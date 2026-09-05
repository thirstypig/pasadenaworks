---
title: "Tina Cloud's 'remote schema' is the committed tina-lock.json — edit config.ts without regenerating it and every deploy fails"
date: 2026-09-05
category: integration-issues
component: "tina/config.ts, tina/tina-lock.json, .github/workflows/deploy.yml"
symptom: "After merging edits to tina/config.ts, every production deploy failed inside `npx tinacms build` with ERR_CLOUD_CHECK_FAILED ('The local Tina schema doesn't match the remote Tina schema'), while build, typecheck and all 186 tests were green. The daily publish cron failed with it."
tags: [tina, tinacms, tina-cloud, deploy, ci, schema, lock-file, silent-failure, scheduled-publishing, misdiagnosis]
status: solved
---

## Summary

Four commits on 2026-09-04 edited `tina/config.ts` — adding `required: true` to
a field, adding `ui.validate` functions, changing a collection's
`match.include`. Locally everything was green: `npm run build`, `npm run
typecheck`, all 186 tests. After merge, **every production deploy failed**:

```
Error: The local GraphQL schema doesn't match the remote GraphQL schema.
  Reason: [NON_BREAKING - FIELD_TYPE_CHANGED] Field 'Blog.tags' changed type from '[String]' to '[String!]!'
  errorCode: 'ERR_CLOUD_CHECK_FAILED'
```

and, after the first revert, a second, coarser message with no reason line:

```
Error: The local Tina schema doesn't match the remote Tina schema.
```

`deploy.yml`'s daily cron is the only thing that makes a date-gated post publish
(see the scheduled-publishing doc), so a blocked deploy meant 16 queued posts
would not ship. Recovery took two hotfixes and a full revert of `tina/`.

**The root cause was not any of the edits.** It was that `tina/tina-lock.json`
had not been regenerated since 2026-08-31. Tina Cloud does not compile
`config.ts`; its "remote schema" **is that committed file**. Regenerate it and
commit it with the change, and the same edits deploy fine.

The first two recovery attempts chased a remedy — "sync the schema in the Tina
Cloud dashboard" — that does not exist. That misdiagnosis is half of what this
document is for.

## The mechanism, from source

All references are `node_modules/@tinacms/cli/dist/index.js` (@tinacms/cli
2.6.1, tinacms 3.12.1).

`BuildCommand.execute` runs two cloud checks in sequence (≈ lines 3980–4040);
the first failure aborts, which is why only one message appears per run:

**Check A — `checkGraphqlSchema` (≈ 4319–4392).** Fetches the remote GraphQL
schema by introspection, builds the local one from
`tina/__generated__/_graphql.json`, and diffs them with `@graphql-inspector`.
*Any* difference throws, and the first diff entry is printed as the `Reason:`
line. "NON_BREAKING" is graphql-inspector's criticality label; the CLI fails
regardless. Only changes that reach the GraphQL type surface trip this —
`required`, `type`, `list`, a new or removed field.

**Check B — `checkTinaSchema` (≈ 4393–4457).** A SHA-256 comparison:

```js
const localTinaSchema = JSON.parse(await database.bridge.get(
  path.join(database.tinaDirectory, "__generated__", "_schema.json")));
localTinaSchema.version = void 0;
const localTinaSchemaSha = crypto.createHash("sha256")
  .update(JSON.stringify(localTinaSchema)).digest("hex");
if (localTinaSchemaSha !== remoteTinaSchemaSha) throw ...
```

against `GET https://content.tinajs.io/db/<clientId>/<branch>/schemaSha`. A
hash cannot say *what* differs, which is why message 2 has no reason. It is
strictly finer than Check A: everything in the GraphQL surface is in
`_schema.json`, plus labels, descriptions, `ui` objects, `match`, and key order.

### What the remote hash actually is

