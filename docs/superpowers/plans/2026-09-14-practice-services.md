# Practice Services Repositioning — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four general small-business services with a Practice Checkup, *Digitize the office*, and *Get more patients* for independent health practices, in all four languages, without losing any indexed URL.

**Architecture:** `src/data/services.ts` stays the single source of service copy. Two service ids (`search`, `ads`) are retired behind Astro static redirects declared in a plain-ESM module, and the blog's four pillars reach services through a typed `PILLAR_SERVICE` map instead of an id match. One service (`digitize`) is added; the homepages gain a "worth more" section; hub, footer, JSON-LD and the share image are re-aimed at practices.

**Tech Stack:** Astro 7.2.9 (static, GitHub Pages), TypeScript, Vitest, `@astrojs/sitemap`, headless Chrome for `og.png`.

**Spec:** `docs/superpowers/specs/2026-09-14-practice-services-design.md` — the English copy in §3 is authoritative and approved; this plan converts it into code. Read both.

## Global Constraints

- **No new dependencies.** Production dependencies stay exactly `astro`, `@astrojs/sitemap`, `@astrojs/rss`, `@fontsource/anton`, `@fontsource/source-serif-4`.
- **Hard rule 1:** a page emits hreflang only for translations that exist. Every service carries all four locales (`Record<Locale, …>` enforces it).
- **Hard rule 3:** URL segment and slug are both translated. New slugs: `en` `practice-digitization`, `es` `digitalizacion-del-consultorio`, `zh-hans` `zhensuo-shuzihua`, `zh-hant` `zhensuo-shuweihua`.
- **Service ids after this change:** `consulting` (Practice Checkup), `digitize` (Digitize the office), `websites` (Get more patients). Display order is exactly that. `search` and `ads` are retired.
- **Blog pillars do not change:** `websites | search | consulting | ads`. `tina/tina-lock.json` must be byte-identical at the end (`git diff --quiet main -- tina/tina-lock.json`).
- **Register bands (built pages, `npm run readability -- --dist`):** `en` Flesch-Kincaid 13–15 · `es` Fernández Huerta 40–55 · `zh-hans`/`zh-hant` register index 0.55–0.85, and no sentence over 85 characters. Close gaps **by hand, one page at a time, re-measuring after each edit. Never run a regex or sweep over prose.**
- **Copy rules:** no "leverage", "solutions", "empower", "transformation". American spelling. English `meta` 150–158 characters.
- **Glossary links** (`/glossary/#…`) appear in English copy only; the glossary is English-only.
- **Every checkable claim ships with a source link or is cut** (spec §3). Sources are produced by Task 2.
- **Translation method:** phrasing from research, every fact from the English; a translation never asserts more than its English twin. Product and regulatory names come from the vendor's or regulator's own localized pages (verify, don't translate). Re-read every sentence containing "never", "only", "not", "no", or a modal against the English before committing. Use the `writing-taiwan-mandarin-copy` skill before writing any `zh-hant` string.
- **Public repository:** no client or family member is named in code, docs, commits, or the PR.
- **Never `rm -rf` inside the project** — move generated directories to the session scratchpad instead. Never commit `dist/`.
- **Scoped readability check** (used by several tasks; run after `npm run build`). It must run from a FILE: `readability.mjs` calls `isMain()`, which reads `process.argv[1]` and throws under `node -e` (found in Task 3). Save once to `$TMPDIR/scoped-readability.mjs`, with `REPO` replaced by the output of `pwd`:

  ```js
  import { reportDist, TARGETS, sentenceGuard } from 'REPO/scripts/readability.mjs';
  const re = /^\/((es|zh-hans|zh-hant)\/)?((services|servicios|fuwu)\/[^/]+\/)?index\.html$/;
  for (const r of reportDist('REPO/dist').filter((r) => re.test(r.page) && !r.tooShort)) {
    const t = TARGETS[r.locale];
    console.log((r.verdict ?? '-').padEnd(6), String(r[t.metric]).padStart(6), (sentenceGuard(r) ?? '').padEnd(8), r.page);
  }
  ```

  Run: `node "$TMPDIR/scoped-readability.mjs"`

  Expected when a task is done: every row it touched reads `ok` and no row reads `runaway`.
- **Commits** end with:

  ```
  Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01V3F6Xwi4r3Ggp3N5bsedoy
  ```

- **Branch:** `feat/practice-services` (already checked out; the spec is committed on it).

---

### Task 1: Retire `search` and `ads` behind redirects, and map pillars to services

**Files:**
- Create: `src/data/retired-services.mjs`
- Create: `src/data/retired-services.test.ts`
- Modify: `src/data/services.ts` (header comment; `Service.id` type; delete the `search` and `ads` objects; move `consulting` first; add `PILLAR_SERVICE` + `serviceForPillar`)
- Modify: `src/components/EndCta.astro:15`
- Modify: `astro.config.mjs` (add `redirects`)
- Modify: `src/data/services.test.ts`
- Modify: `src/content/blog/en/why-customers-cant-find-your-business-on-google.md:46`, `src/content/blog/es/por-que-mi-negocio-no-aparece-en-google.md:46`, `src/content/blog/zh-hans/guge-zhaobudao-wo-de-dian.md:46`, `src/content/blog/zh-hant/google-zhaobudao-wo-de-dian.md:46` (link targets only)

**Interfaces:**
- Produces: `export type ServiceId = 'consulting' | 'websites'` (Task 4 widens it), `export const PILLAR_SERVICE: Record<Pillar, ServiceId>`, `export function serviceForPillar(pillar: Pillar): Service`, `export const RETIRED_SERVICE_REDIRECTS: Record<string, string>` from `src/data/retired-services.mjs`.

- [ ] **Step 1: Write the failing unit tests**

Append to `src/data/services.test.ts` (and change its import line to the one shown):

```ts
import { services, serviceBySlug, serviceForPillar, PILLAR_SERVICE } from './services';
import { PILLARS } from './pillars';

describe('retired services', () => {
  it('no longer resolves a retired slug in any locale', () => {
    expect(serviceBySlug('en', 'get-found-on-google')).toBeUndefined();
    expect(serviceBySlug('en', 'paid-advertising')).toBeUndefined();
    expect(serviceBySlug('es', 'aparecer-en-google')).toBeUndefined();
    expect(serviceBySlug('es', 'publicidad-pagada')).toBeUndefined();
    expect(serviceBySlug('zh-hans', 'guge-tuiguang')).toBeUndefined();
    expect(serviceBySlug('zh-hant', 'fufei-guanggao')).toBeUndefined();
  });
});

describe('serviceForPillar', () => {
  it('gives every blog pillar a live service', () => {
    for (const pillar of PILLARS) {
      expect(serviceForPillar(pillar).id).toBe(PILLAR_SERVICE[pillar]);
    }
  });

  it('sends the retired pillars to Get more patients, and consulting to the Checkup', () => {
    expect(serviceForPillar('search').id).toBe('websites');
    expect(serviceForPillar('ads').id).toBe('websites');
    expect(serviceForPillar('websites').id).toBe('websites');
    expect(serviceForPillar('consulting').id).toBe('consulting');
  });
});
```

Create `src/data/retired-services.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RETIRED_SERVICE_REDIRECTS } from './retired-services.mjs';
import { services } from './services';
import { SEGMENTS, localeUrl } from '../i18n/routes';
import { LOCALES, type Locale } from '../i18n/ui';

/**
 * The service pages retired on 2026-09-14 were indexed in four languages.
 * GitHub Pages has no server, so each one is an Astro static redirect: an
 * instant meta refresh, `noindex`, and a canonical to the page that absorbed it.
 * The source half runs everywhere; the built half needs dist/ and SKIPS without
 * it, which is why ci.yml re-runs the suite after building.
 */
const RETIRED_SLUGS: Record<Locale, string[]> = {
  en: ['get-found-on-google', 'paid-advertising'],
  es: ['aparecer-en-google', 'publicidad-pagada'],
  'zh-hans': ['guge-tuiguang', 'fufei-guanggao'],
  'zh-hant': ['google-tuiguang', 'fufei-guanggao'],
};

const websites = services.find((s) => s.id === 'websites')!;

describe('retired service redirects (source)', () => {
  it("sends every retired slug, in every locale, to that locale's Get more patients page", () => {
    const expected: Record<string, string> = {};
    for (const locale of LOCALES) {
      for (const slug of RETIRED_SLUGS[locale]) {
        const from = localeUrl(locale, SEGMENTS.services[locale], slug).replace(/\/$/, '');
        expected[from] = localeUrl(locale, SEGMENTS.services[locale], websites.slugs[locale]);
      }
    }
    expect(RETIRED_SERVICE_REDIRECTS).toEqual(expected);
  });

  it('never retires a slug that a live service still uses', () => {
    for (const locale of LOCALES) {
      for (const service of services) {
        expect(RETIRED_SLUGS[locale]).not.toContain(service.slugs[locale]);
      }
    }
  });
});

const DIST = join(dirname(fileURLToPath(import.meta.url)), '../../dist');

function builtPages(dir = ''): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(DIST, dir), { withFileTypes: true })) {
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (entry.name === '_astro' || entry.name === 'admin') continue;
      out.push(...builtPages(rel));
    } else if (entry.name === 'index.html') {
      out.push(rel);
    }
  }
  return out;
}

describe.skipIf(!existsSync(DIST))('retired service redirects (built)', () => {
  const entries = Object.entries(RETIRED_SERVICE_REDIRECTS);

  it.each(entries)('%s is an instant, unindexed redirect to %s', (from, to) => {
    const html = readFileSync(join(DIST, from, 'index.html'), 'utf8');
    expect(html).toContain(`content="0;url=${to}"`);
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html).toContain(`<link rel="canonical" href="https://pasadenaworks.com${to}">`);
  });

  it('keeps every redirect out of the sitemap, and every target in it', () => {
    const sitemap = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
    for (const [from, to] of entries) {
      // Positive control first: the target is a real, listed page.
      expect(existsSync(join(DIST, to, 'index.html')), `${to} was not built`).toBe(true);
      expect(sitemap).toContain(`<loc>https://pasadenaworks.com${to}</loc>`);
      expect(sitemap).not.toContain(`<loc>https://pasadenaworks.com${from}/</loc>`);
    }
  });

  it('points no hreflang alternate at a retired address', () => {
    const offenders: string[] = [];
    for (const page of builtPages()) {
      const tags = readFileSync(join(DIST, page), 'utf8').match(/<link[^>]*hreflang[^>]*>/g) ?? [];
      for (const [from] of entries) {
        if (tags.some((tag) => tag.includes(`href="https://pasadenaworks.com${from}/"`))) {
          offenders.push(`${page} → ${from}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the unit tests to verify they fail**

Run: `npx vitest run src/data/services.test.ts src/data/retired-services.test.ts`
Expected: FAIL — `serviceForPillar` is not exported, and `./retired-services.mjs` cannot be resolved.

- [ ] **Step 3: Create the redirect map**

Create `src/data/retired-services.mjs`:

```js
/**
 * Service pages retired on 2026-09-14, when the site moved from general small
 * businesses to independent health practices. Both folded into "Get more
 * patients" (id `websites`), in every locale.
 *
 * Plain ESM, not TypeScript, because astro.config.mjs imports it. Keys carry no
 * trailing slash — Astro's static build writes each one to `<key>/index.html`.
 * `retired-services.test.ts` derives the expected map from `services.ts` and
 * `SEGMENTS`, so a slug typo here fails a test instead of shipping a 404.
 */
export const RETIRED_SERVICE_REDIRECTS = {
  '/services/get-found-on-google': '/services/websites/',
  '/services/paid-advertising': '/services/websites/',
  '/es/servicios/aparecer-en-google': '/es/servicios/sitios-web/',
  '/es/servicios/publicidad-pagada': '/es/servicios/sitios-web/',
  '/zh-hans/fuwu/guge-tuiguang': '/zh-hans/fuwu/wangzhan-jianshe/',
  '/zh-hans/fuwu/fufei-guanggao': '/zh-hans/fuwu/wangzhan-jianshe/',
  '/zh-hant/fuwu/google-tuiguang': '/zh-hant/fuwu/wangzhan-jianzhi/',
  '/zh-hant/fuwu/fufei-guanggao': '/zh-hant/fuwu/wangzhan-jianzhi/',
};
```

In `astro.config.mjs`, add the import under the existing `import sitemap …` line, and add `redirects` directly after `site`:

```js
import { RETIRED_SERVICE_REDIRECTS } from './src/data/retired-services.mjs';
```

```js
  site: 'https://pasadenaworks.com',

  // Retired service pages (2026-09-14). On a static build Astro writes each as
  // an instant meta refresh with noindex and a canonical to the target, and
  // @astrojs/sitemap lists only real pages, so none of these reach the sitemap.
  redirects: RETIRED_SERVICE_REDIRECTS,
```

- [ ] **Step 4: Restructure `services.ts`**

1. Delete the whole `/* ── 2. Organic / SEO … */` object (`id: 'search'`) and the whole `/* ── 3. Online marketing … */` object (`id: 'ads'`).
2. Move the `consulting` object above `websites`, so the array order is `consulting`, `websites`.
3. Replace `export interface Service { id: string; …` with:

```ts
/** The live service ids. Retired ids (`search`, `ads`) redirect — see
 *  src/data/retired-services.mjs. Blog pillars reach a service through
 *  PILLAR_SERVICE below, never by matching this id. */
export type ServiceId = 'consulting' | 'websites';

export interface Service {
  id: ServiceId;
  slugs: Record<Locale, string>;
  t: Record<Locale, ServiceCopy>;
}
```

4. Add `import type { Pillar } from './pillars';` under the existing `import type { Locale }` line, and append after `serviceBySlug`:

```ts
/**
 * Which service each blog pillar's end-of-post call to action points at.
 * The pillars are a blog taxonomy and outlived two services, so this is an
 * explicit map rather than `services.find((s) => s.id === pillar)` — that
 * lookup crashed the build the moment a pillar's service was retired. A pillar
 * missing here is a compile error; a mapped id missing from `services` throws.
 */
export const PILLAR_SERVICE: Record<Pillar, ServiceId> = {
  websites: 'websites',
  search: 'websites',
  ads: 'websites',
  consulting: 'consulting',
};

export function serviceForPillar(pillar: Pillar): Service {
  const id = PILLAR_SERVICE[pillar];
  const service = services.find((s) => s.id === id);
  if (!service) {
    throw new Error(`services.ts: pillar "${pillar}" maps to "${id}", which is not in services[]`);
  }
  return service;
}
```

5. In the header comment, replace the paragraph beginning `Order of this array = display order` with:

```ts
 *  Order of this array = display order on the site: Practice Checkup, then
 *  Digitize the office, then Get more patients (2026-09-14).
 *
 *  `id` and `slugs` are what indexed URLs are built from. Changing a slug moves
 *  a page; retiring a service needs a redirect for every locale in
 *  src/data/retired-services.mjs, as `search` and `ads` got on 2026-09-14.
 *  `websites` can never be retired or renamed: routes.ts builds the city-hub
 *  URL segment from its slugs.
```

- [ ] **Step 5: Point `EndCta` through the map**

In `src/components/EndCta.astro`, replace the import `import { services } from '../data/services';` with `import { serviceForPillar } from '../data/services';` and replace line 15 with:

```ts
const service = serviceForPillar(pillar);
```

- [ ] **Step 6: Retarget the one blog link to the retired page**

Change only the URL in each file, leaving the link text alone:

| File | From | To |
|---|---|---|
| `src/content/blog/en/why-customers-cant-find-your-business-on-google.md` | `(/services/get-found-on-google/)` | `(/services/websites/)` |
| `src/content/blog/es/por-que-mi-negocio-no-aparece-en-google.md` | `(/es/servicios/aparecer-en-google/)` | `(/es/servicios/sitios-web/)` |
| `src/content/blog/zh-hans/guge-zhaobudao-wo-de-dian.md` | `(/zh-hans/fuwu/guge-tuiguang/)` | `(/zh-hans/fuwu/wangzhan-jianshe/)` |
| `src/content/blog/zh-hant/google-zhaobudao-wo-de-dian.md` | `(/zh-hant/fuwu/google-tuiguang/)` | `(/zh-hant/fuwu/wangzhan-jianzhi/)` |

Then confirm nothing else links to a retired slug:

Run: `grep -rn -E "get-found-on-google|paid-advertising|aparecer-en-google|publicidad-pagada|guge-tuiguang|google-tuiguang|fufei-guanggao" src --include='*.md' --include='*.astro' --include='*.ts' | grep -v retired-services`
Expected: no output. Positive control: `grep -c "get-found-on-google" src/data/retired-services.mjs` prints `1`.

- [ ] **Step 7: Run unit tests, typecheck, build, then the built tests**

Run: `npx vitest run src/data/services.test.ts src/data/retired-services.test.ts`
Expected: PASS (the built block may pass on a stale `dist/` or skip; the next command is the real check).

Run: `npm run typecheck && npm run build 2>&1 | tee "$TMPDIR/build.log" | tail -5 && npx vitest run src/data/retired-services.test.ts`
Expected: typecheck 0 errors; build completes; all built-redirect tests PASS (8 redirect cases + sitemap + hreflang).

If a redirect case fails because `dist/services/get-found-on-google/index.html` does not exist, list where Astro wrote it (`find dist -path '*get-found-on-google*'`) and adjust the key shape in `retired-services.mjs` and the `from` derivation in the test together.

Run: `grep -i "warn" "$TMPDIR/build.log" | grep -i -E "redirect|route|glob-loader|global" ; echo "exit:$?"`
Expected: no matching lines (`exit:1`).

- [ ] **Step 8: Full suite and commit**

Run: `npm run test`
Expected: all pass.

```bash
git add src/data/retired-services.mjs src/data/retired-services.test.ts src/data/services.ts src/data/services.test.ts src/components/EndCta.astro astro.config.mjs src/content/blog/en/why-customers-cant-find-your-business-on-google.md src/content/blog/es/por-que-mi-negocio-no-aparece-en-google.md src/content/blog/zh-hans/guge-zhaobudao-wo-de-dian.md src/content/blog/zh-hant/google-zhaobudao-wo-de-dian.md
git commit -m "Retire the search and ads service pages behind per-locale redirects

Blog pillars now reach a service through a typed PILLAR_SERVICE map, since
matching a pillar to a service id crashes once a service is retired.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01V3F6Xwi4r3Ggp3N5bsedoy"
```

---

### Task 2: Source every cited claim, or cut it

**Files:**
- Create: `docs/superpowers/specs/2026-09-14-practice-services-sources.md`
- Modify: `docs/superpowers/specs/2026-09-14-practice-services-design.md` (only if a claim is cut)

**Interfaces:**
- Produces: a sources file whose table has exactly these keys, each with one verified `https://` URL — consumed by Tasks 3 and 4 as `SOURCES.<key>`:

| Key | Claim it supports (spec section) | Where to look first |
|---|---|---|
| `section504Extension` | Medicare Part B practices must meet WCAG 2.1 AA by May 2027 (15+ employees) / May 2028 (§3.4) | Already verified: `https://www.federalregister.gov/documents/2026/05/11/2026-09266/extension-of-compliance-dates-for-nondiscrimination-on-the-basis-of-disability-accessibility-of-web` — confirm Part B coverage is stated in it or in the 2024 final rule it amends, and record which |
| `googlePractitionerListings` | Google allows a separate listing per doctor (§3.4) | Google Business Profile guidelines, "individual practitioners" section, `support.google.com/business` |
| `googleReviewPolicy` | Asking only satisfied patients, or offering anything for a review, breaks Google's rules (§3.4) | Google Maps user-contributed content policy, `support.google.com/contributionpolicy` |
| `hhsReviewResponseSettlement` | HHS has fined practices for review replies that disclosed patient information (§3.4) | An HHS OCR resolution agreement or press release; `hhs.gov` blocks scripted fetches, so find it through WebSearch and cite the page WebSearch surfaces if WebFetch can read it, or a law-firm summary quoting the settlement |
| `hipaaMarketing` | Recall messages must follow HIPAA's marketing rules (§3.4) | HHS guidance on the Privacy Rule's marketing provisions, or 45 CFR 164.501 via `law.cornell.edu` |
| `ocrTrackingTech` | Tracking code on appointment/intake pages can disclose patient information (§3.4) | HHS OCR bulletin on online tracking technologies; record its status after *AHA v. Becerra* (June 2024) and confirm the claim is limited to pages where patients enter health information |
| `calBusProf650` | California prohibits paying for patient referrals (§3.4) | Cal. Bus. & Prof. Code § 650 at `leginfo.legislature.ca.gov` |
| `federalAks` | Federal anti-kickback statute (§3.4) | 42 U.S.C. § 1320a-7b(b) at `law.cornell.edu` or OIG's own summary |
| `hipaaRiskAnalysis` | HIPAA requires a security risk analysis of practices that bill electronically (§3.3) | 45 CFR 164.308(a)(1)(ii)(A) via `law.cornell.edu`, or HHS risk-analysis guidance; confirm the "covered entity" framing (electronic standard transactions) |
| `hipaaCoveredEntities` | Practices that bill insurance electronically are HIPAA covered entities (§3.3) — added during Task 2 | CMS "Are You a Covered Entity?" |
| `medicarePartBCoverage` | Accepting Medicare Part B puts a practice under the Section 504 rule (§3.4) — added during Task 2 | Alston & Bird alert, March 2026 |
| `remindersNoShows` | Automated reminders reduce missed appointments (§3.3) | A systematic review, e.g. Cochrane's review of mobile-phone messaging reminders for healthcare appointments |

- [ ] **Step 1: Verify each source**

For each key: find the page (WebSearch), open it (WebFetch), and confirm it supports the claim **as the spec words it**. Try a blocked host once; if it refuses, use a readable proxy (a law-school statute mirror, a law-firm alert quoting the primary source) rather than a fourth fetch method.

- [ ] **Step 2: Write the sources file**

Create `docs/superpowers/specs/2026-09-14-practice-services-sources.md`:

```markdown
# Sources for the practice services copy

Verified 2026-09-14. One row per key; Tasks 3–4 read these URLs into
`SOURCES` in src/data/services.ts. A claim with no row was cut from the copy.

| Key | URL | What the page says, in brief | Verified via |
|---|---|---|---|
| section504Extension | https://www.federalregister.gov/documents/2026/05/11/2026-09266/extension-of-compliance-dates-for-nondiscrimination-on-the-basis-of-disability-accessibility-of-web | Interim final rule moving web/mobile compliance to May 11, 2027 (15+ employees) and May 10, 2028 (<15) | WebSearch + Reed Smith, Alston & Bird alerts |
```

…then one row per remaining key, each with the real URL found in Step 1 and a one-sentence summary of what the page actually says.

- [ ] **Step 3: Cut anything that did not source**

If a key has no source that supports the claim as worded, delete that clause from spec §3 (keep the sentence grammatical, re-read it), note the cut under a `## Cut` heading in the sources file, and drop the key from the table. Do not soften a claim until it happens to match a source — cut it.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-09-14-practice-services-sources.md docs/superpowers/specs/2026-09-14-practice-services-design.md
git commit -m "Source every checkable claim in the practice services copy

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01V3F6Xwi4r3Ggp3N5bsedoy"
```

---

### Task 3: English copy for the Checkup and Get more patients, plus four glossary entries

**Files:**
- Modify: `src/data/services.ts` (add `SOURCES`, `google()`; rewrite `consulting.t.en` and `websites.t.en`)
- Modify: `src/data/glossary.ts` (header comment; four entries)
- Modify: `src/data/services.test.ts`

**Interfaces:**
- Consumes: `SOURCES` keys from Task 2's sources file.
- Produces: `const SOURCES` and `function google(url: string, locale: Locale): string` inside `services.ts` (module-private), used again by Tasks 4 and 5.

- [ ] **Step 1: Write the failing tests**

Append to `src/data/services.test.ts`, and add `import { glossary } from './glossary';` to its imports:

```ts
describe('glossary links in service copy', () => {
  it('links English copy only to glossary entries that exist', () => {
    const ids = new Set(glossary.map((g) => g.id));
    const text = JSON.stringify(services.map((s) => s.t.en));
    const anchors = [...text.matchAll(/\/glossary\/#([a-z0-9-]+)/g)].map((m) => m[1]);
    expect(anchors, 'positive control: English copy should link the glossary').toContain('ehr');
    expect(anchors.filter((a) => !ids.has(a))).toEqual([]);
  });

  it('keeps glossary links out of non-English copy, because the glossary is English-only', () => {
    for (const service of services) {
      for (const locale of ['es', 'zh-hans', 'zh-hant'] as const) {
        expect(JSON.stringify(service.t[locale]), `${service.id}/${locale}`).not.toContain('/glossary/');
      }
    }
  });
});

describe('English copy rules', () => {
  it('keeps every English meta description between 150 and 158 characters', () => {
    for (const service of services) {
      const n = [...service.t.en.meta].length;
      expect(n, `${service.id} meta is ${n} characters`).toBeGreaterThanOrEqual(150);
      expect(n, `${service.id} meta is ${n} characters`).toBeLessThanOrEqual(158);
    }
  });

  it('uses none of the banned marketing words', () => {
    const text = JSON.stringify(services.map((s) => s.t.en)).toLowerCase();
    for (const word of ['leverage', 'solutions', 'empower', 'transformation']) {
      expect(text).not.toContain(word);
    }
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/data/services.test.ts`
Expected: FAIL — `ehr` is not linked from English copy yet.

- [ ] **Step 3: Add the glossary entries**

In `src/data/glossary.ts`, change the header line `it exists so a small business owner reading` to `it exists so a practice owner reading`, and append these four entries to the `glossary` array:

```ts
  {
    id: 'ehr',
    term: 'EHR (electronic health record)',
    definition:
      "The software a practice uses to keep patient charts, visit notes, prescriptions and test results instead of paper folders. Most EHRs can also handle scheduling and billing, but many practices only ever switch on a fraction of what they paid for.",
  },
  {
    id: 'hipaa',
    term: 'HIPAA',
    definition:
      "The federal law that sets the rules for how medical practices, and the companies they hire, protect patient information. It covers who may see a patient's records, how those records are kept secure, and what has to happen when they leak.",
  },
  {
    id: 'business-associate-agreement',
    term: 'Business associate agreement (BAA)',
    definition:
      'A contract HIPAA requires between a practice and any outside company that handles its patient information, such as an EHR vendor, a billing service or a consultant. It commits that company to protect the information the way the practice itself must.',
  },
  {
    id: 'wcag',
    term: 'WCAG 2.1 AA',
    definition:
      'The Web Content Accessibility Guidelines: the standard for making a website usable by people who are blind, have low vision, or cannot use a mouse. "AA" is the middle of its three levels, and it is the level most accessibility laws point to.',
  },
```

- [ ] **Step 4: Add `SOURCES` and `google()` to `services.ts`**

Directly after the imports, add (URLs copied from the Task 2 sources file; if Task 2 cut a key, omit it here and omit its link in Step 5):

```ts
/** Every outside source the service copy links to, verified in
 *  docs/superpowers/specs/2026-09-14-practice-services-sources.md. A claim a
 *  reader could check carries one of these, or it is not on the site. */
const SOURCES = {
  section504Extension: 'https://www.federalregister.gov/documents/2026/05/11/2026-09266/extension-of-compliance-dates-for-nondiscrimination-on-the-basis-of-disability-accessibility-of-web',
  googlePractitionerListings: '<URL from sources file>',
  googleReviewPolicy: '<URL from sources file>',
  hhsReviewResponseSettlement: '<URL from sources file>',
  hipaaMarketing: '<URL from sources file>',
  ocrTrackingTech: '<URL from sources file>',
  calBusProf650: '<URL from sources file>',
  federalAks: '<URL from sources file>',
  hipaaRiskAnalysis: '<URL from sources file>',
  hipaaCoveredEntities: '<URL from sources file>',
  medicarePartBCoverage: '<URL from sources file>',
  remindersNoShows: '<URL from sources file>',
} as const;

const GOOGLE_HL: Record<Locale, string> = { en: 'en', es: 'es-419', 'zh-hans': 'zh-CN', 'zh-hant': 'zh-TW' };

/** Google's help pages exist in each reader's language; the federal and state
 *  sources do not, so only Google links get a per-locale `hl`. */
function google(url: string, locale: Locale): string {
  const u = new URL(url);
  u.searchParams.set('hl', GOOGLE_HL[locale]);
  return u.toString();
}
```

The `<URL from sources file>` strings are filled from the committed Task 2 file, not invented; `npm run test` in Step 6 fails on any that remain because the next test asserts it.

Add to `src/data/services.test.ts` inside `describe('English copy rules', …)`:

```ts
  it('carries no unfilled source placeholder', () => {
    expect(JSON.stringify(services)).not.toContain('URL from sources file');
  });
```

- [ ] **Step 5: Rewrite the two English objects**

Replace `consulting.t.en` with (text verbatim from spec §3.2):

```ts
      en: {
        title: 'Practice Checkup',
        tagline: 'Find out what is actually costing you patients before you pay anyone to fix it.',
        summary:
          'One fixed-price review of the whole practice — the phones and intake forms, the records and the EHR, the website and the Google listing — ending in a short written plan that ranks what to fix first. If you continue with us, the fee is credited toward that work.',
        body: [
          '<p>Most practices that call us believe they have a marketing problem. Some do, but just as often the new patients are already calling and the practice is losing them somewhere between a voicemail nobody returns and a clipboard of forms that takes twenty minutes to complete. Advertising cannot fix either of those, which is why we look before we recommend anything.</p>',
          '<h2>How it works</h2><ul><li>A conversation with you and your front-desk staff, since the people answering the phones know where the day goes wrong</li><li>A walk through one patient\'s path, from the first search or phone call to the reminder for their next visit</li><li>A review of your <a href="/glossary/#ehr">EHR</a> setup, your patient records, your <a href="/glossary/#google-business-profile">Google Business Profile</a> and reviews, and your website</li><li>A short written plan ranked by what will pay off first, with a fixed price for any follow-on work agreed in writing before we start</li></ul>',
          '<p>Sometimes the plan says the practice is in better shape than you feared, and that the most valuable next step costs very little. We will write that down just as plainly.</p>',
        ],
        outcomes: [
          'A map of one patient\'s path through your practice, with the places patients drop off marked',
          'A plain assessment of your records, EHR, and front-desk workflow',
          'A look at how the practice appears to a patient who searches for it: Google, reviews, website, and health directories',
          'A written plan ranked by what to fix first, not a slide deck',
          'The checkup fee credited toward any work you go on to do with us',
        ],
        meta: 'A fixed-price checkup for independent medical, dental, and eye care practices in Southern California: records, EHR, front desk, and online presence, ranked.',
      },
```

Replace `websites.t.en` with (text verbatim from spec §3.4; each `[cite]` becomes a link on the phrase shown):

```ts
      en: {
        title: 'Get more patients',
        tagline: 'More of the patients you want, and proof of where they came from.',
        summary:
          'Before most patients call, they check your Google listing, your reviews, and your website, so we get those right first. Then we bring back the patients who are overdue and advertise only the treatments worth advertising, with every new patient traced to its source.',
        body: [
          '<p>A prospective patient usually wants to know five things: whether you take their insurance, whether you are accepting new patients, which languages you speak, where to park, and whether they can book online. A practice that answers those questions quickly often gets the call over one down the street that does not, which is why no amount of advertising helps until the basics are right.</p>',
          `<h2>First, the basics</h2><ul><li>Your <a href="/glossary/#google-business-profile">Google Business Profile</a> completed and verified, <a href="${google(SOURCES.googlePractitionerListings, 'en')}">with a separate listing for each doctor</a>, since patients often search by name</li><li>A steady flow of <a href="/glossary/#reviews">reviews</a>: a text after each visit asking every patient, <a href="${google(SOURCES.googleReviewPolicy, 'en')}">never only the satisfied ones, and never with anything offered in return</a></li><li>Replies to reviews written so they never confirm that the reviewer is a patient, <a href="${SOURCES.hhsReviewResponseSettlement}">a HIPAA violation federal regulators fined one dental practice $50,000 for</a></li><li>Healthgrades, Zocdoc, WebMD, and your insurers' provider directories made consistent with Google</li><li>A fast website that meets the <a href="/glossary/#wcag">WCAG 2.1 AA</a> accessibility standard, in Spanish or Chinese where your patients speak it</li></ul>`,
          `<p><a href="${SOURCES.medicarePartBCoverage}">Practices that accept Medicare Part B</a> are now required by federal rule to make their websites meet that accessibility standard, <a href="${SOURCES.section504Extension}">by May 2027 for practices with fifteen or more employees and by May 2028 for smaller ones</a>.</p>`,
          `<h2>Then, growth</h2><p>The least expensive appointment most practices will ever book comes from a patient who is already overdue: the annual eye exam, the six-month cleaning, the follow-up that never got scheduled. Most practices remind those patients poorly or not at all, so growth starts there, before a dollar goes to advertising.</p><ul><li>Tracking that records where every new patient came from, so the monthly report can answer whether the spending paid for itself</li><li>Recall and reactivation messages for patients who are overdue for a visit, <a href="${SOURCES.hipaaMarketing}">written within HIPAA's rules on marketing to patients</a></li><li>A page for each high-value treatment you offer, written for the way patients actually search for it</li><li>Google search ads only for treatments where a new patient is worth the cost, with a budget cap that cannot quietly run away from you</li></ul>`,
          `<p>Some things we will not do: target advertising at people based on a health condition, place ad-tracking code on appointment or intake pages <a href="${SOURCES.ocrTrackingTech}">where it can pass patient information to an advertising platform</a>, or pay anyone for referrals, which <a href="${SOURCES.calBusProf650}">state</a> and <a href="${SOURCES.federalAks}">federal</a> anti-kickback laws prohibit. You retain ownership of the website, the domain, and the content, because holding a client's website hostage is a poor business model and a worse way to treat people.</p>`,
        ],
        outcomes: [
          'Google Business Profile listings for the practice and for each doctor, verified',
          'A review request that reaches every patient after every visit, and replies that never confirm anyone is a patient',
          'Health directory and insurer listings that match Google',
          'A website that loads quickly on a phone, answers the questions patients ask first, and meets WCAG 2.1 AA, in Spanish or Chinese if your patients need it',
          'Recall messages that bring overdue patients back',
          'Search ads with a hard budget cap, only where the numbers work',
          'A monthly note: what you spent, what it returned, and where each new patient came from',
        ],
        meta: 'Websites, Google profiles, reviews, patient recall, and search ads for independent medical, dental, and eye care practices in Southern California, tracked.',
      },
```

- [ ] **Step 6: Tests, typecheck, build, readability**

Run: `npx vitest run src/data/services.test.ts && npm run typecheck`
Expected: PASS; 0 type errors.

Run: `npm run build` then the scoped readability check (Global Constraints).
Expected: `/services/business-advice/index.html` and `/services/websites/index.html` read `ok` (FK 13–15). If either is out of band, edit that page's sentences by hand — merge short sentences with real subordination, or split one that overshoots — rebuild, re-measure. Keep the approved meaning; if a fix would change what a sentence promises, stop and ask the owner.

- [ ] **Step 7: Full suite and commit**

Run: `npm run test`
Expected: all pass. (The readability source-vs-dist cross-check covers blog posts, whose end-of-post tagline just changed; it must stay green.)

```bash
git add src/data/services.ts src/data/services.test.ts src/data/glossary.ts
git commit -m "Rewrite the Checkup and Get more patients pages for health practices

Adds EHR, HIPAA, BAA and WCAG glossary entries and links every checkable
claim to its verified source.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01V3F6Xwi4r3Ggp3N5bsedoy"
```

---

### Task 4: Add "Digitize the office" in all four languages

**Files:**
- Modify: `src/data/services.ts` (widen `ServiceId`; insert the `digitize` object between `consulting` and `websites`)
- Modify: `src/data/services.test.ts`

**Interfaces:**
- Consumes: `SOURCES.hipaaRiskAnalysis`, `SOURCES.remindersNoShows`, `google()` (Task 3).
- Produces: `ServiceId = 'consulting' | 'digitize' | 'websites'`.

- [ ] **Step 1: Write the failing test**

Append to the first `describe('serviceBySlug', …)` block in `src/data/services.test.ts`:

```ts
  it('finds Digitize the office by its slug in every locale', () => {
    expect(serviceBySlug('en', 'practice-digitization')?.id).toBe('digitize');
    expect(serviceBySlug('es', 'digitalizacion-del-consultorio')?.id).toBe('digitize');
    expect(serviceBySlug('zh-hans', 'zhensuo-shuzihua')?.id).toBe('digitize');
    expect(serviceBySlug('zh-hant', 'zhensuo-shuweihua')?.id).toBe('digitize');
  });

  it('lists the services in display order', () => {
    expect(services.map((s) => s.id)).toEqual(['consulting', 'digitize', 'websites']);
  });
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/data/services.test.ts`
Expected: FAIL — `serviceBySlug('en', 'practice-digitization')` is undefined.

- [ ] **Step 3: Write the service**

Change `export type ServiceId = 'consulting' | 'websites';` to `export type ServiceId = 'consulting' | 'digitize' | 'websites';` and insert between the `consulting` and `websites` objects:

```ts
  /* ── 2. Digitize the office (added 2026-09-14) ──────────────────────── */
  {
    id: 'digitize',
    slugs: {
      en: 'practice-digitization',
      es: 'digitalizacion-del-consultorio',
      'zh-hans': 'zhensuo-shuzihua',
      'zh-hant': 'zhensuo-shuweihua',
    },
    t: {
      en: {
        title: 'Digitize the office',
        tagline: 'Less paper, fewer phone calls, and a front desk that is not drowning.',
        summary:
          'We move patient records, scheduling, intake forms, and reminders onto systems that work together, starting from how patients actually move through your office rather than from whatever software someone wants to sell you. We take no commissions from software vendors.',
        body: [
          '<p>Many independent practices run on an <a href="/glossary/#ehr">EHR</a> that is only half set up, a phone line the front desk is always behind on, and paper forms that someone retypes after the visit. Each of those costs staff time, and several of them cost patients who gave up before anyone answered.</p>',
          `<h2>How it works</h2><ul><li>We follow one patient from the first call to the follow-up reminder, and fix the steps where time and money leak out</li><li>Online scheduling, intake and consent forms that patients complete on their phone before the visit, and <a href="${SOURCES.remindersNoShows}">automated reminders that reduce no-shows</a></li><li>Paper charts scanned and organized, and your EHR configured so your staff actually use it</li><li>A <a href="/glossary/#hipaa">HIPAA</a> security risk analysis, <a href="${SOURCES.hipaaRiskAnalysis}">which HIPAA requires</a> of <a href="${SOURCES.hipaaCoveredEntities}">practices that bill insurance electronically</a>, and a signed <a href="/glossary/#business-associate-agreement">business associate agreement</a> with every vendor that handles patient information, including us</li><li>Written office procedures, so the practice runs the same way on the days you are not there</li></ul>`,
          '<p>We recommend software on its merits and accept no commissions or referral fees from any vendor, which is the only way advice about which system to buy can be worth anything. We also stay out of IT repairs and billing, and will point you to people who do those well.</p>',
        ],
        outcomes: [
          'Patients who book, complete their forms, and receive reminders without calling the front desk',
          'Paper charts digitized, and an EHR set up the way your practice actually works',
          'A completed HIPAA security risk analysis, with the fixes it turns up',
          'A business associate agreement signed with every vendor that touches patient data',
          'Written procedures for the front desk and back office',
          'Advice from someone paid by you and nobody else',
        ],
        meta: 'EHR setup, digital intake, online scheduling, and HIPAA risk analysis for independent practices in Southern California. No commissions from software vendors.',
      },
      es: { /* Step 4 */ },
      'zh-hans': { /* Step 4 */ },
      'zh-hant': { /* Step 4 */ },
    },
  },
```

- [ ] **Step 4: Translate it into `es`, `zh-hans` and `zh-hant`**

These three objects are authored during execution (they cannot be written honestly before the terminology research below). Each must satisfy, and Task 5's parity test will enforce the structural half:

- Same keys as `en`; `body` has 3 items with the same HTML shape (paragraph · `<h2>` + a 5-item `<ul>` · paragraph); `outcomes` has 6 items.
- The two source links sit on the same claims; no `/glossary/` links.
- Verified terminology, recorded as a short comment above the `es` object with the page each came from: EHR (Spanish as used by U.S. HHS/HealthIT.gov Spanish pages; Taiwan MOHW usage for 電子病歷; mainland NHC usage for 电子病历), "business associate agreement" (HHS's own Spanish and Chinese language-assistance materials if they exist; otherwise keep the English term with a gloss), HIPAA kept as "HIPAA".
- `es` uses *consultorio* for a doctor's office and *usted*, matching the existing Spanish copy.
- `zh-hant` follows the `writing-taiwan-mandarin-copy` skill; `zh-hans` uses mainland lexis (数字化, not 數位化).
- Every "never / only / not / no" and modal re-read against the English.

- [ ] **Step 5: Test, build, verify hreflang and readability**

Run: `npx vitest run src/data/services.test.ts && npm run typecheck && npm run build`
Expected: PASS, 0 errors, build completes.

Run: `grep -o 'hreflang="[^"]*" href="[^"]*"' dist/services/practice-digitization/index.html`
Expected: exactly 5 lines — one per locale plus `x-default`, each `href` ending in that locale's `practice-digitization` / `digitalizacion-del-consultorio` / `zhensuo-shuzihua` / `zhensuo-shuweihua` URL. Positive control: the same grep on `dist/services/business-advice/index.html` also prints 5 lines.

Run: `grep -o 'hreflang="[^"]*" href="[^"]*"' dist/websites/glendale/index.html; echo "exit:$?"`
Expected: no lines (`exit:1`) — hard rule 1 unchanged. Positive control: `test -f dist/websites/glendale/index.html && echo built` prints `built`.

Run the scoped readability check.
Expected: all four `practice-digitization` / `digitalizacion-del-consultorio` / `zhensuo-*` pages `ok`, none `runaway`. Fix out-of-band pages by hand, one at a time.

- [ ] **Step 6: Full suite and commit**

Run: `npm run test`
Expected: all pass.

```bash
git add src/data/services.ts src/data/services.test.ts
git commit -m "Add Digitize the office in all four languages

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01V3F6Xwi4r3Ggp3N5bsedoy"
```

---

### Task 5: Translate the Checkup and Get more patients, and pin structural parity

**Files:**
- Modify: `src/data/services.ts` (`consulting.t.es|zh-hans|zh-hant`, `websites.t.es|zh-hans|zh-hant`)
- Modify: `src/data/services.test.ts`

**Interfaces:**
- Consumes: `SOURCES`, `google()` (Task 3); the English objects from Tasks 3–4.

- [ ] **Step 1: Write the failing parity test**

Append to `src/data/services.test.ts`:

```ts
describe('translation parity', () => {
  const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;

  it('gives every locale the same structure as English: body blocks, list items, outcomes, source links', () => {
    for (const service of services) {
      const en = service.t.en;
      for (const locale of ['es', 'zh-hans', 'zh-hant'] as const) {
        const tr = service.t[locale];
        const where = `${service.id}/${locale}`;
        expect(tr.body.length, `${where} body blocks`).toBe(en.body.length);
        expect(tr.outcomes.length, `${where} outcomes`).toBe(en.outcomes.length);
        expect(count(tr.body.join(''), /<li>/g), `${where} list items`).toBe(count(en.body.join(''), /<li>/g));
        expect(count(tr.body.join(''), /href="https?:/g), `${where} source links`).toBe(
          count(en.body.join(''), /href="https?:/g),
        );
      }
    }
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/data/services.test.ts -t "translation parity"`
Expected: FAIL for `websites/es` (old copy has 3 body blocks, English now has 5) and `consulting/es` source/structure mismatches.

- [ ] **Step 3: Translate both services**

Replace `consulting.t.es`, `consulting.t['zh-hans']`, `consulting.t['zh-hant']`, `websites.t.es`, `websites.t['zh-hans']`, `websites.t['zh-hant']` with translations of the Task 3 English, authored under the Translation method in Global Constraints and the same rules as Task 4 Step 4, plus:

- Google Business Profile: `es` **Perfil de Negocio de Google** (es-419), `zh-hans` **Google 商家资料**, `zh-hant` **Google 商家檔案** — verified on `support.google.com/business/?hl=<locale>` before writing.
- Medicare Part B: take the name from `medicare.gov`'s Spanish and Chinese publications.
- Google links use `google(SOURCES.<key>, '<locale>')`; federal and state links stay as `SOURCES.<key>`.
- Keep the voice line: *holding a client's website hostage…* translates with the same bluntness as the existing localized copy.
- Localized `meta`: one or two plain sentences; do not pad to a character count.

- [ ] **Step 4: Test, build, readability**

Run: `npx vitest run src/data/services.test.ts && npm run typecheck && npm run build`
Expected: PASS; 0 errors.

Run the scoped readability check.
Expected: all 12 service pages (3 services × 4 locales) `ok`, none `runaway`. Fix by hand, one page at a time.

- [ ] **Step 5: Polarity read**

For each of the 6 translated objects, list every sentence containing a negation or modal and compare it to its English twin (spec §3.2, §3.4). Highest risk: the "things we will not do" paragraph, "never only the satisfied ones, and never with anything offered in return", and "never confirm that the reviewer is a patient". Record "polarity read: 6 objects checked" in the commit body.

- [ ] **Step 6: Full suite and commit**

Run: `npm run test`
Expected: all pass.

```bash
git add src/data/services.ts src/data/services.test.ts
git commit -m "Translate the Checkup and Get more patients into es, zh-hans and zh-hant

Adds a parity test pinning body blocks, list items, outcomes and source links
to the English. Polarity read: 6 objects checked.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01V3F6Xwi4r3Ggp3N5bsedoy"
```

---

### Task 6: Homepages — practice positioning and the "worth more" section, in four languages

**Files:**
- Modify: `src/pages/index.astro` (title, description, hero, services intro, new section, contact intro)
- Modify: `src/data/home.ts` (`HomeCopy` gains `valueHeading`, `valueBody`; all three locales rewritten)
- Modify: `src/pages/[locale]/index.astro` (render the new section)
- Modify: `src/i18n/homepage-parity.test.ts:108-114`

**Interfaces:**
- Produces: `HomeCopy.valueHeading: string`, `HomeCopy.valueBody: string`; both homepages carry `<section class="section" id="worth-more">`.

- [ ] **Step 1: Write the failing tests**

Replace the last `it(...)` in `src/i18n/homepage-parity.test.ts` with:

```ts
  it('keeps the localized homepage reading its copy from home.ts', () => {
    // Guards the other direction: parity must not be achieved by hardcoding
    // English strings into the localized page. The needle is the English H1,
    // asserted present in the English page first so the absence check below
    // cannot pass vacuously after the next copy change.
    const needle = 'For independent practices ready to stop running on paper and word of mouth.';
    expect(english).toContain(needle);
    expect(localized).toContain('copy.heroHeading');
    expect(localized).toContain('copy.servicesHeading');
    expect(localized).not.toContain(needle);
  });

  it('carries the "worth more" section in every language', () => {
    for (const [label, source] of [['english', english], ['localized', localized]] as const) {
      expect(source, `${label} homepage is missing the worth-more section`).toContain('id="worth-more"');
    }
    expect(localized).toContain('copy.valueHeading');
    expect(localized).toContain('copy.valueBody');
  });
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/i18n/homepage-parity.test.ts`
Expected: FAIL — the English needle and `id="worth-more"` are absent.

- [ ] **Step 3: English homepage**

In `src/pages/index.astro` (copy verbatim from spec §3.1):

- `title="Pasadena Works — Consulting for Independent Health Practices"`
- `description="We help independent medical, dental, and eye care practices in Southern California digitize the office, get found online, and bring in more new patients."`
- Eyebrow: `San Gabriel Valley &amp; Southern California`
- H1: `For independent practices ready to stop running on paper and word of mouth.`
- Subhead paragraph: `We help medical, dental, and eye care practices across Southern California digitize the front office, look trustworthy to the patient who searches for them, and bring in new patients they can trace — and we are never paid by the software companies whose products we recommend.`
- "What we do" intro paragraph: `Every engagement begins with a checkup, because a practice that believes it needs advertising frequently needs its intake forms fixed first, and there is no honest way to know which until someone has looked.`
- Contact intro, first paragraph: `Tell us what is happening at your practice — the phones, the paperwork, the Google listing, or whatever is costing you the most at the moment. We will respond with something specific to your practice rather than a proposal assembled beforehand.`

Insert between the services `</section>` and `<Lattice />`:

```astro
  <section class="section" id="worth-more">
    <div class="wrap">
      <h2>Worth more when you step back</h2>
      <p class="prose">None of this is only about this year. A practice with digital records, written procedures, and a steady flow of new patients runs without its owner in the room, which is precisely what a buyer or an associate taking over will pay for. When you are ready to sell, we prepare the practice and introduce you to a broker who handles the sale itself; we do not broker practice sales, and we accept no fee from anyone who does.</p>
    </div>
  </section>
```

- [ ] **Step 4: Localized homepages**

In `src/data/home.ts`, add to `HomeCopy` after `servicesIntro: string;`:

```ts
  /** "Worth more when you step back" — the long-term payoff of the services:
   *  a practice that runs without its owner sells for more. Pasadena Works
   *  prepares the practice and introduces a broker; it never brokers. */
  valueHeading: string;
  valueBody: string;
```

In `src/pages/[locale]/index.astro`, insert between the services `</section>` and `<Lattice />`:

```astro
  <section class="section" id="worth-more">
    <div class="wrap">
      <h2>{copy.valueHeading}</h2>
      <p class="prose">{copy.valueBody}</p>
    </div>
  </section>
```

Then rewrite all three locale objects in `home.ts` — every field — as translations of the English homepage under the Translation method, with these field mappings:

| `HomeCopy` field | English source |
|---|---|
| `title` | the English `<title>` |
| `metaDescription` | the English description |
| `heroEyebrow`, `heroHeading`, `heroSubhead` | English eyebrow, H1, subhead |
| `heroCta`, `closingCta` | keep the current localized button labels unless they mention small businesses |
| `servicesHeading` | keep current value |
| `servicesIntro` | the English "What we do" intro |
| `valueHeading`, `valueBody` | the new English section |
| `serviceAreaHeading` | keep current value |
| `serviceAreaIntro` | new, same meaning in each language: *We are based in the San Gabriel Valley and work with practices across Southern California, including in these cities.* |
| `closingHeading` | keep current value |
| `closingBody` | the English contact intro |

- [ ] **Step 5: Test, build, readability**

Run: `npx vitest run src/i18n/homepage-parity.test.ts && npm run typecheck && npm run build`
Expected: PASS; 0 errors.

Run the scoped readability check.
Expected: `/index.html`, `/es/index.html`, `/zh-hans/index.html`, `/zh-hant/index.html` `ok` (or reported `tooShort`, which is not scored), none `runaway`.

Run: `grep -c 'id="worth-more"' dist/index.html dist/es/index.html dist/zh-hans/index.html dist/zh-hant/index.html`
Expected: each prints `1`.

- [ ] **Step 6: Full suite and commit**

Run: `npm run test`
Expected: all pass.

```bash
git add src/pages/index.astro src/data/home.ts src/pages/\[locale\]/index.astro src/i18n/homepage-parity.test.ts
git commit -m "Reposition all four homepages for practices and add the worth-more section

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01V3F6Xwi4r3Ggp3N5bsedoy"
```

---

### Task 7: Hub and footer strings, structured data, and the share image

**Files:**
- Modify: `src/i18n/ui.ts` (`footer.serviceAreaBlurb`, `hub.servicesDescription`, `hub.servicesIntro` in all four locales)
- Modify: `src/data/site.ts` (add `regionServed`)
- Modify: `src/layouts/Base.astro:69`
- Create: `src/layouts/local-business-schema.test.ts`
- Replace: `public/og.png`

**Interfaces:**
- Produces: `site.regionServed: readonly string[]`.

- [ ] **Step 1: Write the failing test**

Create `src/layouts/local-business-schema.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from '../data/site';

/**
 * The homepage's LocalBusiness JSON-LD, read from the BUILT page because the
 * value only exists after Base.astro renders it. Skips without dist/; ci.yml
 * re-runs the suite after building.
 */
const DIST = join(dirname(fileURLToPath(import.meta.url)), '../../dist');

describe.skipIf(!existsSync(DIST))('LocalBusiness schema on the built homepage', () => {
  it('names the home-base cities and the Southern California counties', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf8');
    const raw = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    expect(raw, 'no JSON-LD on the homepage').toBeDefined();
    const areas = (JSON.parse(raw!).areaServed as { '@type': string; name: string }[]).map(
      (a) => `${a['@type']}:${a.name}`,
    );
    expect(areas).toContain('City:Pasadena');
    expect(site.regionServed.length).toBeGreaterThan(0);
    for (const county of site.regionServed) {
      expect(areas).toContain(`AdministrativeArea:${county}`);
    }
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run typecheck`
Expected: FAIL — `Property 'regionServed' does not exist`.

- [ ] **Step 3: Implement structured data**

In `src/data/site.ts`, after the `serviceArea` array:

```ts
  /* Beyond the home-base cities: the practice work reaches across Southern
     California (2026-09-14). Emitted as schema.org AdministrativeArea. City
     landing pages are still driven by serviceArea alone. */
  regionServed: ['Los Angeles County', 'Orange County', 'Riverside County', 'San Bernardino County'],
```

In `src/layouts/Base.astro`, replace line 69 with:

```ts
  areaServed: [
    ...site.serviceArea.map((city) => ({ '@type': 'City', name: city })),
    ...site.regionServed.map((region) => ({ '@type': 'AdministrativeArea', name: region })),
  ],
```

- [ ] **Step 4: Hub and footer strings**

In `src/i18n/ui.ts`, English values:

```ts
      serviceAreaBlurb: 'Consulting for independent health practices, based in the San Gabriel Valley.',
```

```ts
      servicesDescription:
        'A practice checkup, office digitization, and more new patients, for independent medical, dental, and eye care practices throughout Southern California.',
      servicesIntro: 'Start with the checkup; what it finds decides which of the other two comes next.',
```

Then write the `es`, `zh-hans` and `zh-hant` values of those same three keys as translations of the English, under the Translation method.

Run: `grep -n -i "small business\|negocios pequeños\|小型企业\|小型企業" src/i18n/ui.ts`
Expected: only the `citiesDescription`, `citiesIntro` and `blogDescription` lines remain (city pages and the blog are out of scope, spec §9). Positive control: the grep prints at least those lines.

- [ ] **Step 5: Regenerate `og.png`**

Move the old image aside: `mv public/og.png "$TMPDIR/og-small-business.png"`.

Write this template to `$TMPDIR/og.html` (fonts and logo load from the repo by absolute `file://` path; replace `REPO` with the output of `pwd`):

```html
<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face { font-family: Anton; src: url(file://REPO/node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2); }
@font-face { font-family: 'Source Serif 4'; src: url(file://REPO/node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-400-normal.woff2); }
html, body { margin: 0; width: 1200px; height: 630px; }
body { background: #7a2e35; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 34px; }
.eyebrow { font-family: Anton, Impact, sans-serif; color: #e3cfc6; letter-spacing: 0.1em; text-transform: uppercase; font-size: 26px; }
.frame { background: #faf7f0; border: 6px solid #4a1c22; box-shadow: 0 0 0 10px #7a2e35, 0 0 0 12px #4a1c22; padding: 34px 44px; }
.frame img { display: block; width: 640px; height: auto; }
.tagline { font-family: 'Source Serif 4', Georgia, serif; color: #faf7f0; font-size: 30px; line-height: 1.35; text-align: center; max-width: 900px; margin: 0; }
</style></head><body>
<div class="eyebrow">San Gabriel Valley &amp; Southern California</div>
<div class="frame"><img src="file://REPO/public/logo-lockup.png" alt=""></div>
<p class="tagline">Consulting for independent medical, dental, and eye care practices — paid by you, and nobody else.</p>
</body></html>
```

Run:

```bash
sed -i '' "s#REPO#$(pwd)#g" "$TMPDIR/og.html"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files --window-size=1200,630 --screenshot="$(pwd)/public/og.png" "file://$TMPDIR/og.html"
sips -g pixelWidth -g pixelHeight public/og.png
```

Expected: `pixelWidth: 1200`, `pixelHeight: 630`. Open `public/og.png` with the Read tool and confirm the eyebrow, lockup and tagline all render in their intended faces (Anton for the eyebrow, not a fallback) with nothing clipped. If not, fix the template and re-run once.

- [ ] **Step 6: Test, build, commit**

Run: `npm run typecheck && npm run build && npx vitest run src/layouts/local-business-schema.test.ts src/layouts/og-image.test.ts && npm run test`
Expected: all pass; 0 type errors.

```bash
git add src/i18n/ui.ts src/data/site.ts src/layouts/Base.astro src/layouts/local-business-schema.test.ts public/og.png
git commit -m "Re-aim hub and footer copy, structured data and the share image at practices

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01V3F6Xwi4r3Ggp3N5bsedoy"
```

---

### Task 8: Documentation, full verification, and a pull request left unmerged

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md**

Make exactly these edits:

1. **What this is**, second sentence → `The marketing site for **Pasadena Works**, a small consultancy serving independent health practices — medical, dental, eye care — across Southern California, based in the San Gabriel Valley. Astro static site, deployed free on GitHub Pages at `pasadenaworks.com`.`
2. **Where things live**, the `services.ts` line → `│   ├── services.ts   ← ALL service copy, all four languages; PILLAR_SERVICE maps blog pillars to services` and add below it `│   ├── retired-services.mjs ← redirects for retired service URLs (search, ads → websites)`.
3. **Gotchas**, add a new entry after "Astro can't have two dynamic routes at the same depth":

```markdown
**A service can be retired, but only behind a redirect in every locale, and
`websites` can never be the one.** On 2026-09-14 `search` and `ads` folded into
"Get more patients". Their eight URLs (two services × four locales) are Astro
static redirects declared in `src/data/retired-services.mjs` — an instant meta
refresh, `noindex`, and a canonical to the target; `@astrojs/sitemap` skips
them. `retired-services.test.ts` derives the expected map from `services.ts`
and `SEGMENTS`, and checks the built pages. `websites` survives any rename
because `routes.ts` builds the city-hub segment from its slugs. The blog's four
pillars did not change; they reach a service through `PILLAR_SERVICE` in
`services.ts`, because matching a pillar to a service id crashed the build the
moment a service was retired.
```

4. **Commands**, the `npm run test` comment: replace the count `316 across 26 files` with the count CI reports on the pull request in Step 4 (CI on a clean checkout is the authority — see the worktree gotcha), and add "the retired-service redirects" and "service copy parity across locales" to the list of what the tests cover.
5. **Commands**, the `npm run typecheck` comment: replace `85 files` with the count `npm run typecheck` prints in Step 2.
6. **Voice → Register**, add after the paragraph on the sentence ceiling: `**A list item ends a sentence** (2026-09-14). Both scoring paths mark each bullet's end, because bullets carry no terminal punctuation and a seven-item list used to score as one hundred-word sentence — a list-heavy service page read FK 25.4 that way against paragraphs near grade 11. Measured across the whole corpus before adopting it: no blog post changed verdict (largest shift 0.3). The corollary is that the service pages' earlier in-band scores were partly that artifact, so a rewritten list-heavy page must be raised by hand, not assumed in band.`
7. **Known outstanding work**, add a bullet: `**City pages, a practice-focused content plan, success stories and per-specialty pages** are deliberately deferred — see spec §9 in docs/superpowers/specs/2026-09-14-practice-services-design.md. Until the content plan lands, the 68 small-business posts end in calls to action that lead to practice service pages.`

- [ ] **Step 2: Full local verification**

Run each and read the output:

```bash
npm run typecheck
npm run build 2>&1 | tee "$TMPDIR/build.log" | tail -3
npm run test
npm run readability -- --dist
git diff --quiet main -- tina/tina-lock.json && echo "tina lock unchanged"
grep -i "warn" "$TMPDIR/build.log" | grep -i -E "glob-loader|global|redirect|route"; echo "warn-grep exit:$?"
```

Expected: 0 type errors (note the file count); build completes; all tests pass; readability `--dist` exits 0 with every service page and homepage in band; `tina lock unchanged`; `warn-grep exit:1`.

Hard rule 1:

```bash
grep -o 'hreflang="[^"]*" href="[^"]*"' dist/websites/glendale/index.html; echo "glendale exit:$?"
grep -o 'hreflang="[^"]*" href="[^"]*"' dist/websites/alhambra/index.html | wc -l
grep -o 'hreflang="[^"]*" href="[^"]*"' dist/services/practice-digitization/index.html | wc -l
```

Expected: `glendale exit:1`; alhambra `5`; practice-digitization `5`.

City-page facts survived (spec is copy-only for cities, so this must be unchanged):

```bash
for f in 1926 "Laura Scudder" "400 storefronts" 1895 "Renaissance Plaza" "Huntington Drive" 1887; do printf '%s: ' "$f"; grep -rl -- "$f" dist/websites | wc -l; done
```

Expected: every count ≥ 1.

- [ ] **Step 3: Visual check**

Run `npm run preview:status`; if nothing is running, `npm run preview`. With the browser tools, view at 1280px and 400px wide: `/`, `/services/`, `/services/business-advice/`, `/services/practice-digitization/`, `/services/websites/`, `/zh-hant/`, `/zh-hant/fuwu/zhensuo-shuweihua/`, and `/services/paid-advertising/` (must land on `/services/websites/`). Confirm: three service cards per homepage; the worth-more section renders; no clipped or overflowing text; source links are underlined. Then `npm run preview:stop`.

- [ ] **Step 4: Commit docs, push, open the PR, and stop**

```bash
git add CLAUDE.md
git commit -m "Document the practice repositioning, retired-service redirects and pillar map

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01V3F6Xwi4r3Ggp3N5bsedoy"
git push -u origin feat/practice-services
```

Open the PR with `gh pr create --base main --title "Reposition the services around independent health practices"` and this body:

```markdown
Moves Pasadena Works from general small-business services to three for independent health practices — a Practice Checkup, Digitize the office, and Get more patients — in all four languages.

- Spec: docs/superpowers/specs/2026-09-14-practice-services-design.md
- Sources: docs/superpowers/specs/2026-09-14-practice-services-sources.md
- "Get found on Google" and "Paid and organic marketing" redirect to Get more patients in every locale; nothing that was indexed now 404s.
- Blog posts are unchanged; their end-of-post buttons now lead to the practice services.

## Before merging — owner only
- [ ] A business associate agreement template is ready to sign (the site says Pasadena Works signs one).
- [ ] No existing commissions or referral fees from software vendors (the site says there are none).
- [ ] Recommended: an hour with a healthcare attorney on the HIPAA, BAA, anti-kickback and accessibility statements.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01V3F6Xwi4r3Ggp3N5bsedoy
```

Wait for CI. Read the reported test count from the CI log, amend CLAUDE.md's count if it differs from what Step 1 wrote, commit, push. **Do not merge.** Report the PR URL and the three owner checklist items to the owner.
