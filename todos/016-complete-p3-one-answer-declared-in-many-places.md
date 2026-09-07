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

### 2026-09-06 — The locale list is now declared once

The item left open on 2026-09-04 ("the locale list survives in `tina/config.ts`,
`readability.mjs` and `content-status.mjs` … a change of shape rather than a
deduplication") is closed. `src/i18n/locales.mjs` is the single declaration;
all four consumers import it.

**Plain ESM was the only format all three worlds can read.** `readability.mjs`
and `content-status.mjs` run under bare node with no build step — that is the
point of them — so they cannot import a `.ts`. Tina compiles its config in a
separate esbuild pass. Astro/Vite reads either. So the list lives in `.mjs` and
the TypeScript side re-exports it, rather than the reverse.

**The trap, which was measured rather than assumed.** `Locale` is derived from
this array via `(typeof LOCALES)[number]`, and TypeScript **widens a bare array
in a `.mjs` to `string[]`** — which would make `Locale` equal to `string` while
everything still compiled, silently disabling `buildAlternates()`, the
`RouteProps`/`HubProps` discriminated unions from todo 012, and every
`Record<Locale, …>` map. Probed both forms against the project's own `tsc`
before committing to a design:

| form in the `.mjs` | `(typeof LOCALES)[number]` resolves to |
|---|---|
| `export const LOCALES = ['en', …]` | `string` — literals lost |
| same, with `/** @type {readonly ['en', …]} */` | `"en" \| "es" \| "zh-hans" \| "zh-hant"` |

So the annotation is load-bearing, and the list appears twice inside
`locales.mjs` — adjacent lines, one file to edit. Confirmed afterwards in the
real repo by assigning `'klingon'` to `Locale`, which errors with the full union.

**`checkJs` is off, so nothing in the compiler checks the annotation is still
there.** `src/i18n/locales.test.ts` covers that gap two ways:

- A **compile-time** guard, `string extends Locale ? true : false` asserted as
  `false`. If `Locale` ever widens, this fails `npm run typecheck` — a runtime
  test cannot see it at all.
- A repo walk that fails if any **production** file re-declares the four
  strings. Test files are excluded deliberately: a test that imports the list it
  checks asserts the list equals itself. Five test files name these strings
  directly and should keep doing so (todo 019).

Both were falsified before being kept. Removing the annotation fails the
typecheck with `Type 'false' is not assignable to type 'true'`; adding a fifth
copy to `src/i18n/utils.ts` fails the walk by name. `locales.mjs` was restored
from a copy and confirmed byte-identical by sha256.

**`tina/config.ts` was touched, so the lock was regenerated** per the rule in
CLAUDE.md — `npx tinacms dev --no-server --noWatch`. The hash is **unchanged**
(`b7c543d7…`): `options: [...LOCALES]` compiles to the same four values, so
Tina Cloud sees no schema change and there is no `ERR_CLOUD_CHECK_FAILED` risk.
Verified by `git diff --quiet tina/tina-lock.json` rather than assumed.

`content-status.mjs`'s `TRANSLATIONS` is now the derived `TRANSLATED_LOCALES`
(everything but the default) rather than a fifth hand-written list. Both bare-node
scripts were run to confirm they still work: `content:status` regenerated 20
posts, `readability` scored 20/20 in band.

**Still open from this todo:** `cityDisplayName` and the `pillar` union remain
declared in more than one place, as recorded on 2026-09-04.

### 2026-09-06 — `cityDisplayName` and the `pillar` union, closed

The two items left open on 2026-09-04. One of them turned out to be a live bug,
not just duplication.

**`cityDisplayName` had diverged, and the divergence threw at build.** The helper
existed in `Footer.astro` and in `pages/websites/index.astro`. During todo 020 a
`.filter(Boolean)` guard was added to the Footer copy — and only that one. Run
against the same inputs:

| slug | Footer (guarded) | websites/index (not) |
|---|---|---|
| `south-pasadena` | `"South Pasadena"` | `"South Pasadena"` |
| `-pasadena` | `"Pasadena"` | **throws** |
| `south--pasadena` | `"South Pasadena"` | **throws** |

`word[0]` on an empty segment is `undefined`; `noUncheckedIndexedAccess` is off,
so it types as `string` and the compiler cannot see it. A city added with a
typo'd slug would have failed the build with
`Cannot read properties of undefined (reading 'toUpperCase')`, pointing at a
`.map()` rather than at the slug — and only from one of the two call sites.

This is this todo's thesis caught in the act: **a fix applied to one copy of a
duplicated answer and not the other.** The unguarded copy even carried
`/** … Matches the same derivation Footer.astro uses. */` — an assertion that had
stopped being true and was actively hiding the divergence. It is gone with the
code it described. One implementation now lives in `cities.ts`, the module that
owns city data.

**The `pillar` union was in four places** — the Zod enum in `content.config.ts`,
TypeScript unions in `EndCta.astro` and `Post.astro`, and `options` in
`tina/config.ts`. All four now read `src/data/pillars.ts`.

**`.ts`, not `.mjs`, and the difference from `locales.mjs` is worth stating.**
The locale list is plain ESM because two bare-node scripts import it and cannot
read TypeScript. Nothing needs the pillar list that way: `readability.mjs` and
`content-status.mjs` pass a post's `pillar` value straight through from
frontmatter without ever declaring the set. `tina/config.ts` is TypeScript
compiled by @tinacms/cli's esbuild and already imports `./utils`, so every
consumer can reach a `.ts` module. The format followed the consumers, not habit.

`tina/config.ts` was touched, so the lock was regenerated per the CLAUDE.md rule.
Hash **unchanged** (`b7c543d7…`) — `[...PILLARS]` compiles to the same four
values — verified with `git diff --quiet`, not assumed.

Tests: `cities.test.ts` gains the malformed-slug regression and a repo walk that
fails if `cityDisplayName` is redefined anywhere; `pillars.test.ts` adds a
compile-time guard (`string extends Pillar ? true : false` asserted `false`,
which fails `npm run typecheck` if the `as const` is dropped and the union
widens to `string`) plus a walk for a fifth copy. All four falsified: removing
the guard, redefining the helper, re-declaring the union, and dropping the
`as const` each turn something red — the last one failing both vitest and tsc.

**todos/016 is now fully closed.**
