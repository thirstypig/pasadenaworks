# CLAUDE.md

Project context for Claude Code. Read this before making changes.

## What this is

The marketing site for **Pasadena Works**, a small consultancy serving small
businesses in Pasadena and the San Gabriel Valley. Astro static site, deployed
free on GitHub Pages at `pasadenaworks.com`.

Four languages: English at the root, Spanish and both Chinese variants on
prefixed paths. Organic search is the primary customer acquisition channel, so
SEO correctness is a functional requirement here, not a nice-to-have.

## Who you're working with

The owner is a product manager who does not write code. Assume they can read
code and reason about tradeoffs, but will not spot a subtle CSS or TypeScript
mistake by eye.

That means:

- **Explain changes in plain language**, not just a diff. Say what changed and
  what it will look like, not "refactored the grid template."
- **Always run `npm run build` before saying you're done.** A broken build is
  invisible until it's deployed, and they can't debug it.
- **When you change something visual, verify it rendered.** Build, serve `dist/`,
  and look at it if you have that capability. Don't assume CSS works.
- **Push back when the ask is wrong.** They'd rather hear "that will hurt your
  SEO, here's why" than get what they asked for.
- Don't add dependencies without saying why. The production site's runtime
  dependencies are exactly five: `astro`, `@astrojs/sitemap`, `@astrojs/rss`,
  and `@fontsource/anton` + `@fontsource/source-serif-4` (added 2026-08-26 to
  self-host the two fonts instead of loading them from the Google Fonts CDN;
  the display face was swapped Bevan → Anton → briefly back to Bevan → Anton
  again on 2026-08-27, "final call" — see Resolved).
  `tinacms` and `@tinacms/cli` are devDependencies for the local `/admin`
  editor only — real but deliberate exception, not the site itself.
  `vitest`, plus `typescript`, `picomatch` and `@types/picomatch` (added
  2026-09-03), are the other devDependencies. The last three were already
  being *used* and merely not *declared* — `tina/config.test.ts` imports
  picomatch, and `tsc` only existed because `@tinacms/cli` depends on it, so
  both were reaching npm's hoisting of somebody else's dependency tree. That
  breaks on any future upgrade that changes the hoist layout, with an error
  pointing at our file rather than at the cause. None of this touches the
  production five.

## Commands

```bash
npm install          # once
npm run dev          # dev server at localhost:3180 (see cross-project port registry below)
npm run build        # production build into dist/ — RUN THIS BEFORE FINISHING
npm run preview      # serve the built site, also on localhost:3180
npm run admin        # dev server + Tina CMS admin at localhost:3180/admin/index.html
npm run readability  # reading level of every post, per locale, against the house targets
npm run readability -- --dist   # same, but scores BUILT pages (services, cities,
                     #   homepage) — run `npm run build` first
npm run typecheck    # tsc --noEmit across the repo, including tina/ (Astro skips it)
npm run test         # unit tests (vitest, 155) — i18n/hreflang, reading time, city/service
                     #   lookups, blog i18n helpers, blog content integrity, the content-status
                     #   generator and its Pacific clock, JSON-LD escaping, Tina's collection
                     #   match globs + filename slugifier, the per-locale readability
                     #   metrics (English FK, Spanish Fernandez Huerta, Chinese register),
                     #   and a polarity tripwire on sentences that have shipped reversed
npm run content:status  # regenerate CONTENT-STATUS.md from the post frontmatter
```

**Port 3180 is this repo's reserved slot** in the owner's cross-project port
registry (`MASTER-PORTS.md` / `PORTS.md` at this repo's root, mirrored from
`~/Projects/MASTER-PORTS.md` — the canonical source, covering ~20 other local
projects). Don't let `dev`/`preview` fall back to Astro's default 4321 —
that port is already reserved for a different project (thirstypig) in the
same registry, and running both at once would collide. If a future task
needs another port on this project, claim it from pasadenaworks's own
reserved block (3180–3189 / 4180–4189) and update both the local and root
copies of the registry — never just pick a free-looking port without
checking there first.

