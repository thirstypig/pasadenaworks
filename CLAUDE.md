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
  dependencies are still exactly three (astro, @astrojs/sitemap, @astrojs/rss).
  `tinacms` and `@tinacms/cli` are devDependencies for the local `/admin`
  editor only — real but deliberate exception, not the site itself.

## Commands

```bash
npm install          # once
npm run dev          # dev server at localhost:4321
npm run build        # production build into dist/ — RUN THIS BEFORE FINISHING
npm run preview      # serve the built site
npm run admin        # dev server + Tina CMS admin at localhost:4321/admin/index.html
npm run test         # unit tests (vitest) — i18n/hreflang, reading time, city/service lookups
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
├── content/blog/     ← articles, one .md file each, English only
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
cannot add `[locale]/[cityhub]/[city].astro` — it collides. That file branches
on a `kind` prop (`'service' | 'city'`) instead. Follow that pattern for any new
localized section.

**CJK underlines need a lower baseline.** Chinese glyphs fill the em box and
have no descenders, so the ochre hero underline cuts through them. There's a
`:global(html[lang^='zh'])` override in `[locale]/index.astro`.

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

- Blog i18n mechanism is built (2026-08-26/27) — content collection has
  `locale`/`translationKey`/`slug` fields, `/[locale]/[section]/` and
  `/[locale]/[section]/[service]` reuse the existing service/city routing
  (folded in as a third `kind`, not a separate `[locale]/blog/` — that
  would collide with the dynamic `[section]` segment at the same depth).
  Files live under `src/content/blog/<locale>/`. `SEGMENTS.blog` gives
  the translated `/blog/` segment itself (`boke` for both Chinese
  variants, matching the `fuwu` pattern). Actual translated content
  doesn't exist yet — only the 3 English posts, now with the new
  frontmatter fields. Translating them needs real per-language keyword
  research for the title/slug (see `RESEARCHED` marker precedent in
  cities.ts), not literal translation.
- Tina CMS admin (`npm run admin`) runs in local mode only — no account, no
  signup, but requires your laptop running to edit. Tina Cloud (tina.io) is
  the next step if you want browser-based editing without that. Tina's own
  dependencies (`tinacms`/`@tinacms/cli`) still carry moderate `npm audit`
  findings (react-router) — dev-only tooling, never shipped to the live site,
  and fixing it needs a breaking Tina version bump.
- No scheduling link in the site's nav/footer/service pages yet, even
  though the booking page itself is done: `schedule.pasadenaworks.com`
  (Cal.com, self-hosted on Railway) has a real event — "Free 30-min
  consultation" at `/pasadenaworks/consultation`, Cal Video, the two demo
  events hidden (2026-08-26). Cal.com's own admin flagged the account
  password as too weak/no 2FA — that's on the owner to fix, not something
  an agent should touch. Confirmed working: the booking page genuinely
  translates into Spanish and Chinese based on the visitor's browser
  language (verified via `Accept-Language` header — no explicit switcher
  needed since none is needed). Still open: where the link belongs on
  the site.

## Resolved

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
- The six city pages that previously had generic body copy (Pasadena,
  Altadena, South Pasadena, Glendale, Monrovia, San Marino) were
  strengthened with real, sourced facts via web research (2026-08-26) —
  see the `RESEARCHED` marker in `src/data/cities.ts`. Not firsthand
  knowledge, though: still worth the owner's eye to sharpen with anything
  from actually working these cities.
- Fonts (Bevan, Source Serif 4) are self-hosted via `@fontsource` instead
  of loading from the Google Fonts CDN (2026-08-26).
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
