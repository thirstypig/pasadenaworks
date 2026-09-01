---
status: complete
priority: p1
issue_id: 001
tags: [code-review, ci, reliability, content-integrity]
dependencies: []
---

# The test suite that guards content integrity never runs in CI

## Problem Statement

`.github/workflows/deploy.yml` checks out, builds the Tina admin bundle, builds
the site, and deploys. It never runs `npm run test`. The 89 tests are therefore
enforced only by a human remembering to run them locally.

That matters more than usual in this repo, because those tests are the *only*
thing standing between a content mistake and a silent, permanent data loss on
the live site. The failure mode they guard is documented in CLAUDE.md and
`docs/solutions/`: Astro's glob loader dedupes blog entries by the `slug`
frontmatter field **globally**, so two locales sharing a slug silently drops one
post from the collection.

This PR adds 45 translated posts that publish on a schedule through
2027-01-11. Nobody will be watching each publish date.

## Findings

Verified empirically on this branch, not inferred from documentation.
Introduced a real collision (gave a zh-hant post a slug already used by a
zh-hans post) and ran both gates:

**The build does not catch it.**

```
[WARN] [glob-loader] **blog** contains multiple entries with the same slug:
       `zenme-qing-guke-liu-haoping`. Slugs must be unique.
[build] 67 page(s) built in 776ms
[build] Complete!
build exit code: 0
```

Exit code 0. Page count unchanged. A warning in a log nobody reads. This
deploys green with a post missing.

**The test suite does catch it.**

```
FAIL  src/utils/blog-content.test.ts > blog content integrity >
      gives every post a slug unique across ALL locales, not just within one
Tests  1 failed | 88 passed (89)
```

So the guard exists and works. It just isn't wired to anything that runs
automatically. (Collision reverted; file confirmed byte-identical to HEAD.)

Second-order problem specific to this PR: every one of the 45 new posts is
future-dated, so the date gate excludes them from the build. CI builds 67
pages and never renders a single new file. Back-dating locally produces 131
pages, which is how they were verified during authoring — but that was a
manual act that will not repeat.

## Proposed Solutions

### Option A — Add a test step to the existing deploy workflow
Insert `npm ci && npm run test` before the build step in `deploy.yml`.

- **Pros:** Smallest possible change. Blocks a broken deploy outright. Also
  covers the daily `schedule:` cron, so a post that publishes itself is
  validated on the morning it goes live.
- **Cons:** A failing test now blocks the scheduled publish, not just a push.
  That is arguably correct, but it means a content error stops the whole site
  from redeploying rather than shipping one bad page.
- **Effort:** Small · **Risk:** Low

### Option B — Separate CI workflow on pull_request, deploy unchanged
A `ci.yml` running tests on PRs and pushes to main, leaving `deploy.yml` alone.

- **Pros:** Standard shape. Gives PRs a visible green check. Keeps the deploy
  path simple and keeps the cron publish unblockable.
- **Cons:** Deploy can still ship a collision if someone edits content through
  Tina and merges without a PR — which is exactly how the TinaCMS commits in
  this repo's history were made.
- **Effort:** Small · **Risk:** Low

### Option C — Both: tests on PRs, plus fail the build on the glob-loader warning
Option B, plus grep the Astro build output for `multiple entries with the same
slug` and exit non-zero.

- **Pros:** Closes the Tina-edit path too, since it catches the collision at
  build time regardless of how the content arrived.
- **Cons:** Log-scraping is brittle if Astro changes the warning text. Needs a
  comment explaining why it exists or someone will delete it.
- **Effort:** Medium · **Risk:** Low

## Recommended Action

_(Leave blank for triage.)_

## Technical Details

- **Affected files:** `.github/workflows/deploy.yml`
- **The guard that exists:** `src/utils/blog-content.test.ts`
- **Related documentation:** CLAUDE.md gotchas; `docs/solutions/logic-errors/static-site-scheduled-publishing-needs-a-clock.md`

## Acceptance Criteria

- [ ] `npm run test` runs automatically on pull requests
- [ ] A slug collision on a branch causes a visible red check, not a warning
- [ ] Decision recorded on whether a failing test should block the daily
      scheduled publish (Option A) or only human-initiated changes (Option B)
- [ ] Verified by pushing a deliberate collision to a scratch branch and
      confirming CI goes red

## Work Log

- **2026-08-31** — Found during `/ce:review` of PR #9. Confirmed by injecting a
  real slug collision and running both gates: build exits 0, tests fail. Not
  inferred from the docs — the docs said the build "succeeds" and that turned
  out to be exactly right, but worth proving before filing.

## Resources

- PR #9
- `src/utils/blog-content.test.ts`
- `.github/workflows/deploy.yml`

---

**RESOLVED 2026-08-31 — Option C.** New `.github/workflows/ci.yml` runs the
suite plus a build on every pull request and every non-main branch push;
`deploy.yml` gained a test step before the Tina build, so pushes to main and the
daily scheduled publish are gated too. The build runs once and its log is
grepped for the glob-loader duplicate-slug warning, promoting it to a failure —
that also catches a collision committed through the Tina admin, which never
opens a PR. Verified by reintroducing a real collision: the guard fired.