Hitting the endpoint the CLI uses, with the repo's `.env`:
`main/schemaSha` returned three hashes, and **all three were byte-for-byte the
SHA-256 of the three members of the committed `tina/tina-lock.json`** (`schema`
with `version` stripped, `graphql`, `lookup`). The lock file itself is exactly
`JSON.stringify({schema, lookup, graphql})` of the three `__generated__` files.

Tina's own strings say the same: the CLI warns *"`tina-lock.json` … TinaCloud
requires it to index your schema"* (≈ line 1103); the docs say it *"must be
checked into source control … Run `tinacms dev` locally to trigger an update."*

Tina Cloud **does** re-index `main` on every push — `status/main` reported the
HEAD sha and a timestamp within seconds of each push. It re-indexed four times
during the incident. Every time, it indexed the same lock, and served the same
stale schema. `Last indexed at` moved; the schema did not.

**Who writes the lock:** only `DevCommand` (≈ 3314–3323). `BuildCommand` never
touches it. In this repo that is `npm run admin`, or directly
`npx tinacms dev --no-server --noWatch`. `npx tinacms build` — the command in
`deploy.yml` — compares against the lock but never regenerates it.

## What counts as a schema change

Verified by running Tina's own `buildSchema` on synthetic configs and hashing
the result with the recipe above:

| Edit to `tina/config.ts` | Check A (GraphQL) | Check B (Tina hash) |
|---|---|---|
| `required: true` on a field | **changes** | changes |
| `ui: { validate: fn }` on a field with no prior `ui` | — | **changes** — the function is dropped by `JSON.stringify`, but the now-empty `ui: {}` is a new key |
| `ui: { validate: fn }` on a field that already had `ui` | — | — |
| `match.include` value | — | **changes** |
| `label` / `description` text | — | **changes** |
| key **order** inside a field object | — | **changes** — `JSON.stringify` preserves insertion order |
| comments | — | — |
| function bodies (`slugify`, `validate`) | — | — |

So the "safe list" written into CLAUDE.md during the incident — `ui.validate`,
`description`, `label`, `allowedActions` — was wrong on three of four counts.
**Only comments and function bodies do not reach the hash.**

## Why the bisection went wrong

During recovery, a state that `git diff` showed as differing from the
known-good commit *only in comments* still failed the check, and then the
byte-identical known-good content passed minutes later. The conclusion drawn at
the time — "the remote schema is moving under me" — was wrong. The remote never
moved; the lock had been unchanged for five days.

What the code supports: that intermediate state was **not** schema-identical.
Removing the `validate` bodies by hand almost certainly left an empty `ui: {}`
behind, or reordered keys inside a field — both change the hash, neither looks
like a real change in a diff. The known-good commit passed because it was
schema-identical to the lock: the only `config.ts` change since the lock's last
regeneration had been a function body.

Bisecting by deploy could never have converged, and not for the reason that was
recorded at the time.

## The fix

For any change to `tina/config.ts` or `tina/utils.ts`:

```bash
npx tinacms dev --no-server --noWatch    # ~4s, no credentials, no network
git add tina/tina-lock.json              # commit it WITH the config change
```

That is the entire remedy. The commit is the sync. Tina Cloud indexes the new
lock within seconds of the push, `deploy.yml`'s `waitForDB` polls until
`status: complete`, and both checks pass.

The two improvements reverted during the incident — a Tina editor being unable
to `update` CLAUDE.md, and edit-time validation on `tags`/`heroImage` — can be
restored exactly this way. They were blocked on nothing but a missing lock
regeneration.

There is **no** CLI command that pushes a schema, and nothing in the dashboard
edits one. The dashboard's Reindex button re-reads the lock from GitHub; with a
stale lock it reproduces the stale schema.

## Prevention

Two guards, both credential-free, both verified by reintroducing the actual
incident (`required: true` on `tags`, lock not regenerated):

**1. `ci.yml` regenerates the lock and fails on drift**, before the unit tests:

