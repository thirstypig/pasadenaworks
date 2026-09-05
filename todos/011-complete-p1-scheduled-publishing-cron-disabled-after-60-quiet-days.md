---
status: complete
priority: p1
issue_id: 011
tags: [code-review, ci, content-integrity, scheduled-publishing, silent-failure]
dependencies: []
---

# GitHub disables the publishing cron after 60 quiet days, and the site's whole content schedule depends on it

## Problem Statement

`.github/workflows/deploy.yml:11-12` carries the daily `schedule:` cron that is
the *only* thing that makes a date-gated post publish. CLAUDE.md is explicit
that this is half of a two-part mechanism:

> a static site has no clock, so the daily `schedule:` cron is what makes a date
> arrive. Delete it and the filter is still correct and nothing ever publishes.

**GitHub automatically disables scheduled workflows in a public repository after
60 days of no repository activity.** The repo is public (`gh repo view` →
`visibility: PUBLIC`). GitHub emails the owner and the workflow stays disabled
until someone re-enables it by hand.

The failure is silent in the way this repo keeps getting bitten by:

- Nothing goes red. There is no failing run, because there is no run.
- The site does not break. It simply stops gaining posts.
- `CONTENT-STATUS.md` keeps reporting those posts as `✅ live`, because
  `scripts/content-status.mjs` reads **frontmatter**, not deployments. The
  status file will actively assert that everything shipped.

## Findings

16 of the 20 approved posts are still future-dated, running weekly through
2027-01-11. CLAUDE.md describes the intended steady state as:

> 4 are visible today and the rest surface weekly through 2027-01-11 with no one
> doing anything.

"No one doing anything" for 60 days is precisely the disablement condition. This
is not an edge case here — it is the *designed* operating mode. All 20 posts are
written, reviewed and approved, so there is no remaining reason to touch the
repo, which is exactly what makes the clock run out.

Secondary timing risks on the same cron, both self-healing (a day late, not
never):

- GitHub's scheduled runs are best-effort and are commonly delayed under load.
- `concurrency: { group: pages, cancel-in-progress: true }` (deploy.yml:20-22)
  means a push landing near 13:00 UTC can cancel the cron run.

## Proposed Solutions

### Option A — A second scheduled workflow whose only job is to keep the repo active

A tiny workflow on its own cron (say monthly) that makes a trivial commit, or
calls the deploy workflow via `workflow_dispatch`.

- **Pros:** Removes the failure mode entirely and stays inside GitHub. No
  external service to own or pay for.
- **Cons:** A keepalive workflow is itself a scheduled workflow, so it is subject
  to the same 60-day rule — it only works if it *commits*, since a commit is the
  repository activity that resets the clock. Adds commit noise to the history.
- **Effort:** Small · **Risk:** Low

### Option B — An external pinger hitting `workflow_dispatch`

An outside scheduler (the owner already runs n8n on Railway) calls the GitHub API
to dispatch the deploy workflow daily.

- **Pros:** Not subject to GitHub's inactivity rule at all. n8n already exists and
  is already trusted with production work.
- **Cons:** Moves a critical dependency off GitHub onto a service that has its own
  uptime story, and needs a stored GitHub token. If n8n is down for a week, posts
  silently stop — the same class of failure relocated, not removed.
- **Effort:** Medium · **Risk:** Medium

### Option C — Monitoring instead of prevention: alert when a due post is not live

Check the live site for the posts `CONTENT-STATUS.md` says should be published,
and alert on a mismatch.

- **Pros:** Catches *every* reason a post fails to publish, not just this one —
  a broken build, a cancelled run, a bad `pubDate`. Strictly more general.
- **Cons:** Detects rather than prevents; the post is already late when it fires.
  Needs somewhere to run, which lands back on Option A or B.
- **Effort:** Medium · **Risk:** Low

## Recommended Action

**Option A, plus the CLAUDE.md note.** The keepalive must make a real commit
(touching a file such as a `LAST-BUILD` stamp), because it is repository
*activity* that resets the 60-day clock, not workflow runs. Option C is the
better long-term answer and worth doing later, but it needs a host and this
needs closing now.

Whatever is chosen, CLAUDE.md's scheduled-publishing gotcha should gain a third
sentence: the mechanism is a filter, a clock, **and a repo that stays awake.**

## Technical Details

- `.github/workflows/deploy.yml:11-12` — the `schedule:` block
- `.github/workflows/deploy.yml:20-22` — `concurrency` / `cancel-in-progress`
- `src/utils/blog.ts:18` — the `pubDate <= now` filter (the other half)
- `scripts/content-status.mjs` — reports frontmatter, so it cannot see this
- `docs/solutions/logic-errors/static-site-scheduled-publishing-needs-a-clock.md`

## Acceptance Criteria

- [ ] The publishing cron cannot be disabled by 60 days of inactivity
- [ ] The mitigation is itself verified, not assumed — confirm the mechanism
      actually produces repository activity
- [ ] CLAUDE.md's scheduled-publishing section names the inactivity rule
- [ ] A future-dated post is confirmed to publish on its date after the change

## Work Log

### 2026-09-03 — Found during full-repo review
Surfaced by the content-pipeline agent; verified `visibility: PUBLIC` directly.
Not currently broken — the repo was pushed to today, so the clock is reset. The
risk is entirely prospective, which is why it is easy to leave and expensive to
discover later: the first evidence would be a reader noticing a missing post.

### 2026-09-03 — Resolved, Option A
`.github/workflows/keepalive.yml` runs monthly and commits (plus
`--allow-empty`, since the rule is about repository activity and an empty commit
still counts). Self-sustaining: it resets the counter at day 30, so it never
reaches 60. Its push to main also fires `deploy.yml`, giving a guaranteed
monthly rebuild as a side benefit.

Chose A over B (external n8n pinger) because B relocates the dependency rather
than removing it — n8n down for a week is the same silent failure with a
different owner. Option C (monitor the live site for posts that should be
published) is strictly more general and still worth doing later; it needs a host,
which lands back on A or B, and this needed closing now.

CLAUDE.md's scheduled-publishing section now names all three parts: a filter, a
clock, and a heartbeat.

### 2026-09-05 — verified by running it, and one claim was wrong
Dispatched the workflow rather than waiting 30 days. It committed successfully
(author `github-actions[bot]`, `.github/last-keepalive` stamped), so the
mechanism works.

But no `deploy.yml` run started for that commit. GitHub suppresses workflow
triggers for pushes authored with `GITHUB_TOKEN`, to prevent recursion — so the
"guaranteed monthly rebuild" this log and the workflow comment both advertised
was never real. Corrected in both places.

**The limit that cannot be closed from here:** whether GitHub's 60-day heuristic
counts a `GITHUB_TOKEN` commit as repository activity takes 60 quiet days to
find out. A commit is a commit and should qualify. If certainty matters, give
the workflow a fine-grained PAT with `contents: write` — a PAT-authored push is
indistinguishable from a human one and fires other workflows too, which would
also restore the monthly-rebuild benefit.
