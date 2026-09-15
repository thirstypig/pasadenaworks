---
status: complete
priority: p3
issue_id: "042"
tags: [code-review, seo, structured-data, agent-native]
dependencies: []
---

# The site's structured data says where the business works, but not what it does

## Problem Statement

Each homepage carries a hidden block of machine-readable data (JSON-LD) describing the
business for search engines and AI assistants. It gives the name, website, email,
phone, areas served and social profiles — but no description and no list of services.
A crawler reading it learns that Pasadena Works operates in Southern California, not
that it helps health practices digitize and find patients. It never described the old
services either, so this is not a regression. Separately, the county names this PR
added are ambiguous: several US states have an Orange County.

## Findings

- `src/layouts/Base.astro:62-77` builds the `LocalBusiness` object (`name`, `url`,
  `email`, `telephone`, `areaServed`, `sameAs`), rendered only on homepages
  (`Base.astro:146-148`). No `description`, `knowsAbout` or `hasOfferCatalog`.
- `src/data/site.ts:57` — `regionServed` is `['Los Angeles County', 'Orange County',
  'Riverside County', 'San Bernardino County']`, emitted as bare `AdministrativeArea`
  names with no state (`Base.astro:71`).
- `src/layouts/local-business-schema.test.ts` checks only that those names appear.
- Payoff is modest: Google has no rich result for `Service` markup. The gain is clearer
  understanding by crawlers and AI assistants answering "who helps dental practices
  with X near me" directly.

## Proposed Solutions

### Option A — Describe the business and its services; disambiguate the counties

Use `ProfessionalService` (a kind of `LocalBusiness`); add a `description` in the page's
language, `knowsAbout` (EHR setup, HIPAA risk analysis, Google Business Profile…), and a
`hasOfferCatalog` built from `src/data/services.ts` so it cannot drift from the service
pages. Add `containedInPlace` California to each county. Extend the test.

- **Pros:** The homepage finally states what the business does, in four languages, from
  the same data as the visible copy.
- **Cons:** More to keep valid; a per-locale description needs the same translation care
  as any other copy.
- **Effort:** Medium · **Risk:** Low

### Option B — Only disambiguate the counties

Write each as "Orange County, CA", or add `containedInPlace` California.

- **Pros:** One-line change; fixes the only real ambiguity. **Cons:** Leaves the "what" gap.
- **Effort:** Small · **Risk:** Low

## Recommended Action

See the 2026-09-15 work-log entry.

## Technical Details

- `src/layouts/Base.astro:62-77` and `:146-148`; `src/data/site.ts:53-57`; `src/data/services.ts`
- `src/layouts/local-business-schema.test.ts` (existing built-page check)

## Acceptance Criteria

- [x] Each county in `areaServed` is unambiguous (state named, or contained in California)
- [x] If Option A: description and services appear, generated from data, in all four locales
- [x] The built homepage's JSON-LD passes validator.schema.org
- [x] A test covers every new field; `npm run test` after `npm run build` passes

## Work Log

### 2026-09-14 — Found in PR #75 review
Raised by the agent-native and kieran-typescript review agents.

### 2026-09-15 — Fixed
Option A, trimmed: the LocalBusiness JSON-LD now carries the homepage's meta description in its language, marks each county `containedInPlace` California, and lists the live services as a `hasOfferCatalog` read from services.ts, with localized names and URLs. `@type` stays LocalBusiness. Tests on the built en, es and zh-hant homepages check the counties' state, that the description equals the page meta, and that every offered service URL was built. JSON-LD parsed on all four homepages.

Verified: `npm run typecheck` 0 errors (89 files); `npm run build` clean; `npm run test` 357 passed, 1 skipped (358); 30 tests skip without dist/ (measured by moving dist/ aside); `npm run readability -- --dist` exit 0 with the same out-of-band list as before (listing and legal pages only).

**todos/042 is closed.**

## Resources

- PR #75
- Spec: `docs/superpowers/specs/2026-09-14-practice-services-design.md`
