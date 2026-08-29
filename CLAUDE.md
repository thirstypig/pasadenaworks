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
  and `@fontsource/bevan` + `@fontsource/source-serif-4` (added 2026-08-26 to
  self-host the two fonts instead of loading them from the Google Fonts CDN).
  `tinacms` and `@tinacms/cli` are devDependencies for the local `/admin`
  editor only — real but deliberate exception, not the site itself.

## Commands

```bash
npm install          # once
npm run dev          # dev server at localhost:3180 (see cross-project port registry below)
npm run build        # production build into dist/ — RUN THIS BEFORE FINISHING
npm run preview      # serve the built site, also on localhost:3180
npm run admin        # dev server + Tina CMS admin at localhost:3180/admin/index.html
npm run test         # unit tests (vitest, 44) — i18n/hreflang, reading time, city/service lookups, blog i18n helpers, Tina config helpers
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

Type still pairs a bold slab-serif display face (Bevan) with a serif body
(Source Serif 4) — both self-hosted via `@fontsource`, imported in
`Base.astro`. Bevan was kept through the rebrand: it already reads as bold
vintage sign-painter/showcard lettering, which pairs fine with the new
logo's blocky "WORKS" lockup without needing a second display font. The
serif body is better for the long-form blog reading the SEO strategy depends
on. Don't "fix" either.

## Content

Blog posts are markdown in `src/content/blog/`. **The filename becomes the URL**,
so write it as a keyword. Frontmatter schema is in `src/content.config.ts` —
`pillar` must be one of `websites`, `search`, `consulting`, `ads`, and the build
fails on a typo, deliberately.

`CONTENT-PLAN.md` has the 90-day article schedule with target keywords. One
keyword per article — two articles competing for the same phrase split their own
traffic.

## Voice

The site's whole positioning is that it doesn't talk down to people. Copy is
plain-spoken, sometimes blunt, never markety. Real examples from the site:

> Holding a client's website hostage is a bad business model and a worse way to
> treat people.

> Anyone promising page one by next Tuesday is selling you something else.

If you write copy, match that. No "leverage," no "solutions," no "empower." Say
the plain thing. Short sentences. Admit when something isn't worth the money.

## Known outstanding work

- `CONTENT-PLAN.md`'s remaining recommended priorities — the multilingual-
  angle pieces (weeks 5–8) and the Google Business Profile guide — haven't
  been written in English yet at all. All three *existing* posts are now
  fully translated (see Resolved), so the next translation work is really
  "write these first," not "translate more of what's already up."
- **Cal.com bookings don't reach Twenty CRM yet.** The contact form already
  dual-submits into CRM (see Resolved), but booking a call via `site.bookingUrl`
  doesn't — it's a separate n8n bridge (duplicate the existing contact-form →
  Twenty workflow, swap in a Cal.com "Booking Created" webhook trigger, remap
  `payload.attendees[0].name`/`email`, `payload.title`, `payload.startTime`).
  Not built yet: no n8n API key exists on the Railway service, so this needs
  either the owner doing it by hand in the n8n UI or sharing the existing
  workflow's exact node config for more specific guidance.
- Tina CMS admin (`npm run admin`) runs in local mode only — no account, no
  signup, but requires your laptop running to edit. Tina Cloud (tina.io) is
  the next step if you want browser-based editing without that.
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

- Blog i18n mechanism is built (2026-08-26/27) — content collection has
  `locale`/`translationKey`/`slug` fields, `/[locale]/[section]/` and
  `/[locale]/[section]/[service]` reuse the existing service/city routing
  (folded in as a third `kind`, not a separate `[locale]/blog/` — that
  would collide with the dynamic `[section]` segment at the same depth).
  Files live under `src/content/blog/<locale>/`. `SEGMENTS.blog` gives
  the translated `/blog/` segment itself (`boke` for both Chinese
  variants, matching the `fuwu` pattern). All three existing English
  posts now have Spanish, Simplified Chinese, and Traditional Chinese
  versions (2026-08-27) — real researched keywords per language, not
  literal translations; zh-hant follows Taiwan Mandarin lexis/register.
  See the `slug`-collision gotcha above if adding more.
- `site.formEndpoint` now points at a real Formspree endpoint, and the
  contact form dual-submits into a self-hosted n8n workflow (Railway) that
  forwards leads into Twenty CRM via its REST API (2026-08-25/26). Zapier
  and Make.com were evaluated first but both paywall webhooks on their free
  tiers.
- Astro upgraded 5 → 7.2.7, resolving the high-severity XSS advisories
  (2026-08-26). No application code changes were needed for the migration.
- `site.phone` is a real Google Voice number, (434) 373-0080 (2026-08-26).
- The homepage's "Where we work" city grid was removed and replaced with a
  three-column footer (Explore nav links + locale-aware city links) that
  appears sitewide instead of only on the English homepage (2026-08-26).
- All nine city pages that previously had generic body copy now carry real,
  sourced facts via web research: six on 2026-08-26 (Pasadena, Altadena,
  South Pasadena, Glendale, Monrovia, San Marino), and the last three —
  Alhambra, Arcadia, Monterey Park — on 2026-08-27. See the `RESEARCHED`
  marker in `src/data/cities.ts`; no `TODO` markers remain. Not firsthand
  knowledge, though: still worth the owner's eye to sharpen with anything
  from actually working these cities.
- Fonts (Bevan, Source Serif 4) are self-hosted via `@fontsource` instead
  of loading from the Google Fonts CDN (2026-08-26).
- `tina/config.ts`'s schema now matches `src/content.config.ts` — added the
  `locale`/`translationKey`/`slug` fields the blog i18n work introduced, and
  the `filename.slugify` function now reads the post's `locale` field to
  place new posts in the right `src/content/blog/<locale>/` subfolder
  automatically (2026-08-27). Verified by loading `npm run admin` and
  confirming Tina indexes all four existing posts (including the Spanish
  one) with no schema errors.
- A "Book a call" link (`site.bookingUrl`, `strings.nav.bookCall`) was added
  to the footer, footer-only per the owner's call (2026-08-26) — it points
  at the real Cal.com public booking page for the free 30-min consultation
  (`schedule.pasadenaworks.com/pasadenaworks/consultation`, self-hosted on
  Railway, Cal Video, demo events hidden). Confirmed via `Accept-Language`
  header tests that the page genuinely translates into Spanish and Chinese
  based on the visitor's browser language — no explicit switcher needed.
  Cal.com's own admin flagged the account password as too weak/no 2FA —
  that's on the owner to fix, not something an agent should touch.
- A private, real-password-protected ops dashboard exists at
  `ops.pasadenaworks.com` — links to every backend service (CRM,
  scheduling, n8n, Railway, GitHub, DNS). It is a separate tiny Node
  service deployed directly to Railway (project `pasadenaworks`, service
  `ops-panel`) and is deliberately NOT part of this repo — its source
  living in a public repo would defeat the password gate. Auth is a real
  server-side Basic Auth check (`server.js`, `crypto.timingSafeEqual`),
  not client-side JS. Credentials are the `OPS_USERNAME`/`OPS_PASSWORD`
  variables on that Railway service — change them there, not here.
- `public/og.png` (1200×630) exists, originally as a Craftsman-styled share
  image matching the pre-rebrand hero. Regenerated 2026-08-28 to match the
  2026-08-27 rebrand: rose background, a label-frame card holding
  `logo-lockup.png`, and the site's real tagline — rendered the same way,
  a one-off HTML template screenshotted via headless Chrome rather than a
  design tool. The `<meta property="og:image">` tag in `Base.astro` needed
  no change either time; it just points at whatever file is there.
- The `registry/` folder (a mirror of the owner's cross-project
  `MASTER-PORTS.md`/`PORTS.md`/`README.md`) was removed 2026-08-28 — it
  exposed other local projects' names, stacks, and ports in this public
  repo for no reason this repo needed. The real port reservation for this
  repo (3180–3189/4180–4189) still lives in the root-level
  `MASTER-PORTS.md`/`PORTS.md`, which are unrelated tracked files, not part
  of what got removed.
- The ops dashboard's "Blog editor (Tina)" card now links to the real
  `pasadenaworks.com/admin/index.html` (2026-08-28) instead of describing
  it as local-only — it's backed by Tina Cloud (see the blog-i18n entry
  above), so it works from any browser once the site is deployed, not
  just from the owner's laptop running `npm run admin`.
- Cal.com's Google Calendar sync is confirmed working end-to-end
  (2026-08-28) — booking a slot that overlaps an existing Google Calendar
  event made that slot disappear from availability, not just theoretically
  wired up.
- The `itemProps` config previously added to the blog collection's `ui`
  in Tina (to show `pubDate` next to the title in the post list) turned out
  to not be a real Tina API at the collection level — it's only read off
  object-field/block-template configs, so it silently did nothing since it
  shipped. Removed 2026-08-28, and `filename.slugify` was extracted into
  `tina/utils.ts` with unit tests along the way (`npx tsc --noEmit` now
  passes clean on `tina/config.ts` for the first time — the dead
  `itemProps` was a real type error that no prior build step had caught,
  since `npx tinacms build` only validates the schema, not every `ui`
  callback).
