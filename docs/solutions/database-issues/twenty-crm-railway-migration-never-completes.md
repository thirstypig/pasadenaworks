---
title: "Twenty CRM self-hosted on Railway: migrations never complete, workspace creation fails"
date: 2026-08-25
category: database-issues
component: "Twenty CRM (self-hosted, Railway) — Server + Worker services, Postgres"
symptom: "relation \"core.keyValuePair\" does not exist / relation \"core.workspace\" does not exist; workspace sign-up fails with TypeError: Cannot read properties of undefined (reading 'send') in S3Driver.writeFile"
tags: [railway, twenty-crm, postgres, database-migration, docker-template, self-hosting, typeorm, file-storage]
status: solved
---

## Summary

Deploying Twenty CRM (open-source CRM) to Railway via the official
**"Twenty - the #1 Open-Source CRM"** template (deploy slug
`twenty-or-the-1-open-source-crm`) left the database permanently
half-initialized: the app's own schema/extension bootstrap succeeded on
every boot, but the actual TypeORM tables were never created, so the app
crashed at runtime with `relation "core.keyValuePair" does not exist` and
similar errors. The root cause turned out to be a chicken-and-egg bug in
that template's Docker image, not a Railway configuration mistake. The fix
was switching to a different, actively-maintained Railway template
(`twenty-crm-production`) rather than patching around the bug.

## Solution

### Investigation: what was tried and failed

**1. Deployed the official "Twenty - the #1 Open-Source CRM" Railway template**

Deploy slug `twenty-or-the-1-open-source-crm`, provisioning 4 services:
`Twenty Server`, `Twenty Worker`, `Postgres`, `Redis`.

```bash
railway deploy -t twenty-or-the-1-open-source-crm
```

**2. First crash: S3 storage config validation failure**

The template's `STORAGE_TYPE` defaulted toward `s3`, but
`STORAGE_S3_ACCESS_KEY_ID`, `STORAGE_S3_ENDPOINT`, `STORAGE_S3_NAME`,
`STORAGE_S3_REGION`, `STORAGE_S3_SECRET_ACCESS_KEY` were all empty — the
Railway bucket resource this template expects wasn't auto-provisioned by
the CLI deploy path (only the dashboard's "Deploy" button fully wires
template-linked bucket resources; `railway deploy -t` does not). Server
crashed on boot:

```
ERROR STORAGE_S3_REGION should not be empty
```

Fix attempt:

```bash
railway variables -s "Twenty Server" --set "STORAGE_TYPE=local"
railway variables -s "Twenty Worker" --set "STORAGE_TYPE=local"
railway redeploy -s "Twenty Server" -y
railway redeploy -s "Twenty Worker" -y
```

This cleared the S3 crash but exposed a second, deeper failure underneath it.

**3. Second failure: migrations never run**

Every boot logged the schema/extension bootstrap succeeding, then silently
stopped short of creating any real tables:

```
Running database setup and migrations...
Database appears to be empty, running migrations.
Performed 'create extension "uuid-ossp"' successfully
Performed 'create extension "unaccent"' successfully
Performed 'create schema "public"' successfully
Performed 'create schema "core"' successfully
```

The app then booted anyway and immediately failed at runtime:

```
error: relation "core.keyValuePair" does not exist
```

**4. Ruled out "stale half-migrated database" theory**

Created a brand-new, genuinely empty database directly in Postgres to rule
out interrupted-redeploy corruption:

```sql
CREATE DATABASE twenty;
```

```bash
railway variables -s "Twenty Server" --set "PG_DATABASE_URL=postgresql://postgres:<pw>@postgres.railway.internal:5432/twenty"
railway variables -s "Twenty Worker" --set "PG_DATABASE_URL=postgresql://postgres:<pw>@postgres.railway.internal:5432/twenty"
```

Identical failure recurred against the fresh database — this was not a
corrupted-state issue.

**5. Tried `ENABLE_DB_MIGRATIONS=true`**

Research into Twenty's `entrypoint.sh` behavior surfaced this variable (a
recent change altered whether migrations run by default unless explicitly
disabled).

```bash
railway variables -s "Twenty Server" --set "ENABLE_DB_MIGRATIONS=true"
railway variables -s "Twenty Worker" --set "ENABLE_DB_MIGRATIONS=true"
railway redeploy -s "Twenty Server" -y
```

No change in behavior — same silent stop after schema creation.

**6. SSH'd into the live container to run migrations manually**

```bash
railway ssh -s "Twenty Server"
yarn command:prod database:migrate
```

```
error: unknown command 'database:migrate'
```

That command name doesn't exist in this build's CLI.

**7. Listed the real command surface**

```bash
yarn command:prod --help
```

Found `run-instance-commands` — "Run legacy TypeORM migrations and all
registered instance commands" — the actual current name for what used to
be `database:migrate`.

**8. Ran it manually — surfaced the true root cause**

```bash
yarn command:prod run-instance-commands
```

