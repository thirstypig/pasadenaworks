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
npm run dev          # dev server at localhost:4321
npm run build        # production build into dist/ — RUN THIS BEFORE FINISHING
npm run preview      # serve the built site
npm run admin        # dev server + Tina CMS admin at localhost:4321/admin/index.html
npm run test         # unit tests (vitest, 37) — i18n/hreflang, reading time, city/service lookups, blog i18n helpers
```

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

## Design system

Palette derives from Craftsman architecture — Greene & Greene pine green,
stained-glass ochre, pale sage. The lattice motif is the cloud-lift pattern from
Pasadena Craftsman joinery.

All colors, type scale, and spacing are custom properties at the top of
`src/styles/global.css`. **Derive from the tokens; don't hardcode hex values or
pixel sizes in component styles.**

Type pairs a bold slab-serif display face (Bevan) with a serif body (Source
Serif 4) — both self-hosted via `@fontsource`, imported in `Base.astro`. The
serif body is better for the long-form blog reading the SEO strategy depends
on. Don't "fix" this.

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
- `public/og.png` (1200×630) exists — a Craftsman-styled share image
  matching the hero (headline, logo frame, ochre lattice divider),
  rendered via a one-off HTML template and screenshot rather than a
  design tool. The `<meta property="og:image">` tag in `Base.astro` was
  already wired up before this; it just had no file to point at.
