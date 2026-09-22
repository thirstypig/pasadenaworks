# CLAUDE.md

Project context for Claude Code. Read this before making changes.

## What this is

The marketing site for **Pasadena Works**, a small consultancy serving independent
health practices — medical, dental, eye care — across Southern California, based
in the San Gabriel Valley. Astro static site, deployed free on GitHub Pages at
`pasadenaworks.com`.

**Repositioned 2026-09-14** from general small businesses to practices: a Practice
Checkup, *Digitize the office*, and *Get more patients*. A fourth service,
**Transition Planning**, followed on 2026-09-22: preparation only — no brokers
or introductions — until the attorney answers `todos/046` (e). The decisions, the
approved copy and every source behind a checkable claim are in
`docs/superpowers/specs/2026-09-14-practice-services-design.md` and its
`-sources.md` twin. The ten city pages followed on 2026-09-15 — rebuilt on
clinician-registry, hospital and Census figures, in all four languages. The 68
blog posts still address small businesses; that is a deliberate follow-up
(spec §9), not an oversight.

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
  `vitest` and `@astrojs/check` (which provides the `astro check` half of
  `npm run typecheck`), plus `typescript`, `picomatch` and `@types/picomatch`
  (added 2026-09-03), are the other devDependencies. The last three were already
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
npm run preview      # serve the built site, also on localhost:3180. DETACHED —
                     #   it returns to the prompt and keeps running past the
                     #   terminal. Use the two commands below to see and stop it.
npm run preview:status  # is a background preview running, on what port, since when
npm run preview:stop    # stop it
npm run admin        # dev server + Tina CMS admin at localhost:3180/admin/index.html
npm run readability  # reading level of every post, per locale, against the house targets
npm run readability -- --dist   # same, but scores BUILT pages (services, cities,
                     #   homepage) — run `npm run build` first
npm run typecheck    # astro sync && astro check && tsc --noEmit — .astro files
                     #   AND .ts, tina/ included. 108 files. The build itself
                     #   typechecks neither; the sync is required, see below.
npm run test         # tests (vitest, 458 across 35 files, measured locally after a build on 2026-09-22) — i18n/hreflang, reading
                     #   time, city/service lookups, blog i18n helpers, blog content
                     #   integrity, the content-status generator and its Pacific clock,
                     #   JSON-LD escaping, Tina's collection match globs + filename
                     #   slugifier, the per-locale readability metrics (English FK,
                     #   Spanish Fernandez Huerta, Chinese register), a polarity tripwire
                     #   on sentences that have shipped reversed, the hero-image path
                     #   rules (todos/018) — which reject a PROTOCOL-RELATIVE
                     #   `//host/x.jpg` as well as `https://`, because the first guard
                     #   caught only the spellings that announce themselves — the
                     #   hero-credit link-needs-a-name predicate, and the Unsplash
                     #   script's slug/traversal validation and UTM-fragment handling,
                     #   the retired-service redirects, the service copy's parity
                     #   across locales, the LocalBusiness areaServed, and the
                     #   city pages — their four title patterns, figure and
                     #   source-URL parity across locales, the one-name-per-city
                     #   tripwire, and the built-page guards in
                     #   src/data/city-pages.test.ts, and the About page — its
                     #   copy in every locale and its built pages' hreflang set.
                     #   46 of these need dist/ and SKIP without it — the rendered
                     #   nav-link checks (About links included), the og:image,
                     #   stylesheet and JSON-LD checks, the fourteen
                     #   built-redirect checks, the four built-city-page checks,
                     #   the two built-About-page checks, and the readability
                     #   cross-checks — which is why ci.yml re-runs the whole suite
                     #   after the build. deploy.yml reports 47 skipped, not 46:
                     #   it tests BEFORE `npx tinacms build`, so
                     #   tina/__generated__/_schema.json is absent and the lock
                     #   test skips too — ci.yml regenerates that file first, so
                     #   it runs there. Both counts are what CI reports on a
                     #   CLEAN checkout; see the worktree gotcha below before
                     #   believing a bigger number measured locally.
