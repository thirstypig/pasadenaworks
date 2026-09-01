---
status: complete
priority: p2
issue_id: 008
tags: [code-review, correctness, tooling, introduced-by-this-pr]
dependencies: []
---

# The content-status generator now stamps in Pacific but computes its table in UTC

## Problem Statement

This PR changed the header stamp in `scripts/content-status.mjs` to Pacific:

```js
const stamp = today.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
```

but `renderTable(posts, today)` still receives the raw `today`, so every row's
date (`p.pubDate.toISOString().slice(0, 10)`, line 104) and every countdown
(`daysUntil`, line 70) remain UTC. One file, two clocks.

Between 5pm and midnight Pacific the header says one day and the table behaves
as if it were the next — the same "table looks a day out of step" confusion the
change was meant to fix, relocated inside the file.

## Findings

Worse, the comment justifying the change is wrong on both of its claims:

> *Pacific, not UTC. The site date-gates in Pacific and stamps its footer the
> same way…*

- **"The site date-gates in Pacific"** — it does not. `src/utils/blog.ts:15-18`
  and `:110-113` do `data.pubDate <= now` on plain `Date` objects, which is a
  UTC-instant comparison. It lands on the right Pacific day only because
  `deploy.yml`'s cron fires at `0 13 * * *` (06:00 PT) — the *cron* supplies the
  Pacific-ness, not the code.
- **"stamps its footer the same way"** — `src/components/Footer.astro:14` is
  `new Date().getFullYear()`. A year, machine-local, no timezone anywhere.

So this line is the only timezone-aware code in the repo, and its comment
justifies it by appealing to two behaviors that do not exist. A future reader
trusting that comment would draw the wrong conclusion about how the site works.

Separately, `en-CA` is doing load-bearing work unexplained: it is there because
it formats as `YYYY-MM-DD`. On a small-ICU Node build it would silently fall
back and emit `8/31/2026` into a committed doc. `src/utils/blog.test.ts:51-55`
already carries a regression guard for exactly this class of silent `Intl`
fallback, so the codebase treats it as a real hazard — but `main()` is not
exported and the stamp has no test at all.

## Proposed Solutions

### Option A — Revert the stamp to UTC
Put the whole file back on one clock, the one the table already uses.

- **Pros:** Smallest change; internally consistent again; removes a comment
  that is factually wrong. The original "off by a day in the evening" complaint
  was cosmetic on a doc regenerated on demand.
- **Cons:** Re-accepts the evening-off-by-one on the stamp.
- **Effort:** Small · **Risk:** Low

### Option B — Derive a Pacific `today` and pass it to `renderTable`
Make the whole generator Pacific, and correct the comment to say the cron is
what makes publishing land on a Pacific day.

- **Pros:** Consistent, and matches what a reader of the table expects. Keeps
  the improvement that motivated the change.
- **Cons:** More surface; `daysUntil` needs care around DST boundaries.
- **Effort:** Medium · **Risk:** Medium

### Option C — Option B plus extract and test the stamp
`export function dateStamp(date)` built with `Intl.DateTimeFormat(...).formatToParts`,
which is order- and locale-data-independent, plus a unit test.

- **Pros:** Removes the `en-CA` fallback hazard, makes the only timezone-aware
  code in the repo testable, and this PR adds no tests today.
- **Cons:** Most work of the three.
- **Effort:** Medium · **Risk:** Low

## Recommended Action

_(Leave blank for triage.)_

## Technical Details

- **Affected file:** `scripts/content-status.mjs:133-154`
- **Comment is wrong about:** `src/utils/blog.ts:15-18,110-113`, `src/components/Footer.astro:14`
- **Prior art for the Intl hazard:** `src/utils/blog.test.ts:51-55`

## Acceptance Criteria

- [ ] The header stamp and the table rows agree on what day it is, at every
      hour — verified at a time between 5pm and midnight Pacific
- [ ] The comment describes how publishing actually works (cron-driven), or is
      removed
- [ ] If Pacific is kept, the stamp is produced in a way that does not depend on
      `en-CA` locale data being present

## Work Log

- **2026-08-31** — Found by the TypeScript/Astro review during `/ce:review` of
  PR #9. Introduced by this PR. Both claims in the comment independently
  verified false against `blog.ts` and `Footer.astro`.

## Resources

- `scripts/content-status.mjs`
- PR #9, commit "Stamp CONTENT-STATUS in Pacific, and sync the docs"

---

**RESOLVED 2026-08-31 — Option C.** `pacificToday()` returns the Pacific
calendar day as midnight UTC — the same shape every `pubDate` has — and feeds
both the stamp and `renderTable`, so one clock drives the whole file. Built with
`Intl.DateTimeFormat(...).formatToParts` rather than a locale that happens to
print ISO order, removing the small-ICU fallback hazard. The comment now says
what is actually true: the site gates on a UTC instant and the deploy cron is
what makes publishing land on a Pacific day.

The fix demonstrated the bug on the way out: at 23:54 PT on 2026-08-31 (06:54
UTC Sep 1) the table had been counting from Sep 1 while stamped Aug 31, showing
Sep 7 as "6 days" when from Aug 31 it is 7. Both halves now say 7. Five tests
added, including DST on both sides.
