---
status: complete
priority: p2
issue_id: "037"
tags: [code-review, seo, tests, content]
dependencies: ["036"]
---

# Service links written inside blog posts are never checked, and most posts are not built yet

## Problem Statement

This PR had to fix four blog posts by hand that linked to a retired Chinese service
URL. Nothing would have caught a fifth. The retired-services test scans built pages
for **hreflang** links to retired URLs — which are generated from live slugs, so that
scan cannot fail on its own — and `rendered-links.test.ts` checks only header and
footer links. Worse, 63 of the 68 post sets have a future `pubDate`, so they are not
in `dist/` at all: any built-page check is blind to them until the day they publish.

## Findings

- `src/data/retired-services.test.ts:49–61, 83–94` — hreflang-only scan.
- `src/i18n/rendered-links.test.ts:103` — nav/footer only.
- 12 blog files (3 sets × 4 locales) hardcode service paths in their text.
- Today every such link points at a live slug (SEO and TypeScript reviewers grepped).

## Proposed Solutions

### Option A: Source-side test over all 272 post files
Extract every markdown link to `/{services|servicios|fuwu}/<slug>/` (with locale
prefix) and assert `serviceBySlug(locale, slug)` finds a live service in that
locale. Widen the built-page scan to any `href`, not only hreflang.
- **Pros:** covers unpublished posts; cheap; fails with the file and link.
- **Cons:** only service links (the class of link that actually broke).
- **Effort:** Small · **Risk:** Low

### Option B: Post-build check that every internal href resolves in `dist/`
- **Pros:** broader.
- **Cons:** still blind to the 63 unpublished sets.
- **Effort:** Medium · **Risk:** Low

## Recommended Action

Option A.

## Technical Details

- `src/utils/blog-content.test.ts` (or `retired-services.test.ts`), `src/data/services.ts` (`serviceBySlug`)

## Acceptance Criteria

- [x] Test reads all post files including future-dated ones and finds ≥ 12 service links (positive control)
- [x] Fails on an injected link to `/zh-hans/fuwu/guge-tuiguang/` (verified, then reverted)
- [x] Built-page scan matches any href to a retired URL

## Work Log

### 2026-09-14 — Found in PR #75 review
Architecture-strategist (P2), code-simplicity (P2), kieran-typescript (P3 note).

### 2026-09-14 — Fixed on the PR #75 branch
Option A. New source test reads all post files (including date-gated ones) and asserts every service link resolves to a live service page, with a ≥12-link positive control; the built-page scan now matches any href, not only hreflang, with its own positive control. Falsified twice: a probe post linking /zh-hans/fuwu/guge-tuiguang/ and a probe built page linking /services/paid-advertising/ both went red, and the slug-rename probe from 036 also turned this test red via existing posts. Probes moved out afterwards.

Verified: `npm run typecheck` 0 errors (88 files); `npm run build` no warnings; `npm run test` 349 passed, 1 skipped (350, up from 346); `npm run readability -- --dist` exit 0 with every service page and homepage in band.

**todos/037 is closed.**

## Resources

- PR #75