```
query failed: SELECT "WorkspaceEntity"."id" ... FROM "core"."workspace" ...
error: error: relation "core.workspace" does not exist
ERROR [RunInstanceCommandsCommand] Instance commands failed: relation "core.workspace" does not exist
```

### Root cause

A genuine bug in this Twenty build's own `run-instance-commands` command:
its `checkWorkspaceVersionSafety` step queries `core.workspace` as a
pre-flight safety check *before* running the migrations that would create
that table. On a truly empty database, the safety check itself throws and
aborts before the real migrations ever execute — a chicken-and-egg failure
specific to first-time/from-scratch initialization. It is not a Railway
config issue, not a storage issue, and not caused by any interrupted
redeploy; it reproduced identically against a brand-new, never-touched
database. It appears to be a defect/regression in the
`twentycrm/twenty:latest` image as wired by the
`twenty-or-the-1-open-source-crm` Railway template specifically.

### Working solution

Abandoned that template entirely rather than patching around the bug.
Deployed the actively-maintained alternative template instead:

```bash
railway deploy -t twenty-crm-production
```

(deploy slug `twenty-crm-production`, source repo `nomideusz/twenty-railway`,
services named `server`/`worker`/`postgres`/`redis`). Its own docs state
migrations run correctly on first boot ("First boot migrates the database
in a minute or two").

This template hit the *same* S3-bucket-not-auto-wired issue as step 2 (same
underlying Railway CLI limitation, unrelated to the migration bug), fixed
the same way:

```bash
railway variables -s "server" --set "STORAGE_TYPE=local"
railway variables -s "worker" --set "STORAGE_TYPE=local"
```

After that redeploy, `/client-config` returned real application data (not a
database error), and creating a workspace through the web UI succeeded
end-to-end. Confirmed via:

```bash
curl https://<server-domain>/client-config
```

The old broken template's 4 services were deleted afterward once the
replacement was confirmed working.

## Prevention

1. **Verify first-boot success concretely, not just deployment status.** A
   Railway deployment showing `SUCCESS` only means the container started
   and passed its HTTP healthcheck — it does NOT mean the application's own
   first-run bootstrapping (database migrations, storage config, etc.)
   actually completed. Always independently verify by hitting an API
   endpoint that depends on real data (e.g. `/client-config` for Twenty)
   rather than trusting a bare `/` healthcheck.

2. **Prefer official/actively-maintained templates over generic-sounding
   ones**, and check the template's source repo and last-updated date
   before deploying. `twenty-or-the-1-open-source-crm` turned out to have a
   real unresolved bug in its migration bootstrap; the alternative
   `twenty-crm-production` template (backed by a maintained GitHub repo,
   `nomideusz/twenty-railway`) worked correctly.

3. **`railway deploy -t <template>` via the CLI does not fully replicate
   the Railway web dashboard's "Deploy" button** — specifically,
   auto-provisioned linked resources like S3-compatible buckets don't get
   created/wired the same way. When a template's docs mention an
   auto-provisioned bucket or similar linked resource, expect to either
   configure it manually (e.g. `STORAGE_TYPE=local` as a fallback) or use
   the web UI deploy flow instead of the CLI for that specific step.

4. **When debugging a Railway service that logs nothing useful**, remember
   Railway enforces a 500 logs/sec per-replica rate limit — NestJS's
   verbose `InstanceLoader` boot spam can itself trigger this and silently
   drop the real error message in the same burst. If logs look suspiciously
   incomplete right where you'd expect a stack trace, check for a "Railway
   rate limit... Messages dropped: N" line nearby, and don't trust that "no
   visible error" means "no error occurred."

5. **`railway ssh` gives direct container access for exactly this kind of
   investigation** — running `yarn command:prod --help` (or the equivalent
   CLI help command for whatever app you're debugging) inside the
   container is far more reliable than guessing command names from memory
   or generic web docs, since exact command names change between versions.

## Related

- [twentyhq/twenty#20062](https://github.com/twentyhq/twenty/issues/20062)
  — "Setup script doesn't initialize database schema": the dev-setup script
  creates DB infra but skips running schema migrations, producing the same
  class of `relation "core.X" does not exist` errors.
- [twentyhq/twenty#12936](https://github.com/twentyhq/twenty/issues/12936)
  — "Migration failing in v1.0, when do clear install via k8s/docker |
  Migration issue with already created empty databases": a distinct but
  related manifestation — migrations failing specifically against
  fresh/empty databases on container-based installs.
- [railway.com/deploy/twenty-or-the-1-open-source-crm](https://railway.com/deploy/twenty-or-the-1-open-source-crm)
  — the Railway template that hit this bug (official `twentycrm/twenty:latest`
  image, migrations silently no-op after schema/extension creation).
- [railway.com/deploy/twenty-crm-production](https://railway.com/deploy/twenty-crm-production)
  — the working alternative template (source: `nomideusz/twenty-railway`)
  that ran migrations correctly on first boot.

No other `docs/solutions/` entries exist in this repo yet — this is the
first documented solution.
