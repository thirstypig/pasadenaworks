---
status: complete
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

### 2026-09-04 — Closed; one of the four was not a defect

**#1 — the guard now exists.** `MAX_CHARS_PER_SENTENCE = 60` and
`sentenceGuard()`, deliberately separate from `verdict()` so the "N/M in band"
counts keep meaning one thing. Scoped to zh, matching the claim the header
actually made. Threshold chosen from measurement (40 posts: min 30.7, median
41.0, p90 46.1, max 47.1), set ~27% above the observed max so it is a tripwire
rather than something prose gets edited to satisfy. Four tests including a
positive control — without one, the corpus assertion would be satisfied by a
guard that can never fire, which is the exact bug being fixed.

**`readingEase` was NOT a defect.** Reported as "advertised and never printed".
It is printed — via `--json`, which the file header points at on line 6. Verified
by running it: `readingEase: 46` on the English rows. Left alone.

**#2** — `Base.astro` gained a `noindex` prop that emits
`robots: noindex, follow` and suppresses **both** canonical and `og:url`. A
canonical asserts the content lives at that address, and `/404/` does not exist
(Astro emits `dist/404.html`). It was the only canonical in the build that did
not resolve.

**#3** — removed. Confirmed dead first: the only `text-decoration: underline`
left in `src/` is in `LangSwitch.astro`. CLAUDE.md's gotcha rewritten to keep the
*principle* (CJK glyphs have no descenders) while recording that the rule went,
so nobody re-adds it speculatively.

**#4** — both comments corrected. `content-status.mjs` now names the real glob
(`DOCS_ROOT_INCLUDE = '*'`) and explains why `'*.md'` is wrong, instead of
citing the broken value as the fix. `tina/config.ts` no longer enumerates "five
root files" — there are six; it now says "every `.md` at the repo root", which
cannot go stale.
