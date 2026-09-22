# About Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an About page in all four languages that says who runs Pasadena Works and how it is paid, linked from the header and footer.

**Architecture:** Copy lives in a new data module, `src/data/about.ts`, keyed by locale. One component, `AboutBody.astro`, renders it for both routes, so the English page and its translations cannot drift apart as the English and localized hubs once did. English is a plain `src/pages/about.astro`. The three translations are a fourth `kind` on the existing dual-purpose route `[locale]/[section]/index.astro`, because Astro cannot hold a second dynamic route at that depth.

**Tech Stack:** Astro 7, TypeScript, vitest.

**Spec:** `docs/superpowers/specs/2026-09-21-positioning-about-transition-design.md` §3, with its sources twin `…-sources.md`.

## Global Constraints

- First name **James** only. No surname, no photo, no industry named, no family or client names — anywhere in the public repo, commits or PR.
- Claims limited to: "8 years in product"; rebuilt practice websites; EHR workflow consulting; paid by the practice only; no vendor commissions; no broker fees. **Do not claim the owner speaks Spanish or Chinese** — not established.
- Four locales; translated URL segments (hard rule 3): `about`, `sobre-nosotros`, `guanyu-women`, `guanyu-women`.
- `translations` on `Base` comes from `aboutPaths()` — a correct four-locale map because the page genuinely exists in all four (hard rule 1).
- Readability bands met **by hand** on the built page: en FK 13–15, es Fernández Huerta 40–55, zh register 0.55–0.85. Never edit prose with a regex to move a score.
- Voice: plain-spoken, no "leverage/solutions/empower". American English.
- Stage explicit paths only (`git add <path>`), never `-A`; read `git show --stat HEAD` after each commit.
- Before the PR: `npm run build`, `npm run test`, `npm run typecheck`, and look at the rendered page at desktop and 375px width.

---

### Task 1: About copy and URL segment

**Files:**
- Create: `src/data/about.ts`
- Modify: `src/i18n/routes.ts` (add `about` to `SEGMENTS` and export `aboutPaths`)
- Test: `src/data/about.test.ts`

**Interfaces:**
- Produces: `interface AboutCopy { title: string; meta: string; heading: string; sections: { heading: string; body: string[] }[] }`, `export const about: Record<Locale, AboutCopy>`, `SEGMENTS.about: Record<Locale, string>`, `aboutPaths(): Record<Locale, string>`.

- [ ] **Step 0: Branch** — `git switch main && git pull && git switch -c feat/about-page`

- [ ] **Step 1: Write the failing test** — `src/data/about.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { about } from './about';
import { LOCALES } from '../i18n/ui';
import { SEGMENTS, aboutPaths } from '../i18n/routes';

/** The one fact each locale must carry, spelled the way that locale spells it.
 *  A translation that drops the number, or the name, fails here rather than
 *  in front of a reader. */
const EIGHT = { en: 'eight', es: 'ocho', 'zh-hans': '八', 'zh-hant': '八' } as const;

describe('about copy', () => {
  it('exists in every locale with three non-empty sections', () => {
    for (const locale of LOCALES) {
      const copy = about[locale];
      expect(copy.sections, locale).toHaveLength(3);
      for (const s of copy.sections) expect(s.body.join('').length, `${locale}: ${s.heading}`).toBeGreaterThan(0);
    }
  });

  it('names James and the eight years in every locale', () => {
    for (const locale of LOCALES) {
      const text = about[locale].sections.flatMap((s) => s.body).join(' ');
      expect(text, locale).toContain('James');
      expect(text, locale).toContain(EIGHT[locale]);
    }
  });

  it('keeps every meta description within 155 characters', () => {
    for (const locale of LOCALES) expect(about[locale].meta.length, locale).toBeLessThanOrEqual(155);
  });
});

describe('SEGMENTS.about', () => {
  it('is pinned, because changing it moves a published URL', () => {
    expect(SEGMENTS.about).toEqual({
      en: 'about',
      es: 'sobre-nosotros',
      'zh-hans': 'guanyu-women',
      'zh-hant': 'guanyu-women',
    });
  });

  it('builds one path per locale', () => {
    expect(aboutPaths()).toEqual({
      en: '/about/',
      es: '/es/sobre-nosotros/',
      'zh-hans': '/zh-hans/guanyu-women/',
      'zh-hant': '/zh-hant/guanyu-women/',
    });
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run src/data/about.test.ts`
Expected: FAIL — `Cannot find module './about'`.

- [ ] **Step 3: Add the segment** — in `src/i18n/routes.ts`, extend the `SEGMENTS` type annotation with `about: Record<Locale, string>;` and add after `blog`:

