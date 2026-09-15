# Practice City Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the nine small-business city pages with ten data-backed pages for independent health practices, every one in all four languages, without losing any published city URL.

**Architecture:** Figures come from three public sources through one committed, dependency-free script (`scripts/city-data.mjs`) whose output and exact queries are recorded in a sources file. `src/data/cities.ts` keeps the types, slugs and helpers; the copy moves into one module per locale under `src/data/city-copy/`, so each language can be written and reviewed without touching the others. Every city page renders a "Sources" list, which the readability scorer treats as furniture.

**Tech Stack:** Astro 7 (static, GitHub Pages), TypeScript, Vitest, Node 22 `fetch`.

**Spec:** `docs/superpowers/specs/2026-09-14-practice-city-pages-design.md` — the decisions in §1 are the owner's and are not reopened here. Read both documents.

## Global Constraints

- **No new dependencies.** Production dependencies stay exactly `astro`, `@astrojs/sitemap`, `@astrojs/rss`, `@fontsource/anton`, `@fontsource/source-serif-4`.
- **Cities (slug → display name):** `pasadena`, `altadena`, `south-pasadena`, `glendale`, `alhambra`, `arcadia`, `monrovia`, `san-marino`, `monterey-park`, `san-gabriel` (new). Display names come from `cityDisplayName()`.
- **URLs do not change.** `SEGMENTS.cityHub` stays `websites` / `sitios-web` / `wangzhan-jianshe` / `wangzhan-jianzhi` (pinned by `routes.test.ts`). Spec §2's reason is stale: the segment is written out in `src/i18n/routes.ts`, not derived from a service slug. The conclusion stands.
- **Every URL already published must still build:** 9 English city pages, `/es/sitios-web/alhambra/`, `/zh-hans/wangzhan-jianshe/alhambra/`, `/zh-hant/wangzhan-jianzhi/alhambra/`, `/zh-hant/wangzhan-jianzhi/arcadia/`, `/zh-hans/wangzhan-jianshe/monterey-park/`.
- **English title (H1 and `<title>`), exactly:** `Medical and dental practice consulting in {City}`. Chosen over the spec's "Practice consulting in {City}" because practice owners search "medical practice consultant" and "dental practice consultant", and "practice consulting" alone also reads as law or accounting.
- **Localized title patterns:** `es` `Asesoría para consultorios médicos y dentales en {City}`; `zh-hans` `{城市名}（{City}）医疗与牙科诊所顾问`; `zh-hant` `{城市名}（{City}）醫療與牙科診所顧問`. A translator may change the wording only on research evidence recorded in the sources file.
- **Body:** exactly three plain-text paragraphs per city and locale (landscape · patients and language · what we would do here), no HTML. Altadena's are described in Task 2.
- **Meta bands (characters):** `en` 150–158, `es` 130–160 (same as `services.test.ts`).
- **Register bands (built pages, `npm run readability -- --dist`):** `en` Flesch-Kincaid 13–15 · `es` Fernández Huerta 40–55 · `zh-hans`/`zh-hant` register index 0.55–0.85 and no sentence over 85 characters. Close gaps **by hand, one page at a time, re-measuring after each edit. Never run a regex or sweep over prose.**
- **Copy rules:** no "leverage", "solutions", "empower", "transformation". American spelling. Every figure carries its date or release. Nothing is claimed that a source on the page does not support.
- **Translation method:** every figure from the English, phrasing from research; a translation never asserts more than its English twin; product and regulatory names from their owners' localized pages (`Perfil de Negocio de Google`, `Google 商家资料`, `Google 商家檔案`); Taiwan usage for `zh-hant` (use the `writing-taiwan-mandarin-copy` skill first). Figures stay in Arabic digits in every language, with a period as the decimal mark. Re-read every comparative, negation and modal against the English before committing.
- **Altadena:** acknowledge the Eaton Fire plainly with sources; no urgency language; nothing that reads as capitalizing on the fire; say that registry and Census figures predate it.
- **Public repository:** no client is named or described anywhere — code, docs, commits, PR.
- **Never `rm -rf` inside the project** (move to the session scratchpad). Never commit `dist/` or screenshots.
- **Scoped readability check** for city pages (run after `npm run build`). Save once to `$TMPDIR/city-readability.mjs`, replacing `REPO` with the output of `pwd`:

  ```js
  import { reportDist, TARGETS, sentenceGuard } from 'REPO/scripts/readability.mjs';
  const re = /^\/((es\/sitios-web)|(zh-hans\/wangzhan-jianshe)|(zh-hant\/wangzhan-jianzhi)|websites)\/[^/]+\/index\.html$/;
  for (const r of reportDist('REPO/dist').filter((r) => re.test(r.page))) {
    const t = TARGETS[r.locale];
    console.log((r.tooShort ? 'SHORT' : r.verdict).padEnd(6), String(r[t.metric]).padStart(6), (sentenceGuard(r) ?? '').padEnd(8), r.page);
  }
  ```

  Run: `node "$TMPDIR/city-readability.mjs"`. Done means every row for the locale you touched reads `ok`, none reads `SHORT` or `runaway`.

---

### Task 1: The figures, and where they came from

**Files:**
- Create: `scripts/city-data.mjs`
- Create: `scripts/city-data.test.mjs`
- Create: `docs/superpowers/specs/2026-09-14-practice-city-pages-sources.md`

**Interfaces:**
- Produces: `docs/superpowers/specs/2026-09-14-practice-city-pages-sources.md` — per city: dentists, optometrists, primary-care physicians (each with query date), hospitals in the city and nearby (HCAI name and facility number), Spanish and Chinese shares with ACS release, plus the Eaton Fire figures. Tasks 2–5 take every number from this file and nowhere else.

- [ ] **Step 1: Write the failing test** — `scripts/city-data.test.mjs`

