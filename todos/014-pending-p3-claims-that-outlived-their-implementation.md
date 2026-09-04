---
status: pending
priority: p3
issue_id: 014
tags: [code-review, documentation, correctness, seo]
dependencies: []
---

# Four places where the code asserts something that stopped being true

## Problem Statement

This repo's characteristic bug is not broken code — it is code that stopped
being true while its documentation kept asserting it. The 2026-09-03 review
closed four instances at P1/P2 (`:global()` that never applied, an inert
honeypot, a cron with an undocumented dependency, a nav link that predated its
own helper). These four are the same shape, not yet expensive.

Each one actively misleads a reader, which is worse than silence: a comment that
describes a guard makes the next person stop looking for one.

## Findings

**1. A stated safety property with no implementation.**
`scripts/readability.mjs:52-53` says characters-per-sentence "is kept only as a
guard against runaway sentences." Nothing compares it to anything — `verdict()`
never reads it. CLAUDE.md treats every band's upper bound as load-bearing and
records that a 13+ floor alone passed a 15.9-grade draft with 29.8-word
sentences. So this is a guard the codebase believes it has and does not.
`readingEase` is likewise advertised at `:30` as part of the English output and
never printed.

**2. `404.astro:9` sets `path="/404/"`.** Astro emits `dist/404.html`; there is
no `dist/404/index.html`, so that canonical is the only one in the build that
does not resolve. Low impact (the page is served with a 404 status), but it is
also missing `noindex`, and no page in the build contains that string.

**3. `[locale]/index.astro:90-92` lowers a CJK hero underline that no longer
exists.** `grep -rn underline src/data/ src/pages/` returns only this rule.
CLAUDE.md still documents "the ochre hero underline" as a live gotcha. The rule
compiles and ships correctly — it simply targets nothing.

**4. Two comments documenting removed behaviour.**
`scripts/content-status.mjs:13-14` says Tina picks the file up "via its `*.md`
glob". The real glob is `DOCS_ROOT_INCLUDE = '*'` — and `'*.md'` is precisely
the value that made both docs collections index zero documents for four days.
The comment points a future reader at the bug as though it were the fix.
`tina/config.ts:37-39` enumerates "the five root files"; there are six —
`CONTENT-STATUS.md` is matched by the same glob, and its visibility in Tina is
the whole reason `content-status.mjs` writes it there.

## Proposed Solutions

### Option A — Make each claim true, or delete it
Wire the sentence-length ceiling into `verdict()`; drop the 404 canonical and add
`noindex`; delete the dead underline rule and CLAUDE.md's mention; correct both
comments (say "every `.md` at the repo root" rather than enumerating).

- **Pros:** Removes four traps. #1 also closes a real gap in a measurement CLAUDE.md
  says must have an upper bound.
- **Cons:** #1 is a judgement call — picking a ceiling is a decision, not cleanup.
- **Effort:** Small, except #1 (Medium) · **Risk:** Low

### Option B — Delete the claims, implement nothing
Strike the "guard" sentence and `readingEase`, fix the comments, leave the rest.

- **Pros:** Fast and honest; the file stops lying.
- **Cons:** Leaves the measurement without the upper bound CLAUDE.md argues for.
- **Effort:** Small · **Risk:** Low

## Recommended Action

**Option A**, but split #1 out: it needs a decision on what "runaway" means in
characters for Chinese and in words for English. The other three are mechanical.

## Acceptance Criteria

- [ ] Either a sentence-length ceiling exists in `verdict()`, or the claim is gone
- [ ] `/404/` canonical removed; `noindex` present
- [ ] The dead underline rule and its CLAUDE.md mention are gone
- [ ] Neither comment names a glob or a count that is wrong

## Work Log

### 2026-09-03 — Found during full-repo review
Grouped deliberately: individually each is trivial, but the pattern is the one
that has produced this repo's most expensive bugs.
