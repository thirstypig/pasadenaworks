---
status: complete
priority: p3
issue_id: 015
tags: [code-review, seo, hreflang, content-integrity]
dependencies: []
---

# Three invariants that hold today only because a test happens to cover them

## Problem Statement

Hard rule 1 (never claim a translation that does not exist) is enforced
structurally almost everywhere: `cityLocales()`, `getTranslationsFor()` and the
services' total `Record<Locale, …>` all derive the answer from real data. Three
places instead *assert* it and rely on a test to notice if the assertion goes
wrong. That works until someone adds the next service-like data type, which will
not have the test.

## Findings

**1. The homepage is the only page type whose hreflang is asserted, not derived.**
`src/pages/index.astro:13-18` and `src/pages/[locale]/index.astro:21-26` hardcode
all four homepage paths. But `[locale]/index.astro:11-16` derives
`getStaticPaths` from `Object.keys(home)`, and `home` is
`Partial<Record<Locale, HomeCopy>>` (`src/data/home.ts:26`) — partial on purpose.

Scenario: comment out the `zh-hant` block pending a rewrite. `/zh-hant/` stops
being generated, while the English homepage keeps emitting
`hreflang="zh-Hant" href="…/zh-hant/"` and `LangSwitch` keeps rendering the 繁
link. Both now point at a 404. TypeScript is satisfied, because `Partial` is the
correct type. The build passes. Fix: derive from `home` the same way
`getStaticPaths` does.

**2. Services hardcode all four locales for hreflang.**
`[locale]/[section]/[service].astro:112-114` maps `LOCALES` unconditionally,
where the city branch immediately below filters through `cityLocales()`.
`services.test.ts:22` asserts every service has all four locales, so the map is
currently truthful — the test is the guard. But CLAUDE.md's hard rule says
explicitly: *"Don't hardcode a full four-locale map for consistency."* This is
that shape, kept honest by something in another file.

**3. `slug` is an unvalidated free string, and two slugs can collide on one file.**
`src/content.config.ts:30` has no format constraint. `Website-Costs` and
`website-costs` are two distinct, uniqueness-test-passing slugs that both
slugify to `en/website-costs.md` — so the second Tina save silently overwrites
the first. This is the inverse of the collision todo 002 closed, and it is still
open. `z.string().regex(/^[a-z0-9-]+$/)` closes both halves and makes the
filename derivation total.

## Proposed Solutions

### Option A — Derive all three
`homePaths()` helper from `Object.keys(home)`; filter services by declared
locales the way cities are filtered; add the slug regex.

- **Pros:** Moves all three from "a test notices" to "it cannot happen".
  #3 in particular removes a real data-loss path through Tina.
- **Cons:** #2 changes code that is not currently wrong, which needs a clear
  comment or it will read as churn.
- **Effort:** Small · **Risk:** Low

### Option B — Slug regex only
Fix #3, leave #1 and #2 to their tests.

- **Pros:** Targets the one with a live data-loss path.
- **Cons:** Leaves the homepage able to emit an alternate at a 404.
- **Effort:** Small · **Risk:** Low

## Recommended Action

**Option A.** #3 first — it is the only one that can destroy content.

## Acceptance Criteria

- [ ] Removing a locale from `home.ts` removes it from the homepage's alternates
- [ ] A service missing a locale does not produce an alternate for it
- [ ] A slug with an uppercase letter or a space fails the build
- [ ] `npm run build` still emits 0 alternates for glendale, 3 for arcadia, 5 for alhambra

## Work Log

### 2026-09-03 — Found during full-repo review
#2 was reported as a likely P1 and downgraded after checking: `services.test.ts`
does assert the invariant, so nothing is currently wrong. Recorded at its honest
severity rather than its alarming shape.

### 2026-09-04 — Closed; two fixed, one dissolved on inspection

**#1 — derived.** `homeTranslations()` in `src/data/home.ts` builds the map from
`Object.keys(home)` plus an explicit `en` (the English homepage's copy lives in
`src/pages/index.astro`, not in `home.ts`). Both homepages use it. Proven by
commenting out the `zh-hant` block: `/zh-hant/` stops being generated **and** the
English homepage stops advertising it. Before, the alternate would have pointed
at a 404. It fixes `LangSwitch` at the same time, since that reads the same map.
Built output otherwise byte-identical.

**#3 — constrained.** `slug` is now
`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`. Verified first that all 80 existing slugs pass
and none collide, then falsified: `slug: Website-Costs` fails the build with
`InvalidContentEntryDataError … lowercase letters, digits and single hyphens
only`. That closes the inverse of todo 002 — two distinct slugs that both write
one filename, where the second Tina save silently overwrote the first.

**#2 was not a defect.** Flagged on shape: services map all four locales for
hreflang where cities filter. But `Service.slugs` and `Service.t` are total
`Record<Locale, …>` (services.ts:45-46), so a service missing a locale is a
COMPILE error — the type already is the structural guard this todo asks for.
`City.t` is `Partial<…>` by design, which is why cities need a runtime filter.
No code change; a comment now records the distinction so it is not re-flagged,
and explicitly says not to "fix" it by filtering, which would add a runtime guard
for a case the compiler rejects.

The useful generalisation: *"hardcodes all four locales"* is not by itself a
hard-rule-1 violation. Whether it is depends on whether the type permits a
partial. Two of these three looked identical and only one was real.
