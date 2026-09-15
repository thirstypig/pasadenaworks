---
status: complete
priority: p3
issue_id: "039"
tags: [code-review, readability, tests, maintainability]
dependencies: []
---

# Three hygiene problems in the reading-level scorer, one of which can silently push a page out of band

## Problem Statement

PR #75 taught the reading-level scorer that a bullet point ends a sentence. It works,
but left three loose ends: an invisible character that looks like an empty string, a
doc comment now attached to the wrong thing, and a filter that depends on a CSS class
nothing checks is still there. The third matters most: renaming that class would move
the Spanish homepage out of its target band with every check still green.

## Findings

- **Invisible character.** `scripts/readability.mjs:227` reads `const LIST_ITEM_END = '';`
  on screen, but the quotes hold a raw U+E000 private-use character (bytes `ee 80 80`).
  Editors, diffs and GitHub show `''`, so a well-meaning cleanup would break sentence
  splitting in all four languages.
- **Orphaned doc comment.** The "A LIST ITEM ENDS A SENTENCE" block (lines 208–226) and
  the constant were inserted between `prose()`'s own doc comment (179–207) and
  `function prose` (229). Editor tooltips now show the wrong text for `prose()`.
- **Unasserted class name.** `mainProse()` drops the homepage city list by class
  (`readability.mjs:535`, `ul.service-area`; markup at `src/pages/[locale]/index.astro:82`).
  The only test (`scripts/readability.test.mjs:660`) uses hand-written HTML; nothing
  asserts the **built** localized homepages still contain `class="service-area"`. Rename
  it and `/es/` goes from Fernández Huerta 46 to 58, outside the 40–55 band — and
  `npm run readability -- --dist` fails only on a runaway sentence (line 632), never
  on a band miss.

## Proposed Solutions

### Option A — Escape, move, and assert the class on the built page

Write `'\uE000'`; move the block above `prose()`'s doc comment; add a built-page check
that each localized homepage in `dist/` contains `class="service-area"`.

- **Pros:** Smallest change; fails loudly the moment the class is renamed. **Cons:** The
  scorer still depends on a styling class, just guarded now.
- **Effort:** Small · **Risk:** Low

### Option B — Escape, move, and use a dedicated skip attribute

Same first two fixes; mark the list `data-readability="skip"` and have `mainProse()`
drop any element carrying it.

- **Pros:** A styling rename can no longer change scores; reusable. **Cons:** Edits the
  template too, and still wants one assertion that the attribute exists in `dist/`.
- **Effort:** Small · **Risk:** Low

## Recommended Action

See the 2026-09-15 work-log entry.

## Technical Details

- `scripts/readability.mjs` lines 179–229 and 535; `scripts/readability.test.mjs` 579–706
- `src/pages/[locale]/index.astro` lines 82 (markup) and 154 (CSS)

## Acceptance Criteria

- [x] `LIST_ITEM_END` is written as an escape sequence, not a raw character
- [x] `prose()`'s doc comment sits directly above `function prose`
- [x] A test fails if a built localized homepage loses the marker the scorer relies on
- [x] `npm run test`, `npm run build`, then `npm run readability -- --dist` all pass

## Work Log

### 2026-09-14 — Found in PR #75 review
Raised by the code-simplicity, kieran-typescript and pattern-recognition review agents.

### 2026-09-15 — Fixed
All three fixed in scripts/readability.mjs and its test: `LIST_ITEM_END` is written `'\uE000'` (same runtime value); the list-item block moved above `prose()`'s doc comment, a pure move; two built-page tests assert each localized homepage has `<ul class="service-area">` and that "Monrovia" is excluded from the /es/ score. Each was falsified on scratch copies (class renamed on es and zh-hant copies; exclusion line deleted from a scorer copy). Note: on the 2026-09-15 build, renaming the class moves /es/ from 47 to 55 — the band edge — not 46 to 58; the failure message gives both figures with dates.

Verified: `npm run typecheck` 0 errors (89 files); `npm run build` clean; `npm run test` 357 passed, 1 skipped (358); 30 tests skip without dist/ (measured by moving dist/ aside); `npm run readability -- --dist` exit 0 with the same out-of-band list as before (listing and legal pages only).

**todos/039 is closed.**

## Resources

- PR #75
- Spec: `docs/superpowers/specs/2026-09-14-practice-services-design.md`
