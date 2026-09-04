---
status: pending
priority: p2
issue_id: 013
tags: [code-review, security, crm, contact-form, static-hosting, needs-owner-action]
dependencies: []
---

# The n8n CRM webhook is an unauthenticated write endpoint published in every page's HTML

## Problem Statement

`src/data/site.ts` holds the n8n webhook URL and `src/components/ContactForm.astro`
renders it into the page as `data-crm-webhook-url`. Verified in the built output:

```
$ grep -o 'data-crm-webhook-url="[^"]*"' dist/index.html
data-crm-webhook-url="https://n8n-production-94d1d.up.railway.app/webhook/15ada5a1-…"
```

Anyone who views source can POST arbitrary JSON there, at any volume, with no
token, no origin check and no rate limit — writing forged records into Twenty CRM
and bypassing Formspree's spam filtering entirely. `mode: 'no-cors'` makes the
response opaque, so the site cannot detect any of it.

**This is inherent to the architecture, not a mistake in it.** A static site has
no server (hard rule 4), so any endpoint the browser calls is public by
construction. A query-string secret does not help: it ships in the same HTML.

## Findings

**The honeypot that would have blunted this was inert — now fixed.**
`ContactForm.astro` rendered a `company` field with a comment saying bots fill
it, but the handler never read it and the name was not `_gotcha`, so Formspree
ignored it too. Renamed and enforced on both paths (2026-09-03). That stops
naive form-fillers; it does not stop anyone POSTing the endpoint directly.

**A second, quieter bug in the same call.** `mode: 'no-cors'` restricts
`Content-Type` to three safelisted values, so the `application/json` header is
silently stripped and n8n receives the body as `text/plain`. Worth confirming the
workflow still parses it — it may be working by accident.

**Host discrepancy worth resolving.** `memory/project_contact_form_architecture.md`
records the n8n instance as `n8n-production-80f3d.up.railway.app`; `site.ts`
points at `n8n-production-94d1d`. One of the two is stale.

## Proposed Solutions

### ~~Option A — Formspree forwards to n8n server-side~~ RULED OUT

Struck 2026-09-03. `src/data/site.ts:23-24` already records why: *"Formspree's
free plan can't forward submissions anywhere on its own, and Zapier/Make both
paywall webhooks on their free tiers too."* The architecture memory adds that
paid tiers were declined. This option was recommended in the first draft of this
todo **without checking the decision already recorded in the repo** — the note
was two lines above the value being audited.

It becomes available only by paying for Formspree (or an equivalent), which is a
budget decision, not an engineering one.

### Option B — A shared secret in the request

- **Does not work.** Anything the browser sends is in the HTML. It would buy only
  the appearance of a fix, and mislead the next reader.

### Option C — Harden the n8n workflow

Validate and constrain server-side, where the code is not public: require the
expected fields, reject anything with the honeypot filled, drop submissions
whose shape does not match, and rate-limit per IP.

- **Pros:** The only option available without spending money. Caps the damage,
  keeps the lead path untouched, and the logic lives somewhere not readable from
  the page. Composes with the honeypot fix already landed.
- **Cons:** The endpoint stays writable by anyone — this is damage control, not
  closure. Must be done in the n8n UI (owner's login; not reachable from tool
  calls). Rate limiting in n8n is more work than the validation.
- **Effort:** Medium · **Risk:** Low

### Option D — Accept it, and monitor

Leave as is; watch Twenty for junk and clean up if it appears.

- **Pros:** Zero work. The endpoint is unadvertised, and small-site webhooks are
  rarely found by anything but a broad scanner.
- **Cons:** Security by obscurity. The URL is in the HTML of every page of a
  site whose whole strategy is to be found in search.
- **Effort:** None · **Risk:** Medium

## Recommended Action

**Option C**, done in n8n. Paste-ready node config below, per the owner's
preferred way of working with n8n (see `memory/reference_n8n_edit_workflows_via_node_json.md`).

Add an **IF** node between the Webhook trigger and the HTTP Request node, and
route only the `true` branch onward:

```json
{
  "parameters": {
    "conditions": {
      "options": { "caseSensitive": true, "version": 2 },
      "combinator": "and",
      "conditions": [
        { "operator": { "type": "string", "operation": "empty" },
          "leftValue": "={{ $json.body._gotcha || '' }}" },
        { "operator": { "type": "string", "operation": "notEmpty" },
          "leftValue": "={{ $json.body.email || '' }}" },
        { "operator": { "type": "string", "operation": "contains" },
          "leftValue": "={{ $json.body.email || '' }}", "rightValue": "@" },
        { "operator": { "type": "string", "operation": "notEmpty" },
          "leftValue": "={{ $json.body.message || '' }}" },
        { "operator": { "type": "number", "operation": "lt" },
          "leftValue": "={{ ($json.body.message || '').length }}", "rightValue": 5000 }
      ]
    }
  },
  "type": "n8n-nodes-base.if",
  "name": "Valid submission?"
}
```

Note `$json.body.…` rather than `$json.…` — the webhook nests the payload under
`body`. Confirm against one real submission in n8n's execution log before
trusting the paths, and check what content type actually arrives (see Findings).

Rate limiting is a second step and can wait; the validation removes the cheap
abuse.

## Technical Details

- `src/data/site.ts` — `crmWebhookUrl`, and the comment recording why Formspree forwarding is unavailable
- `src/components/ContactForm.astro` — `data-crm-webhook-url`, the `no-cors` fetch, the now-enforced honeypot
- n8n workflow — owner's UI only

## Acceptance Criteria

- [ ] n8n rejects a submission with `_gotcha` filled
- [ ] n8n rejects a submission missing `email` or `message`
- [ ] A real test submission still creates a Twenty CRM record
- [ ] Confirm what content type n8n actually receives
- [ ] Reconcile the `80f3d` / `94d1d` host discrepancy

## Work Log

### 2026-09-03 — Found during full-repo review
Security review confirmed the exposure in built HTML and that the honeypot was
never read. Also confirmed clean, so it is not re-audited: no secret has ever
been committed, `TINA_TOKEN` is absent from the deployed admin bundle, all nine
`set:html` sites trace to author-committed data, and fork PRs cannot reach secrets.

### 2026-09-03 — Recommendation corrected
First draft recommended Formspree server-side forwarding. That was wrong: the
repo already documents that the free plan cannot do it and that paid tiers were
declined — in a comment directly above the value being audited. Lesson worth
keeping: **when a finding concerns a configured value, read the comment attached
to it before proposing an alternative.** Rewritten around Option C, which is the
only one available at this budget, with the n8n node config ready to paste.
