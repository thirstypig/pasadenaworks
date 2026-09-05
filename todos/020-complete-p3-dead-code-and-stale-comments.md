---
status: complete
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

### 2026-09-04 — Closed, with two items deliberately left open

**The two that were more than cleanup:**

**#1** — the ci.yml comment now says what actually happens. Tina commits to
`main` and ci.yml is `branches-ignore: [main]`, so the duplicate-slug grep never
ran on the path the comment named. A Tina collision IS still caught, by
`blog-content.test.ts` in deploy.yml — so the fix was to correct the claim, not
to add a gate. Defence in depth is real for pull requests and absent for Tina;
saying otherwise made it look stronger than it is.

**#2** — `heroAlt` is now enforced by a zod `.refine()` when `heroImage` is set.
Falsified: `heroAlt: ""` fails the build with *"heroAlt is required when
heroImage is set — describe the photo."* Same class as the tags/heroImage drift
closed on 2026-09-03: a constraint that existed only as prose.

**Deleted after confirming zero USAGES** (the raw grep counts were misleading —
five hits each turned out to be one interface field plus four locale values):
`buttons.readMore`, `buttons.viewCity`, `misc.languages`,
`misc.placeholderNotice` — 16 literals and 4 interface fields; `PREFIXED_LOCALES`;
`--color-brand`; `.contact-schedule`; `WEAK` in readability.mjs.

**Kept, contrary to the finding:** `PARTICLES` and `dropQuotedSamples` are NOT
dead — both are used inside readability.mjs (lines 296 and 198). Only their
`export` was unnecessary; that was dropped.

**Other fixes:** the `rgba(200, 134, 43, 0.06)` literal in two files replaced
with `color-mix()` on the token, so changing `--color-ochre` no longer leaves
them stale. `cityDisplayName` gained `.filter(Boolean)` — a slug with a doubled
or leading hyphen produced an empty segment and threw at build. The main nav's
landmark was labelled "Home"; it now uses a new `misc.mainNav` string in all four
locales (an intermediate attempt relabelled it "Services", which was no better).
`/rss.xml` now has a discovery link, emitted only on English pages since the feed
is English-only by design.

**`'pw-theme'` could not be de-duplicated.** One of the two sites is Base.astro's
inline pre-paint script, which cannot import anything — that is the whole reason
it is inline. Both sites now carry a cross-reference comment so a rename is
caught by grep.

**Left open, both needing a decision rather than a fix:**
- The arrows (`→`, `←`) fall out of Anton — confirmed visually while checking
  the contact form: the arrow renders in the fallback face beside ultra-bold
  condensed text. Fixing means either a pseudo-element or wrapping ~5 markup
  sites, and it is a design call about how the arrow should look.
- The English/localized visual divergence (logo hero, frame styles, city hub as
  list vs card grid) is a deliberate-call question, not drift to be cleaned up.

### 2026-09-04 — `tags: required` had to be reverted; it broke every deploy

Adding `required: true` to the Tina `tags` field changed the generated GraphQL
type from `[String]` to `[String!]!`, and `npx tinacms build` in deploy.yml then
refused to run:

```
[NON_BREAKING - FIELD_TYPE_CHANGED] Field 'Blog.tags' changed type from '[String]' to '[String!]!'
Error: The local GraphQL schema doesn't match the remote GraphQL schema. (ERR_CLOUD_CHECK_FAILED)
```

Tina Cloud holds the remote schema and did not pick the change up on its own —
three consecutive deploy runs failed with `Last indexed at` frozen at
16:18:49 GMT, including a manual re-run several minutes later. Reverted, because
this blocks EVERY deploy, and deploy.yml's cron is the only thing that makes a
date-gated post publish (todo 011): an edit-time validation is not worth
stopping the publishing pipeline.

**What survived.** The `ui.validate` on `tags` is kept and gives the same
editor-time feedback — it is a client-side function and does not touch the
GraphQL type. `heroImage`'s validate is likewise unaffected. Astro's
`z.array(z.string()).min(1).max(3)` remains the real enforcement, so a post with
no tags still fails the build; the finding's substance stands.