```js
import { describe, it, expect } from 'vitest';
import { primaryTaxonomy, practisesIn, countGroup, GROUPS, placeMatches, pct } from './city-data.mjs';

const provider = (number, taxonomies, addresses) => ({ number, taxonomies, addresses });
const loc = (city) => ({ address_purpose: 'LOCATION', city, state: 'CA' });
const mail = (city) => ({ address_purpose: 'MAILING', city, state: 'CA' });

describe('city-data counting rules', () => {
  it('counts a provider by PRIMARY taxonomy only', () => {
    // The registry's taxonomy filter is a substring match on ANY taxonomy, so a
    // query for "Dentist" returned a training-program student whose secondary
    // taxonomy was Dentist (Monrovia, 2026-09-15).
    const student = provider(1, [
      { desc: 'Student in an Organized Health Care Education/Training Program', code: '390200000X', primary: true },
      { desc: 'Dentist', code: '122300000X', primary: false },
    ], [loc('MONROVIA')]);
    expect(primaryTaxonomy(student).desc).toMatch(/^Student/);
    expect(countGroup([student], GROUPS.dentists, 'MONROVIA')).toBe(0);
  });

  it('counts a practice LOCATION, never a mailing address', () => {
    const mailOnly = provider(2, [{ desc: 'Dentist', code: '122300000X', primary: true }], [mail('MONROVIA'), loc('ARCADIA')]);
    expect(practisesIn(mailOnly, 'MONROVIA')).toBe(false);
    expect(practisesIn(mailOnly, 'ARCADIA')).toBe(true);
  });

  it('includes dental and optometry specialties but only generalist primary care', () => {
    const ortho = provider(3, [{ desc: 'Dentist, Orthodontics and Dentofacial Orthopedics', code: '1223X0400X', primary: true }], [loc('ARCADIA')]);
    const hygienist = provider(4, [{ desc: 'Dental Hygienist', code: '124Q00000X', primary: true }], [loc('ARCADIA')]);
    const cardio = provider(5, [{ desc: 'Internal Medicine, Cardiovascular Disease', code: '207RC0000X', primary: true }], [loc('ARCADIA')]);
    const fm = provider(6, [{ desc: 'Family Medicine', code: '207Q00000X', primary: true }], [loc('ARCADIA')]);
    expect(countGroup([ortho, hygienist], GROUPS.dentists, 'ARCADIA')).toBe(1);
    expect(countGroup([cardio, fm], GROUPS.primaryCare, 'ARCADIA')).toBe(1);
  });

  it('de-duplicates a provider returned by two queries', () => {
    const im = provider(7, [{ desc: 'Internal Medicine', code: '207R00000X', primary: true }], [loc('ALHAMBRA')]);
    expect(countGroup([im, im], GROUPS.primaryCare, 'ALHAMBRA')).toBe(1);
  });

  it('rejects a Census place ID that resolves to a different city', () => {
    // 16000US0648816 was first tried for Monterey Park and returned Montebello.
    expect(placeMatches('Montebello, CA', 'Monterey Park')).toBe(false);
    expect(placeMatches('Monterey Park, CA', 'Monterey Park')).toBe(true);
    expect(placeMatches('Altadena CDP, CA', 'Altadena')).toBe(true);
    expect(placeMatches('South Pasadena, CA', 'Pasadena')).toBe(false);
  });

  it('rounds a share to one decimal place', () => {
    expect(pct(4011, 10000)).toBe('40.1');
    expect(pct(1, 3)).toBe('33.3');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run scripts/city-data.test.mjs`
Expected: FAIL — `Failed to load url ./city-data.mjs`.

- [ ] **Step 3: Write the script** — `scripts/city-data.mjs`

```js
/**
 * The figures behind the city pages, fetched from their public sources.
 *
 *   node scripts/city-data.mjs > "$TMPDIR/city-data.json"
 *
 * Re-run it when the pages are refreshed; the sources file in
 * docs/superpowers/specs/ records what it returned and when. Three sources,
 * all keyless:
 *
 * - CMS NPI Registry API v2.1. Two traps, both found by querying: the city
 *   filter also matches MAILING addresses unless address_purpose=LOCATION, and
 *   the taxonomy filter is a substring match against EVERY taxonomy a provider
 *   lists, so results are re-filtered here by primary taxonomy.
 * - California HCAI licensed facility list (ArcGIS). General acute care,
 *   active, not closed.
 * - ACS 5-year table C16001 through Census Reporter, because the Census
 *   Bureau's own API now requires a key.
 */
import { isMain } from './is-main.mjs';

export const CITIES = [
  // hcai[0] is the city itself; the rest are adjoining cities, whose hospitals
  // the page may call "nearby" and never "in" the city.
  { name: 'Pasadena', npi: 'PASADENA', hcai: ['Pasadena'], census: '16000US0656000' },
  { name: 'Altadena', npi: 'ALTADENA', hcai: ['Altadena', 'Pasadena'], census: '16000US0601290' },
  { name: 'South Pasadena', npi: 'SOUTH PASADENA', hcai: ['South Pasadena', 'Pasadena', 'Alhambra'], census: '16000US0673220' },
  { name: 'Glendale', npi: 'GLENDALE', hcai: ['Glendale'], census: '16000US0630000' },
  { name: 'Alhambra', npi: 'ALHAMBRA', hcai: ['Alhambra', 'San Gabriel', 'Monterey Park'], census: '16000US0600884' },
  { name: 'Arcadia', npi: 'ARCADIA', hcai: ['Arcadia', 'Monrovia'], census: '16000US0602462' },
  { name: 'Monrovia', npi: 'MONROVIA', hcai: ['Monrovia', 'Arcadia'], census: '16000US0648648' },
  { name: 'San Marino', npi: 'SAN MARINO', hcai: ['San Marino', 'Pasadena', 'San Gabriel'], census: '16000US0668224' },
  { name: 'Monterey Park', npi: 'MONTEREY PARK', hcai: ['Monterey Park', 'Alhambra'], census: '16000US0648914' },
  { name: 'San Gabriel', npi: 'SAN GABRIEL', hcai: ['San Gabriel', 'Alhambra'], census: '16000US0667042' },
];

export const GROUPS = {
  dentists: { queries: ['Dentist'], matches: (t) => t.desc.startsWith('Dentist') },
  optometrists: { queries: ['Optometrist'], matches: (t) => t.desc.startsWith('Optometrist') },
  // Generalist codes only: a cardiologist is filed under Internal Medicine too.
  primaryCare: {
    queries: ['Family Medicine', 'Internal Medicine'],
    matches: (t) => t.code === '207Q00000X' || t.code === '207R00000X',
  },
};

export const primaryTaxonomy = (p) => p.taxonomies.find((t) => t.primary) ?? null;

export const practisesIn = (p, npiCity) =>
  p.addresses.some((a) => a.address_purpose === 'LOCATION' && a.state === 'CA' && a.city === npiCity);

export function countGroup(providers, group, npiCity) {
  const seen = new Set();
  for (const p of providers) {
    const t = primaryTaxonomy(p);
    if (t && group.matches(t) && practisesIn(p, npiCity)) seen.add(p.number);
  }
  return seen.size;
}

export const placeMatches = (censusName, city) => censusName.split(',')[0].replace(/ CDP$/, '') === city;

export const pct = (part, whole) => ((part / whole) * 100).toFixed(1);

const PAGE = 200;

/** Every provider for one query. The API refuses skip > 1000, so 1,200 is a
 *  ceiling: a full last page means the true count may be higher. */
async function npiAll(npiCity, taxonomy) {
  const providers = [];
  for (let skip = 0; skip <= 1000; skip += PAGE) {
    const url = new URL('https://npiregistry.cms.hhs.gov/api/');
    const params = {
      version: '2.1', state: 'CA', city: npiCity, enumeration_type: 'NPI-1',
      address_purpose: 'LOCATION', taxonomy_description: taxonomy, limit: String(PAGE), skip: String(skip),
    };
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NPI ${res.status}: ${url}`);
    const body = await res.json();
    if (body.Errors) throw new Error(`NPI ${JSON.stringify(body.Errors)}: ${url}`);
    const page = body.results ?? [];
    providers.push(...page);
    if (page.length < PAGE) return { providers, capped: false };
  }
  return { providers, capped: true };
}

