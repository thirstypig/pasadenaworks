---
status: pending
priority: p3
issue_id: 020
tags: [code-review, cleanup, dead-code]
dependencies: []
---

# Dead exports, dead strings, dead CSS, and one comment that describes a gate that does not run

## Problem Statement

Ordinary cleanup, kept as one todo because none of it individually justifies a
change. Two items are more than cleanup and are called out below.

## Findings

**More than cleanup:**

**1. `ci.yml`'s stated Tina protection does not run on Tina commits.**
`ci.yml:61-64` says the duplicate-slug build-log grep "also catches a collision
introduced through the Tina admin, which can commit content without ever opening
a pull request." Tina is configured `branch: 'main'` (`tina/config.ts:48`) and
`ci.yml` is `push: branches-ignore: [main]` — so on the one path the comment
names, that step never runs. Nor does typecheck, nor the post-build readability
check. The gap is small in practice: `blog-content.test.ts` catches slug
collisions and *does* run in `deploy.yml`. So this is a false comment plus
defence-in-depth that is not actually in depth. Either add the grep to
`deploy.yml`'s build step or correct the comment.

**2. `heroAlt` is optional even when `heroImage` is set.**
`content.config.ts:16-17`; `Post.astro:104` renders `alt={heroAlt ?? ''}`. Tina's
field description says "Required if a hero image is set" and nothing enforces it,
so a hero photo can ship announced as decorative. A zod `.refine()` on the pair
makes it a build failure. (Same class as the `tags`/`heroImage` drift closed in
the 2026-09-03 PR.)

**Ordinary cleanup:**

- `ui.ts` — `buttons.readMore`, `misc.languages`, `misc.placeholderNotice` have
  zero consumers: 12 dead literals across four languages plus their interface
  fields. Every future locale pays translation cost for text nothing renders.
  (`buttons.viewCity` was in this list and is now arguably usable.)
- `ui.ts:22-25` — `PREFIXED_LOCALES`, zero consumers, while two route files
  declare the same filter inline. (See todo 016.)
- `global.css:36` — `--color-brand: var(--color-rose)`, a dead alias left by the
  mechanical rebrand rename. (`--color-brand-dark` at `:37` *is* used once.)
- `index.astro:75` — `.contact-schedule`, a class with no rule anywhere.
- `readability.mjs` — nine computed fields nothing reads (`charsPerSentence`,
  `charsPerClause`, `longest`, `formal`, `colloquial`, `particles`,
  `wordsPerSentence`, `polysyllabicPct`, `readingEase`), plus the clause
  machinery (`CJK_CLAUSE_END`, the clause map/filter) that exists solely to
  produce `charsPerClause`. **The `charsPerSentence` claim is todo 014's #1 and
  should be decided there, not swept up here.** `WEAK` at `:198` is dead too
  (found by `astro check`). `PARTICLES` and `dropQuotedSamples` are exported and
  never imported.
- `readability.mjs:365` — `localeFromPath` anchors its regex on `/dist\//`, so
  its only production caller at `:444` writes `localeFromPath('dist' + rel)`
  purely to satisfy the anchor — after `reportDist` deliberately computed `rel`
  relative to the passed root, because hardcoding "dist" was a previous bug.
- `Post.astro:250` and `glossary.astro:51` — `rgba(200, 134, 43, 0.06)`, the
  literal RGB of `--color-ochre`, in two files. Change the token and both go
  stale silently. `color-mix()` fixes it.
- `Post.astro:174` (`max-height: 400px`), `index.astro:109-112`,
  `CookieConsent.astro:91` — hardcoded values that should derive from tokens.
  `--space-1` and `--step-4` are deliberately NOT flagged: a scale with a gap is
  worse than a scale with an unused step.
- `'pw-theme'` is a magic string in `Base.astro:84` and `ThemeToggle.astro:48`;
  renaming one silently reintroduces the flash-of-wrong-theme the inline script
  exists to prevent.
- `Footer.astro:22` — `word[0].toUpperCase()`; `noUncheckedIndexedAccess` is off,
  so a slug with a doubled or leading hyphen yields `''` and throws at build.
  `.filter(Boolean)` costs nothing.
- `Header.astro:28` labels the main nav `aria-label={strings.nav.home}` → "Home",
  which reads oddly in a landmark list.
- `/rss.xml` is built and correct (4 items, no drafts, no future posts) but
  reachable from nowhere: no `<link rel="alternate">` in `Base.astro`, no footer
  link, not in the sitemap. It is also English-only by design, so the three
  localized blog indexes have no feed. Either wire it up or delete it.
- English and localized pages have diverged visually (logo hero, frame styles,
  city hub as list vs card grid). Not a defect — but undocumented, so it reads as
  drift. Worth a deliberate call.

## Proposed Solutions

### Option A — Fix 1 and 2, delete the dead code, leave the design questions
- **Pros:** #1 stops a comment lying about a gate; #2 closes an a11y hole with the
  same shape as one already fixed. The deletions are mechanical.
- **Cons:** Large diff, low individual value; risks burying the two real items.
- **Effort:** Medium · **Risk:** Low

### Option B — Fix 1 and 2 only; leave the rest
- **Pros:** Small, reviewable, keeps the two consequential items visible.
- **Cons:** The dead code stays.
- **Effort:** Small · **Risk:** Low

## Recommended Action

**Option B**, then the deletions whenever a change is already touching those
files. The RSS feed and the English/localized visual divergence are questions for
the owner, not cleanup.

## Acceptance Criteria

- [ ] `ci.yml`'s comment matches what actually runs, or the grep runs on main
- [ ] A post with `heroImage` and no `heroAlt` fails the build
- [ ] `/rss.xml` is either linked or removed

## Work Log

### 2026-09-03 — Found during full-repo review
`WEAK` was surfaced independently by `astro check` when it was adopted (todo 012).
