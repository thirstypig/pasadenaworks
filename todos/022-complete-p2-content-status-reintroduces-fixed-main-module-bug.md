---
status: complete
priority: p2
issue_id: 022
tags: [code-review, scripts, silent-failure, ci]
dependencies: []
---

# `content-status.mjs` reintroduces the exact "main module" bug `unsplash.mjs` documents fixing

## Problem Statement

`scripts/unsplash.mjs` has an explicit code comment explaining why comparing
`import.meta.url` to a naively-constructed `file://` string is wrong, and uses
`pathToFileURL` to do it safely instead. `scripts/content-status.mjs` uses the
exact naive form the comment warns against, in a sibling script maintained in
the same review pass — the fix never propagated sideways.

## Findings

Found by the pattern-recognition-specialist review agent, 2026-09-09 full-repo pass.

`scripts/unsplash.mjs:207-212` — canonical, safe form, with the comment:
```js
/* CANONICAL COMPARISON. `file://${process.argv[1]}` is a string, not a URL:
   `import.meta.url` percent-encodes spaces and non-ASCII characters, so on a
   checkout path containing either, this test is false and the script exits 0
   having done nothing at all — no output, no error. `pathToFileURL` produces
   the same encoding both sides. */
if (import.meta.url === pathToFileURL(process.argv[1]).href) { ... }
```

`scripts/readability.mjs:557` — a different but equally safe form:
```js
if (process.argv[1] === fileURLToPath(import.meta.url)) { ... }
```

`scripts/content-status.mjs:212` — the naive, broken form:
```js
if (import.meta.url === `file://${process.argv[1]}`) main();
```

**Why it matters:** on a checkout path containing a space or non-ASCII character
(this repo runs Chinese-language content, and a home directory could plausibly
contain either), `npm run content:status` would exit 0 having silently done
nothing — no `CONTENT-STATUS.md` regenerated, no error, no output distinguishing
it from success. This is the identical silent-failure class `unsplash.mjs`'s own
comment was written specifically to warn future editors away from.

## Proposed Solutions

### Option A — Fix `content-status.mjs` to match one of the two safe forms already in the repo

Swap the naive comparison for either the `pathToFileURL` form or the
`fileURLToPath` form already proven correct in the other two scripts.

- **Pros:** Minimal, mechanical, zero new dependencies, matches an existing
  in-repo pattern exactly.
- **Cons:** None.
- **Effort:** Small · **Risk:** Low

### Option B — Extract a shared `isMain(url)` helper and have all three scripts call it

Pull the "is this the entry module" check into one tiny shared module (e.g.
`scripts/is-main.mjs`) so there's one implementation instead of three
independently-maintained ones that have already drifted into three different
correctness levels.

- **Pros:** Prevents this exact class of drift from happening a fourth time —
  a future new script copies the shared helper instead of reinventing the check.
- **Cons:** Slightly more churn than Option A; touches all three scripts instead
  of one.
- **Effort:** Small · **Risk:** Low

## Recommended Action

Option B, since Option A alone leaves the same three-independent-implementations
shape that caused this drift in the first place — extracting a shared helper
closes the class of bug, not just this one instance.

## Technical Details

- `scripts/content-status.mjs:212` — the broken comparison
- `scripts/unsplash.mjs:207-212` — the documented-correct form to copy or extract
- `scripts/readability.mjs:557` — the second (also-correct) existing form

## Acceptance Criteria

- [ ] `content-status.mjs`'s main-module check uses a form proven correct on a
      path containing a space or non-ASCII character (add a regression test that
      exercises this, not just a manual check)
- [ ] If Option B: `scripts/unsplash.mjs` and `scripts/readability.mjs` also
      switch to the shared helper, so there's exactly one implementation
- [ ] `npm run content:status` still regenerates `CONTENT-STATUS.md` correctly

## Work Log

### 2026-09-09 — Found during full-repo review
Pattern-recognition-specialist agent, part of an 8-agent intensive review
requested by the owner. No P1s found across all 8 agents; this is one of three P2s.

### 2026-09-09 — Closed, Option B landed
Extracted `scripts/is-main.mjs` (`isMain(url)`, the `pathToFileURL` form) and
switched all three scripts — `content-status.mjs`, `unsplash.mjs`,
`readability.mjs` — to call it instead of each maintaining its own comparison.
Added `scripts/is-main.test.mjs`: asserts true on a normal path, false when the
URL is a different module, and — the actual regression — true on a path
containing a space or non-ASCII character, with an explicit assertion showing
the naive `file://${path}` string form would have disagreed with the real URL
on that same path.

Verified functionally, not just via the unit test: ran `npm run content:status`
(wrote `CONTENT-STATUS.md` correctly) and `node scripts/unsplash.mjs` (printed
its usage help) directly after the change. `npm run test`: 308 passing (up from
304 — 4 new tests).

## Resources

- Full-repo review, 2026-09-09 (pattern-recognition-specialist agent)