```ts
  /** The About page, per locale. 关于我们/關於我們 is the standard label in
   *  both scripts, so the romanization is shared, as `fuwu` is. */
  about: {
    en: 'about',
    es: 'sobre-nosotros',
    'zh-hans': 'guanyu-women',
    'zh-hant': 'guanyu-women',
  },
```

and after `blogIndexPaths`:

```ts
export const aboutPaths = (): Record<Locale, string> => indexPaths(SEGMENTS.about);
```

Update the `indexPaths` doc comment's "three index pages" to "four pages" and add the About page to its list.

- [ ] **Step 4: Write the English copy** — `src/data/about.ts`

```ts
import type { Locale } from '../i18n/ui';

/*
 * The About page, all four locales. Claims are limited to what the owner
 * stated on 2026-09-21 and recorded in
 * docs/superpowers/specs/2026-09-21-positioning-about-transition-sources.md:
 * first name James, eight years in product, rebuilt practice websites, EHR
 * workflow consulting. Add a claim there before adding it here. Never add a
 * surname, a family member or a client name — this repo is public.
 */

export interface AboutCopy {
  /** <title>. */
  title: string;
  /** Meta description, 155 characters at most. Not scored for readability. */
  meta: string;
  /** The page's <h1>. */
  heading: string;
  /** Exactly three: who, what we have done, how we are paid. */
  sections: { heading: string; body: string[] }[];
}

export const about: Record<Locale, AboutCopy> = {
  en: {
    title: 'About Pasadena Works — Paid by the Practice and Nobody Else',
    meta: 'Pasadena Works is run by James, who has spent eight years in product management. We are paid by the practice and nobody else.',
    heading: 'Paid by the practice, and nobody else',
    sections: [
      {
        heading: 'Who you would be working with',
        body: [
          'Pasadena Works is run by James, who has spent eight years in product management, which is the work of deciding what a piece of software should do, for whom, and why, before anyone builds it. That habit is the whole method here. Before we recommend a tool, we watch how your front desk actually handles a new patient, a refill request, or a rescheduled appointment, because a system that fits the way your staff already works will be used, whereas one chosen from a vendor’s demonstration usually ends up running alongside the paper it was bought to replace.',
        ],
      },
      {
        heading: 'What we have done inside practices',
        body: [
          'The work so far has been of two kinds. We have rebuilt practice websites so that a patient can find the hours, the accepted insurance, and the way to book an appointment without having to call, and we have consulted on EHR workflows, which means mapping who enters what, and at which step, before the practice commits to configuring a system around it. We describe that work in general terms because we do not name a client without its written permission.',
        ],
      },
      {
        heading: 'How we are paid',
        body: [
          'We are paid by the practice and by nobody else. Because we take no commission from software vendors, we have no reason to recommend one EHR over another except that it suits your office; because we take no fee from practice brokers, our advice to a doctor who is considering a sale does not depend on whether the sale happens. When something you are considering is not worth the money, we will say so, even when the thing in question is our own work.',
        ],
      },
    ],
  },
  // es, zh-hans, zh-hant: written in Step 5.
};
```

- [ ] **Step 5: Write the three translations** into the same object, following the house method (memory `project_blog_translation_method`, and CLAUDE.md "Register"):
  - Research phrasing, not facts: every fact is the English one. "EHR" is "expediente clínico electrónico (EHR)" in Spanish and 电子病历系统 / 電子病歷系統 in Chinese; zh-hant uses Taiwan vocabulary (病患, 軟體, 預約).
  - Keep `James` in Latin script in all three. "Eight years" is `ocho años` / `八年`.
  - Chinese register: 書面語 markers (因此, 然而, 並非), no 吧/呢/啊/嘛; sentences under the 220-character ceiling.
  - Re-read every negation against the English — "no commission", "no fee", "does not depend", "not worth the money" — a reversed one is the defect `blog-content.test.ts` cannot see.
  - `meta` ≤155 characters in every locale.

- [ ] **Step 6: Run the test and typecheck**

Run: `npx vitest run src/data/about.test.ts src/i18n/routes.test.ts && npm run typecheck`
Expected: PASS, 0 type errors.

- [ ] **Step 7: Commit**

```bash
git add src/data/about.ts src/data/about.test.ts src/i18n/routes.ts
git commit -m "Add the About page copy in four languages and its URL segment"
git show --stat HEAD
```

---

### Task 2: The page, in four locales

**Files:**
- Create: `src/components/AboutBody.astro`, `src/pages/about.astro`
- Modify: `src/pages/[locale]/[section]/index.astro` (fourth `kind`)
- Test: `src/data/about-built.test.ts`

**Interfaces:**
- Consumes: `about`, `aboutPaths()`, `SEGMENTS.about` from Task 1; `strings.nav.bookCall`, `site.bookingUrl` (existing).
- Produces: built pages at the four paths in `aboutPaths()`.