```yaml
- name: Regenerate tina-lock.json and fail if tina/config.ts drifted from it
  run: |
    npx tinacms dev --no-server --noWatch --noTelemetry
    if ! git diff --quiet -- tina/tina-lock.json; then
      git --no-pager diff -- tina/tina-lock.json | head -c 4000
      echo "::error file=tina/tina-lock.json::tina/config.ts changed the compiled schema but tina/tina-lock.json was not regenerated. ..."
      exit 1
    fi
```

The diff it prints is exactly what the schema change does — which also makes a
deliberate schema change reviewable, since its lock diff ships in the PR. That
dissolves the apparent chicken-and-egg ("a legitimate schema change would
always fail a PR-time cloud check, because the remote still has the old
schema"): the guard checks the PR against *itself*, not against the cloud.

**2. `tina/lock.test.ts`** runs the deploy's own hash comparison — lock vs
`__generated__/_schema.json`, same recipe as `checkTinaSchema` — inside
`npm run test`. It skips when `_schema.json` is absent (gitignored; a fresh
checkout has none), which is why the CI step above runs first: it writes that
file, so the test executes in CI too. Two positive controls: the lock exists and
has its three members, and the hashing function is shown to strip `version` and
to move on any other change.

Verified: with the incident reintroduced, the test fails naming both hashes,
and the CI step's diff names `"required":true`.

### What would not have caught it

- `npm run build` — Astro never runs the cloud check.
- `npm run typecheck` — nothing about the lock is a type.
- 186 tests — none opened `tina-lock.json`.
- `npx tinacms build` run *locally with credentials* — this **does** catch it,
  in ~20 seconds, and was the tool that finally allowed bisection. It is the
  second line of defence, not the first, because it needs `.env` and a network.
- The dashboard — nothing there to catch or fix it.

### Not adopted, and why

`--skip-cloud-checks` on the deploy would have made the red go away. It skips
`checkClientInfo`, `waitForDB`, and both schema checks, then builds and ships
the admin bundle regardless. With a GraphQL-surface mismatch, the shipped
admin's generated queries disagree with what the cloud resolves against — the
failure moves from a red deploy to runtime errors in the editor. The guard
exists for a reason; the fix is to satisfy it, not remove it.

## Related

- [Scheduled publishing on a static site: a date filter is only half the feature](../logic-errors/static-site-scheduled-publishing-needs-a-clock.md) — why a blocked deploy is a content outage here, not an inconvenience
- [Tina collections indexed zero documents because `match.include` already gets the format appended](./tina-match-include-appends-the-format-and-matches-nothing.md) — the same shape: a Tina construct that means something different from what it looks like, failing silently
- [Tina wrote every Chinese post to `<locale>/.md`](./tina-slugify-strips-cjk-and-collides-filenames.md) — the third Tina failure in this corpus; all three were invisible to the local gate
- [`:global()` in a plain stylesheet is dead CSS](../ui-bugs/astro-global-selector-is-inert-outside-a-scoped-style-block.md) — written the same day, with a postscript about claims that outlive their implementation. This incident added one: a *remedy* that never existed, recorded in three places as fact.
- `CLAUDE.md` § *`tina/tina-lock.json` IS the schema Tina Cloud serves* — the house rule
- Tina docs: https://tina.io/docs/tina-folder/overview/ — "must be checked into source control"

## Postscript

Three claims were written into the repo during recovery, each confidently,
each wrong:

1. "Update the schema in Tina Cloud first (dashboard)." — no such mechanism.
2. "`ui.validate` and `description` are safe edits." — both change the hash.
3. "The remote schema is moving under me." — it had not moved in five days.

All three were plausible, all three were consistent with the evidence visible at
the time, and all three would have sent the next person down the same dead end.
They were caught only by reading `@tinacms/cli`'s source and hitting the cloud
endpoints directly. The generalisable rule is the same one the `:global()` doc
ends on: a claim about a mechanism is not evidence the mechanism exists. When
the fix is "do X in a system you cannot see," verify X exists before writing it
down.