Deployment is automatic: pushing to `main` triggers
`.github/workflows/deploy.yml`. Never build and commit `dist/` — it's gitignored
and the Action handles it.

**The tests gate both workflows** (added 2026-09-01). `.github/workflows/ci.yml`
runs the suite and a build on every pull request and branch push;
`deploy.yml` runs the suite before building, so a push to `main` *and* the daily
scheduled publish are both gated. Before this, nothing ran the tests
automatically — which mattered because the content invariants they protect fail
silently: a duplicate `slug` builds green with exit code 0 and only a warning,
while the test suite catches it. `ci.yml` also greps the build log for that
warning and promotes it to a failure, which catches a collision committed
through Tina without a pull request.

`ci.yml` has a fourth step, added 2026-09-03: it re-runs the readability tests
**after** the build. The rendered-page cross-check needs `dist/`, and both
workflows run the suite before building, so in the unit step that test skips
rather than fails. Without the post-build step it would never execute in CI at
all — which is exactly how it first shipped broken, passing on a laptop that
happened to have a stale `dist/` lying around and failing the moment CI ran it
on a clean checkout.

`ci.yml` also runs `npm run typecheck` (added 2026-09-03), and it runs there
**and not in `deploy.yml`** on purpose. Nothing in this repo ran `tsc` before,
so a type error was invisible — `npm run test` does not typecheck and
`npm run build` passes because Astro never compiles `tina/`. But that same
fact is why it must not gate the deploy: a type error in `tina/` cannot
reach the built site, while `deploy.yml`'s cron is the only thing that makes
a date-gated post publish. Blocking the daily publish over one would stop
real content from shipping to fix nothing.

## Where things live

```
src/
├── data/
│   ├── site.ts       ← email, phone, form endpoint, service-area cities
│   ├── services.ts   ← ALL service copy, all four languages
│   ├── cities.ts     ← city landing page copy
│   └── home.ts       ← homepage copy for es / zh-hans / zh-hant
├── i18n/
│   ├── ui.ts         ← locale registry + UI strings (nav, buttons, forms)
│   ├── routes.ts     ← translated URL segments + hreflang builders
│   └── utils.ts      ← t() and localePath()
├── content/blog/     ← articles, one .md file per language, under en/ es/ zh-hans/ zh-hant/
├── components/       ← Header, Footer, ContactForm, LangSwitch, Lattice, CityBody
├── layouts/          ← Base (ALL SEO tags live here), Post
├── pages/
└── styles/global.css ← design tokens
```

`todos/` at the repo root holds code-review findings, one file per finding, named
`{id}-{status}-{priority}-{slug}.md` where status moves `pending` → `complete`.
Each carries the reproduction, two or three options with trade-offs, and a work
log. Written by `/ce:review`; read before starting work so a known issue isn't
rediscovered.

**Copy changes go in `src/data/`, not in page templates.** If you find yourself
editing prose inside an `.astro` file, check whether it belongs in a data file
first. The exception is `src/pages/index.astro`, which holds the English
homepage copy directly.

## Hard rules

### 1. Never claim a translation that doesn't exist

`hreflang` alternates are generated from real data. A page that exists only in
English must emit **zero** alternates — claiming a Spanish version that 404s is
worse for SEO than claiming none.

`cityLocales()` in `cities.ts` and the `translations` prop on `Base.astro`
enforce this. Don't hardcode a full four-locale map "for consistency."

Verify after any routing change:

```bash
npm run build
grep -o 'hreflang="[^"]*" href="[^"]*"' dist/websites/glendale/index.html   # expect nothing
grep -o 'hreflang="[^"]*" href="[^"]*"' dist/websites/alhambra/index.html   # expect 4 + x-default
```

`src/i18n/routes.test.ts` unit-tests `buildAlternates()` directly (zero/partial/full-locale
cases) — run `npm run test` for a faster check than the grep above during development.

### 2. City pages must say something real

`src/data/cities.ts` has a warning at the top. Near-identical pages with the
city name swapped are the classic doorway-page pattern — Google indexes them
and ranks none of them.

If asked to add cities in bulk, push back. Ask what's actually true about that
city's commercial districts. Six honest pages beat twenty thin ones.