async function hospitals(cityNames) {
  const url = new URL('https://services5.arcgis.com/fMBfBrOnc6OOzh7V/arcgis/rest/services/facilitylist/FeatureServer/0/query');
  const list = cityNames.map((c) => `'${c.replace(/'/g, "''")}'`).join(',');
  url.searchParams.set('where', `LicenseType='General Acute Care' AND FacilityStatus='A' AND City IN (${list})`);
  url.searchParams.set('outFields', 'FacilityNbr,FacilityName,City,Date_Closed');
  url.searchParams.set('returnGeometry', 'false');
  url.searchParams.set('f', 'json');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HCAI ${res.status}`);
  const body = await res.json();
  if (body.error) throw new Error(`HCAI ${JSON.stringify(body.error)}`);
  return body.features
    .map((f) => f.attributes)
    .filter((a) => a.Date_Closed == null)
    .map((a) => ({ name: a.FacilityName, number: a.FacilityNbr, city: a.City }));
}

async function languages(ids) {
  const res = await fetch(`https://api.censusreporter.org/1.0/data/show/latest?table_ids=C16001&geo_ids=${ids.join(',')}`);
  if (!res.ok) throw new Error(`Census Reporter ${res.status}`);
  return res.json();
}

if (isMain(import.meta.url)) {
  const queried = new Date().toISOString().slice(0, 10);
  const census = await languages(CITIES.map((c) => c.census));
  const out = { queried, acsRelease: census.release.name, cities: [] };
  for (const city of CITIES) {
    const geo = census.geography[city.census];
    if (!placeMatches(geo.name, city.name)) throw new Error(`${city.census} is ${geo.name}, not ${city.name}`);
    const e = census.data[city.census].C16001.estimate;
    const counts = {};
    for (const [key, group] of Object.entries(GROUPS)) {
      const all = [];
      let capped = false;
      for (const q of group.queries) {
        const r = await npiAll(city.npi, q);
        all.push(...r.providers);
        capped ||= r.capped;
      }
      counts[key] = { count: countGroup(all, group, city.npi), capped };
    }
    const hs = await hospitals(city.hcai);
    out.cities.push({
      name: city.name,
      clinicians: counts,
      hospitalsInCity: hs.filter((h) => h.city === city.hcai[0]),
      hospitalsNearby: hs.filter((h) => h.city !== city.hcai[0]),
      spanish: pct(e.C16001003, e.C16001001),
      chinese: pct(e.C16001021, e.C16001001),
      censusPlace: `${city.census} (${geo.name})`,
    });
  }
  console.log(JSON.stringify(out, null, 2));
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run scripts/city-data.test.mjs`
Expected: PASS, 6 tests.

- [ ] **Step 5: Run the script and read the output**

Run: `node scripts/city-data.mjs > "$TMPDIR/city-data.json"` then read the file.
Expected: ten cities, no thrown place mismatch, no `capped: true` (if one is capped, the page says "more than 1,200"). Language shares should sit within 0.1 of the spec's §4a table; a larger gap means a new ACS release, so name the release that was used.

Check the hospital names by hand. HCAI licenses some buildings separately and truncates names (`HH-CSHS TERRI  JERRY KOHL MEDICAL PAVIL` sits on Huntington Hospital's campus). A page names each hospital as the hospital names itself and mentions a campus once, never a licensed building as if it were another hospital. Record every such judgment in the sources file.

- [ ] **Step 6: Verify the Eaton Fire figures**

Fetch the CAL FIRE incident page (`https://www.fire.ca.gov/incidents/2025/1/7/eaton-fire`) once. If it confirms structures destroyed and fatalities, use its numbers and link it. If it blocks scripts, use one readable secondary source that cites CAL FIRE (Los Angeles County's recovery site first) and say so in the sources file. Then do the same for a current rebuilding figure: Catalyst California's tracker as the spec names it, or the county's permit dashboard. Use a figure only if a page you actually read states it, with its date.

- [ ] **Step 7: Write the sources file**

`docs/superpowers/specs/2026-09-14-practice-city-pages-sources.md`: a heading per city with every figure the pages may use, its value, the query or URL that produced it, and the date. Add a methods section (copy the counting rules from the script header: primary taxonomy, practice location, generalist primary-care codes, the 1,200 ceiling, hospitals "nearby" only from an adjoining city) and the Eaton Fire section. Also include the reader-facing source links each page will cite:
- NPI: `https://npiregistry.cms.hhs.gov/search`
- HCAI: `https://data.chhs.ca.gov/dataset/healthcare-facility-locations`, if it loads; otherwise the HCAI facility-finder page that does
- Census: `https://censusreporter.org/tables/C16001/?geo_ids=<censusId>`

Confirm each URL responds before listing it.

- [ ] **Step 8: Commit**

```bash
git add scripts/city-data.mjs scripts/city-data.test.mjs docs/superpowers/specs/2026-09-14-practice-city-pages-sources.md
git commit -m "Fetch and record the figures behind the city pages"
```

---

### Task 2: Sources on the page, and the English city pages

**Files:**
- Modify: `src/data/cities.ts` (types, header comment, slugs, assembly; copy moves out)
- Create: `src/data/city-copy/en.ts`, `es.ts`, `zh-hans.ts`, `zh-hant.ts`
- Modify: `src/components/CityBody.astro`
- Modify: `src/i18n/ui.ts` (`hub.citySources` in the interface and all four locales)
- Modify: `src/data/site.ts` (add `'San Gabriel'` to `serviceArea` after `'Monterey Park'`)
- Modify: `scripts/readability.mjs` (`mainProse()` drops `ul.city-sources`)
- Test: `src/data/cities.test.ts`, `scripts/readability.test.mjs`

**Interfaces:**
- Consumes: the sources file from Task 1.
- Produces:

```ts
// src/data/cities.ts
export interface CitySource { label: string; url: string }
export interface CityCopy {
  title: string; summary: string;
  /** Exactly three plain-text paragraphs. No HTML. */
  body: string[];
  meta: string;
  /** Required and non-empty: a city page cannot build without its sources. */
  sources: [CitySource, ...CitySource[]];
}
export const CITY_SLUGS: readonly ['pasadena', 'altadena', 'south-pasadena', 'glendale', 'alhambra', 'arcadia', 'monrovia', 'san-marino', 'monterey-park', 'san-gabriel'];
export type CitySlug = (typeof CITY_SLUGS)[number];
export interface City { slug: CitySlug; t: Partial<Record<Locale, CityCopy>> }
// src/data/city-copy/<locale>.ts
export const copy: Partial<Record<CitySlug, CityCopy>>;
```

Each locale module is `Partial`, so Tasks 3–5 can land in any order and a future city can still exist in fewer languages. The four-language requirement is a test (Task 6), not a type.

- [ ] **Step 1: Write the failing tests**

Replace the `cityLocales` block in `src/data/cities.test.ts` and add the blocks below it. Keep the `cityBySlug` and `cityDisplayName` blocks as they are, but change `cityBySlug('monterey-park')` to also assert `cityBySlug('san-gabriel')?.slug`.

```ts
import { cities, cityLocales, cityBySlug, cityDisplayName, type CityCopy } from './cities';

const COPY: CityCopy = { title: 't', summary: 's', body: ['b'], meta: 'm', sources: [{ label: 'l', url: 'https://example.com/' }] };

describe('cityLocales', () => {
  it('reports only the locales a city defines, never a fixed list', () => {
    // Synthetic cities on purpose. Every real city now carries all four
    // locales, so the old data-driven "the shapes must differ" check could no
    // longer fail — and a function returning a hardcoded four-locale list is
    // exactly what hard rule 1 forbids.
    expect(cityLocales({ slug: 'pasadena', t: { en: COPY } })).toEqual(['en']);
    expect(cityLocales({ slug: 'arcadia', t: { en: COPY, 'zh-hant': COPY } }).sort()).toEqual(['en', 'zh-hant']);
    expect(cityLocales({ slug: 'alhambra', t: { en: COPY, es: undefined } })).toEqual(['en']);
  });

  it('agrees with the data for every real city', () => {
    expect(cities.length).toBe(10);
    for (const city of cities) {
      expect(cityLocales(city).sort()).toEqual(
        (Object.keys(city.t) as (keyof typeof city.t)[]).filter((l) => city.t[l]).sort(),
      );
    }
  });
});

/** Figures a reader could check, with formatting that legitimately differs
 *  between languages removed: thousands separators, and a Chinese
 *  "2026 年 9 月", reduced to its year because English writes the month as a word. */
function figures(text: string): string[] {
  return (text.replace(/(\d{4})\s*年\s*\d{1,2}\s*月/g, '$1').match(/\d+(?:[.,]\d+)*/g) ?? [])
    .map((n) => n.replace(/,(?=\d{3}\b)/g, ''))
    .sort();
}

const prose = (c: CityCopy) => [c.summary, ...c.body].join(' ');

describe('city copy', () => {
  it('normalizes figures the same way in every language', () => {
    expect(figures('1,200 dentists and 23.0% in September 2026')).toEqual(figures('2026 年 9 月，1200 名牙醫，23.0%'));
    expect(figures('26 dentists')).not.toEqual(figures('62 dentists'));
  });

  it('gives every page three plain paragraphs and at least two https sources', () => {
    for (const city of cities) {
      for (const locale of cityLocales(city)) {
        const c = city.t[locale]!;
        const where = `${city.slug}/${locale}`;
        expect(c.body, where).toHaveLength(3);
        for (const p of [c.title, c.summary, c.meta, ...c.body]) expect(p, where).not.toMatch(/[<>]/);
        expect(c.sources.length, where).toBeGreaterThanOrEqual(2);
        for (const s of c.sources) {
          expect(new URL(s.url).protocol, `${where}: ${s.url}`).toBe('https:');
          expect(s.label.trim(), where).not.toBe('');
        }
      }
    }
  });

  it('titles every English page with the searched phrase', () => {
    for (const city of cities) {
      expect(city.t.en!.title).toBe(`Medical and dental practice consulting in ${cityDisplayName(city.slug)}`);
    }
  });

  it('keeps meta descriptions in the service pages’ bands', () => {
    const BAND = { en: [150, 158], es: [130, 160] } as const;
    for (const city of cities) {
      for (const locale of ['en', 'es'] as const) {
        const c = city.t[locale];
        if (!c) continue;
        const n = [...c.meta].length;
        expect(n, `${city.slug}/${locale} meta is ${n}`).toBeGreaterThanOrEqual(BAND[locale][0]);
        expect(n, `${city.slug}/${locale} meta is ${n}`).toBeLessThanOrEqual(BAND[locale][1]);
      }
    }
  });

  it('never reuses a paragraph with only the city name and figures swapped (hard rule 2)', () => {
    // The doorway pattern a data-backed page is most tempted by: one template,
    // new numbers. Longest names first, so "South Pasadena" masks before "Pasadena".
    const names = cities.map((c) => cityDisplayName(c.slug)).sort((a, b) => b.length - a.length);
    const mask = (p: string) =>
      names.reduce((s, n) => s.replaceAll(n, '<CITY>'), p).replace(/\d+(?:[.,]\d+)*/g, '<N>');
    const seen = new Map<string, string>();
    for (const city of cities) {
      for (const p of city.t.en!.body) {
        const key = mask(p);
        expect(seen.get(key), `${city.slug} repeats a paragraph from ${seen.get(key)}`).toBeUndefined();
        seen.set(key, city.slug);
      }
    }
    expect(seen.size).toBe(cities.length * 3);
  });

  it('carries exactly the English figures into every translation', () => {
    for (const city of cities) {
      for (const locale of cityLocales(city).filter((l) => l !== 'en')) {
        expect(figures(prose(city.t[locale]!)), `${city.slug}/${locale}`).toEqual(figures(prose(city.t.en!)));
      }
    }
  });
});
```

In `scripts/readability.test.mjs`, directly after `'excludes the service-area city list'`:

```js
  /**
   * A city page's source list is citations, not prose: "CMS NPI Registry,
   * queried September 2026" would score as a five-word sentence per item and
   * drag every city page toward the bottom of its band.
   */
  it('excludes a city page’s source list', () => {
    const out = mainProse('<main><p>Real prose about the practice.</p><ul class="city-sources"><li><a href="https://x.example/">CMS NPI Registry, queried September 2026</a></li></ul></main>');
    expect(out).toContain('Real prose');
    expect(out).not.toContain('NPI Registry');
  });
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/data/cities.test.ts scripts/readability.test.mjs`
Expected: FAIL. `CityCopy` has no `sources` (type), `cities.length` is 9, the title and three-paragraph tests fail, and the source-list exclusion test fails on `NPI Registry`.

- [ ] **Step 3: Restructure the data**

`src/data/cities.ts`: replace the header comment with one that describes the data-backed method (every page rests on registry, hospital and Census figures a reader can check; a paragraph that reads the same with another city's name and numbers swapped in is rewritten; the figures come from `scripts/city-data.mjs` and are recorded in `docs/superpowers/specs/2026-09-14-practice-city-pages-sources.md`). Say why all four locales exist: the reader is the practice owner, who may read Spanish or Chinese wherever the practice is, so language share is page *content*, not the rule for which translations exist. Say that `cityLocales()` still reads the data, so a future city can exist in fewer languages without claiming a translation. Delete `RESEARCHED` and the raw-HTML note. Then:

```ts
import type { Locale } from '../i18n/ui';
import { LOCALES } from '../i18n/ui';
import { copy as en } from './city-copy/en';
import { copy as es } from './city-copy/es';
import { copy as zhHans } from './city-copy/zh-hans';
import { copy as zhHant } from './city-copy/zh-hant';

// (interfaces CitySource, CityCopy exactly as in Interfaces above)

export const CITY_SLUGS = [
  'pasadena', 'altadena', 'south-pasadena', 'glendale', 'alhambra',
  'arcadia', 'monrovia', 'san-marino', 'monterey-park', 'san-gabriel',
] as const;
export type CitySlug = (typeof CITY_SLUGS)[number];

export interface City {
  slug: CitySlug;
  t: Partial<Record<Locale, CityCopy>>;
}

const COPY: Record<Locale, Partial<Record<CitySlug, CityCopy>>> = { en, es, 'zh-hans': zhHans, 'zh-hant': zhHant };

export const cities: City[] = CITY_SLUGS.map((slug) => ({
  slug,
  t: Object.fromEntries(LOCALES.flatMap((l) => (COPY[l][slug] ? [[l, COPY[l][slug]]] : []))),
}));
```

Keep `cityDisplayName`, `cityLocales` and `cityBySlug` unchanged, and move the orphaned doc comment above `cityLocales` back onto it. `LOCALES` must be exported from `ui.ts` already (it is imported that way by the route files). If a circular import appears, import it from `../i18n/locales.mjs` instead.

Each `city-copy/*.ts` starts:

```ts
import type { CityCopy, CitySlug } from '../cities';

export const copy: Partial<Record<CitySlug, CityCopy>> = {
};
```

`es`, `zh-hans` and `zh-hant` stay empty in this task. The old translated small-business copy is removed, and Tasks 3–5 restore those URLs with new copy.

- [ ] **Step 4: Render the sources**

`src/components/CityBody.astro`:

```astro
---
import type { CityCopy } from '../data/cities';
import type { Locale } from '../i18n/ui';
import { t } from '../i18n/utils';

interface Props {
  copy: CityCopy;
  locale: Locale;
}

const { copy, locale } = Astro.props;
const strings = t(locale);
---

<div class="city-body prose">
  {copy.body.map((paragraph) => <p>{paragraph}</p>)}
  <h2 class="city-sources__heading">{strings.hub.citySources}</h2>
  <ul class="city-sources">
    {copy.sources.map((s) => (
      <li><a href={s.url} rel="noopener">{s.label}</a></li>
    ))}
  </ul>
</div>

<style>
  .city-sources__heading {
    font-size: var(--step-0);
    margin-top: var(--space-6);
  }
  .city-sources {
    font-size: var(--step--1);
    padding-left: var(--space-4);
  }
</style>
```

Check that `--step--1`, `--space-4` and `--space-6` exist in `src/styles/global.css`, and substitute the nearest existing tokens if not; never hardcode sizes. Pass `locale="en"` in `src/pages/websites/[city].astro` and `locale={locale}` in `src/pages/[locale]/[section]/[service].astro`.

`src/i18n/ui.ts`: add `citySources: string;` to `hub` in `UIStrings`, with values `en` `'Sources'`, `es` `'Fuentes'`, `zh-hans` `'资料来源'`, `zh-hant` `'資料來源'`.

`scripts/readability.mjs` `mainProse()`, directly after the `service-area` line:

```js
  // A city page's source list is citations, not prose (2026-09-15).
  t = t.replace(/<ul\b[^>]*\bclass="[^"]*\bcity-sources\b[^"]*"[^>]*>[\s\S]*?<\/ul>/g, ' ');
```

`src/data/site.ts`: add `'San Gabriel',` after `'Monterey Park',`.

- [ ] **Step 5: Write the ten English pages**

In `src/data/city-copy/en.ts`, one entry per slug, in `CITY_SLUGS` order. Every figure comes from the sources file, with its date or release. For each city:
- `title`: the Global Constraints pattern.
- `summary`: one sentence, true of this city only.
- `body[0]`, the practice landscape: the three clinician counts (registry date), and the hospitals in the city, or nearby hospitals clearly marked as in the adjoining city.
- `body[1]`, patients and language: the Spanish and Chinese shares (ACS release), and what they mean *here* for a practice's website, intake forms and Google Business Profile. A city at 0.9% Chinese says something different from one at 43.8%, and the page should read that way.
- `body[2]`, what we would do here: tied to this city's facts, pointing at the Practice Checkup, *Digitize the office* or *Get more patients* by name. No links in body text: the body is plain text.
- `meta`: 150–158 characters.
- `sources`: NPI, HCAI and Census links as recorded, each labelled with its date or release, for example `CMS NPI Registry, queried September 2026`.

**If the figures give a city nothing real to say** (for example, a clinician count so small that paragraph 3 could only be generic), stop and report it to the orchestrator rather than padding (spec §1.6). The owner decides.

**Altadena** follows the same three slots, with different content. `body[0]` states the Eaton Fire's toll with its source and says the registry and Census figures predate it, then gives them. `body[1]` gives the language shares under that caveat. `body[2]` offers only what applies (patient records that burned, Google listings pointing at addresses that no longer exist, working from temporary locations), with no urgency and no offer framed around the fire. Its sources add the fire source(s).

- [ ] **Step 6: Run the unit tests**

Run: `npx vitest run src/data/cities.test.ts scripts/readability.test.mjs`
Expected: PASS.

- [ ] **Step 7: Build and measure**

Run: `npm run build 2>&1 | tee "$TMPDIR/build.log" | tail -3`, then `grep -i 'warn' "$TMPDIR/build.log"`, then `node "$TMPDIR/city-readability.mjs"`.
Expected: build succeeds with no warnings, and all ten `/websites/<slug>/` rows read `ok` against FK 13–15, none `SHORT` or `runaway`. For each row out of band, edit that page's prose by hand, rebuild and re-measure. Then run `grep -o 'hreflang="[^"]*"' dist/websites/san-gabriel/index.html`. It should print nothing (English-only for now), and as a positive control `grep -c 'city-sources' dist/websites/san-gabriel/index.html` should print 1.

- [ ] **Step 8: Typecheck and full suite**

Run: `npm run typecheck` then `npm run test`
Expected: 0 errors; all tests pass. `homepage-parity.test.ts` or `home.test.ts` may count `serviceArea`. If one fails because San Gabriel was added, update the expectation and say so in the commit.

- [ ] **Step 9: Commit**

```bash
git add src/data/cities.ts src/data/city-copy src/components/CityBody.astro src/i18n/ui.ts src/data/site.ts scripts/readability.mjs scripts/readability.test.mjs src/data/cities.test.ts src/pages/websites/\[city\].astro "src/pages/[locale]/[section]/[service].astro"
git commit -m "Rebuild the English city pages on registry, hospital and Census figures"
```

---

### Task 3: Spanish city pages

**Files:**
- Modify: `src/data/city-copy/es.ts` (this file only)

**Interfaces:**
- Consumes: `CityCopy`, `CitySlug` from `src/data/cities.ts`; the ten English entries in `src/data/city-copy/en.ts`; the sources file.
- Produces: ten `es` entries. `/es/sitios-web/<slug>/` builds for every city.

- [ ] **Step 1: Research the phrasing.** Search how US Spanish-language practice owners phrase "medical practice consulting" and "dental office" (for example `asesoría para consultorios dentales`, `consultoría para clínicas médicas`), and use Google's own `es-419` help pages for Google Business Profile terms. Record the choices, with URLs, in a short "Spanish phrasing" section of the sources file.

- [ ] **Step 2: Translate all ten pages.** Keep the `es` title pattern, the same three slots, and the same figures with a period as the decimal mark. Keep the `sources` URLs, with labels translated (`Registro NPI de los CMS, consultado en septiembre de 2026`). Meta 130–160 characters. For Altadena, carry the same caveats and no more.

- [ ] **Step 3: Run the data tests.**

Run: `npx vitest run src/data/cities.test.ts`
Expected: PASS. The figure-parity test now compares ten Spanish pages; a mismatch names the city.

- [ ] **Step 4: Build and measure.**

Run: `npm run build 2>&1 | tail -3` then `node "$TMPDIR/city-readability.mjs"`
Expected: every `/es/sitios-web/<slug>/` row reads `ok` (Fernández Huerta 40–55; lower is harder). Fix by hand, one page at a time.

- [ ] **Step 5: Polarity read.** Re-read every sentence containing `no`, `nunca`, `solo`, `más`, `menos`, `debe` or `puede` against its English twin.

- [ ] **Step 6: Commit**

```bash
git add src/data/city-copy/es.ts docs/superpowers/specs/2026-09-14-practice-city-pages-sources.md
git commit -m "Translate the city pages into Spanish"
```

---

### Task 4: Simplified Chinese city pages

**Files:**
- Modify: `src/data/city-copy/zh-hans.ts` (this file only)

**Interfaces:** as Task 3, producing ten `zh-hans` entries at `/zh-hans/wangzhan-jianshe/<slug>/`.

- [ ] **Step 1: City names and phrasing.** Confirm each city's Chinese name as the local Chinese-language press and city governments write it (e.g. 帕萨迪纳, 阿罕布拉, 圣盖博, 蒙特利公园, 阿凯迪亚), since readers search for these names. Record each name and one source URL in a "Chinese city names" table in the sources file, with both scripts' forms. Google terms come from `support.google.com/...?hl=zh-CN` (`Google 商家资料`).

- [ ] **Step 2: Translate all ten pages** with the `zh-hans` title pattern, the same figures in Arabic digits (`23.0%`, `2026 年 9 月`), source labels in Chinese with the same URLs, and a register that raises formality through word choice (因此, 然而, 并非), not through length. No sentence over 85 characters. For Altadena, carry the same caveats and no more.

- [ ] **Step 3: Run** `npx vitest run src/data/cities.test.ts src/utils/blog-content.test.ts`. **Expected:** PASS. The script-purity guards are in `blog-content.test.ts`; if they only cover the blog, run `grep -nP '[\x{4E00}-\x{9FFF}]' src/data/city-copy/zh-hans.ts` and check by eye that no Traditional-only characters appear.

- [ ] **Step 4: Build and measure** with the scoped check. **Expected:** every `/zh-hans/wangzhan-jianshe/<slug>/` row reads `ok` (register 0.55–0.85), no `runaway`.

- [ ] **Step 5: Polarity read** of every 不/没/并非/只/更/较/应/可以/会 sentence against the English. English "can" is 可以 or 能, never 会.

- [ ] **Step 6: Commit**

```bash
git add src/data/city-copy/zh-hans.ts docs/superpowers/specs/2026-09-14-practice-city-pages-sources.md
git commit -m "Translate the city pages into Simplified Chinese"
```

---

### Task 5: Traditional Chinese city pages

**Files:**
- Modify: `src/data/city-copy/zh-hant.ts` (this file only)

**Interfaces:** as Task 3, producing ten `zh-hant` entries at `/zh-hant/wangzhan-jianzhi/<slug>/`.

- [ ] **Step 1: Load the `writing-taiwan-mandarin-copy` skill.** Take city names from Task 4's table (Traditional column; if Task 4 has not landed, research them and add the Traditional column yourself). Google terms come from `?hl=zh-TW` (`Google 商家檔案`).

- [ ] **Step 2: Translate all ten pages** from the English, not from the Simplified text: Taiwan lexis (資料, 網站, 軟體), full-width punctuation, the `zh-hant` title pattern, the same figures, and Chinese source labels. No sentence over 85 characters. For Altadena, carry the same caveats and no more.

- [ ] **Step 3: Run** `npx vitest run src/data/cities.test.ts`. **Expected:** PASS.

- [ ] **Step 4: Build and measure** with the scoped check. **Expected:** every `/zh-hant/wangzhan-jianzhi/<slug>/` row reads `ok`, no `runaway`.

- [ ] **Step 5: Polarity read** as in Task 4 (不/沒/並非/只/更/較/應/可以/會).

- [ ] **Step 6: Commit**

```bash
git add src/data/city-copy/zh-hant.ts docs/superpowers/specs/2026-09-14-practice-city-pages-sources.md
git commit -m "Translate the city pages into Traditional Chinese"
```

---

### Task 6: Hubs, the built-page guards, and the docs

**Files:**
- Modify: `src/pages/websites/index.astro` (description and intro)
- Modify: `src/i18n/ui.ts` (`citiesDescription`, `citiesIntro` × 4 locales)
- Modify: `src/i18n/homepage-parity.test.ts:82` (comment quotes the old Arcadia title)
- Create: `src/data/city-pages.test.ts`
- Modify: `src/data/cities.test.ts` (four-locale completeness)
- Modify: `CLAUDE.md`, `README.md` if it describes city pages, `docs/superpowers/specs/2026-09-14-practice-city-pages-design.md` (§2 reason; status)

**Interfaces:**
- Consumes: all four `city-copy` modules complete.

- [ ] **Step 1: Write the failing tests**

Append to `src/data/cities.test.ts` (import `LOCALES` from `'../i18n/ui'`):

```ts
describe('city coverage', () => {
  it('every city exists in all four languages', () => {
    // A test, not a type: City.t stays Partial so a future city CAN exist in
    // fewer languages without claiming a translation. Today's decision (spec
    // §1.3) is all four, and this is what holds the site to it.
    for (const city of cities) expect(cityLocales(city).sort(), city.slug).toEqual([...LOCALES].sort());
  });
});
```

Create `src/data/city-pages.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cities } from './cities';
import { SEGMENTS, localeUrl } from '../i18n/routes';
import { LOCALES } from '../i18n/ui';
import { reportDist } from '../../scripts/readability.mjs';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '../../dist');
const file = (url: string) => join(DIST, url, 'index.html');

/**
 * APPEND-ONLY. Every city URL this site has ever published, written out
 * literally rather than derived from cities.ts — a derived list moves with a
 * rename and could never catch one. Same reasoning as retired-services.test.ts.
 */
const PUBLISHED = [
  '/websites/pasadena/', '/websites/altadena/', '/websites/south-pasadena/', '/websites/glendale/',
  '/websites/alhambra/', '/websites/arcadia/', '/websites/monrovia/', '/websites/san-marino/',
  '/websites/monterey-park/', '/es/sitios-web/alhambra/', '/zh-hans/wangzhan-jianshe/alhambra/',
  '/zh-hant/wangzhan-jianzhi/alhambra/', '/zh-hant/wangzhan-jianzhi/arcadia/',
  '/zh-hans/wangzhan-jianshe/monterey-park/',
  // 2026-09-15
  '/websites/san-gabriel/',
];

describe.skipIf(!existsSync(DIST))('built city pages', () => {
  it('still builds every city URL ever published', () => {
    for (const url of PUBLISHED) expect(existsSync(file(url)), url).toBe(true);
  });

  it('emits four alternates plus x-default on every city page, in every language', () => {
    let pages = 0;
    for (const city of cities) {
      for (const locale of LOCALES) {
        const html = readFileSync(file(localeUrl(locale, SEGMENTS.cityHub[locale], city.slug)), 'utf8');
        const langs = [...html.matchAll(/hreflang="([^"]+)"/g)].map((m) => m[1]).sort();
        expect(langs, `${locale} ${city.slug}`).toEqual([...LOCALES, 'x-default'].sort());
        expect(html, `${locale} ${city.slug} has no sources list`).toMatch(/class="city-sources"/);
        pages++;
      }
    }
    expect(pages).toBe(40);
  });

  it('keeps an English-only page free of alternates (hard rule 1, with its control)', () => {
    const glossary = readFileSync(join(DIST, 'glossary', 'index.html'), 'utf8');
    expect(glossary).toMatch(/<h1/); // control: the file is the real page
    expect(glossary).not.toMatch(/hreflang=/);
  });

  it('scores every city page inside its reading band', () => {
    const urls = new Set(cities.flatMap((c) => LOCALES.map((l) => `${localeUrl(l, SEGMENTS.cityHub[l], c.slug)}index.html`)));
    const rows = reportDist(DIST).filter((r) => urls.has(r.page));
    expect(rows).toHaveLength(40);
    for (const r of rows) {
      expect(r.tooShort, `${r.page} is too short to score`).toBe(false);
      expect(r.verdict, r.page).toBe('ok');
    }
  });
});
```

Verify two things by hand before trusting this file. First, `localeUrl('en', 'websites', 'pasadena')` returns `/websites/pasadena/`, with both slashes, so that `+ 'index.html'` matches `reportDist`'s `page` shape (`/websites/pasadena/index.html`). Adjust the concatenation if it does not. Second, `/glossary/` really emits no hreflang today (`grep -c hreflang dist/glossary/index.html`). If it does, pick a page that does not, and say so in the test comment.

- [ ] **Step 2: Run to verify.** Run `npm run build` then `npx vitest run src/data/city-pages.test.ts src/data/cities.test.ts`. **Expected:** PASS if Tasks 3–5 are complete. To prove the guards are not decorative, temporarily delete one `es` entry: the four-language test and the alternates test must both fail. Restore the entry with `git checkout -- src/data/city-copy/es.ts` and confirm `git diff --quiet src/data/city-copy/es.ts`.

- [ ] **Step 3: Re-aim the hubs.** In `src/pages/websites/index.astro`, the description becomes ``Consulting for independent medical, dental, and eye care practices in ${names}.`` and the intro paragraph says the practices work across the San Gabriel Valley and each city page starts from its own registry and Census figures. In `ui.ts`, write `citiesDescription` and `citiesIntro` to match in all four locales, following the same translation constraints. These are hub summaries, reported but not scored, so keep them plain.

- [ ] **Step 4: Update the stale comment** at `src/i18n/homepage-parity.test.ts:82` so its example is the new `zh-hant` Arcadia title as it appears in `zh-hant.ts`.

- [ ] **Step 5: Docs**
  - `CLAUDE.md` hard rule 1: the verify block becomes `dist/glossary/index.html   # expect nothing` plus a positive control on `dist/websites/alhambra/index.html   # expect 4 + x-default`.
  - Hard rule 2: replace "commercial districts" with the data-backed method and the masked-paragraph test.
  - "City pages: check the facts survived": replace the list (1926, Laura Scudder, …) with "assert that the figures in the sources file appear in the built pages, and run `npm run test`, whose parity test compares every translation's figures with the English".
  - Where-things-live tree: add `city-copy/` under `src/data/`.
  - "Known outstanding work": city pages are no longer deferred, and city photos are the follow-up.
  - Test and typecheck counts: set these from the actual output of `npm run test` without `dist/` (move `dist` to the scratchpad, run, move it back), and from `npm run typecheck`.
  - Spec: status becomes `built`, and §2's reason now points at `routes.ts`.
  - `README.md`: grep for `city` and update only claims that became false.

- [ ] **Step 6: Full gate**

Run in order: `npm run typecheck`, `npm run build 2>&1 | tee "$TMPDIR/build.log" | tail -3`, `grep -ci 'warn' "$TMPDIR/build.log"`, `npm run test`, `npm run readability -- --dist; echo "exit $?"`.
Expected: 0 type errors; build succeeds; 0 warnings; all tests pass; readability exits 0.

- [ ] **Step 7: Visual check.** Check `npm run preview:status` first, then run `npm run preview`. Screenshot `/websites/`, `/websites/altadena/`, `/websites/san-gabriel/` and `/zh-hant/wangzhan-jianzhi/arcadia/` at 1280px and at 400px, saving the images to the session scratchpad only. Confirm the sources list sits below the body at a smaller size, links wrap without horizontal scroll at 400px, the footer lists ten cities without overflowing, and the Chinese hub's items use the body font. Stop the server with `npm run preview:stop`.

- [ ] **Step 8: Commit**

```bash
git add src/pages/websites/index.astro src/i18n/ui.ts src/i18n/homepage-parity.test.ts src/data/city-pages.test.ts src/data/cities.test.ts CLAUDE.md docs/superpowers/specs/2026-09-14-practice-city-pages-design.md README.md
git commit -m "Re-aim the city hubs at practices and guard the built city pages"
```

---

## Out of scope

- **City photos.** The owner asked for them on 2026-09-15, and each photo is the owner's pick. After this lands, shortlist candidates per city with `npm run unsplash -- search` (Wikimedia Commons CC0 or CC BY as a fallback; no share-alike; nothing of the fire for Altadena) and add hero-image support to the city pages as its own change.
- The practice content plan, success stories and per-specialty pages (services spec §9).
