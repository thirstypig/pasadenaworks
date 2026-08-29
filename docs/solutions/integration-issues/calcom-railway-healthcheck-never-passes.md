---
title: "Self-hosted Cal.com on Railway: deploys stuck FAILED, healthcheck against \"/\" never passes"
date: 2026-08-28
category: integration-issues
component: "Cal.com Web App (Railway service, calcom/cal.com Docker image, self-hosted at schedule.pasadenaworks.com)"
symptom: "Deployment logs show the app claiming readiness almost instantly (\"✓ Ready in ~500ms\" + a harmless WebPush/VAPID warning), then total silence — no crash, no error, no further output. Railway's HTTP healthcheck against \"/\" never receives a single response; build log repeats \"Attempt #N failed with service unavailable\" until the 5-minute retry window expires and the deployment is marked FAILED. Reproduced identically across ~5 separate deploy attempts."
tags: [cal.com, railway, self-hosted, docker, healthcheck, deployment, google-calendar, oauth]
status: solved
---

## Summary

After adding a `GOOGLE_API_CREDENTIALS` env var to enable Google Calendar
sync on a self-hosted Cal.com instance on Railway, every subsequent
deployment failed — the app process appeared to start fine, but Railway's
healthcheck against `/` never got a response and killed the deploy after 5
minutes. The env var, the Docker image tag/version, CPU/memory, and
Postgres were all ruled out as the cause through direct testing. It turned
out to be a known, unresolved upstream Cal.com/Railway compatibility bug
([calcom/cal.com#27978](https://github.com/calcom/cal.com/issues/27978)),
unrelated to the credentials change that happened to trigger the redeploy.
The fix: clear the **Healthcheck Path** setting entirely in Railway
(Settings → Deploy), which makes Railway check only that the container
process is alive instead of requiring an HTTP 200 from the app. Deploys
then succeed — just much more slowly than normal (~20–30 minutes observed,
vs. ~30 seconds).

## Solution

### Investigation: what was tried and failed

**1. Suspected the env var that triggered the first failure**

Setting `GOOGLE_API_CREDENTIALS` preceded the first failed deploy, so it
was the natural first suspect. Ruled out by removing the variable entirely
and redeploying — failed identically. Not the cause.

**2. Suspected the floating `:latest` tag had pulled a regressed image**

Pinned the image to a specific known-good version
(`calcom/cal.com:v6.2.0`) instead of `:latest`. Failed identically. Ruled
out further by checking deployment history: the one deployment that had
ever succeeded (3 days earlier) had *also* used `:latest` — there's no
"latest broke, pinning fixed it" story available here.

**3. Suspected resource starvation (OOM / CPU throttling)**

```
# via Railway's metrics API for the service, during the failure window
CPU_USAGE:        max 0.62 of 8 cores
MEMORY_USAGE_GB:  max 3.2 of 8 GB limit
```

No signs of the container being killed for resource reasons.

**4. Suspected database-side blocking**

Checked Postgres logs for the same time window — clean, routine
checkpoints only, no connection errors, no lock contention.

Each of these took real time to check and none moved the needle — if you
hit this again, skip straight to the fix below.

### Root cause

Not definitively identified — and as of this writing, Cal.com's own
maintainers haven't identified it either
([calcom/cal.com#27978](https://github.com/calcom/cal.com/issues/27978),
open with no fix, other users hitting the exact same symptom with
different healthcheck paths and longer timeouts). Working theory only:
something in Cal.com's post-"Ready" async bootstrap hangs specifically
under Railway's container networking, so the process never actually opens
up to accept HTTP requests despite appearing to have started. Treat this
as a description of the symptom, not a diagnosis.

### Working solution

In the Railway dashboard, on the affected service:

1. Go to **Settings → Deploy**.
2. Find **Healthcheck Path**.
3. Clear it completely (ours was `/`; blank when done).
4. Save, then trigger a redeploy.

```
Healthcheck Path: /          (before — HTTP healthcheck required, fails forever)
Healthcheck Path: (blank)    (after — Railway just checks the process is alive)
```

This came from Railway's own Help Station as the documented way to disable
the HTTP healthcheck, not an official Cal.com fix:
[station.railway.com/questions/can-i-disable-healthcheck-0ed43918](https://station.railway.com/questions/can-i-disable-healthcheck-0ed43918).

Two operational notes from doing this live:

- **The agent driving this (Claude, via Railway's API) could not make this
  change programmatically.** Both the Docker image source change and the
  healthcheck-path clear returned `Not Authorized` on Railway's
  `serviceInstanceUpdate` GraphQL mutation even with correct auth headers,
  and a higher-level automation tool *falsely reported success* without
  the change actually persisting (caught by independently re-checking
  `get-service-config` afterward). Both had to be done manually by the
  account owner in the Railway dashboard UI.
- **The site never actually went down for real visitors** during any of
  this. Railway keeps the last-good deployment serving traffic until a new
  one passes healthcheck (or, with no healthcheck configured, until a new
  one's process starts) — confirmed throughout via direct `curl` against
  the live domain. A string of FAILED deployments in the Railway dashboard
  does not by itself mean visitors are affected; check the live URL
  directly before treating it as an outage.

## Prevention

1. **Recognize this failure signature fast.** Clean "Ready" line + one
   harmless warning + total silence, paired with Railway's
   `Attempt #N failed with service unavailable` retries and literally zero
   entries in the deployment's HTTP logs (not 4xx/5xx — *zero* traffic).
   That combination points at this Railway/Cal.com incompatibility, not a
   real app crash (which produces an error and a nonzero exit) or a real
   misconfiguration (which produces a startup-time error before "Ready").

2. **Diagnostic order for "container says Ready but healthcheck never
   passes" on Railway generally:**
   - Check the deployment's HTTP logs specifically. Zero entries means
     Railway's proxy never received a single request (networking/
     healthcheck-layer problem) — as opposed to actual error responses,
     which point back at the app itself.
   - Pull CPU/memory metrics for the exact failure window before assuming
     an app-level hang. Resource exhaustion looks similar but has a
     different fix (raise resource limits, not touch the healthcheck).
   - Check whether the exact same image/config has ever deployed
     successfully before changing anything else. If it has, and the only
     thing that changed is what you just edited, verify that specific
     change is actually the cause (see next point) before spending time
     auditing its contents.

3. **Don't trust "it must be the thing I just changed."** It's the natural
   first suspect, and it was wrong here — removing the just-added
   `GOOGLE_API_CREDENTIALS` variable and redeploying reproduced the
   identical failure, which is what proved the credential wasn't the cause
   and redirected the investigation toward an unrelated upstream bug. A
   failed reproduction *without* the suspected change is the fastest way
   to rule a suspect in or out.

4. **Dropping the HTTP healthcheck here is a tradeoff, not a free fix.**
   With no healthcheck path, Railway considers the deployment "healthy" the
   moment the container process starts — even if the web app inside never
   becomes reachable or is serving errors. This repo's own
   [Twenty CRM migration doc](../database-issues/twenty-crm-railway-migration-never-completes.md)
   makes the mirror-image point: *"A Railway deployment showing SUCCESS
   only means the container started and passed its HTTP healthcheck — it
   does NOT mean the application's own first-run bootstrapping actually
   completed."* With the healthcheck removed entirely, SUCCESS now means
   even less than that. If real health verification matters going forward,
   consider a lightweight external uptime check (e.g. a periodic curl from
   outside Railway) instead, since it won't block the deploy pipeline the
   way Railway's own healthcheck does.

5. **Expect deploys to take unusually long even after this fix** (~20–30
   minutes observed here, vs. the normal ~30 seconds). Don't assume a
   deploy that looks "stuck" in the dashboard has failed — confirm its
   actual status before killing and retrying it; a retry while one is
   still genuinely in progress can leave two deployments queued against
   the same service.

## Related

- [Twenty CRM self-hosted on Railway: migrations never complete](../database-issues/twenty-crm-railway-migration-never-completes.md) —
  same "a Railway SUCCESS status doesn't mean what you'd assume" theme,
  opposite direction (healthcheck passing hid an incomplete migration,
  vs. here the healthcheck was removed entirely).
- [Railway custom domain stuck at "Validating Ownership"](./railway-custom-domain-stuck-validating-ownership.md) —
  another Railway infrastructure gotcha on this same Cal.com service
  (`schedule.pasadenaworks.com`), different specific bug (DNS/TLS, not
  healthcheck).
- [calcom/cal.com#27978](https://github.com/calcom/cal.com/issues/27978) —
  the unresolved upstream bug report.
- [station.railway.com/questions/can-i-disable-healthcheck-0ed43918](https://station.railway.com/questions/can-i-disable-healthcheck-0ed43918) —
  Railway's own documentation of the healthcheck-disable workaround.