### 3. Translated URL segments stay translated

`/services/websites/` → `/es/servicios/sitios-web/` → `/zh-hant/fuwu/wangzhan-jianzhi/`

Both the path segment and the slug are translated, because a Spanish speaker
searches "sitios web," not "websites." Different keyword, different URL. Never
mix an English segment with a translated slug.

All of this comes from `SEGMENTS` in `src/i18n/routes.ts`. Change slugs there
and the hreflang tags follow automatically.

### 4. Don't break the static-hosting constraint

GitHub Pages has no server. No SSR, no API routes, no server-side form handling.
The contact form posts to a third-party endpoint (`site.formEndpoint`). If a
feature needs a backend, say so rather than building something that fails
silently in production.

## Gotchas already found in this codebase

These cost real debugging time. Don't reintroduce them.

**`ch` units on a wrapper resolve against the wrapper's font.** `max-width: 22ch`
on a `<header>` uses the inherited body serif, not the display face in the `<h1>`
inside it — about 180px instead of 700px, which set headings one word per line.
Constrain the heading itself in `em`, which resolves against its own font size.

**`.section--dark a` beats `.btn`.** A bare descendant link rule inside dark
sections silently overrode button text color. The rule is now
`.section--dark a:not(.btn)` with explicit button overrides below it. Watch
CSS specificity when adding section-level link styles.

**The lattice divider is a CSS mask, not an inline SVG.** It was originally an
`<svg>` with `preserveAspectRatio="none"`, which stretched the motif into
unreadable noise across wide containers. It now tiles at true size via
`mask-image`. Don't "simplify" it back to an inline SVG.

**Astro can't have two dynamic routes at the same depth.**
`[locale]/[section]/[service].astro` already claims `[locale]/[a]/[b]`. You
cannot add `[locale]/[cityhub]/[city].astro` — it collides. That file (and its
`[locale]/[section]/index.astro` sibling one level up) branch on a `kind`
prop instead — now three values (`'service' | 'city' | 'blog-post'`, the
last added 2026-08-27 for translated blog posts). Follow that pattern for any
new localized section, and when you add a new `kind`, **grep the file for
every existing `if`/`else` first** — a bare `else` written when there were
only two kinds silently mis-branches the moment a third one exists. Hit
exactly this bug adding the blog kind; see
`docs/solutions/logic-errors/dual-purpose-route-bare-else-broke-on-third-kind.md`.

**Scheduled publishing is two mechanisms, not one.** `getPostsByLocale()`
gates on `pubDate <= now` as well as `draft` — and that filter must stay in
`src/utils/blog.ts`, never move into a page template. It also backs
`getStaticPaths` for both blog routes, so a future-dated post gets no page
*and no sitemap entry*; filtering only the index would hide posts from readers
while still advertising the URLs to Google. `getTranslationsFor()` needs the
same filter or a live post can emit an `hreflang` alternate at an unbuilt page.
The other half lives in `.github/workflows/deploy.yml`: a static site has no
clock, so the daily `schedule:` cron is what makes a date arrive. Delete it and
the filter is still correct and nothing ever publishes. Full write-up in
`docs/solutions/logic-errors/static-site-scheduled-publishing-needs-a-clock.md`.

**CJK underlines need a lower baseline.** Chinese glyphs fill the em box and
have no descenders, so the ochre hero underline cuts through them. There's a
`:global(html[lang^='zh'])` override in `[locale]/index.astro`.

