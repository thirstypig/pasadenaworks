---
status: pending
priority: p2
issue_id: 013
tags: [code-review, security, crm, contact-form, static-hosting]
dependencies: []
---

# The n8n CRM webhook is an unauthenticated write endpoint published in every page's HTML

## Problem Statement

`src/data/site.ts` holds the n8n webhook URL, and `src/components/ContactForm.astro`
renders it into the page as `data-crm-webhook-url`. Verified in the built output:

```
$ grep -o 'data-crm-webhook-url="[^"]*"' dist/index.html
data-crm-webhook-url="https://n8n-production-94d1d.up.railway.app/webhook/15ada5a1-…"
```

Anyone who views source can POST arbitrary JSON to that endpoint, at any volume,
with no token, no origin check and no rate limit. That writes forged records
straight into Twenty CRM and bypasses Formspree's spam filtering entirely — the
browser-side call is a second, unfiltered path to the same destination.

`mode: 'no-cors'` makes the response opaque, so the site cannot detect any of it.

**A query-string secret does not help**, because it ships in the same HTML. This
is not a configuration mistake; it is what putting a write endpoint in a static
page means.

## Findings

**The honeypot that would have blunted this is inert.** `ContactForm.astro:26-27`
renders a `company` field with a comment saying bots fill it, but the submit
handler never reads it, and the field is not named `_gotcha`, so Formspree will
not drop it either. Two mitigations that look present and are not.

**A second, quieter bug in the same call.** `mode: 'no-cors'` restricts
`Content-Type` to three safelisted values, so the `application/json` header is
silently stripped and n8n receives the body as `text/plain`. Worth confirming the
workflow still parses it — it may be working by accident.

Related but out of scope here: `docs/RESOLVED.md` records the contact form
dual-submitting by design, so this is the design working as intended, not drift.
The design is what needs revisiting.

## Proposed Solutions

### Option A — Formspree forwards to n8n server-side; drop the browser call

Remove `data-crm-webhook-url` and the second `fetch` entirely; configure the
Formspree endpoint to forward submissions to n8n.

- **Pros:** The only option that actually closes it. The webhook stops being
  public, spam filtering applies to everything reaching the CRM, and the page
  gets simpler. Respects the static-hosting constraint — no backend added.
- **Cons:** Depends on Formspree's forwarding/webhook feature being available on
  the current plan; needs verifying before committing. Changes a working
  production lead path, so it must be tested with a real submission end to end.
- **Effort:** Small–Medium · **Risk:** Medium — this is how leads reach the CRM.

### Option B — Rotate the webhook path and add a shared secret

- **Pros:** Fast.
- **Cons:** **Does not work.** Any secret the browser sends is in the HTML. This
  buys nothing but the appearance of a fix, and would make the next reader think
  the problem was handled.
- **Effort:** Small · **Risk:** High (false sense of security)

### Option C — Keep the direct call, add rate limiting and validation in n8n

Leave the endpoint public but make the workflow reject junk: required-field
checks, a rate limit per IP, and the honeypot actually enforced.

- **Pros:** No change to the lead path, so no risk of dropping a real enquiry.
  Reduces the damage without touching the architecture.
- **Cons:** The endpoint stays writable by anyone; this caps the blast radius
  rather than removing it. Rate limiting in n8n is more work than it sounds.
- **Effort:** Medium · **Risk:** Low

## Recommended Action

**Option A**, with Option C's honeypot fix landed first as a cheap independent
win (wire `company` into the submit handler, or rename it `_gotcha` so Formspree
drops it — one line either way, no risk to the lead path).

Deliberately **not** actioned in the 2026-09-03 review PR: A changes how leads
reach the CRM, and breaking that silently is worse than the exposure it fixes.
It needs the owner's go-ahead and a real end-to-end test submission.

## Technical Details

- `src/data/site.ts` — the webhook URL
- `src/components/ContactForm.astro:19` (attribute), `:26-27` (honeypot), `:65-108` (handler), `:81` (`no-cors`)
- Related: `memory/project_contact_form_architecture.md`, `docs/RESOLVED.md`

## Acceptance Criteria

- [ ] The n8n webhook URL no longer appears in any built page
- [ ] A real test submission still creates a Twenty CRM record, verified in the CRM
- [ ] The honeypot either blocks a submission or is removed — not left decorative
- [ ] Confirm what content type n8n actually receives

## Work Log

### 2026-09-03 — Found during full-repo review
Security review confirmed the exposure in built HTML and confirmed the honeypot
is never read. Also confirmed clean, so it is not re-audited: no secret has ever
been committed, `TINA_TOKEN` is absent from the deployed admin bundle, all nine
`set:html` sites trace to author-committed data, and fork PRs cannot reach
secrets.