- [ ] **Step 1: Write the failing built-page test** — `src/data/about-built.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIST } from '../utils/built-pages';
import { aboutPaths } from '../i18n/routes';
import { about } from './about';

/** Same rule as city-pages.test.ts: only <link rel="alternate"> WITH hreflang
 *  counts — the language switcher's anchors and the RSS link would both
 *  otherwise be counted. */
function alternates(html: string): string[] {
  return [...html.matchAll(/<link\b[^>]*\brel="alternate"[^>]*>/g)]
    .map((m) => /\bhreflang="([^"]+)"/.exec(m[0])?.[1])
    .filter((lang): lang is string => Boolean(lang));
}

const fileFor = (path: string) => join(DIST, path.replace(/^\//, ''), 'index.html');

describe.skipIf(!existsSync(DIST))('built About pages', () => {
  it('exist in all four locales with their own heading', () => {
    for (const [locale, path] of Object.entries(aboutPaths())) {
      expect(existsSync(fileFor(path)), path).toBe(true);
      const html = readFileSync(fileFor(path), 'utf-8');
      expect(html, path).toContain(about[locale as keyof typeof about].heading);
    }
  });

  it('claim all four translations plus x-default, and nothing else', () => {
    for (const path of Object.values(aboutPaths())) {
      const alts = alternates(readFileSync(fileFor(path), 'utf-8'));
      expect(alts, path).toHaveLength(5);
      expect(alts, path).toContain('x-default');
    }
  });
});
```

- [ ] **Step 2: Build and confirm it fails**

Run: `npm run build && npx vitest run src/data/about-built.test.ts`
Expected: FAIL — `/about/` does not exist.

- [ ] **Step 3: Create the shared body** — `src/components/AboutBody.astro`

```astro
---
/** The About page body, shared by the English route and the localized one so
 *  the two cannot drift apart — the fate of every page this site ever kept as
 *  two copies (see routes.ts on indexPaths). The button is `.btn`, which the
 *  readability scorer already strips as furniture. */
import type { Locale } from '../i18n/ui';
import { about } from '../data/about';
import { t } from '../i18n/utils';
import { site } from '../data/site';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const copy = about[locale];
const strings = t(locale);
---

<section class="section wrap">
  <h1>{copy.heading}</h1>
  {copy.sections.map((s) => (
    <>
      <h2>{s.heading}</h2>
      {s.body.map((p) => <p class="prose">{p}</p>)}
    </>
  ))}
  <p>
    <a class="btn" href={site.bookingUrl} target="_blank" rel="noopener">{strings.nav.bookCall} &rsaquo;</a>
  </p>
</section>
```

- [ ] **Step 4: Create the English route** — `src/pages/about.astro`

```astro
---
import Base from '../layouts/Base.astro';
import AboutBody from '../components/AboutBody.astro';
import { about } from '../data/about';
import { aboutPaths } from '../i18n/routes';

const paths = aboutPaths();
---

<Base title={about.en.title} description={about.en.meta} locale="en" path={paths.en} translations={paths}>
  <AboutBody locale="en" />
</Base>
```

- [ ] **Step 5: Add the fourth `kind`** — in `src/pages/[locale]/[section]/index.astro`:

  1. Imports: add `aboutPaths` to the `routes` import; `import AboutBody from '../../../components/AboutBody.astro';` and `import { about } from '../../../data/about';`.
  2. `HubProps`: add `| { kind: 'about'; locale: Locale }`, and change the doc comment's "three hub kinds" to "four".
  3. `getStaticPaths`, inside the loop after the blog push:

     ```ts
     paths.push({
       params: { locale, section: SEGMENTS.about[locale] },
       props: { kind: 'about', locale },
     });
     ```

  4. The guard: `if (kind !== 'blog' && kind !== 'service' && kind !== 'city-hub' && kind !== 'about')`.
  5. **Grep every `kind ===` in the file first** (CLAUDE.md gotcha). Insert a branch before the final bare `: (` city-hub branch:

     ```astro
     ) : kind === 'about' ? (
       <Base
         title={about[locale].title}
         description={about[locale].meta}
         locale={locale}
         path={aboutPaths()[locale]}
         translations={aboutPaths()}
       >
         <AboutBody locale={locale} />
       </Base>
     ```

  6. Update the file's top comment from "Triple-purpose" to name all four.

- [ ] **Step 6: Build, test, typecheck**

Run: `npm run build && npx vitest run src/data/about-built.test.ts && npm run typecheck`
Expected: PASS; build log contains no `[glob-loader]` duplicate-slug warning and no `'global' is not recognized`.

- [ ] **Step 7: Commit**

```bash
git add src/components/AboutBody.astro src/pages/about.astro "src/pages/[locale]/[section]/index.astro" src/data/about-built.test.ts
git commit -m "Build the About page in four languages from one shared body"
git show --stat HEAD
```

---

### Task 3: Header and footer links