**A blog post's `slug` frontmatter field must be unique across ALL locales,
not just within one.** Astro's glob-loader content collection dedupes
entries by the `slug` field globally — it's not aware that `src/content/
blog/zh-hans/` and `zh-hant/` are different languages. Giving the
Simplified and Traditional versions of the same post the identical Hanyu
Pinyin romanization (e.g. both using `xiaoxing-qiye-wangzhan-xuyao-shenme`)
silently dropped one from the collection at build time, with only a
`[glob-loader] contains multiple entries with the same slug` warning to
notice it by — the build still "succeeds." Renaming the *filename* doesn't
fix it; the collision is on the `slug` field value itself, since routing
uses `post.data.slug`, not the filename. Fix: give each locale's slug a
genuinely distinct value — often free anyway, since Simplified and
Traditional sources frequently prefer different real words for the same
concept (e.g. mainland "小型企业" vs. Taiwan "中小企業" for "small
business," found via keyword research, not invented for uniqueness).

**A Tina collection's `match.include` must omit the file extension.** Tina
appends the collection's `format` itself — `getMatches()` in
`@tinacms/schema-tools` builds `` `${path}/${include}.${format}` `` — so
writing `include: '*.md'` produces the glob `*.md.md`, matches nothing, and
the collection indexes **zero documents with no error and no warning**. Both
docs collections were broken this way from the day they were added
(2026-08-27) until 2026-08-31, and nobody noticed because an empty list looks
like an empty folder. The globs now live in `tina/utils.ts` as
`DOCS_ROOT_INCLUDE` / `DOCS_SOLUTIONS_INCLUDE` with the explanation, and
`tina/config.test.ts` calls Tina's own `getMatches()` and asserts the result
matches a file that actually exists. Full write-up, including the
`Error: Body must be a string` red herring, in
`docs/solutions/integration-issues/tina-match-include-appends-the-format-and-matches-nothing.md`.

**A `[^a-z0-9]` slug transform deletes every Chinese character.** Tina's
`slugifyBlogFilename` used to derive a new post's filename from its *title*
that way, so a CJK title collapsed to an empty basename and the file landed at
`<locale>/.md` — the first Chinese post created in the admin became a hidden
dotfile and the second silently overwrote it. Accented Latin degraded too
(`página` → `p-gina`). It survived because the seven cases in
`tina/utils.test.ts` were all ASCII English, on a site that publishes in four
languages. The filename now derives from the `slug` field, which is required,
already ASCII, and already unique across locales — so **a slug collision now
collides two files on disk as well**, making that test more load-bearing than
it looks. The rule worth carrying: a test corpus must contain a sample from
every locale the product ships in. Full write-up in
`docs/solutions/integration-issues/tina-slugify-strips-cjk-and-collides-filenames.md`.

**`sort`/`uniq` under a non-CJK locale lie about CJK duplicates.** Auditing
the built site for duplicate `<title>`/meta-description tags with
`grep ... | sort | uniq -c` reported false duplicates (and would equally
hide real ones) — under `LANG=en_US.UTF-8` with `LC_ALL` unset, `sort` and
`uniq` do locale-aware collation, and that collation doesn't treat distinct
Han characters as reliably distinct for grouping purposes. Ten-plus
genuinely different Chinese titles collapsed into one bogus "duplicate"
count. Force byte-exact comparison instead: `LC_ALL=C sort ... | LC_ALL=C
uniq -c`. Also watch for short combined-flag forms like `grep -rho` on
this environment's `ugrep` — it undercounted real matches (`-l` said 1
file, `-o` implied many) on the same CJK content; use long-form flags
(`--only-matching`, `-H`) or `/usr/bin/grep` when auditing non-ASCII text.

## Design system

**Rebranded 2026-08-27** around a real logo file the owner provided
(`public/logo-source.svg`, a script "Pasadena" wordmark + blocky "WORKS" +
a rose icon — vintage Americana commercial lettering, in the tradition of
1920s–50s Southern California citrus-crate-label and soda-fountain print
art, not the Craftsman-architecture identity the site launched with).

Palette: deep rose/burgundy (`--color-rose`, tied to the logo's rose mark)
replaces the old Greene & Greene pine green; citrus-crate-label gold
(`--color-ochre`) carried over unchanged — it already fit the new direction;
dusty blush (`--color-blush`) replaces pale sage; warm cream neutrals
unchanged. The CSS custom property *names* (`--color-rose`, `--color-blush`)
still read like the old `--color-pine`/`--color-sage` shape because they
were mechanically renamed, not because "rose" is incidental — it's the
literal new brand color now.

The divider motif (`Lattice.astro`) is a beaded pearl-rule now, the border
language of a vintage label, replacing the old diamond/cloud-lift motif tied
to Craftsman joinery. Card/frame borders (`.label-frame` in global.css,
renamed from `.craftsman-frame`) are a simple double-rule border instead of
the old geometric corner-bracket "windowpane" style.

Logo assets: `public/logo-mark.png` (the rose icon alone, square, black —
used in the header next to the wordmark text) and `public/logo-lockup.png`
(the full script+WORKS+rose lockup — used large on the homepage hero).
Favicons/apple-touch-icon are the rose icon too. `public/og.png` (the
social-share image) was regenerated to match this rebrand on 2026-08-28 —
see Resolved.

**A quality caveat on the source SVG:** it was auto-traced from a raster
image, not drawn as clean vector paths — zoom in and the curves show visible
faceting/stair-stepping. Fine at the sizes currently used (header icon,
favicon, a mid-size hero image); would look rough blown up large (print, a
big hero background). Get a proper vector redraw before using it any bigger
than the current hero size.

All colors, type scale, and spacing are custom properties at the top of
`src/styles/global.css`. **Derive from the tokens; don't hardcode hex values or
pixel sizes in component styles.**

Type pairs a bold condensed display face (Anton) with a serif body (Source
Serif 4) — both self-hosted via `@fontsource`, imported in `Base.astro`.
Anton is modeled on 1930s–40s American gothic/grotesque poster and
newspaper-headline lettering, matching the bold condensed "WORKS" half of
the real logo more closely than the earlier Bevan (a sign-painter/showcard
face, from a European/Bauhaus-adjacent tradition) did — settled on
2026-08-27 after briefly reverting to Bevan and swapping back, "final
call." The serif body is better for the long-form blog reading the SEO
strategy depends on. Don't "fix" either.

## Content

Blog posts are markdown in `src/content/blog/`. **The filename becomes the URL**,
so write it as a keyword. Frontmatter schema is in `src/content.config.ts` —
`pillar` must be one of `websites`, `search`, `consulting`, `ads`, and the build
fails on a typo, deliberately.

`CONTENT-PLAN.md` has the 90-day article schedule with target keywords. One
keyword per article — two articles competing for the same phrase split their own
traffic.

`CONTENT-STATUS.md` is the live picture: every English post, its publish date,
which translations exist, and whether it is live, due in N days, published
English-only (🚩) or still a draft. It is **generated** — run
`npm run content:status` after any content change rather than editing it. It
also shows up inside Tina under Project Docs.

## Voice

The site's whole positioning is that it doesn't talk down to people. Copy is
plain-spoken, sometimes blunt, never markety. Real examples from the site:

> Holding a client's website hostage is a bad business model and a worse way to
> treat people.

> Anyone promising page one by next Tuesday is selling you something else.

If you write copy, match that. No "leverage," no "solutions," no "empower."
Admit when something isn't worth the money.

### Register: college level, set 2026-09-03

**The owner's call, made after seeing the measurements and after pushback.**
Copy across the whole site — every language — targets a college reading level.
This replaces the earlier "short sentences" instruction, which is why that line
is gone from the paragraph above. What survives from it is the *attitude*:
blunt, specific, no marketing vocabulary, willing to name the downside. What
changed is the *construction*: subordinate clauses and real transitions instead
of stacked short declaratives.

Run `npm run readability` for the live picture. `scripts/readability.mjs` holds
the targets and the reasoning; `scripts/readability.test.mjs` locks them.

| Locale | Metric | Target |
|---|---|---|
| `en` | Flesch-Kincaid grade | 13–15 |
| `es` | Fernández Huerta (**lower = harder**) | 40–55 |
| `zh-hans` / `zh-hant` | 書面語 register index | 0.55–0.85 |

**One formula per language, never one across all four.** Flesch-Kincaid is
defined over English syllables; on Spanish it inflates, and on Chinese it is
meaningless rather than merely wrong. The first Chinese metric tried here was
characters-per-sentence, which reported 19/20 posts already in band — because
Chinese raises register through word choice (所以→因此, 但是→然而, 不是→並非,
dropping 吧/呢/啊/嘛), not through sentence length. Length and difficulty come
apart in Chinese in a way they do not in English.

**Every band has an upper bound, and it is load-bearing.** A bare "13+" floor
is satisfied by an unreadable 40-word sentence. The first zh-Hant rewrite came
back at register 1.00 — 25 formal markers, zero colloquial — which reads as a
legal document, not as a college-level article. The max caught it.

**Source anything the reader could check.** Raising register without raising
rigor just makes assertions sound more confident. The pilot post carried 29
unsourced figures across the corpus and 1 outbound citation in 20 posts; the
rewrite cites Google's own documentation, per locale
(`?hl=zh-TW`, `?hl=zh-CN`, `?hl=es-419`). Verify a URL before citing it —
checking the postcard claim is what revealed the post had been overstating it.

**Sentences that carry polarity still need a human read.** Register work
rewrites exactly the comparatives and modals that `blog-content.test.ts`
cannot see. Re-read every "more/less", "should/shouldn't" and every modal
against the English twin before shipping a translation set.

**What is deliberately NOT raised.** The instruction was "throughout the
site", and three things are still excluded on purpose:

- **UI text** — nav, buttons, form labels, CTAs. "Contact us" must not
  become "Initiate correspondence". These are excluded from measurement
  too, because scoring them creates pressure to do exactly that.
- **Legal pages** (`/terms/`, `/privacy/`, `/accessibility/`) — rewriting a
  privacy policy for reading level risks changing what it commits you to.
- **The glossary** — its job is explaining technical terms to people who do
  not know them, so college-level definitions defeat the purpose.

Also untouched within the data modules: `meta` descriptions (155 characters
to win a click in a search result is a different job from reading well),
`title`, and `tagline`. Index/listing pages are card summaries and are
reported but not scored.

**Two measurement paths, and they must agree.** The blog is markdown and is
scored at source. Service, city and homepage copy lives in `src/data/*.ts`
and reaches the page through components, so it is scored from the BUILT
page instead — whatever sits inside `<main>`. Blog posts are scored both
ways deliberately: `readability.test.mjs` fails if the two disagree by more
than half a grade. They started 1.1 apart, and the entire gap was page
furniture inside `<main>` — a back-link, an image credit, a CTA button.

**City pages: check the facts survived.** Hard rule 2 content is sourced.
After any register edit to `cities.ts`, assert the specifics are still in
the built output (1926, Laura Scudder, 400 storefronts, 1895, Renaissance
Plaza, Huntington Drive, 1887) rather than trusting the diff.

**The metric describes the prose; editing prose to move the metric inverts
what it is for.** That happened four times during the conversion and every
one of those edits read worse than what it replaced. The counter-rule is not
"never touch the metric" but "measure which one is broken" — on one post a
shortfall looked exactly like a scoring artifact, and measuring the proposed
fix across all 20 English posts showed it moved them by at most +0.4 against
a 1.3-grade gap, so the prose really was thin and the metric was left alone.
Full write-up in
`docs/solutions/process-errors/a-writing-metric-corrupts-the-prose-it-governs.md`.

## Known outstanding work

- `CONTENT-PLAN.md`'s full 90-day schedule is done and approved: all 20
  English posts are `draft: false` as of 2026-08-31 (the owner reviewed and
  flipped the last 5 via Tina). Since the same date the site is
  **date-gated** — a post appears on its `pubDate` and not before — so 4 are
  visible today and the rest surface weekly through 2027-01-11 with no one
  doing anything. **Never read "20 approved" as "20 visible."**
  **All 20 now have Spanish, Simplified and Traditional Chinese versions**
  (2026-08-31), so nothing on the schedule will publish English-only and there
  is no translation backlog left to work. Don't take the count here on trust —
  `CONTENT-STATUS.md` is generated from the frontmatter and is the live answer;
  this line is the one that goes stale.

  The rule still binds anything written from here on: translate alongside the
  English draft, not afterwards. A date-gated post whose translations miss its
  own `pubDate` publishes English-only and does not get a second chance.
- **No code-review findings are open in `todos/`** — all ten are complete as of
  2026-09-01. The work logs are still worth reading before related work; they
  record why the rejected options were rejected. One caveat learned closing
  `006`: **a todo is a snapshot, not a live view.** Two of its four findings had
  already been fixed as side effects of `007` and `008`, and nothing marked them
  resolved. Re-verify a finding against the current code before acting on it.
- **Tina's moderate `npm audit` findings (react-router open-redirect/SSR
  injection CVEs) have no safe fix available yet, checked 2026-08-27** —
  this isn't "hasn't been done," it's genuinely blocked upstream. We're
  already on the latest `tinacms`/`@tinacms/cli` (3.12.1/2.6.1), and even
  that latest release still pins `react-router-dom: ^6.30.3`, inside the
  vulnerable range. The only fix `npm audit fix --force` offers is
  downgrading to `tinacms@0.59.1` — a pre-3.x release with a different,
  incompatible config API from what `tina/config.ts` uses now, which would
  almost certainly break `npm run admin` rather than fix anything. Real
  risk is low regardless: Tina admin only runs locally, never reaches the
  live site, and both CVEs need a browser actually navigating a malicious
  link while the local dev server happens to be running. Re-check
  `npm audit` next time `tinacms` gets touched — nothing to act on until
  Tina ships a version with an unaffected react-router-dom.
## Resolved

Already solved — **details and reasoning in [`docs/RESOLVED.md`](docs/RESOLVED.md)**.
Read that file before re-investigating any of these.

- Cal.com bookings now reach Twenty CRM, repeat customers included
- Blog i18n mechanism is built (2026-08-26/27)
- `site.formEndpoint` now points at a real Formspree endpoint, and the contact form dual-submits into a self-hos…
- Astro upgraded 5 → 7.2.7, resolving the high-severity XSS advisories (2026-08-26).
- `site.phone` is a real Google Voice number, (434) 373-0080 (2026-08-26).
- The homepage's "Where we work" city grid was removed and replaced with a three-column footer (Explore nav link…
- All nine city pages that previously had generic body copy now carry real, sourced facts via web research: six…
- Fonts (originally Bevan, now Anton; Source Serif 4) are self-hosted via `@fontsource` instead of loading from…
- `tina/config.ts`'s schema now matches `src/content.config.ts`
- A "Book a call" link (`site.bookingUrl`, `strings.nav.bookCall`) was added to the footer, footer-only per the…
- A private, real-password-protected ops dashboard exists at `ops.pasadenaworks.com`
- `public/og.png` (1200×630) exists, originally as a Craftsman-styled share image matching the pre-rebrand hero.
- The `registry/` folder (a mirror of the owner's cross-project `MASTER-PORTS.md`/`PORTS.md`/`README.md`) was re…
- The ops dashboard's "Blog editor (Tina)" card now links to the real `pasadenaworks.com/admin/index.html` (2026…
- Cal.com's Google Calendar sync is confirmed working end-to-end (2026-08-28)
- The `itemProps` config previously added to the blog collection's `ui` in Tina (to show `pubDate` next to the t…
- Cal.com's password-reset emails were never sending, blocking login to the owner's own account (2026-08-29).
- Twenty CRM's MCP server is reachable — it advertised `http://` behind Railway's TLS proxy; fixed with `TRUST_PROXY=1` (2026-08-31)
- Tina's "Project Docs" and "Debugging Notes" collections indexed zero documents silently from 2026-08-27 until 2026-08-31 — `match.include` gets the format appended (2026-08-31)
- All 20 blog posts exist in all four languages; the translation backlog is closed (2026-09-01)
- The test suite gates both CI and deploy — nothing ran it automatically before (2026-09-01)
- Blog prose links are underlined at rest, fixing a WCAG 1.4.1 failure (2026-09-01)
- Tina no longer writes every Chinese post to the same empty filename (2026-09-01)
- JSON-LD is escaped before injection; `site.social` is finally read, as schema.org `sameAs` (2026-09-01)
- A translation set can no longer half-publish through a mismatched `draft` flag (2026-09-01)
- `npx tsc --noEmit` passes, and `npm run typecheck` now gates pull requests (2026-09-03)
