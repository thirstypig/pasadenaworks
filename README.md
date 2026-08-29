# Pasadena Works

Marketing site for a small-business consultancy in Pasadena, CA. Built with
[Astro](https://astro.build), deployed free on GitHub Pages.

**What to publish into it:** see [CONTENT-PLAN.md](./CONTENT-PLAN.md) — a
90-day article schedule with target keywords and the reasoning behind the order.

**Working on this with Claude Code:** [CLAUDE.md](./CLAUDE.md) holds the project
conventions, hard rules, and the bugs already found and fixed. Claude Code reads
it automatically — you don't need to paste it in.

**Four languages.** English at the root, Spanish and both Chinese variants on
prefixed paths. Every page gets proper `hreflang` tags, so Google indexes each
language separately instead of treating them as duplicates.

---

## If you're forking this for your own business

Everything below lives in **`src/data/site.ts`** unless noted. This site's own
copy of these is already filled in for real — treat this section as what to
change if you're using this repo as a starting point for a different business.

| What | Where | Why it matters |
|---|---|---|
| **Contact form endpoint** | `site.ts` → `formEndpoint` | The form won't work until this is a real endpoint, not `REPLACE_ME`. See below. |
| **Email and phone** | `site.ts` → `email`, `phone`, `phoneDisplay` | |
| **Service area cities** | `site.ts` → `serviceArea` | Drives the homepage list and your local search schema. |
| **Service copy** | `src/data/services.ts` | All four services, all four languages, in one file. |
| **City pages** | `src/data/cities.ts` | Nine city landing pages. Read the warning at the top before adding more. |
| **Homepage copy** | `src/pages/index.astro` (English), `src/data/home.ts` (other languages) | |

### Setting up the contact form

GitHub Pages serves static files — it has no server, so it can't receive form
submissions on its own. You need a third-party endpoint:

1. Sign up at [formspree.io](https://formspree.io) (free tier handles 50
   submissions/month).
2. Create a form, copy the endpoint URL.
3. Paste it into `formEndpoint` in `src/data/site.ts`.

[Web3Forms](https://web3forms.com) and [Tally](https://tally.so) work the same
way if you prefer them. The form already includes a honeypot field to catch
bots and a hidden `_locale` field so you can see which language version each
lead came from.

**This site also forwards leads into a CRM.** `site.ts` → `crmWebhookUrl`
points at a self-hosted [n8n](https://n8n.io) workflow (not Formspree or
Zapier — both paywall webhooks on their free tiers) that creates a Person
record in a self-hosted Twenty CRM instance via its REST API. This is
optional — leave `crmWebhookUrl` blank and the form still works, emailing you
via Formspree either way. See `CLAUDE.md`'s "Resolved" section for how this
is wired up if you want to replicate it.

---

## Running it locally

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install     # once
npm run dev     # start the dev server at localhost:3180
npm run build   # build the production site into dist/
npm run preview # look at the built site before deploying
npm run test    # run the unit test suite (vitest)
```

The dev server reloads as you save. Leave it running while you edit.

There's a small unit test suite (44 tests) covering the parts of this site
that are easy to get subtly wrong without noticing: `hreflang`/locale-routing
logic, city/service slug lookups, blog reading-time math, the blog i18n
path/label helpers (translated `/blog/` segment per locale, localized date
formatting, reading-time and byline strings), and the Tina admin's filename
helper. Run `npm run test` before pushing a change to any of `src/i18n/`,
`src/data/`, `src/utils/`, or `tina/`.

---

## Deploying to GitHub Pages

**One-time setup:**

1. Create a repo on GitHub and push this code to the `main` branch.
2. In the repo, go to **Settings → Pages**.
3. Under "Build and deployment", set **Source** to **GitHub Actions**.

That's it. `.github/workflows/deploy.yml` handles the rest — every push to
`main` rebuilds and republishes the site automatically. No manual uploads.

### Pointing pasadenaworks.com at it

At your domain registrar, create these records:

**For the apex domain** (`pasadenaworks.com`) — four `A` records:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**For `www`** — one `CNAME` record pointing to `YOUR-USERNAME.github.io`

Then in **Settings → Pages → Custom domain**, enter `pasadenaworks.com` and
tick **Enforce HTTPS**. DNS can take up to 24 hours to propagate; the HTTPS
checkbox may be greyed out until it does.

`public/CNAME` already contains the domain, so don't delete that file.

---

## Editing the blog from a browser (Tina CMS)

You don't have to hand-write the markdown files. Run:

```bash
npm run admin
```

and open **http://localhost:3180/admin/index.html** — a real browser-based
editor for every blog post, all the fields, a rich-text body editor. Saving
writes straight to the `.md` files in `src/content/blog/<locale>/`, same as
editing them by hand — commit and push the result the normal way.

This runs in **local mode**: it needs your laptop running `npm run admin`,
no account, no signup, nothing external. If you ever want to edit from a
browser without your laptop running (e.g. a phone, or handing editing to
someone else), that needs [Tina Cloud](https://tina.io) — sign up, connect
this GitHub repo, and set `clientId`/`token` in `tina/config.ts`. Not set up
yet; local mode covers everything today.

`tina/config.ts` is the schema Tina edits against — it's a hand-maintained
mirror of the real schema in `src/content.config.ts`. If you add a field to
one, add it to the other.

---

## Writing a blog post

Create a `.md` file in `src/content/blog/en/`. **The filename becomes the URL**,
so `why-my-website-is-slow.md` publishes at `/blog/why-my-website-is-slow/`.

Use hyphens, lowercase, and real keywords — this is a small SEO decision you
make every time you write.

```markdown
---
title: "Why your website is slow, in plain English"
description: "A short explanation of what makes small business websites slow and the three fixes that matter most. Aim for 150-158 characters here."
pubDate: 2026-09-01
pillar: websites
targetKeyword: "why is my website slow"
draft: false
locale: en
translationKey: why-website-is-slow
slug: why-my-website-is-slow
---

Your first paragraph. Write normally — headings with ##, **bold**, lists.
```

**Field notes:**

- `pillar` — must be one of `websites`, `search`, `consulting`, `ads`. This
  decides which service gets promoted at the bottom of the post. The build
  fails if you typo it, which is deliberate.
- `description` — this is your Google search result snippet. Write it for a
  human deciding whether to click.
- `targetKeyword` — one search phrase per article. It doesn't appear on the
  page; it's a note to yourself so you don't accidentally write three articles
  competing for the same term.
- `draft: true` — hides the post from the site, the sitemap, and the RSS feed.
- `locale` — which of the four languages this file is written in.
- `translationKey` — shared across every language's version of "the same"
  post, so the build can find sibling translations for `hreflang` tags. Pick
  a short, stable id (e.g. `why-website-is-slow`) — it never appears in a URL.
- `slug` — the real URL slug, **in this language**. Not a translation of the
  English filename — pick the keyword a speaker of that language would
  actually search.

### Translating a post

Not required — most posts can stay English-only, and that's fine. To
translate one, create a new file under the matching locale folder
(`src/content/blog/es/`, `zh-hans/`, or `zh-hant/`) with the **same
`translationKey`** as the original, its own researched `targetKeyword` and
`slug` for that language (see `CONTENT-PLAN.md`'s "Translating an article"
section for which posts are worth the effort), and a full translation of the
body in the site's voice — not a literal, word-for-word one. The build finds
the sibling automatically and generates correct `hreflang` tags; you don't
need to touch any routing code.

---

## City landing pages

Nine cities live in `src/data/cities.ts` and publish to `/websites/<city>/`,
with a hub at `/websites/`. Los Angeles is deliberately not one of them — it's
too broad to write a specific, honest page about, so it stays a general
mention (footer, schema `areaServed`) rather than a landing page.

**The rule for this file is in the file itself, and it matters:** near-identical
pages with the city name swapped out are the classic doorway-page pattern.
Google indexes them and ranks none of them. Every city here names real streets
and real commercial districts, and if you can't do that for a new city, don't
add it. Six honest pages beat twenty thin ones.

Cities carry translations only where the language is genuinely how local
customers search — Alhambra has all four, Arcadia has English and Traditional
Chinese, Glendale is English-only. The `hreflang` tags follow that automatically,
so an English-only city correctly claims no alternates at all.

## Adding a service or a language

**A new service:** add an entry to the `services` array in
`src/data/services.ts`. You need a slug and full copy for all four languages.
Every page that lists services picks it up automatically — nothing else to edit.

**A new language:** add it to `LOCALES` in `src/i18n/ui.ts`, add its UI strings
in the same file, add URL segments in `src/i18n/routes.ts`, then add its copy to
`services.ts` and `home.ts`. TypeScript will point at every spot you missed.

---

## How the multilingual URLs work

```
/                              /es/                    English root, others prefixed
/services/                     /es/servicios/          the path segment is translated
/services/websites/            /es/sitios-web/  ...    so is the service slug
/websites/                     /es/sitios-web/         city landing page hub
/websites/pasadena/            /es/sitios-web/alhambra/
/blog/                         /es/blog/               blog index — "blog" is
                                                        kept as-is for Spanish
                                                        (a naturalized
                                                        loanword); Chinese
                                                        uses /boke/ (博客)
/blog/<slug>/                  /es/blog/<slug-es>/     one post — only where a
                                                        translation exists;
                                                        most posts stay
                                                        English-only
```

Translated slugs are deliberate: a Spanish speaker searches "sitios web," not
"websites." Those are different keywords and they need different URLs to rank.

The `hreflang` tags are generated from `src/i18n/routes.ts`, so if you change a
slug the alternates update with it. Pages that exist in only one language emit
no alternates at all — claiming a translation that doesn't exist is worse for
SEO than claiming none.

---

## What's already handled

Sitemap with language annotations · RSS feed at `/rss.xml` · `robots.txt` ·
canonical URLs · Open Graph tags with a real share image (`/og.png`) ·
`LocalBusiness` structured data on the homepage · 404 page · skip-to-content
link · visible keyboard focus · `prefers-reduced-motion` respected ·
responsive to 380px · Privacy Policy and Terms of Service pages (`/privacy/`,
`/terms/`, linked from the footer) · a plain-English SEO/GEO glossary at
`/glossary/` · self-hosted fonts (no Google Fonts CDN round trip) · a
password-protected internal ops dashboard linking every backend service
(deployed separately, not part of this repo — see `CLAUDE.md`).

## Worth doing next

- **Real photographs.** The single highest-impact addition. Stock imagery will
  undercut the "we're not like other agencies" positioning faster than anything
  else on the site.
- **Google Search Console.** Verify the domain and submit
  `https://pasadenaworks.com/sitemap-index.xml`. This is how you find out which
  queries you're actually appearing for.
- **Translate the remaining blog posts.** The mechanism exists (see
  "Writing a blog post" below) — only one of three posts has a Spanish
  version so far, and none have Chinese versions yet.
---

## Structure

```
src/
├── data/
│   ├── site.ts         ← settings: email, phone, form endpoint, cities
│   ├── services.ts     ← all service copy, all four languages
│   ├── cities.ts       ← city landing page copy
│   └── home.ts         ← homepage copy for es / zh-hans / zh-hant
├── i18n/
│   ├── ui.ts           ← locale registry + UI strings (nav, buttons, forms)
│   ├── routes.ts       ← translated URL segments + hreflang builders
│   └── utils.ts        ← t() and path helpers
├── content/blog/       ← your articles, one .md file per language (en/es/zh-hans/zh-hant)
├── components/         ← Header, Footer, ContactForm, LangSwitch, Lattice
├── layouts/            ← Base (all SEO tags live here), Post
├── pages/
│   ├── index.astro     ← English homepage
│   ├── [locale]/       ← generates es, zh-hans, zh-hant
│   └── services/       ← English service pages
└── styles/global.css   ← design tokens: colors, type scale, spacing
```

**Design notes.** The palette comes from a 1920s–50s Southern California
citrus-crate-label look, built around the owner's real logo — deep rose,
citrus-crate gold, dusty blush. The lattice motif in the hero and section
dividers is a beaded pearl-rule, the border language of a vintage label. To
change the look, edit the custom properties at the top of `global.css`;
every color and size on the site derives from them.
