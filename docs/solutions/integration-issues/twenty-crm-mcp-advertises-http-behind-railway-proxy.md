---
title: "Twenty CRM's MCP server unreachable on Railway: OAuth metadata advertises http:// behind a TLS-terminating proxy"
date: 2026-08-31
category: integration-issues
component: "Twenty CRM (self-hosted, Railway service `server`, crm.pasadenaworks.com) — OAuth discovery + MCP endpoints"
symptom: "`claude mcp add --transport http twenty-crm https://crm.pasadenaworks.com/mcp` fails immediately with `✘ Failed to connect — Protected resource http://crm.pasadenaworks.com/mcp does not match expected https://crm.pasadenaworks.com/mcp (or origin)`. Every URL in `/.well-known/oauth-authorization-server` and `/.well-known/oauth-protected-resource/mcp`, and the `resource_metadata` in the 401 `WWW-Authenticate` header, is `http://` — even though the site is HTTPS-only and `SERVER_URL` is already correctly set to the https URL."
tags: [twenty-crm, railway, self-hosting, mcp, oauth, reverse-proxy, express, trust-proxy, x-forwarded-proto, nestjs]
status: solved
---

## Summary

Twenty's MCP server would not connect. Its OAuth discovery documents advertised
`http://` URLs, and MCP clients correctly refuse to run an OAuth flow against a
plain-HTTP resource.

The obvious fix — "set `SERVER_URL` to the https URL" — is what every
self-hosting guide recommends and it was **already done**. The endpoints that
build these URLs never read `SERVER_URL`; they derive them from the incoming
request, and Express only reports `https` when it is told to trust the proxy in
front of it. Railway terminates TLS at its edge and forwards plain HTTP, so
Express was accurately reporting `http`.

**Fix: set `TRUST_PROXY=1` on the Railway `server` service.** One variable, no
code change, reversible by removing it.

## Symptom

```
$ claude mcp add --transport http twenty-crm https://crm.pasadenaworks.com/mcp
$ claude mcp list
  twenty-crm: https://crm.pasadenaworks.com/mcp (HTTP)
    ✘ Failed to connect — Protected resource http://crm.pasadenaworks.com/mcp
      does not match expected https://crm.pasadenaworks.com/mcp (or origin)
```

The server itself was healthy. `POST /mcp` returned a well-formed 401:

```
www-authenticate: Bearer resource_metadata="http://crm.pasadenaworks.com/.well-known/oauth-protected-resource/mcp", scope="api profile"
```

And discovery was complete and correct except for the scheme:

```json
{
  "issuer": "http://crm.pasadenaworks.com",
  "authorization_endpoint": "http://crm.pasadenaworks.com/authorize",
  "token_endpoint": "http://crm.pasadenaworks.com/oauth/token",
  "registration_endpoint": "http://crm.pasadenaworks.com/oauth/register",
  "grant_types_supported": ["authorization_code", "client_credentials", "refresh_token"],
  "code_challenge_methods_supported": ["S256"]
}
```

RFC 9728 §3.2 requires the `resource` value to equal the resource identifier
exactly, so `http://…/mcp` ≠ `https://…/mcp` is a hard rejection, not a warning.
Railway does issue a 301 from http→https, but the client compares metadata
*before* it would ever follow a redirect.

## Investigation

### Ruled out: the custom domain

Reproduced identically on the Railway-generated domain:

```bash
curl -s https://server-production-a8ea7.up.railway.app/.well-known/oauth-protected-resource/mcp
# {"resource":"http://server-production-a8ea7.up.railway.app/mcp", ...}
```

Not a DNS, certificate, or custom-domain problem.

### Ruled out: `SERVER_URL` — the red herring

Every self-hosting guide for Twenty says to set `SERVER_URL` to the public
HTTPS URL. It was already set:

```bash
railway variables -s server -e production --json | jq -r .SERVER_URL
# https://crm.pasadenaworks.com
```

Correct, and irrelevant to this code path. `SERVER_URL` governs OAuth callbacks
and generated email links; it is not consulted when building discovery metadata.

### The diagnostic tell

**The advertised host changed depending on which domain was called** — the
custom domain returned `http://crm.pasadenaworks.com`, the Railway domain
returned `http://server-production-a8ea7.up.railway.app`.

A value read from configuration would be *identical* on both. Varying output
means request-derived input. That single observation eliminated the entire class
of "fix the base-URL config" hypotheses before any of them was attempted.

### Proxy headers were being ignored outright

Supplying the header by hand changed nothing:

```bash
curl -s -H 'X-Forwarded-Proto: https' https://crm.pasadenaworks.com/.well-known/oauth-authorization-server \
  | jq -r .issuer
# http://crm.pasadenaworks.com     <- unchanged
```

Not "read and mishandled" — discarded. That points at trust configuration
rather than parsing.

### Root cause, in Twenty's source

`packages/twenty-server/src/engine/core-modules/application/application-oauth/controllers/oauth-discovery.controller.ts`:

```ts
const issuer = getRequestBaseUrl(request);
```

`packages/twenty-server/src/utils/get-request-base-url.util.ts`:

```ts
// Absolute origin the request arrived on (honors Express `trust proxy`).
export const getRequestBaseUrl = (request: Request): string =>
  `${request.protocol}://${request.get('host')}`;
```

Express's `req.protocol` returns the raw connection protocol unless `trust proxy`
is enabled, in which case it consults `X-Forwarded-Proto`. Railway terminates TLS
at its edge and speaks plain HTTP to the container, so **`http` was the correct
answer to the question Express was asked.**

Twenty exposes the setting, in `config-variables.ts`:

```ts
TRUST_PROXY: string = 'loopback, linklocal, uniquelocal';
```

> Express "trust proxy" setting. Controls whether X-Forwarded-* headers are
> honored — required for request.protocol to return "https" when TLS is
> terminated upstream (reverse proxy, ingress, Cloudflare, etc.).

The default trusts loopback and private-range peers, which Twenty's own docs
call "correct when NestJS runs behind a reverse proxy." Railway's edge reaches
the container from outside those ranges, so nothing matched and every forwarded
header was dropped. **This is a Railway-topology mismatch, not a Twenty bug.**

`main.ts` parses it:

```ts
const trustProxyRaw = twentyConfigService.get('TRUST_PROXY');
const trustProxy = /^\d+$/.test(trustProxyRaw)
  ? Number(trustProxyRaw)
  : (configTransformers.boolean(trustProxyRaw) ?? trustProxyRaw);
app.set('trust proxy', trustProxy);
```

A numeric string becomes an Express hop count.

## Solution

Set one variable on the Railway `server` service:

```
TRUST_PROXY=1
```

`1` trusts exactly one upstream hop — the Railway edge that is actually there —
rather than `true`, which trusts an unbounded chain. Setting the variable
triggers a redeploy (~2 minutes). Remove it to revert.

Security exposure is minimal here: all traffic already arrives over HTTPS, so a
spoofed `X-Forwarded-Proto` can at worst make the server advertise its own URLs
incorrectly. On a host where plain-HTTP requests can reach the container
directly, prefer an explicit trusted-IP list over a hop count.

## Verification

```bash
curl -s https://crm.pasadenaworks.com/.well-known/oauth-authorization-server | jq -r .issuer
# https://crm.pasadenaworks.com

curl -s https://crm.pasadenaworks.com/.well-known/oauth-protected-resource/mcp | jq -r .resource
# https://crm.pasadenaworks.com/mcp
```

`claude mcp list` moved from `✘ Failed to connect` to `! Needs authentication` —
discovery now valid, browser login pending. After authenticating via `/mcp`, a
live query succeeded:

```
find_many_people {limit: 10, select: ["id","name","emails","updatedAt"]}
→ {"success": true, "message": "Found 7 person records", ...}
```

## Prevention

**Recognize the class.** Any self-hosted app behind a TLS-terminating proxy
(Railway, Fly, Render, Cloudflare, an ingress controller) that advertises or
redirects to `http://` when it should say `https://` is almost certainly missing
a trust-proxy setting. Look for `TRUST_PROXY` / `trust proxy` / `--proxy-headers`
**before** touching base-URL configuration.

**Use the varying-host test.** To decide whether an advertised URL comes from
config or from the request, call the same endpoint through two different
hostnames:

```bash
curl -s https://custom.example.com/.well-known/oauth-authorization-server | jq -r .issuer
curl -s https://app-production-xxxx.up.railway.app/.well-known/oauth-authorization-server | jq -r .issuer
```

Identical → config-derived, so fix the config. Different → request-derived, so
config cannot fix it. This is a 10-second test that eliminates a whole hypothesis
family.

**Read the code before changing production env vars.** The popular answer
(`SERVER_URL`) was already correct and would have been "applied" with no effect,
after a redeploy and downtime — then likely followed by a second guess. Two
`gh search code` calls and one file read found the actual line. See
[debug with evidence, not guessing](./calcom-railway-smtp-password-reset-emails-fail.md)
for the prior incident that established this habit in this project.

**A generated OAuth document is a diagnostic.** `/.well-known/*` is
unauthenticated and reflects exactly what the server believes about itself —
often the fastest way to see a misconfiguration, without reading any config.

### Regression check

There is no unit test for this — it is deployment topology, not code. Verify
after any change to the Railway service, the custom domain, or a Twenty upgrade
(a template rebuild could reset the variable):

```bash
test "$(curl -s https://crm.pasadenaworks.com/.well-known/oauth-authorization-server | jq -r .issuer)" \
  = "https://crm.pasadenaworks.com" && echo OK || echo "REGRESSED: check TRUST_PROXY"
```

## Related

- [Twenty CRM self-hosted on Railway: migrations never complete](../database-issues/twenty-crm-railway-migration-never-completes.md) — same instance, initial deployment
- [Railway custom domain stuck at "Validating Ownership"](./railway-custom-domain-stuck-validating-ownership.md) — how `crm.pasadenaworks.com` was attached
- [Self-hosted Cal.com on Railway: password-reset emails never arrive](./calcom-railway-smtp-password-reset-emails-fail.md) — same "the platform, not the app, is the constraint" shape (Railway blocking outbound SMTP)
- `reference-twenty-crm-railway` memory — API key location, REST filter syntax, and MCP connection steps for this workspace