**To restore it:** update the schema in Tina Cloud first (dashboard, owner's
login), confirm the remote type reads `[String!]!`, then re-add `required: true`.
Not attempted from here — that dashboard is not reachable by tooling.

**The lesson worth carrying:** `tina/config.ts` is not a local file. Some edits
to it are schema changes that must be synchronised with Tina Cloud, and they fail
at DEPLOY time, long after the local build and the whole test suite have gone
green. `required`, field type, and adding or removing a field are all in that
category; `ui.validate`, `description` and `label` are not. Nothing in the local
gate can catch this — the first signal is a red deploy on main.

### 2026-09-04 — the whole Tina change set had to come out, not just `required`

Reverting `required: true` alone did NOT restore deploys. The error changed from
"local **GraphQL** schema doesn't match" (with a `Reason:` naming the `tags`
type) to "local **Tina** schema doesn't match" with no reason given — a second,
coarser check.

Bisected locally instead of by deploy cycle, using `.env` and `npx tinacms
build`, which runs the same cloud check:

| tina/ state | cloud check |
|---|---|
| `DOCS_ROOT_INCLUDE` back to `'*'` | still fails |
| `ui.validate` blocks removed as well | still fails |
| `tina/config.ts` + `tina/utils.ts` restored to 28e0102 | **passes** |

Note the middle row against the last: with both reverted, `git diff` showed
**only comment differences** from 28e0102, and it still failed — then the exact
28e0102 content passed. The remote schema is not stable while this is being
tested: Tina Cloud re-indexes from `main`, and `main` moved four times during
the investigation. That is why bisecting by deploy is hopeless and why the
answer is "restore the known-good state", not "find the one guilty line".

**Reverted in full**: both `ui.validate` blocks, `DOCS_ROOT_INCLUDE`, and the
`tina/config.test.ts` assertions that pinned the CLAUDE.md exclusion. `tina/` is
now byte-identical to the last state that deployed successfully.

**What this costs**, recorded so it is not lost:
- todo 018's CLAUDE.md protection is gone — a Tina editor can again `update`
  CLAUDE.md. Re-apply after syncing Tina Cloud.
- The `tags` / `heroImage` edit-time validation is gone. Astro's zod schema still
  enforces both at build, so the defect todo 020 named is still caught; only the
  earlier, friendlier signal is missing.

**Both remain valid findings blocked on one external step**: updating the schema
in Tina Cloud's dashboard, which needs the owner's login and is not reachable
from tooling.

### 2026-09-05 — the "sync Tina Cloud in the dashboard" remedy does not exist

Verified from `@tinacms/cli` source and by hitting Tina Cloud's own endpoints:
the remote schema **is** the committed `tina/tina-lock.json`. Tina Cloud indexes
it from `main` on every push; the cloud's `/schemaSha` returns exactly the
SHA-256 of that file's `schema` member. It had not been regenerated since
2026-08-31, which is why four re-indexes all served the same stale schema and
why "the remote moved" was a misdiagnosis — it never moved.

**The reverted changes here can be restored** without any dashboard: re-apply
them, run `npx tinacms dev --no-server --noWatch`, commit the regenerated lock
alongside. `ci.yml` and `tina/lock.test.ts` now catch a missing regeneration
before merge.

Also corrected: `ui.validate` is not schema-neutral (it leaves `ui: {}` behind,
a new key in the hash) and `description` is not safe either. Only comments and
function bodies are.

### 2026-09-05 — restored, and the diagnosis held

Re-applied with `tina/tina-lock.json` regenerated and committed alongside. The
deploy passed, including the `Build Tina Cloud admin bundle` step that had
failed four times — confirming the lock, not the edits, was the cause. New lock
schema sha `10d9190e…` (was `a3e38d12…`).

The CI lock guard passed on the PR too, which was the open question: a PR that
genuinely changes the schema now passes, because the guard compares the PR
against itself rather than against the cloud.

`required: true` and both `ui.validate` blocks are back, so `tags` and
`heroImage` are validated at edit time again rather than only at build.
