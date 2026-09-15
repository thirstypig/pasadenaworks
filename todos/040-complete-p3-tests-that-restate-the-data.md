---
status: complete
priority: p3
issue_id: "040"
tags: [code-review, tests, duplication, maintainability]
dependencies: []
---

# Several new tests copy the data they check, so they prove little and must be edited in lockstep

## Problem Statement

A test earns its keep by catching a mistake nobody saw. Several tests added in PR #75
retype values from the data files instead, so an honest copy change turns them red for
no reason, while a mistake made in both places passes. Nothing is broken; this is
maintenance weight and false comfort. **Overlap:** the concurrent P2 work for todos
036/037 already absorbs (a); re-check the rest after it merges.

## Findings

- **(a) Retired slugs typed three times** at review: `src/data/retired-services.mjs`,
  `RETIRED_SLUGS` in `src/data/retired-services.test.ts`, and a partial 6-of-8 copy in
  `src/data/services.test.ts` (missing `zh-hans/fufei-guanggao`, `zh-hant/google-tuiguang`).
  **Since addressed by the 036 work:** `RETIRED_SLUGS` became the deliberately literal,
  append-only `PUBLISHED_SERVICE_URLS` ledger, and the partial copy is gone. Verify on merge.
- **(b) Echo tests** in `services.test.ts`: Digitize's four slugs (20-25), the display
  order pin (27-29), a line-by-line copy of `PILLAR_SERVICE` (53-58), and a check for
  the placeholder "URL from sources file" (100-102) that nothing can produce.
- **(c) Misnamed test:** "gives every blog pillar a live service" (47-51) reads its
  expected value from `PILLAR_SERVICE` itself, so it only proves nothing throws.
- **(d)** `src/i18n/homepage-parity.test.ts:113` uses the English H1 sentence as its
  needle, so the next headline edit breaks it; match `{copy.heroHeading}` instead.
- **(e)** `services.test.ts:72` and `:111` hardcode `['es', 'zh-hans', 'zh-hant']`
  rather than importing `TRANSLATED_LOCALES` from `src/i18n/locales.mjs:55`.
- **(f)** `builtPages()` in `retired-services.test.ts:127` copies the walker in
  `src/i18n/rendered-links.test.ts:35-47`.
- **(g)** `src/layouts/local-business-schema.test.ts` is a new 28-line file for one check
  that could sit in `src/layouts/og-image.test.ts` with the other built-homepage checks.

## Proposed Solutions

### Option A — One cleanup pass after 036/037 merge

Delete or rename the echo tests; import the locale list; share one walker; fold the
schema test into `og-image.test.ts`.

- **Pros:** Fewer edits per copy change; each test left can fail for a real reason.
  **Cons:** Touches five test files; the test count drops, which must be explained.
- **Effort:** Small · **Risk:** Low

### Option B — Fix only (c) and (e) now

- **Pros:** Fixes the overclaiming name and locale list. **Cons:** Echoes and walker stay.
- **Effort:** Small · **Risk:** Low

## Recommended Action

See the 2026-09-15 work-log entry.

## Technical Details

- `src/data/`: `services.test.ts`, `retired-services.test.ts`; `src/i18n/`: `homepage-parity`,
  `rendered-links`; `src/layouts/`: `local-business-schema`, `og-image` (all `.test.ts`)

## Acceptance Criteria

- [x] (a) confirmed resolved by the 036 ledger once merged
- [x] No test name claims more than its assertion proves
- [x] Translated-locale lists come from `src/i18n/locales.mjs`; one built-page walker
- [x] `npm run test` passes before and after `npm run build`; any count change explained

## Work Log

### 2026-09-14 — Found in PR #75 review
Raised by the code-simplicity, pattern-recognition and kieran-typescript review agents.

### 2026-09-15 — Fixed
(a) done by 036. (b) Removed the Digitize slug echo test (the published-URL list pins every slug) and the placeholder check; kept the display-order test, renamed to say the order is the owner's decision. (c) Renamed the derived pillar test to "resolves every blog pillar to a service without throwing"; the hardcoded mapping test stays as the real assertion. (d) The homepage-parity needle is read from the English page's H1, with a positive control on its length. (e) services.test.ts uses LOCALES and TRANSLATED_LOCALES. (f) The built-page walker lives once in src/utils/built-pages.ts, imported by both tests. (g) local-business-schema.test.ts was kept as its own file: with todo 042 it now carries five checks, not one.

Verified: `npm run typecheck` 0 errors (89 files); `npm run build` clean; `npm run test` 357 passed, 1 skipped (358); 30 tests skip without dist/ (measured by moving dist/ aside); `npm run readability -- --dist` exit 0 with the same out-of-band list as before (listing and legal pages only).

**todos/040 is closed.**

## Resources

- PR #75; todos 036 and 037 (overlapping P2 work)
- Spec: `docs/superpowers/specs/2026-09-14-practice-services-design.md`
