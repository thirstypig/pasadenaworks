---
title: "Self-hosted Cal.com on Railway: password-reset emails never arrive"
date: 2026-08-29
category: integration-issues
component: "Cal.com Web App (Railway service, calcom/cal.com Docker image, self-hosted at schedule.pasadenaworks.com)"
symptom: "The /auth/forgot-password form accepts a valid account email and returns success, but no reset email ever arrives — reproduced across two consecutive submissions before investigation. Railway deploy logs show the underlying send failing with SEND_PASSWORD_RESET_EMAIL_ERROR: Connection timeout, code: 'ETIMEDOUT', command: 'CONN' — the SMTP TCP connection itself never completes, regardless of correct EMAIL_SERVER_* env vars."
tags: [cal.com, railway, self-hosted, smtp, email, gmail, app-password, password-reset, nodemailer]
status: solved
---

## Summary

The owner couldn't log into their own self-hosted Cal.com instance and the
forgot-password flow silently produced no email, twice. Two independent,
stacked causes were involved, each with a distinct error signature that
only appeared once the previous one was fixed: (1) Railway blocks outbound
SMTP entirely on Free/Trial/Hobby plans, which surfaces as a connection
timeout, not an auth error; and (2) once that was resolved by upgrading to
Railway's Pro plan, a Gmail App Password generated under the wrong Google
account produced a completely different, credential-specific rejection.
Fixed by upgrading the Railway plan and regenerating the App Password under
the correct account.

## Solution

### Investigation: what was tried, in order

**1. Checked the service's env vars on Railway.**
No SMTP configuration existed at all — no `EMAIL_FROM`, `EMAIL_SERVER_HOST`,
`EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, or `EMAIL_SERVER_PASSWORD`.
Self-hosted Cal.com has no default mail transport, so this alone was
enough to explain a silent failure.

**2. Set full SMTP config for Gmail and redeployed.**
```
EMAIL_FROM=jc.pasadenaworks@gmail.com
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=jc.pasadenaworks@gmail.com
EMAIL_SERVER_PASSWORD=<a Gmail App Password>
```
Still no email arrived.

**3. Read the actual Railway deploy logs instead of re-guessing at config.**
Found the real error:
```
SEND_PASSWORD_RESET_EMAIL_ERROR: Connection timeout
code: 'ETIMEDOUT', command: 'CONN'
```
This is a failure at the TCP handshake stage — the app never even reached
the SMTP auth step, so the credentials weren't the problem yet.

**4. Root-caused via research:** Railway blocks outbound SMTP (ports
465/587/2525) entirely on Free/Trial/Hobby plans. It's unblocked only on
Pro and above. This is a platform-tier network restriction, not an
application misconfiguration — no amount of correct env-var tuning works
around it below Pro.

**5. Owner upgraded the Railway account to the Pro plan**, and the service
was redeployed to make sure the new network policy actually applied to the
running container.

**6. Retried forgot-password — a new and different error appeared:**
```
535-5.7.8 Username and Password not accepted (BadCredentials)
code: 'EAUTH', command: 'AUTH PLAIN'
```
This confirmed the network/connection layer was now fixed (the `ETIMEDOUT`
was gone) and the failure had moved to SMTP authentication itself — a
second, independent problem, not a leftover of the first.

**7. Root cause #2:** the Gmail App Password originally supplied had been
generated under the wrong Google account, not `jc.pasadenaworks@gmail.com`.
An App Password is scoped to the specific Google account it's created
under; using one from a different account produces exactly this
`BadCredentials`/`EAUTH` failure.

**8. Owner regenerated the App Password** while specifically logged into
`jc.pasadenaworks@gmail.com` (via `myaccount.google.com/apppasswords`), the
new value was set as `EMAIL_SERVER_PASSWORD`, and the service redeployed
again.

**9. Retried forgot-password — the reset email arrived.** Owner changed
their password, confirming the full flow now works end-to-end.

### Root cause

Two independent, stacked causes, each producing a distinct and diagnosable
error signature:

- **(a) Railway network-tier restriction.** Free/Trial/Hobby Railway plans
  block outbound SMTP on ports 465/587/2525 at the platform level. Symptom:
  `ETIMEDOUT` on the connection itself (`command: 'CONN'`) — the TCP
  handshake never completes. This looks superficially like a wrong
  host/port, but no SMTP config change fixes it; only a Pro-plan-or-above
  upgrade does.
- **(b) Gmail App Password account mismatch.** An App Password is valid
  only for the Google account under which it was generated. Using one from
  the wrong account produces `535 BadCredentials` / `EAUTH` on
  `AUTH PLAIN` — a completely different failure signature than (a), and
  one that can only surface *after* (a) is resolved, since the connection
  has to succeed before authentication is even attempted.

The key diagnostic lesson: these two failures are easy to conflate ("email
still isn't sending") but have distinct log signatures (`ETIMEDOUT`/`CONN`
vs `EAUTH`/`AUTH PLAIN`) that point to entirely different fixes — reading
deploy logs after each change, rather than re-guessing at SMTP config, is
what separated them.

### Working solution

Final working configuration on the "Cal.com Web App" Railway service
(project `pasadenaworks`):

```
EMAIL_FROM=jc.pasadenaworks@gmail.com
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=jc.pasadenaworks@gmail.com
EMAIL_SERVER_PASSWORD=<Gmail App Password generated specifically under jc.pasadenaworks@gmail.com>
```

Plus: **the Railway project/account must be on the Pro plan** (or above) —
this is a precondition, not something set via env vars, and without it the
SMTP connection never completes regardless of how correct the above values
are.

## Prevention

- **Diagnose by error type, not by re-checking config first.** An
  `ETIMEDOUT`/connection-timeout failure means the SMTP *connection
  itself* never completed — that's a network/platform block (firewall,
  hosting provider port restriction), not a credentials problem. An auth
  error (`535`, `EAUTH`, etc.) means the connection succeeded and the
  *credentials* are wrong. Let the error type route the investigation:
  timeout → check the hosting platform's outbound network policy and plan
  tier first; auth failure → check the credential/account next.
- **SMTP setup checklist for any Railway-hosted service:**
  - Confirm the plan tier actually permits outbound SMTP (Railway blocks it
    below Pro) before touching env vars.
  - Double-check which Google account is currently active in the browser
    before generating an app password — it's easy to generate one under
    the wrong signed-in account and not notice until auth fails.
  - Verify the generated app password matches the exact account referenced
    in `EMAIL_FROM`/`EMAIL_SERVER_USER`.
- **Prefer an HTTPS-based transactional email API (Resend, SendGrid,
  Mailgun) over raw SMTP for any new Railway-hosted service that needs to
  send mail.** These run over port 443, which no plan tier blocks,
  sidestepping this entire class of problem before it starts.

## Related

- [Self-hosted Cal.com on Railway: deploys stuck FAILED, healthcheck against "/" never passes](./calcom-railway-healthcheck-never-passes.md) —
  same Cal.com Railway service (`schedule.pasadenaworks.com`), a different
  bug (deploy healthcheck, not outbound SMTP).
- [Railway custom domain stuck at "Validating Ownership"](./railway-custom-domain-stuck-validating-ownership.md) —
  a third, unrelated gotcha on this same Cal.com service (DNS/TLS
  ownership verification).
- [Twenty CRM self-hosted on Railway: migrations never complete](../database-issues/twenty-crm-railway-migration-never-completes.md) —
  not technically related, but relevant infra context: this fix unblocked
  building the Cal.com → Twenty CRM n8n bridge in the same session, which
  writes into this same Twenty instance.
