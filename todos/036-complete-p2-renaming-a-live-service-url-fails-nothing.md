---
status: complete
priority: p2
issue_id: "036"
tags: [code-review, seo, tests, architecture]
dependencies: []
---

# Renaming or deleting a live service URL leaves every test green while four indexed pages 404

## Problem Statement

The Practice Checkup now lives at `/services/business-advice/`, so renaming that
slug is the obvious next edit. Doing it moves the page, and every link, hreflang tag
and sitemap entry follows the new slug — so CI stays green while four URLs Google
has indexed return 404. The redirect test cannot catch it: it compares two
hand-written lists (the redirect map and `RETIRED_SLUGS` in the test), and neither
is checked against URLs that actually shipped.

## Findings

- `src/data/retired-services.test.ts:17–36` — "derived" equality of two hand lists.
- `src/data/services.test.ts:46–55` — a third, partial copy (6 of 8).
- No test references `business-advice`, `asesoria-de-negocios` or `jingying-zixun`
  outside `services.ts` (TypeScript reviewer's grep).
- The only test that fails on removing a service is the display-order pin, and the
  natural "fix" is editing the expected array.

## Proposed Solutions

### Option A: An append-only ledger of every service URL ever published
A literal list of paths (five service ids × four locales); a test asserts each one
is either a live service page or a key in `RETIRED_SERVICE_REDIRECTS`, and that the
live set is a subset of the ledger (so a new URL must be recorded).
- **Pros:** catches renames and deletions; failure message says "add a redirect".
- **Cons:** one more list to append when a service is added.
- **Effort:** Small · **Risk:** Low

### Option B: Pin each live service's four slugs in `services.test.ts`
- **Pros:** smallest.
- **Cons:** failure says "update the test", so it gets fixed the wrong way.
- **Effort:** Small · **Risk:** Medium

## Recommended Action

Option A. It also replaces the partial 6-of-8 copy in `services.test.ts` (see 040).

## Technical Details

- `src/data/retired-services.test.ts` (or a new sibling test), `src/data/services.test.ts`

## Acceptance Criteria

- [x] Ledger lists all 20 historical service paths, written literally
- [x] Test fails when a live slug is renamed without a redirect (verified by injection, then reverted)
- [x] Test fails when a new live service URL is not in the ledger
- [x] Partial duplicate block removed

## Work Log

### 2026-09-14 — Found in PR #75 review
Kieran-typescript (P2), architecture-strategist (P2), code-simplicity (P3).

### 2026-09-14 — Fixed on the PR #75 branch
Option A. `retired-services.test.ts` now holds PUBLISHED_SERVICE_URLS, a literal append-only list of all 20 service URLs (history on main shows no other slug or segment ever existed), with four source tests: every published URL is live or redirected; every live URL is recorded; redirects come only from published, non-live URLs; each target is a live page in the same language. RETIRED_SLUGS and the partial 6-of-8 block in services.test.ts were removed. Falsified by renaming business-advice → practice-checkup: both ledger tests failed with the "would 404 — add a redirect" message, then restored.

Verified: `npm run typecheck` 0 errors (88 files); `npm run build` no warnings; `npm run test` 349 passed, 1 skipped (350, up from 346); `npm run readability -- --dist` exit 0 with every service page and homepage in band.

**todos/036 is closed.**

## Resources

- PR #75; `src/data/retired-services.mjs`