npm run content:status  # regenerate CONTENT-STATUS.md from the post frontmatter
npm run unsplash -- search "small business storefront"   # find a hero image
npm run unsplash -- use <photoId> <post-slug>            # download it + print frontmatter
```

**Port 3180 is this repo's reserved slot** in the owner's cross-project port
registry. The canonical source is `~/Projects/MASTER-PORTS.md`, **outside this
repo**. A full, byte-identical copy of that file sits at this repo's root for
local testing, but it is **gitignored and never committed**: this repo is public,
and the registry names ~25 projects along with their stacks and hosting. (Deleting
`registry/` on 2026-08-28 began that fix. The root copies were trimmed on
2026-09-04 and gitignored on 2026-09-12, when `PORTS.md` was retired everywhere.)
Don't let `dev`/`preview` fall back to Astro's default 4321 —
that port is already reserved for a different project (thirstypig) in the
same registry, and running both at once would collide. If a future task
needs another port on this project, claim it from pasadenaworks's own
reserved block (3180–3189 / 4180–4189): edit `~/Projects/MASTER-PORTS.md`, then
run `~/Projects/sync-master-ports.sh`. Never just pick a free-looking port without
checking there first.

**`--port` is a preference, not a reservation, and that is how a pinned port
still ends up in someone else's slot.** Astro increments when the port it was
given is busy, silently and with a success message. Found 2026-09-07: a second
`npm run preview` started 2026-09-06 23:07 was serving on **3181** with
`--port 3180` on its own command line, because a first preview already held
3180. 3181 is the ops-panel's assigned slot (`~/Projects/property-page/
ops-panel`, deliberately taken from *this* project's block because ops-panel
deploys into the same Railway project), so `npm run dev` there would have been
answered by a stale copy of this site. The tell is confusing: a request to the
ops panel returns **200 with GA tags** instead of the panel's 401.

So a leftover `preview` is not harmless background noise — it is a squatter one
port to the right. Before blaming a port, check who actually holds it and what
they were *asked* to hold:

```bash
lsof -nP -iTCP:3181 -sTCP:LISTEN            # who is really there
ps -o lstart=,command= -p <pid>             # since when, and with which --port
```

A mismatch between the `--port` argument and the listening port is the whole
diagnosis.

**Astro no longer increments — `strictPort` is on (2026-09-07).**
`astro.config.mjs` sets `vite.server.strictPort` and `vite.preview.strictPort`,
so a busy port is now `exit 1` and *"Dev/Preview server process exited before
becoming ready"* instead of a success message one slot to the right. Verified
both ways: without it, `npm run preview` against a held 3180 exits **0** and
serves 3181; with it, nothing binds and the exit code is **1**. Ports here come
from a registry, so a busy reserved port is never something to route around — it
means something stale is holding it.

This works because Astro's dev and preview servers are both Vite servers
underneath, and Astro sets `preview.port` but never `strictPort`, so a
user-supplied one survives the `mergeConfig`. There is no Astro-level option for
this — `strictPort` appears nowhere in Astro's own source, only Vite's.

**`astro preview` is a DETACHED DAEMON in Astro 7, and that is the real reason
these accumulate.** `npm run preview` prints a URL and returns to the prompt;
the server keeps running after the terminal closes, never appears in the shell's
job list, and survives until it is explicitly stopped. Four had piled up across
this repo and property-page by 2026-09-07, the oldest seven days old. Astro
tracks one per project, so a second `npm run preview` here now answers *"Preview
server already running at :3180"* rather than starting another — but a `dev`
server and a `preview` server are different daemons and will still contend,
which is exactly how property-page ended up with `dev` on 3190 and `preview`
displaced onto 3191. Reach for `npm run preview:status` before assuming a port
is free, and `npm run preview:stop` rather than hunting a pid.

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

**`tsc` alone cannot see `.astro` files** — it has no parser for them, so for a
while all 28 components, layouts and pages were outside the gate while ~94
minified vendor bundles under `public/admin` were inside it. That is where every
unsafe cast lives. `astro check` was added 2026-09-03 and `public/admin`
excluded; the gate covered 85 files then (108 as of 2026-09-21) and reports 0 errors.

**What that buys, concretely:** the `kind` discriminants on both dual-purpose
routes are now real discriminated unions (`RouteProps`, `HubProps`) rather than
`Astro.props as {...}`, so a fourth kind — or a `kind` literal copied between
the two files, which use different vocabularies for overlapping concepts — is a
**compile error where it is written**. Verified: renaming one literal produces 4
errors and exit 1. Before this it produced a green build that shipped 12 pages
with an empty `<title>` canonicalized to the homepage.

The `typecheck` script runs `astro sync` before `tsc`, and that is **not
optional**. The types for the virtual `astro:content` module are *generated*
into `.astro/`, which is gitignored — so they are absent from a clean checkout
and `tsc` reports `Cannot find module 'astro:content'` followed by a cascade of
implicit-`any` errors. It passes on any laptop that has ever run a build, which
is why the first version of this shipped green locally and red in CI. Exactly
the stale-`dist/` trap one paragraph up, in a new costume.

## Where things live

```
src/
├── data/
│   ├── site.ts       ← email, phone, form endpoint, service-area cities
│   ├── services.ts   ← ALL service copy, all four languages; PILLAR_SERVICE maps blog pillars to services
│   ├── retired-services.mjs ← redirects for retired service URLs (search, ads → websites)
│   ├── cities.ts     ← city list, CityCopy shape, cityLocales() + cityDisplayName()
│   ├── city-copy/    ← the city page prose itself, one module per locale (en, es, zh-hans, zh-hant)
│   ├── home.ts       ← homepage copy for es / zh-hans / zh-hant
│   ├── about.ts      ← About page copy, all four languages
│   ├── pillars.ts    ← THE pillar list (schema, both components, Tina all read it)
│   └── hero-image.ts ← what a heroImage path may be; rejects protocol-relative URLs
├── i18n/
│   ├── locales.mjs   ← THE locale list, plain ESM so bare-node scripts + Tina can import it
│   ├── ui.ts         ← locale registry + UI strings (nav, buttons, forms)
│   ├── routes.ts     ← translated URL segments + hreflang builders
│   └── utils.ts      ← t() and localePath()
├── content/blog/     ← articles, one .md file per language, under en/ es/ zh-hans/ zh-hant/
├── components/       ← Header, Footer, ContactForm, CookieConsent, LangSwitch,
│                        Lattice, CityBody, CityPhoto, CityDataStrip, AboutBody,
│                        EndCta, BlogPostGrid, TagPill, ThemeToggle
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
grep -o 'hreflang="[^"]*" href="[^"]*"' dist/glossary/index.html            # expect nothing
grep -o 'hreflang="[^"]*" href="[^"]*"' dist/websites/alhambra/index.html   # expect 4 + x-default
```

The "expect nothing" page used to be `dist/websites/glendale/index.html`, and
that is worth knowing rather than just fixing: Glendale gained all four locales
on 2026-09-15, so the check had quietly become one that can never fail. An
absence check whose subject stops existing passes forever — which is why the
positive control on the second line is not decoration, and why
`src/data/city-pages.test.ts` runs both halves against the built pages.
`/glossary/` is English-only today; if it ever gains a translation, move the
check again rather than deleting it.

`src/i18n/routes.test.ts` unit-tests `buildAlternates()` directly (zero/partial/full-locale
cases) — run `npm run test` for a faster check than the grep above during development.

### 2. City pages must say something real

`src/data/cities.ts` has a warning at the top. Near-identical pages with the
city name swapped are the classic doorway-page pattern — Google indexes them
and ranks none of them.

**The method is data-backed, not landmark-backed** (2026-09-15). Every page
rests on figures a reader can check for that city: registered clinicians by
type from the CMS NPI Registry, the licensed general acute care hospitals in or
beside the city from California HCAI, and the share of residents who speak
Spanish and Chinese at home from the Census ACS 5-year table C16001. The queries
and query dates are in
`docs/superpowers/specs/2026-09-14-practice-city-pages-sources.md`, which is the
only source the copy may cite. `sources` is a required, non-empty field on
`CityCopy`, so a page cannot build without its links.

Naming a commercial district was the old method and it is gone — a street name
says nothing to a clinic owner, and it is far too easy to write the same
sentence ten times with the street swapped.

The guard is a test, not a habit: `cities.test.ts` masks every city name and
every number out of each English paragraph and fails if two cities are left
with the same sentence. "One template, new numbers" is the doorway pattern a
data-backed page is most tempted by, so that is the shape it looks for.

If asked to add cities in bulk, push back. Ask what the registry, the hospital
list and the Census actually say about that city, and whether the answer is
different enough to be worth a page. Six honest pages beat twenty thin ones.

### 2b. A city page's furniture goes BETWEEN paragraphs

The house pattern, set 2026-09-16, is:

```
paragraph · photo · paragraph · data strip · paragraph · sources
```

`CityBody.astro` does the interleaving; `CityPhoto.astro` and
`CityDataStrip.astro` each only know how to draw one thing. It lands evenly
because `CityCopy.body` is exactly three paragraphs, which is the reason that
constraint is documented on the type. Both pieces sat stacked above the `<h1>`
until this change, which pushed the opening sentence down the page and made the
photograph read as a banner.

**The photo is deliberately narrower than the prose column** — 26rem against
`--max-width-prose`'s 38rem — so it reads as an illustration inside the text.
That also means every file renders smaller than it was fetched, which is why
Alhambra's 605px original (the one file below the 1216px corpus width) is not
a visible problem: at 26rem it downscales like the others rather than
stretching.

**Both are furniture and `mainProse()` drops them before scoring** — the credit
because it is a `<figcaption>`, the strip by its `city-strip` class. Position
does not affect that, which is why this layout change needed no change to the
scorer. The strip is an `<aside>` and **not** a `<div>`: it nests `<div>` rows,
so the non-greedy exclusion would stop at the first inner `</div>` and leave
most of the panel in the sample. Measured — with the exclusion removed, 27
built pages fall out of band and the city pages read FK 15.6–16.0; with it, 16
— 3 legal pages, the glossary, and 12 index and listing pages.

**That set was 17 until 2026-09-16, and the seventeenth is worth the paragraph.**
A live post, `/blog/do-i-need-a-website-if-i-have-instagram/`, read FK 12.9 on
the built page against 13.3 at source. The prose was never the problem: the
built path was scoring `<p class="post__subtitle">`, which `Post.astro` renders
from the SAME frontmatter string that becomes `<meta name="description">`. Meta
descriptions are excluded from scoring on purpose — 155 characters written to
win a click is a different job from reading well — and the markdown path never
saw it because frontmatter is stripped. "Sometimes no. Usually yes." is two
two-word sentences at the head of a 37-sentence sample. Its siblings
`post__author` and `post__meta` were excluded from the start; this one was
missed. With it excluded the two paths agree exactly at 13.3, which is the
evidence that nothing else was wrong with the post.

Measured across the whole built corpus before keeping it, as every correction
to this instrument must be: 10 of 96 pages moved, all of them in the harder
direction, and exactly one verdict changed — that post, below → ok. No page
moved out of band.

`city-pages.test.ts` pins the ORDER, not just the presence of both markers: a
presence test keeps passing if someone moves them back above the heading.

**The strip shows five fixed clinic types, largest first, not a per-city top
five.** A real top five drops optometrists from five of the ten pages, and eye
care is one of the three practice types this site sells to. And a specialty can
only be counted at all if it has one generalist taxonomy code — obstetrics and
pediatrics were probed and rejected, because their practitioners scatter across
subspecialty codes and a generalist filter returns 0 OB/GYNs and 3
pediatricians in Pasadena. The sources spec records that dead end; don't
re-derive it.

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
last added 2026-08-27 for translated blog posts). The sibling
`[locale]/[section]/index.astro` now has four kinds —
`'blog' | 'service' | 'city-hub' | 'about'`, the last added 2026-09-21 for the
About page. Follow that pattern for any
new localized section, and when you add a new `kind`, **grep the file for
every existing `if`/`else` first** — a bare `else` written when there were
only two kinds silently mis-branches the moment a third one exists. Hit
exactly this bug adding the blog kind; see
`docs/solutions/logic-errors/dual-purpose-route-bare-else-broke-on-third-kind.md`.

**A service can be retired or renamed, but only behind a redirect in every
locale.** On 2026-09-14 `search` and `ads` folded into "Get more patients".
Their eight URLs (two services × four locales) are Astro static redirects
declared in `src/data/retired-services.mjs` — an instant meta refresh,
`noindex`, and a canonical to the target; `@astrojs/sitemap` skips them.
`retired-services.test.ts` keeps an append-only, literal list of every service
URL ever published and fails if any stops resolving — it is deliberately NOT
derived from `services.ts`, because a derived expectation moves with a rename.
The same file checks every service link written inside a blog post from
source, since most posts are date-gated and absent from `dist/`. The city
pages' segment (`/websites/`) is written out in `routes.ts` and pinned by a
test rather than read from the service slug, so a service rename never moves
every city page. The blog's four
pillars did not change; they reach a service through `PILLAR_SERVICE` in
`services.ts`, because matching a pillar to a service id crashed the build the
moment a service was retired.

**Scheduled publishing is two mechanisms, not one.** `getPostsByLocale()`
gates on `pubDate <= now` as well as `draft` — and that filter must stay in
`src/utils/blog.ts`, never move into a page template. It also backs
`getStaticPaths` for both blog routes, so a future-dated post gets no page
*and no sitemap entry*; filtering only the index would hide posts from readers
while still advertising the URLs to Google. `getTranslationsFor()` needs the
same filter or a live post can emit an `hreflang` alternate at an unbuilt page.
The other half lives in `.github/workflows/deploy.yml`: a static site has no
clock, so the daily `schedule:` cron is what makes a date arrive. Delete it and
the filter is still correct and nothing ever publishes.

**There is a third part, and it is the least obvious: the repo has to stay
awake.** GitHub disables scheduled workflows in a public repository after 60
days with no repository activity, and "no one doing anything" is exactly the
steady state this design aims for. `.github/workflows/keepalive.yml` commits
monthly to reset that counter — it must *commit*, because the rule is about
repository activity, not workflow runs. So the mechanism is a filter, a clock,
and a heartbeat.

The heartbeat does **not** trigger a deploy, and it is worth knowing why: GitHub
suppresses workflow triggers for pushes authored with `GITHUB_TOKEN`, to prevent
recursion. Verified by dispatching it — the commit landed, no deploy ran. Give
the workflow a fine-grained PAT if you want it to double as a monthly rebuild. Full write-up in
`docs/solutions/logic-errors/static-site-scheduled-publishing-needs-a-clock.md`.

**CJK underlines need a lower baseline — kept as a principle, not as live
code.** Chinese glyphs fill the em box and have no descenders, so an underline
sized for Latin text cuts through them. There *was* a `text-underline-offset`
override on the zh hero heading; it was removed 2026-09-04 because nothing
underlines a hero heading any more (the only `text-decoration: underline` left
in `src/` is in `LangSwitch.astro`). The rule had been protecting something that
no longer existed. Re-apply the principle if an underline is ever added to
display type — but do not re-add the rule speculatively.

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

**`:global(...)` is inert unless the `<style>` block is SCOPED.** It is an Astro
compiler construct, and the condition is the scoping — not the file type.
Verified against `@astrojs/compiler-rs`: it survives verbatim inside
`<style is:global>` as well, so "add `is:global`" reproduces the bug rather than
fixing it. `global.css` is
a plain stylesheet, so Astro never touches it and the selector ships verbatim,
where the browser discards the whole rule as invalid. The Chinese line-height
override was written that way and was dead from the day it landed — every zh
page rendered at Latin spacing (measured ratio 1.600, not 1.800) while this file
cited it as a working fix. Selectors in `global.css` are already global; the
`:global()` in `[locale]/index.astro` is correct because that one *is* inside a
`<style>` block. Fixed 2026-09-03.

The build was never actually silent about it: lightningcss warns *"'global' is
not recognized as a valid pseudo-class"* and exits 0, and printed that on every
build for months. `ci.yml` now promotes it to a failure alongside the
duplicate-slug warning — the same move, for the same reason.

**hreflang has exactly one producer, and it must stay that way.**
`@astrojs/sitemap`'s `i18n` option was enabled and built its own `xhtml:link`
alternates by stripping the locale prefix and matching the remaining path — which
hard rule 3 translates, so it structurally could not see this site's translation
sets. It paired `/blog/` with `/es/blog/` only, contradicting that page's own
correct four-locale set, and could not emit `x-default` at all. Conflicting
annotations are a documented reason Google discards a cluster, so the accidental
producer was throwing away what `buildAlternates()` earns. Removed 2026-09-03 —
do not re-enable it. The page-level tags in `Base.astro` are the source of truth.

**A review agent and your own verification can share a working tree.** During the
2026-09-03 review, `dist/` was grepped while a parallel agent had deliberately
broken a `kind` literal and rebuilt — producing real evidence for a bug that was
the agent's experiment, not the repo's state. It looked exactly like a genuine
finding. When running `/ce:review` with parallel agents, re-verify anything
`dist/`-based *after* they finish, or build into a separate directory.

**And the same shared tree has a WRITING form, which is worse: `git add -A`
commits whatever a peer agent is halfway through.** On 2026-09-15 two agents
were working this checkout at once — one finishing the readability scorer, one
mid-task on the city hubs. The first staged everything, and swept up the
second's `src/data/cities.test.ts` (modified) and `src/data/city-pages.test.ts`
(new, untracked) — files with nothing to do with its task. It noticed, backed
out with `git reset --soft HEAD~1` plus a selective `git restore --staged`, and
re-committed; verified afterwards with `git log --oneline --all -- <path>`
returning empty, so the file had never been in any commit. Nothing was lost,
but only because the agent checked its own `git show --stat` before moving on.

The reading form corrupts *evidence*; this one corrupts *history*, and a
squash-merge would have buried it. **Stage explicit paths — `git add <path> …` —
never `-A` or `.`, whenever anything else might be working this tree**, and read
`git show --stat HEAD` after committing rather than trusting the command. The
existing `git status` / `ListAgents` / worktree checks tell you a peer exists;
they do not stop your own staging from taking their work.

**A leftover worktree makes the test suite count itself twice.** A git worktree
under `.claude/worktrees/` is a full second checkout, so every `*.test.ts` in it
is a real file on disk — and `.claude/` is not in vitest's default `exclude`.
From 2026-09-09 to 2026-09-11 a stale worktree made `npm run test` report **623
tests across 52 files** while CI, on a clean checkout, reported **316 across
26**. The doubled figure was written into this file as the project's test count.

Three things kept it invisible:

- **It does not look like a 2x.** The stale copy sits at an OLDER commit with
  fewer tests, so the total is a plausible number rather than an obvious double
  (316 + 307 = 623).
- **`git status` is clean.** `.git/info/exclude` — a local, uncommitted,
  per-clone file — lists `.claude/worktrees/`, so git never mentions it. That
  rule means nothing to a test runner walking the filesystem.
- **Everything passes.** The duplicate run is green; only the count moves. And a
  count is exactly the kind of number that gets copied into docs unexamined.

`vitest.config.ts` now excludes `.claude/**` (added 2026-09-11; verified by
running a deliberately failing test from both locations — red in `src/`, not
collected under `.claude/`). The rule worth carrying past this specific fix:
**a number measured on a laptop is a claim about that laptop.** CI on a clean
checkout is the authority, which is the same lesson as the stale-`dist/` trap
and the `astro sync` one. `npm run typecheck` was re-measured with the worktree
gone and was never inflated — it reported 84 either way, and reads 85 now only
because this fix added `vitest.config.ts` to the files it checks.

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

**`tina/tina-lock.json` IS the schema Tina Cloud serves — commit it with every
`tina/` change.** Tina Cloud does not compile `tina/config.ts`; it indexes the
committed lock from `main` on every push (verified: its `/schemaSha` endpoint
returns exactly the SHA-256 of the lock's `schema` member). `deploy.yml`'s
`npx tinacms build` compiles `config.ts` fresh and compares against that hash.
Edit `config.ts` without regenerating the lock and **every deploy fails with
`ERR_CLOUD_CHECK_FAILED`** — after merge, with build, typecheck and all tests
green — and the daily publish cron fails with it. That happened on 2026-09-04
across four commits; it took two hotfixes and a full revert to recover, and the
first two attempts chased a "sync it in the Tina dashboard" step that does not
exist. There is nothing to sync. The commit is the sync.

**The rule:** after touching `tina/config.ts` or `tina/utils.ts`, run

```bash
npx tinacms dev --no-server --noWatch    # ~4s, no credentials, no network
git add tina/tina-lock.json
```

and commit the lock in the same change. `npm run admin` regenerates it too;
`npx tinacms build` does **not**. `ci.yml` now regenerates it and fails the PR if
it differs from the commit, and `tina/lock.test.ts` runs the deploy's own hash
comparison locally whenever `tina/__generated__/_schema.json` exists.

**What counts as a schema change** (learned by bisecting, not by guessing):
field `type`, `list`, `required`, `options`, `label`, `description`,
`match.include`, the *shape* of any `ui` object — a `ui.validate` function is
dropped by `JSON.stringify` but leaves `ui: {}` behind, a new key — and even key
**order** inside a field. Only comments and function bodies do not reach the
hash. An earlier version of this section listed `description` and `ui.validate`
as safe; both were wrong.

**A regenerated lock that DIFFERS is not proof your edit reached the schema.**
The file carries a `fullVersion` stamp from `@tinacms/graphql`, so a
`node_modules` that has drifted behind `package-lock.json` changes the hash on
its own — seen 2026-09-16, where a comment-only edit appeared to move the schema
and the entire diff was `2.4.11` → `2.4.10`. Committing that would have failed
every deploy, from the opposite direction to the 2026-09-04 incident. Diff the
lock's `schema` member and find out what actually moved; note the member was the
same byte length both times, so a length check would have called it unchanged.
Two traps alongside it: macOS has no `timeout`, so `timeout N npx tinacms …`
never runs the command while looking like a clean no-change result, and `npm ci`
can fail `EACCES` on root-owned `~/.npm/_cacache` entries *after* emptying
`node_modules`. Full write-up in
`docs/solutions/integration-issues/tina-lock-json-is-the-remote-schema-and-must-be-committed.md`.

**Bisecting by deploy cannot work**, and it looked like the remote was moving.
It was not: the lock had been unchanged since 2026-08-31 and every re-index
served the same stale schema. Compare locally — the test above, or
`npx tinacms build` with `.env` loaded — never by merging.

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

### Hero images: the API changed the obligations, not just the source

An Unsplash API key was added 2026-09-08 (`UNSPLASH_ACCESS_KEY` in `.env`,
gitignored, never committed — verified against full history, which matters
because this repo is public). **Use `npm run unsplash` rather than doing this by
hand**, because signing up moved the site from the Unsplash *license* to the
Unsplash *API guidelines*, and they are stricter in three ways that all fail
**silently** — the page renders, the build passes, nothing complains:

1. the photographer must be credited **with a link** to their profile,
2. Unsplash must be linked too, both carrying `utm_source`/`utm_medium`,
3. `links.download_location` must be **called** when a photo is used. Fetching
   the image file does not count; that endpoint alone is what credits the
   contributor with a download.

`scripts/unsplash.mjs` does all three and prints the frontmatter, so compliance
is automatic rather than remembered. `search` lists candidates and stops —
choosing the photo for an article is editorial and stays human.

**`heroCreditUrl` is optional on purpose.** The 20 images already in
`public/blog/` predate the API and remain covered by the plain license, where
attribution is appreciated but not required. Requiring the field would fail the
build on 80 existing files to satisfy a rule that does not reach them.
`Post.astro` renders the linked form when the URL is present and the old bare
`Photo: Name` when it is not. Both ends validate through the same predicate in
`src/data/hero-credit.ts` — Astro's schema and Tina's field — because those two
already drifted into exact opposition once over `heroImage`.

**The host is compared, never the string.** `heroCreditUrl` becomes an outbound
link on every rendering of a post and is typed by whoever is editing. A
lookalike like `https://unsplash.com.evil.example/@x` contains the literal
"unsplash.com" and passes any `includes` check, so the URL is parsed and
`hostname` compared.

**Fetch a sized image, never the original.** The first working version of the
script downloaded what `download_location` returns, which is the full-resolution
file: **5,596 KB at 9000×6000**, against a corpus that runs 1216–1422px and
100–400 KB. On a site whose entire acquisition strategy is organic search that
is a self-inflicted Core Web Vitals wound, and no build step objects to it. The
script now builds a resized URL from `urls.raw` (`HERO_WIDTH = 1400`) and still
calls `download_location` for the compliance obligation, discarding its URL —
148 KB at 1400×933 for the same photo.

Note the API key is on the **Demo** tier: 50 requests/hour, not the 5,000 of
Production, which needs a separate application to Unsplash. A 403 from the
script is almost always that limit rather than a bad key, and it says so.

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

Chinese also carries **two length tripwires, checked by `sentenceGuard()`**: a
per-sentence ceiling of 220 characters on the longest sentence
(`MAX_SENTENCE_CHARS`) and a page-mean ceiling of 85
(`MAX_MEAN_CHARS_PER_SENTENCE`). They exist because `registerIndex` measures
word choice, not length — the two come apart in Chinese, which is the whole
reason that metric replaced characters-per-sentence — so a post can sit
perfectly in band while running 80 characters to a sentence. English and Spanish
need no equivalent: their primary metrics are already length-sensitive and their
band maxima catch the same failure.

Both are **tripwires, not targets**, and the two ceilings are set differently.
The per-sentence one follows the rule — ~24% above the observed maximum of the
statistic it reads (176 → 220). The mean one does **not**: 85 sits about 52%
above the observed maximum mean of 55.8, because it was deliberately held where
it was rather than re-derived downward to 70. The paragraph two below explains
why, and it is the fuller account; the point here is only that neither value is
anything prose should be edited toward, which is the inversion the write-up
further down warns about. Added 2026-09-04, after the file header had claimed
such a guard existed for months while nothing compared the value to anything.

**There was one, and it read the wrong statistic (fixed 2026-09-15).** The old
`MAX_CHARS_PER_SENTENCE = 85` was compared against the page MEAN while every
description of it — here and in the script — called it a per-sentence ceiling.
A page hit exactly 85 characters in one sentence while the guard reported `ok`,
because its mean sat in the forties; only a by-hand measurement caught it. The
longest sentence is now measured under the name the documentation always used,
and the mean is kept as a separate check with its own code (`'runaway'` vs
`'dense'`), because neither statistic subsumes the other. Calibrated over the
complete Chinese corpus — 136 blog posts plus 46 built pages, 182 items: longest
min 19, median 83, max 176 (the zh-hant FTC fake-review post, which enumerates
six categories in one semicolon-separated sentence). 176 × 1.24 = 218.2 → 220.

**Know what 220 does and does not guard.** A maximum has a far fatter right tail
than a mean, so the same rule yields a much looser ceiling: the built pages top
out at 97 and the Chinese city pages at 76, so 220 is driven by one blog outlier
and binds the blog alone. The mean ceiling does not rescue them either — the
built corpus tops out at 55.8 against 85. What actually holds the Chinese city
pages to the house standard is the register band and human review, not either
length tripwire. **`MAX_MEAN_CHARS_PER_SENTENCE` was deliberately NOT re-derived
downward**: the rule would give 70, but the 68.4 that set 85 was real prose this
site shipped, and ratcheting a tripwire down every time the corpus improves
turns it into a target that tracks the prose. Re-derive when it was fitted to
the wrong *sample*; not merely because the corpus moved.

**It was 60 until 2026-09-07, and why it moved is the lesson.** `sentenceGuard()`
was called only from the CLI's markdown branch, never from `--dist` — so the
guard could see the blog and nothing else, and the 60 was derived from that
blog-only sample (max 47.1, +27%). But service, city and homepage copy lives in
`src/data/*.ts`, has no markdown source, and is measurable *only* from the built
page. The ceiling was calibrated on a sample that structurally excluded the copy
most likely to trip it. Wiring the guard into `--dist` failed four service pages
at once (61.5–68.4).

**That is a recalibration, not a snooze, and the difference is testable.**
Raising a ceiling because prose crossed it is the metric-corrupts-prose
inversion. Raising it because the number was fitted to the wrong sample is
fixing the measurement — and the check is whether the new value comes from the
same rule applied to a *complete* corpus. It does. If a future page trips a
ceiling, that is a genuine runaway: fix the prose, not the number.

**A list item ends a sentence** (2026-09-14). Both scoring paths mark each
bullet's end, because bullets carry no terminal punctuation and a seven-item
list used to score as one hundred-word sentence — a list-heavy service page read
FK 25.4 that way against paragraphs near grade 11. Measured across the whole
corpus before adopting it: no blog post in any locale changed verdict (largest
shift 0.3). The corollary is that the service pages' earlier in-band scores
were partly that artifact, so a rewritten list-heavy page must be raised by
hand, not assumed in band — all three were, to FK 13.0–13.4.

That fix had a side effect worth knowing: on the localized homepages each
two-word city in the service-area list became a two-word "sentence" and pulled
`/es/` from 46 to 58. A list of place names is furniture, like the nav and the
form, so `mainProse()` now drops `ul.service-area`. Every correction to the
instrument gets the same whole-corpus check as the first one. Full write-up in
`docs/solutions/process-errors/readability-scorer-counted-a-bulleted-list-as-one-sentence.md`.

**The service and city pages' back-links were the last furniture still scored**
(fixed 2026-09-15). "‹ All cities", "‹ Back to services" and their translations
landed as a three-word sentence on every service and city page in all four
locales — the same category as the nav, the form and the blog's own
`a.post__back`, all already excluded. They now carry `class="page-back"` and
`mainProse()` drops them by that class, with the same paired "the marker still
exists on the built page" test `ul.service-area` has. That one is written as an
invariant over the whole build — after removing `p.page-back` and
`a.post__back`, no `‹` may remain inside any `<main>` — so it covers every
locale and both page types, and catches a new page type that grows an unclassed
back-link. It is not arithmetic trivia: the furniture dragged
words-per-sentence down, and the Spanish city pages had been paying for it with
60–71-word sentences against English twins running 25–37. Removing it moved no
blog verdict in any locale (largest shift 0.0) and put four English city pages
above the band at 15.1–15.9, which were then repaired by hand.

`scripts/readability.test.mjs` now asserts the guard against **both** corpora,
and the built-page half skips without `dist/` — which is why `ci.yml` re-runs
the suite after the build. `npm run readability -- --dist` also exits non-zero
on a runaway now; it previously ended in an unconditional `exit(0)`, so that CI
step could fail on exactly one thing, a missing `dist/`.

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
After any register edit to `city-copy/*.ts`, assert that the figures recorded in
`docs/superpowers/specs/2026-09-14-practice-city-pages-sources.md` still appear
in the built pages, then run `npm run test`: its parity test compares every
translation's figures, digit for digit, against the English, and a second test
compares the source URLs. Do not trust the diff — a register edit rewrites the
sentence around a number, which is exactly where one gets dropped or rounded.

The old list here named 1926, Laura Scudder, 400 storefronts, 1895, Renaissance
Plaza, Huntington Drive and 1887. All of that copy was removed on 2026-09-15
when the pages were rebuilt on registry, hospital and Census figures, so those
strings are now the opposite of a check: grepping for them would fail on
correct pages.

**The metric describes the prose; editing prose to move the metric inverts
what it is for.** That happened four times during the conversion and every
one of those edits read worse than what it replaced. The counter-rule is not
"never touch the metric" but "measure which one is broken" — on one post a
shortfall looked exactly like a scoring artifact, and measuring the proposed
fix across all 20 English posts showed it moved them by at most +0.4 against
a 1.3-grade gap, so the prose really was thin and the metric was left alone.
Full write-up in
`docs/solutions/process-errors/a-writing-metric-corrupts-the-prose-it-governs.md`.

**That inversion has a second, quieter form, and it shipped: an edit that
RAISES the score while BREAKING the prose.** English and Spanish are graded
partly on words-per-sentence, so splicing two adjacent sentences together
with a conjunction improves the number every time. Done mechanically it also
strands the swallowed sentence's capital mid-clause — `..., and A brochure
site with a telephone number presents less of one.` Thirty-two of these
reached `main` across four merged pull requests in September 2026, because
every number moved the right way and nobody re-read the half that got worse.

They came in three shapes, and the second is the one a reviewer's eye slides
past: a stranded capital (18), a LOWERCASED brand where the swallowed
sentence began with one — `..., and google publishes those conditions`,
`..., and huy Fong cannot stop them` (14) — and a doubled conjunction,
`..., y Y cerca del 80%` (1). More were findable only by reading: a mangled
list, a non-sequitur, `is not a courthouse, and it is a letter`.

`scripts/readability.test.mjs` now carries a **`Latin-script corpus grammar
guards`** block covering all three, the Latin-script twin of the `由於` and
`之因此` guards above and written for the same reason. It carries the same
"a sample, not an inventory" caveat as the script-purity table: the brand
list is the proper nouns this corpus actually uses, and matching is anchored
to `, and` / `, y` because URLs, slugs and tag lists legitimately carry
`google` in lower case everywhere. Each guard was verified to FAIL on an
injected violation before being kept.

**The rule this leaves:** close a band gap by hand, post by post, measuring
after each — merge sentences with real subordination, choose more precise
words, and split anything that overshoots the ceiling. Never run a regex over
prose to move a score. All four locales reached 68/68 in band that way on
2026-09-10 (en mean 13.6, es 52.3, zh 0.6).

## Known outstanding work

- **A practice-focused content plan, success stories and per-specialty pages**
  are deliberately deferred — spec §9 in
  `docs/superpowers/specs/2026-09-14-practice-services-design.md`. Until the
  content plan lands, the 68 small-business posts end in calls to action that
  lead to practice service pages.

  **City pages are no longer on that list.** Ten cities now exist in all four
  languages, rebuilt on registry, hospital and Census figures and re-aimed at
  practices (2026-09-15, spec
  `docs/superpowers/specs/2026-09-14-practice-city-pages-design.md`). The city
  hub and the blog index descriptions in `ui.ts` were re-aimed at the same
  time; the blog descriptions name practices *alongside* other local
  businesses, because the corpus itself is still general small-business
  writing and nine posts are retail-specific.
- **Both schedules are written, translated and approved: 68 sets, every one
  in all four languages, all `draft: false` as of 2026-09-10.** The original
  90-day run (20 sets) was approved 2026-08-31; `CONTENT-PLAN.md`'s phase two
  (48 sets, weekly Mondays 2027-01-18 → 2027-12-13) was approved 2026-09-10
  after the owner reviewed every article. There is no content backlog and no
  translation backlog.

  The site is **date-gated** — a post appears on its `pubDate` and not before —
  so approving all 68 published nothing on the day: the build was 71 pages
  before and after, and reaches ~323 once the whole schedule has surfaced.
  **Never read "68 approved" as "68 visible."** Don't take the count here on
  trust either — `CONTENT-STATUS.md` is generated from the frontmatter and is
  the live answer; this line is the one that goes stale.

  Two articles do not match the titles in `CONTENT-PLAN.md`, on purpose.
  2027-07-19 was planned around In-N-Out's website and is now "Websites that
  barely change" built on the Wayback Machine, because in-n-out.com cannot be
  read by any method available here (curl returns an 843-byte shell, a real
  browser gets an Incapsula block page). 2027-12-06 was planned as a summary
  of published agency rate surveys and now reports the search instead, because
  every such survey found is vendor-published and states no sample size, field
  dates or selection method.

  One phase-two Monday, 2027-11-29, was flagged in `CONTENT-PLAN.md` itself as
  the weakest of the case-study articles, to be dropped if no citable source
  could be found. A source was found and it shipped, so all 48 Mondays carry
  an article and the run has no gaps.

  The rule still binds anything written from here on: translate alongside the
  English draft, not afterwards. A date-gated post whose translations miss its
  own `pubDate` publishes English-only and does not get a second chance.

  Separately, **the college reading-level bands (register bands) apply to
  this whole 68-post corpus, and `npm run readability` is the only thing
  that checks it — `npm run test` does not.** `scripts/readability.test.mjs`
  unit-tests the scoring *engine* (syllable counting, the grading formulas,
  the sentence-guard, the grammar guards) against synthetic sample text; it
  does not iterate the actual blog corpus and assert every post is in band.
  That gap let 13 English and roughly as many Spanish posts — mostly the
  newer phase-two batch — ship outside the 13–15 / 40–55 target bands with
  nothing red in CI. Fixed 2026-09-10 (68/68 in band, all four locales; see
  Resolved), **and the test-suite gap is now closed too**: a
  `corpus reading level` block in `scripts/readability.test.mjs` scores the
  real corpus and fails with the offending file, its score and the target
  band. It also asserts each locale scored at least one post, so a locale
  that silently stopped being scored cannot pass the check vacuously.

  The gap was proven before it was closed: a post mangled into short
  declaratives left `npm run test` fully green and `npm run readability
  -- --dist` at exit 0. Note why the CLI did not help — `--dist` exits
  non-zero only on a RUNAWAY SENTENCE, never on a band miss.
- **PR #75's review (2026-09-14) added `029`–`046`.** Every P1 and P2
  (`029`–`038`) was fixed on that branch before merge — mostly legal wording
  on the service pages, the Chinese Checkup name, and three guards that make a
  service URL rename or a stale link fail a test. The P3s were triaged and
  closed afterwards: `039`–`045` and `047` are complete, and **`046` is the
  only one still pending** — the questions for the attorney hour, which is an
  owner decision rather than a defect and cannot be closed from here.
- **All 28 earlier code-review findings, `001`–`028`, are complete** (`001`–`020` as
  of 2026-09-05; `021`–`028` added and closed since). `013` closed the
  original batch: the n8n workflow now validates before writing to the CRM.
  Closing it uncovered a live P1 underneath the P2 — the contact form had been
  writing *blank* records into Twenty since 2026-08-26 — so read that todo before
  touching the contact form or the n8n workflow.

  **Every finding in that batch is closed, including the items parked inside todos marked
  `complete` as decisions rather than defects.** Findings `020` (English/
  localized visual divergence) and `028` (a fourth-`kind` compile-error claim
  found to be overstated on inspection) both closed with the same lesson as
  `006` below: read the work log, don't assume the title describes the fix.

  The work logs are worth reading before related work; they record why the
  rejected options were rejected, and several record findings that dissolved on
  inspection rather than being real. Two caveats learned the hard way:
  **a todo is a snapshot, not a live view** (closing `006`, two of its four
  findings had already been fixed as side effects of `007`/`008` with nothing
  marking them resolved), and **a finding's shape is not its severity** —
  "hardcodes all four locales" was a real hard-rule-1 bug in one place and
  correct, type-enforced code in another. Re-verify against current code before
  acting.
- **Tina's `npm audit` is down to 2 moderate (from 8), fixed 2026-09-10, and
  the remaining 2 are a genuinely different problem from the ones that were
  fixed — not a smaller version of the same one.**

  Three separate causes were hiding under one "8 moderate" number:

  1. **body-parser's own CVE** (nested `qs` dependency) — fixed by plain
     `npm audit fix`, no `--force`, from a clean `npm ci` baseline. Bumped
     `@tinacms/cli` 2.6.1 → 2.7.0 and `@tinacms/graphql` 2.4.10 → 2.4.11,
     both already inside package.json's declared `^` ranges. Ordinary
     maintenance, not a forced change.
  2. **The react-router cluster** (`react-router`, `react-router-dom`,
     `tinacms`, `@tinacms/cli`, `@tinacms/app` — 5 of the original 8) — the
     GHSA advisories cover the *entire* range `>=6.0.0 <7.18.0`, so there
     never was a patched 6.x release to move to; 6.30.6 (the actual latest
     6.x, confirmed via `npm view`) is still vulnerable. The only fix is the
     7.x major, which Tina's own `^6.30.3` pin excludes — this is the part
     the 2026-08-27/2026-09-09 versions of this note called "genuinely
     blocked upstream," and that reasoning was correct as far as it went.
     What it missed: npm's `overrides` field can force a transitive
     dependency past an ancestor's declared range when the forced version
     stays API-compatible, and react-router-dom kept its plain
     `Routes`/`Route`/`useNavigate`/`Link` API compatible from 6 into 7 (the
     breaking changes are in framework/data mode, which Tina's admin app
     doesn't use). Forced to `7.18.3` via `overrides` in `package.json`.
     **Verified in a real browser, not assumed from the changelog** — booted
     the local Tina admin dev server and drove it end to end: collection
     list, folder navigation across all four locales, hash-based route
     changes at every depth, and the full post editor form all rendered and
     worked. One cosmetic React "missing key prop" warning in Tina's own
     `Breadcrumb` component, unrelated to routing.
  3. **`express`/`qs` — still open, and not the same issue as #2.** `express`
     is a transitive dependency of `@tinacms/cli`'s
     `altair-express-middleware` (the local GraphQL playground), pinned to
     `express@4.22.2`, whose own declared range (`qs: ~6.15.1`) caps below
     the `qs@6.16.0` fix. Express 5.x fixes this but is a major bump
     `altair-express-middleware` doesn't support yet. This one really is
     blocked upstream — re-check next time `@tinacms/cli` gets touched.

  **The standing rule from the old note still holds and generalizes past
  this specific fix:** "N moderate" is a claim to re-check every time, not a
  standing fact, and a single reported count can hide more than one root
  cause. Read what's actually blocking each package, not just the total.
## Resolved

Already solved — **details and reasoning in [`docs/RESOLVED.md`](docs/RESOLVED.md)**.
Read that file before re-investigating any of these.

- Cal.com bookings now reach Twenty CRM, repeat customers included
- Blog i18n mechanism is built (2026-08-26/27)
- `site.formEndpoint` now points at a real Formspree endpoint, and the contact form dual-submits into a self-hosted n8n workflow → Twenty CRM. **The CRM half silently wrote blank records until 2026-09-05** — `no-cors` forces text/plain, so n8n received `body` as a string and every expression resolved to empty, while all four layers reported success
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
- A full-repo review's 20 findings are all closed, `013` last (2026-09-05)
- `tina/tina-lock.json` is the schema Tina Cloud serves; not committing it broke every deploy (2026-09-05)
- The contact form's CRM leg wrote blank records into Twenty for ten days; `no-cors` forces text/plain and n8n handed the workflow a string (2026-09-05) — full write-up in `docs/solutions/integration-issues/no-cors-forces-text-plain-and-the-webhook-received-a-string.md`
- Blog hero images are self-hosted from `public/blog/`, not hotlinked from Unsplash; the schema now fails the build on an external URL (2026-09-06)
- The contact form's enquiry text reaches Twenty as a Note; the workflow is Webhook → Normalise → Valid? → Person → Note → link (2026-09-06)
- Analytics consent can be withdrawn from the footer, in all four languages; `define:vars` makes that script `is:inline`, so it must delegate (2026-09-06)
- The four homepages are one design again — localized heroes carry the logo lockup and framed service cards (2026-09-06)
- The publishing cron has a monthly heartbeat, so GitHub cannot disable it for inactivity (2026-09-04)
- The booking CTA was dead for nine days — a Testing-mode Google OAuth app expires refresh tokens after 7 days, and Cal.com answers an unreadable calendar with zero slots rather than an error (2026-09-07) — full write-up in `docs/solutions/integration-issues/calcom-testing-mode-oauth-expires-and-availability-goes-silently-empty.md`
- The contact form's honeypot no longer eats a real lead to Chrome autofill, and a retry no longer duplicates the CRM record; verified from a real browser against production (2026-09-07)
- The Chinese sentence ceiling is calibrated on the corpus it governs, and `readability -- --dist` can actually fail (2026-09-07)
- The ops panel sends `no-store` and no longer hotlinks Google Fonts (2026-09-07, property-page#2)
- The npm audit drift that briefly hid a critical advisory is fixed, and the audit is verified back to exactly 8 moderate (Tina only) as of 2026-09-09 — see the Tina audit note above for what's still open
- Four latent Unsplash-attribution bugs are fixed before any could fire: a credit link with no name rendered no caption at all, a UTM-fragment bug put required params where a browser never sends them, captions were hardcoded English on the other three locales, and `scripts/unsplash.mjs` wrote an unvalidated slug straight into a file path (2026-09-09, #45)
- A blog post's social-share image is its own hero photo now, not the site-wide `/og.png` — todos/012's parked product decision (2026-09-09)
- The 48-article phase-two content calendar is fully drafted, all in four languages — 47 written Mondays plus one (2027-11-29) that CONTENT-PLAN.md had pre-flagged as droppable if uncitable, for which a real source was ultimately found (2026-09-10)
- 13 English and roughly as many Spanish posts (mostly the phase-two batch) had drifted outside the college reading-level bands with nothing in CI catching it; all four locales are back to 68/68 in band, and 32 sentences a mechanical sentence-join had damaged (a stranded capital, a lowercased brand name, a doubled conjunction) were repaired along the way — three new Latin-script grammar guards added to `scripts/readability.test.mjs` so the specific damage pattern can't ship silently again (2026-09-10)
- Tina's `npm audit` is down to 2 moderate from 8 — one real fix via plain `npm audit fix` (body-parser's nested `qs`), one via an `overrides` pin to a patched react-router-dom major, verified working in a real browser session against the local admin — see the Tina audit note above for what's still open and why (2026-09-10)
- A leftover git worktree made `npm run test` collect the repo twice and report 623 tests across 52 files, against CI's 316 across 26; the doubled figure had been written into this file as the project's test count (2026-09-11, #71)
- The site is repositioned for independent health practices; the PR's review removed a BAA promise with no template behind it, corrected the accessibility-law paragraph, and added guards so a service URL rename or a stale post link fails a test (2026-09-14, #75)
- The readability scorer counted a bulleted list as one sentence, so a list-heavy service page read FK 25.4 against paragraphs near grade 11; each list item now ends a sentence on both scoring paths, and the side effect it caused on the localized homepages' city list (/es/ 46 → 58) was found and excluded (2026-09-14, #75)
- The PR #75 review's P3 findings are closed and the Checkup's URL no longer says "business advice" (2026-09-15, #76)
- The homepage leads with growth: H1 "More new patients, and a front office that runs without you", title "Pasadena Works — More Patients for Medical & Dental Practices". The "Worth more when you step back" section was removed along with its parity test — nothing on the site markets selling a practice (2026-09-15, #77) (partly superseded 2026-09-21: the positioning spec reverses this, and the About page mentions advising a doctor considering a sale, and the Transition Planning service (2026-09-22))
- The city pages are rebuilt for practices: ten cities (San Gabriel is new) in all four languages, resting on CMS NPI Registry, California HCAI and Census ACS figures instead of the old street-and-landmark copy, with the hub and blog descriptions re-aimed to match. The five translated city URLs that were already published still build, and `src/data/city-pages.test.ts` is the append-only guard that keeps them building (2026-09-15)
- An About page exists in four languages — first name only, paid by the practice and nobody else (2026-09-21)
- Transition Planning is a fourth service in four languages, preparation only until the attorney answers todos/046 (e) (2026-09-22)
