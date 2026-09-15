---
status: complete
priority: p2
issue_id: "038"
tags: [code-review, architecture, seo, city-pages]
dependencies: []
---

# The city-page URL segment is borrowed from the "websites" service slug, and this PR makes that permanent

## Problem Statement

`routes.ts` builds the city-hub segment (`/websites/pasadena/`) from the `websites`
service's slugs, and this PR writes "`websites` can never be retired or renamed"
into code comments and CLAUDE.md. The link is only that the two use the same word;
nothing needs them equal. Consequences: "Get more patients" can never get a matching
slug; practice city pages (spec §9.1, already designed on the stacked branch) inherit
`/websites/<city>/`; and a service slug edit silently moves every city page with no
redirect.

## Findings

- `src/i18n/routes.ts:51` — `cityHub: services.find((s) => s.id === 'websites')!.slugs`
- `src/data/services.ts:21–22` and CLAUDE.md — the "never rename" rule.
- Every read of `SEGMENTS.cityHub` is in `[service].astro` (lines ~78, 163, 168, 238);
  none needs it to equal the service slug (architecture reviewer).

## Proposed Solutions

### Option A: Literal city-hub record with a pinning test
Write today's four values literally in `routes.ts`; a test pins them with a message
saying a change moves every city page and needs redirects.
- **Pros:** built site unchanged; the service can be renamed independently later;
  the rule "never rename websites" goes away.
- **Cons:** the two words can now drift apart (which is the point).
- **Effort:** Small · **Risk:** Low

### Option B: Keep the coupling, pin the four values in a test
- **Pros:** smallest change.
- **Cons:** the constraint on the service stays.
- **Effort:** Small · **Risk:** Low

## Recommended Action

Option A, and update the comments and CLAUDE.md that state the old rule.

## Technical Details

- `src/i18n/routes.ts`, `src/i18n/routes.test.ts`, `src/data/services.ts` comment, CLAUDE.md

## Acceptance Criteria

- [x] `routes.ts` no longer imports the service list for the city hub
- [x] Built city pages at identical URLs (Glendale 0 alternates, Alhambra 4 + x-default)
- [x] Pinning test fails on a changed city-hub value (verified, then reverted)
- [x] No doc still claims `websites` can never be renamed

## Work Log

### 2026-09-14 — Found in PR #75 review
Architecture-strategist (P2).

### 2026-09-14 — Fixed on the PR #75 branch
Option A. `SEGMENTS.cityHub` is now written out in routes.ts (no import of services.ts), pinned by a new test in routes.test.ts whose failure message says to add redirects. The services.ts comment and CLAUDE.md no longer claim `websites` can never be renamed. Falsified with an injected es value, then restored. Built city URLs unchanged.

Verified: `npm run typecheck` 0 errors (88 files); `npm run build` no warnings; `npm run test` 349 passed, 1 skipped (350, up from 346); `npm run readability -- --dist` exit 0 with every service page and homepage in band.

**todos/038 is closed.**

## Resources

- PR #75; `docs/superpowers/specs/2026-09-14-practice-city-pages-design.md` (stacked branch)
