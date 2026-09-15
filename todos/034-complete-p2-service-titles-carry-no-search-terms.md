---
status: complete
priority: p2
issue_id: "034"
tags: [code-review, seo, i18n, copy]
dependencies: ["033"]
---

# Service page titles match no search query, and the retired SEO page's keywords vanished from its redirect target

## Problem Statement

A page's `<title>` is its strongest search signal and the first thing an AI
assistant quotes. The three service titles are the display names:
"Digitize the office — Pasadena Works", "Get more patients — Pasadena Works",
"Practice Checkup — Pasadena Works". None names practices, a specialty, EHR, or
local search. Separately, the retired "Get found on Google" page (local SEO, Google
Maps) now redirects to "Get more patients", whose text never says "Maps" or "local
search". Google can treat a redirect to a non-equivalent page as a soft 404 and drop
the old page's signals.

## Findings

- Titles rendered from `copy.title` at `src/pages/services/[service].astro:26` and
  `src/pages/[locale]/[section]/[service].astro:142`.
- SEO reviewer's word count on `<main>` of `/services/websites/`: "SEO" 0, "Maps" 0,
  "local" 0; positive control "Google Business Profile" 2.
- On `main`, the retired page's meta targeted "Local SEO and AI search (GEO)… Google Maps".

## Proposed Solutions

### Option A: Optional `seoTitle` per locale, used for `<title>` only; add Maps/local search to the basics bullet
- **Pros:** H1 keeps its plain-spoken name; titles sit outside readability scoring
  (CLAUDE.md); the target page genuinely covers the retired topic again.
- **Cons:** one more field to keep translated; falls back to `title` when absent.
- **Effort:** Small–Medium · **Risk:** Low

### Option B: Rename the display titles themselves
- **Pros:** no new field.
- **Cons:** loses the voice of the on-page headings, which the owner approved.
- **Effort:** Small · **Risk:** Medium

## Recommended Action

Option A. Keep each `seoTitle` near 60 characters including " — Pasadena Works"
where the language allows.

## Technical Details

- `src/data/services.ts` (ServiceCopy interface + 12 copies), both service routes

## Acceptance Criteria

- [x] Every service page's `<title>` names practices or the service's search term, in all four locales
- [x] H1s unchanged
- [x] "Google Maps" / local search mentioned in the Get more patients basics, all four locales
- [x] Typecheck and tests pass; titles not duplicated across pages (`LC_ALL=C`)

## Work Log

### 2026-09-14 — Found in PR #75 review
Agent-native reviewer (titles) and SEO/i18n reviewer (titles + retired keywords).

### 2026-09-14 — Fixed on the PR #75 branch
Option A. Optional `seoTitle` on ServiceCopy, used by both service routes as `seoTitle ?? title`; H1s unchanged. Set for en and es on all three services and for zh on Digitize and Get more patients (the zh Checkup title is already descriptive after 033). Get more patients' first basics bullet now says the profile is what puts the practice in Google Maps and local search, in all four locales. Built titles confirmed, e.g. "Dental & Medical Practice Marketing, Local SEO — Pasadena Works".

Verified: `npm run typecheck` 0 errors (88 files); `npm run build` no warnings; `npm run test` 349 passed, 1 skipped (350, up from 346); `npm run readability -- --dist` exit 0 with every service page and homepage in band.

**todos/034 is closed.**

## Resources

- PR #75
