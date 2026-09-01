---
status: complete
priority: p2
issue_id: 004
tags: [code-review, documentation, agent-context]
dependencies: []
---

# CLAUDE.md still says 5 of 20 posts are translated — this PR made that false

## Problem Statement

`CLAUDE.md:322-327`, under "Known outstanding work", says:

> **5 of the 20 have Spanish/Simplified/Traditional Chinese translations;
> 15 do not.** Date-gating turns that backlog into a queue with deadlines:
> each post needs its translations before its own `pubDate`, or it publishes
> English-only. Next gap is 2026-09-14's `instagram-vs-website`, then weekly.
> Three are load-bearing — 2026-09-28 (Spanish), 2026-10-12 and 2026-10-19
> (Chinese) argue for exactly the reach they'd be missing.

Every claim in that paragraph is now wrong. Verified against the tree:

```
20 of 20 posts have all four languages
```

The backlog it describes, the "next gap", and all three load-bearing deadlines
were eliminated by this PR.

## Findings

This matters more here than stale docs usually do. `CLAUDE.md` is this repo's
agent brief — it is loaded into context at the start of every session and is
explicitly described as instructions that override default behavior. A future
session reading it would believe there are 14 posts left to translate and three
deadlines to plan around. The plausible outcomes are wasted effort re-planning
work that is done, or worse, a second set of translations written over the
existing ones.

`CONTENT-PLAN.md` was updated in this PR and is correct. `CONTENT-STATUS.md` is
generated and is correct. `CLAUDE.md` is the one that was missed — which is the
same class of failure its own "Resolved" section exists to prevent, and the same
one the 2026-08-27 changelog entry in `MASTER-PORTS.md` describes as "the
description just went stale in place."

## Proposed Solutions

### Option A — Rewrite the section to describe the new state
Replace the paragraph with the current fact: all 20 posts are complete in four
languages, no translation deadlines remain, and the rule going forward is to
translate alongside the English draft.

- **Pros:** Correct, and preserves the *reasoning* (why date-gating makes this
  urgent) which is still valuable for future posts.
- **Cons:** None.
- **Effort:** Small · **Risk:** Low

### Option B — Move it to the Resolved section
Treat it like the other completed items and link to `CONTENT-PLAN.md`.

- **Pros:** Matches the file's existing convention for finished work, keeps
  "Known outstanding work" genuinely outstanding.
- **Cons:** Loses the forward-looking rule unless it is restated somewhere.
- **Effort:** Small · **Risk:** Low

### Option C — Point at the generated file instead of restating counts
Replace the hardcoded numbers with a pointer to `CONTENT-STATUS.md`.

- **Pros:** Cannot go stale again — the generated file is regenerated from
  frontmatter. Fixes the root cause rather than this instance.
- **Cons:** A reader loses the at-a-glance summary without opening another file.
- **Effort:** Small · **Risk:** Low

## Recommended Action

_(Leave blank for triage.)_

## Technical Details

- **Affected files:** `CLAUDE.md:314-330`
- **Already correct:** `CONTENT-PLAN.md`, `CONTENT-STATUS.md`

## Acceptance Criteria

- [ ] CLAUDE.md no longer claims a translation backlog exists
- [ ] The forward-looking rule (translate alongside the English draft, because a
      missed `pubDate` publishes English-only permanently) survives somewhere
- [ ] Counts either match reality or are replaced by a pointer to the generated
      file so they cannot drift again

## Work Log

- **2026-08-31** — Found during `/ce:review` of PR #9 by diffing the file's
  claims against the tree. Self-inflicted: introduced by the same PR that
  invalidated it.

## Resources

- `CLAUDE.md:314-330`
- `CONTENT-STATUS.md` (generated)

---

**RESOLVED 2026-08-31 — Options A + C.** The section now states the real
position (all 20 complete, no backlog), keeps the forward-looking rule, and
points at `CONTENT-STATUS.md` as the live answer with an explicit note that the
hardcoded line is the one that goes stale.