**Files:**
- Modify: `src/i18n/ui.ts` (`nav.about` in the interface and all four locales), `src/components/Header.astro`, `src/components/Footer.astro`
- Test: `src/i18n/rendered-links.test.ts`

**Interfaces:**
- Consumes: `SEGMENTS.about` (Task 1), the built pages (Task 2).
- Produces: `strings.nav.about`.

- [ ] **Step 1: Write the failing test** — append inside the existing `describe.skipIf(...)` block in `src/i18n/rendered-links.test.ts`:

```ts
  it('links every locale to its own About page from the header and footer', () => {
    // Positively stated, for the same reason as the blog check above: it must
    // reach THIS locale's page, not merely avoid English. English is checked
    // too — it is the one locale the check above skips.
    const missing: string[] = [];
    for (const locale of LOCALES) {
      const home = locale === 'en' ? 'index.html' : `${locale}/index.html`;
      const html = readFileSync(join(DIST, home), 'utf-8');
      const expected = locale === 'en' ? `/${SEGMENTS.about.en}/` : `/${locale}/${SEGMENTS.about[locale]}/`;
      const header = html.match(/<header[\s\S]*?<\/header>/)?.[0] ?? '';
      const footer = html.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? '';
      if (!header.includes(`href="${expected}"`)) missing.push(`${locale} header: ${expected}`);
      if (!footer.includes(`href="${expected}"`)) missing.push(`${locale} footer: ${expected}`);
    }
    expect(missing).toEqual([]);
  });
```

- [ ] **Step 2: Build and confirm it fails**

Run: `npm run build && npx vitest run src/i18n/rendered-links.test.ts`
Expected: FAIL listing eight missing links.

- [ ] **Step 3: Add the label** — `src/i18n/ui.ts`: add `about: string;` to `UIStrings.nav` after `blog`, and the values `about: 'About'` (en), `about: 'Nosotros'` (es), `about: '关于我们'` (zh-hans), `about: '關於我們'` (zh-hant).

- [ ] **Step 4: Link it** — in both `Header.astro` and `Footer.astro`, add after the `SEGMENTS` import usage:

```ts
const aboutHref = localeUrl(locale, SEGMENTS.about[locale]);
```

and after the blog link in each nav:

```astro
<a href={aboutHref}>{strings.nav.about}</a>
```

(`Footer.astro` already imports `SEGMENTS` and `localeUrl`; confirm `Header.astro` does — it does at line 3.)

- [ ] **Step 5: Build, test, and look at it**

Run: `npm run build && npm run test && npm run typecheck`
Expected: all pass. Then `npm run preview:status` (stop a stale one with `npm run preview:stop`), `npm run preview`, and look at `/`, `/about/`, `/zh-hant/guanyu-women/` at desktop width **and at 375px**: the header now carries five links — confirm it wraps cleanly and does not overflow sideways. If it overflows, stop and report rather than restyling the header inside this task.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/ui.ts src/components/Header.astro src/components/Footer.astro src/i18n/rendered-links.test.ts
git commit -m "Link the About page from the header and footer in every locale"
git show --stat HEAD
```

---

### Task 4: Reading level, docs, PR

**Files:**
- Modify: `src/data/about.ts` (only if a locale is out of band), `CLAUDE.md` (Where things live; test count), `docs/RESOLVED.md` / CLAUDE.md Resolved list (one line)

- [ ] **Step 1: Score the built pages**

Run: `npm run build && npm run readability -- --dist 2>&1 | grep -E "about|sobre-nosotros|guanyu-women|in band"`
Expected: the four About pages are **not** listed as out of band. If one is, fix that locale's prose by hand — join sentences with real subordination or choose more precise words, measure again — then re-run `npx vitest run src/data/about.test.ts`.

- [ ] **Step 2: Confirm the hreflang rule by hand**

Run: `grep -o 'hreflang="[^"]*" href="[^"]*"' dist/about/index.html`
Expected: four locales plus `x-default`.

- [ ] **Step 3: Update docs** — in CLAUDE.md "Where things live" add `about.ts ← About page copy, all four languages` under `src/data/`; update the `npm run test` count to what CI will report (run `npm run test` and copy the totals, noting the built-page skips); add one Resolved line: "An About page exists in four languages — first name only, paid by the practice and nobody else (2026-09-21)" and its RESOLVED.md entry.

- [ ] **Step 4: Commit, push, PR**

```bash
git add CLAUDE.md docs/RESOLVED.md src/data/about.ts
git commit -m "Record the About page in the project docs"
git show --stat HEAD
git push -u origin feat/about-page
gh pr create --title "Add an About page in four languages" --body-file <path to a body written in the scratchpad: what the page says in plain language, the four URLs, what was checked by eye at desktop and 375px, and the test totals — ending with the Claude Code attribution line>
```

Merging is the owner's call.
