---
title: "Railway custom domain stuck at \"Validating Ownership\" despite correct DNS (missing TXT record)"
date: 2026-08-26
category: integration-issues
component: "Railway custom domains (Twenty CRM + Cal.com services, crm.pasadenaworks.com and schedule.pasadenaworks.com) — DNS via Squarespace"
symptom: "Browser shows Railway's \"train has not arrived at the station\" 404 / TLS certificate error (curl: SSL certificate problem, subjectAltName does not match); Railway API reports customDomain.status.certificateStatus stuck at CERTIFICATE_STATUS_TYPE_VALIDATING_OWNERSHIP with verified: false for 20+ hours, even though the CNAME record is DNS_RECORD_STATUS_PROPAGATED"
tags: [railway, custom-domain, dns, tls-certificate, squarespace, twenty-crm, graphql-api]
status: solved
---

## Summary

A Railway custom domain (`crm.pasadenaworks.com`, pointed at the Twenty CRM
"server" service) had its CNAME record correctly configured and fully
propagated, but Railway never issued a TLS certificate for it — the domain
sat at `CERTIFICATE_STATUS_TYPE_VALIDATING_OWNERSHIP` / `verified: false`
for over 20 hours. Visiting the domain showed Railway's generic
"train has not arrived at the station" error page, and `curl` failed with a
certificate-hostname mismatch (the connection was served by Railway's
`*.up.railway.app` wildcard cert instead of one for the custom domain).

The root cause: Railway also requires a **separate TXT record** for
ownership verification (`_railway-verify.<subdomain>`), independent of the
CNAME. This TXT requirement is **not surfaced in the `dnsRecords` list**
that the dashboard/API shows for "what DNS to configure" — that list only
showed the CNAME. It only appears under a different field
(`status.verificationDnsHost` / `status.verificationToken`) that has to be
queried separately. Without it, certificate issuance stalls indefinitely
with no error message.

## Solution

### Investigation: what was tried and failed

**1. Confirmed DNS was actually fine**

```bash
dig +short CNAME crm.pasadenaworks.com   # -> f6zv1lbg.up.railway.app. (matched Railway's required value)
dig +short CAA pasadenaworks.com          # -> (empty — no CAA record blocking issuance)
```

Railway's own GraphQL API agreed the CNAME was propagated:

```graphql
query domains($projectId: String!, $environmentId: String!, $serviceId: String!) {
  domains(projectId: $projectId, environmentId: $environmentId, serviceId: $serviceId) {
    customDomains {
      domain
      status {
        dnsRecords { hostlabel recordType requiredValue currentValue status }
        verified
        certificateStatus
      }
    }
  }
}
```
returned `dnsRecords[0].status: "DNS_RECORD_STATUS_PROPAGATED"` — but
`verified: false` and `certificateStatus: "CERTIFICATE_STATUS_TYPE_VALIDATING_OWNERSHIP"`.

**2. Tried the low-risk retry mutation first**

Railway's GraphQL schema exposes a direct retry:

```graphql
mutation retry($id: String!) { customDomainIssueCertificate(id: $id) }
```

This returned `true` but had **no effect** — same stuck state 5+ minutes
later. (Worth trying first since it's non-destructive, but don't expect it
to fix a genuinely missing-verification-record case.)

**3. Deleted and recreated the custom domain**

```graphql
mutation del($id: String!) { customDomainDelete(id: $id) }
mutation create($input: CustomDomainCreateInput!) {
  customDomainCreate(input: $input) {
    id domain
    status { dnsRecords { hostlabel recordType requiredValue } verified certificateStatus }
  }
}
```

**Important gotcha**: recreating the domain assigned a **brand-new required
CNAME target** (`1moxsip6.up.railway.app`, different from the original
`f6zv1lbg.up.railway.app`). The old CNAME value became stale immediately —
DNS had to be updated again to the new target before anything could
proceed. Don't assume delete+recreate preserves the CNAME target.

After updating DNS to the new CNAME and confirming propagation, the domain
was **still** stuck at `VALIDATING_OWNERSHIP` — ruling out "stale
verification cache" as the sole cause and pointing at something structurally
missing from the DNS setup, not just a timing issue.

### Root cause

Found via Railway's community forum (Central Station) — searching
`"VALIDATING_OWNERSHIP"` surfaced multiple identical reports. Railway's
domain-ownership verification for custom domains requires a **TXT record**
at `_railway-verify.<subdomain>`, separate from the CNAME, containing a
token Railway generates per-domain. This is exposed via a different part of
the schema than the CNAME:

```graphql
query domains($projectId: String!, $environmentId: String!, $serviceId: String!) {
  domains(projectId: $projectId, environmentId: $environmentId, serviceId: $serviceId) {
    customDomains {
      status { verificationDnsHost verificationToken }
    }
  }
}
```
returned:
```json
{"verificationDnsHost": "_railway-verify.crm", "verificationToken": "railway-verify=e755b5d1a3856b13b8e9e188d3b9d8fc8d9f234be7238cc2155916281b5ee983"}
```

`dig +short TXT _railway-verify.crm.pasadenaworks.com` confirmed this
record simply didn't exist — it had never been created, only the CNAME had.

### Working solution

Add a TXT record on the DNS provider (Squarespace, in this case):

- **Host:** `_railway-verify.crm`
- **Value:** `railway-verify=e755b5d1a3856b13b8e9e188d3b9d8fc8d9f234be7238cc2155916281b5ee983`
  (the exact value comes from `status.verificationToken` for the specific
  domain — it's per-domain, don't reuse across domains)

Within about a minute of the TXT record propagating (confirmed via
`dig +short TXT _railway-verify.crm.pasadenaworks.com`), Railway's API
flipped to `certificateStatus: "CERTIFICATE_STATUS_TYPE_VALID"` /
`verified: true`, and `https://crm.pasadenaworks.com/` started returning
`200` with a valid certificate.

## Confirmed recurrence

The exact same issue hit a second, unrelated Railway custom domain on this
same project the next day: `schedule.pasadenaworks.com` (fronting a
self-hosted Cal.com service, not Twenty CRM). Same symptoms — CNAME
propagated and correct, `certificateStatus: VALIDATING_OWNERSHIP`,
`verified: false` — and the same missing `_railway-verify.<subdomain>` TXT
record was the cause. This confirms it's a systemic gap in how Railway
surfaces the verification requirement (the CNAME-only `dnsRecords` list),
not a one-off fluke with a specific service or domain. Fixed the same way:
added the TXT record from `status.verificationToken`, then called
`customDomainIssueCertificate(id)` to force an immediate retry rather than
waiting — went from `VALIDATING_OWNERSHIP` to `CERTIFICATE_STATUS_TYPE_VALID`
in under a minute once the TXT record was confirmed propagated.

**Takeaway**: on any new Railway custom domain on this project, check
`status.verificationDnsHost`/`verificationToken` *before* considering DNS
setup complete — don't wait for a stuck certificate to discover it's needed.

## Prevention

1. **When adding a Railway custom domain, always check
   `status.verificationDnsHost` / `status.verificationToken` in addition to
   `status.dnsRecords`.** The dashboard's "DNS records to add" UI and the
   `dnsRecords` API field only show the CNAME — the TXT ownership-
   verification record is a separate requirement that's easy to miss
   entirely, especially since there's no error telling you it's missing.
   The domain just sits at "Validating Ownership" forever with no
   actionable message.

2. **Don't assume `certificateStatus: VALIDATING_OWNERSHIP` past a few
   minutes means "just wait longer."** If DNS for the CNAME is confirmed
   propagated and it's still stuck after ~10-15 minutes, suspect a missing
   TXT record before assuming it's a Railway-side delay.

3. **If you delete and recreate a custom domain to force a fresh
   certificate attempt, expect a new required CNAME target.** Railway does
   not guarantee the same target value across create calls for the same
   domain string — re-check `status.dnsRecords[].requiredValue` after
   recreating, and update DNS again if it changed.

4. **`customDomainIssueCertificate(id)` is a safe first thing to try** (it
   just returns `true`/`false`, no side effects), but it won't fix a
   genuinely missing verification record — it only re-triggers issuance
   against whatever DNS state already exists.

## Related

- [Twenty CRM self-hosted on Railway: migrations never complete](../database-issues/twenty-crm-railway-migration-never-completes.md) —
  this domain fronts the same Twenty CRM Railway deployment documented
  there; both issues surfaced during the same infrastructure work
  (self-hosted CRM + contact-form integration, 2026-08-25/26).
- Railway Central Station threads found via web search for this exact
  symptom (multiple independent reports of the same missing-TXT-record
  cause): search `"VALIDATING_OWNERSHIP"` on `station.railway.com`.
