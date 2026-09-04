---
status: complete
priority: p3
issue_id: 016
tags: [code-review, architecture, duplication, i18n]
dependencies: []
---

# Seven answers the codebase derives correctly in one place and re-states in several others

## Problem Statement

Todo 006 named this shape once (`sameAs` written three ways). The 2026-09-03
review found it repo-wide, and it is the *cause* of four user-visible defects
fixed in that PR: an English page and its localized twin, each maintaining its
own copy of the same decision, diverging silently.

Fixing those four symptoms without this leaves the mechanism intact.

## Findings

**1. The `translations` map is built four different ways across nine sites.**
Style A hardcodes literals (`index.astro:13-18` and `[locale]/index.astro:21-26`,
byte-identical); Style B hardcodes `en` and template-literals the rest
(services and city hub, each duplicated between the English page and its
localized twin); Style C spells out `blogIndexPath` four times; Style D derives
via `LOCALES.map(...)` and `localeUrl` — the correct one, used only by the two
detail routes. A–C bypass `localeUrl` and re-implement the locale-prefix rule
inline; `en: '/services/'` even bypasses `SEGMENTS.services.en`, which exists.

Not the forbidden pattern: these five pages genuinely do exist in all four
locales, so a four-locale map is correct here. It is the correct map written
longhand five times.

**2. The locale list exists in six places.** `ui.ts:15` is canonical.
`content.config.ts:21` (Zod enum), `tina/config.ts:159` (options),
`readability.mjs:62` (a second `export const LOCALES`), `content-status.mjs:28-29`,
and — the one with teeth — `readability.mjs:366`, disguised as a regex
alternation `(es|zh-hans|zh-hant)` whose unknown case **falls through to `'en'`**.
A fifth locale would be scored with Flesch-Kincaid, which CLAUDE.md itself calls
"meaningless rather than merely wrong" on Chinese, and reported as out of band
with a plausible-looking number. `content.config.ts` can just do `z.enum(LOCALES)`;
the two `.mjs` scripts cannot import TypeScript without a build step, which is
the honest constraint — a shared `.mjs`/`.json` closes it.

**3. `.service-grid` / `.service-card` CSS in four files** — `index.astro:137`,
`[locale]/index.astro:114`, `services/index.astro:40`,
`[locale]/[section]/index.astro:142`. These **already differed**: only the
English file carried `.service-card__link`, which is exactly why that CTA went
missing from the localized index. (The rule was copied to the localized file in
the 2026-09-03 fix; promoting both to `global.css` is the real answer.)

**4. The `pillar` union is declared four times** — `content.config.ts:11`,
`Post.astro:21`, `EndCta.astro:8`, `tina/config.ts:108` — and
`EndCta.astro:14` does `services.find((s) => s.id === pillar)!`, where
`Service.id` is bare `string`. That non-null assertion is the only thing binding
the enum to the service ids. It fails loudly, so it is low severity, but
exporting a `Pillar` type and typing `Service.id` as it makes both `find`s
provably total.

**5. `cityDisplayName` duplicated verbatim** in `Footer.astro:21-22` and
`websites/index.astro:16-17`, the second carrying a comment acknowledging it.

**6. The BCP-47 map** existed three times; the `routes.ts` copy was removed
2026-09-03. `astro.config.mjs:10-15` still restates it, plus `site.url` at `:5`
and `DEFAULT_LOCALE` at `:9`.

**7. `PREFIXED_LOCALES` (`ui.ts:22-25`) has zero consumers** while two route
files each declare `LOCALES.filter((l) => l !== 'en')` inline.

## Proposed Solutions

### Option A — Helpers for the maps, one source for the lists
`homePaths()`, `servicesIndexPaths()`, `cityHubPaths()` in `routes.ts`; a shared
locales module the `.mjs` scripts can import; card CSS to `global.css`; `Pillar`
exported and `Service.id` typed as it; `cityDisplayName` into `cities.ts`.

- **Pros:** Removes the mechanism behind four already-shipped defects. Roughly
  120–160 lines deleted.
- **Cons:** Touches many files at once, which makes review harder and is exactly
  the kind of change that hides a mistake.
- **Effort:** Medium · **Risk:** Medium

### Option B — Only the two with live consequences
The `readability.mjs:366` fallback (silently wrong scoring) and the card CSS
(already drifted once).

- **Pros:** Small, targeted, easy to review.
- **Cons:** Leaves seven maps in four styles.
- **Effort:** Small · **Risk:** Low

## Recommended Action

**Option B first, then A in its own PR.** B contains the only two that can
produce a wrong answer today; A is a refactor and deserves not to ride along
with defect fixes.

## Acceptance Criteria

- [ ] `localeFromPath` returns null (and skips loudly) for an unknown locale, not `'en'`
- [ ] Card CSS has one definition
- [ ] Built HTML is byte-identical before and after any refactor here

## Work Log

### 2026-09-03 — Found during full-repo review
Named as the root cause of todo-PR #17's four copy divergences, not as tidiness.

### 2026-09-04 — Closed. Option B, plus most of A.

**#1 — the six longhand `translations` maps are gone.** Three helpers in
routes.ts (`servicesIndexPaths`, `cityHubPaths`, `blogIndexPaths`), each derived
through `localeUrl` and `SEGMENTS`. The maps had been written out six times in
three styles, all bypassing `localeUrl`, and `en: '/services/'` even bypassed
`SEGMENTS.services.en`, which exists and equals 'services'.

**Verified as a true no-op**: `diff -rq` across every built HTML file reports
nothing, and the md5 of every `<link rel="alternate">` on all 67 pages is
identical before and after. That is the right acceptance test for a refactor
whose whole claim is that it changes nothing.

The two homepage maps in this group were already fixed under todo 015 — those
genuinely needed deriving, because `home` is `Partial`. These three do not: the
pages exist in all four locales, so a full map is correct. The helper comment
records the distinction, since "derive it" and "a four-locale map is fine here"
look contradictory without it.

**#2 — the silent locale fallback is gone.** `localeFromPath`'s alternation
`(es|zh-hans|zh-hant)` is now built from `LOCALES`, so an unknown locale can no
longer fall through to `'en'` and be scored with Flesch-Kincaid — which this
file's own header calls "meaningless rather than merely wrong" on Chinese. Also
removed the fabricated `'dist' + rel` argument at the call site: the regex
anchored on `dist/`, forcing the caller to re-add a prefix that `reportDist` had
deliberately stripped, because hardcoding "dist" had been a bug before.

**#3 — `.service-grid` promoted to global.css**, after hashing all four copies to
confirm they were byte-identical. The `.service-card` rules are deliberately NOT
shared: the English homepage uses the label-frame treatment and the other three a
bordered card. That is a design choice, and merging them would have changed the
homepage. Took the chance to apply `min(16rem, 100%)`, matching the reflow fix
made to BlogPostGrid.

**#4 — `content.config.ts` now does `z.enum(LOCALES)`.** Verified it still
narrows: `locale: ko` fails the build. Adding a locale was always loud; renaming
or removing one was silent — posts with the old value validated against a stale
hand-written enum and then matched nothing, vanishing with no page, no sitemap
entry and no error.

**Still open, and deliberately.** The locale list survives in `tina/config.ts`
(1), `readability.mjs` (3) and `content-status.mjs` (2). The two `.mjs` scripts
run under bare node and cannot import the TypeScript registry without a build
step — that is a real constraint, and closing it means adding a shared
`.mjs`/`.json` module, which is a change of shape rather than a deduplication.
Worth doing; not worth smuggling into this batch. `cityDisplayName` and the
`pillar` union are likewise left.
