# City pages for independent health practices

**Date:** 2026-09-14 · **Status:** built (2026-09-15) · **Branch:** `feat/practice-city-pages`, based on `main`

Follows `2026-09-14-practice-services-design.md` §9 item 1.
This repository is public: no client is named anywhere.

---

## 1. Decisions

| # | Question | Decision |
|---|---|---|
| 1 | Which cities | The nine existing pages plus **San Gabriel**: Pasadena, Altadena, South Pasadena, Glendale, Alhambra, Arcadia, Monrovia, San Marino, Monterey Park, San Gabriel. |
| 2 | What makes a page substantive | **Data-backed.** Each page rests on sourced, city-specific figures: registered clinicians by type, nearby hospitals, and languages residents speak at home. Hard rule 2 is met by facts a reader can check, not by landmarks. |
| 3 | Languages | **All four locales for every city.** The page's reader is the practice owner, who may read Spanish or Chinese regardless of the neighborhood, and the rest of the site is already four-language. The Census language figures become page *content*, not the rule for which translations exist. |
| 4 | Altadena | **Acknowledge the Eaton Fire plainly, with sources, and offer only the help that genuinely applies** — records that burned, Google listings pointing at addresses that no longer exist, temporary locations. No sales push. |
| 5 | Old shopping-district facts | Removed (Laura Scudder, Garvey's storefronts, Renaissance Plaza, Santa Anita Park, Old Town's Friday fair). They say nothing to a clinic owner. A historical detail stays only where it bears on practices. |
| 6 | If research finds nothing real for a city | Stop and bring it to the owner. Never pad a page. |

## 2. URLs

Unchanged. City pages keep `/websites/<slug>/` and the localized hub segments
(`/es/sitios-web/<slug>/`, `/zh-hans/wangzhan-jianshe/<slug>/`,
`/zh-hant/wangzhan-jianzhi/<slug>/`), because every existing page is indexed.
San Gabriel gets slug `san-gabriel`. No redirects are needed: nothing is removed.

**Correction (2026-09-15).** This section originally said the segments were
"derived from the `websites` service slugs". They are not, and have not been
since 2026-09-14: `SEGMENTS.cityHub` in `src/i18n/routes.ts` writes the four
values out longhand, precisely so that renaming or retiring the `websites`
service cannot move every city page's URL. `routes.test.ts` pins them.

## 3. Page structure

`CityCopy` gains a required `sources` field; the invisible `RESEARCHED` HTML
comment is retired in favour of it.

```ts
export interface CitySource {
  /** What the reader sees, e.g. "CMS NPI Registry, queried September 2026". */
  label: string;
  /** https only. Rendered as a link. */
  url: string;
}

export interface CityCopy {
  title: string;
  summary: string;
  /** Plain-text paragraphs. No raw HTML. */
  body: string[];
  meta: string;
  /** Required and non-empty: a city page cannot build without its sources. */
  sources: [CitySource, ...CitySource[]];
}
```

`CityBody.astro` renders the paragraphs, then a short "Sources" list whose
heading is a new UI string in all four locales.

Each city's `body` has three paragraphs, in this order:

1. **The practice landscape.** Registered dentists, optometrists, and
   primary-care physicians (family and internal medicine) practising in the
   city, and the licensed general acute care hospitals in or immediately
   beside it, named as they name themselves. Figures carry their date.
2. **Patients and language.** The share of residents aged five and over who
   speak Spanish and who speak Chinese at home, and what that means for a
   practice's website, intake forms, and Google Business Profile.
3. **What we would do here.** Tied to paragraph 1 and 2's facts for *this*
   city, pointing at the Checkup, Digitize the office, or Get more patients.
   A paragraph that would read the same with a different city name swapped in
   fails hard rule 2 and is rewritten.

Titles and meta follow the service pages' pattern; English `meta` is 150–158
characters.

**Superseded (2026-09-15).** The title pattern proposed here, "Practice
consulting in {City}", is not what shipped. The owner's pattern is what people
search for — the outcome, not the service:

| Locale | Title |
|---|---|
| `en` | `More patients for medical and dental practices in {City}` |
| `es` | `Más pacientes para consultorios médicos y dentales en {City}` |
| `zh-hans` | `为{中文名}（{City}）医疗与牙科诊所带来更多患者` |
| `zh-hant` | `為{中文名}（{City}）醫療與牙科診所帶來更多病患` |

All four are pinned by `src/data/cities.test.ts`, Altadena included, and the
Chinese name in each is the one name that city carries per script (the "Chinese
city names" table in the sources file).

## 4. Data sources and methods

Every figure is reproducible from these, and the exact query is recorded in a
sources file (`2026-09-14-practice-city-pages-sources.md`) produced during
implementation.

| Figure | Source | Method |
|---|---|---|
| Clinicians by type | CMS NPI Registry API v2.1 (`npiregistry.cms.hhs.gov/api/`); reader-facing link to the registry search | `city=<CITY>&state=CA&enumeration_type=NPI-1`, one query per `taxonomy_description` in {Dentist, Optometrist, Family Medicine, Internal Medicine}; paginate `limit=200` with `skip` until a page returns fewer than 200; de-duplicate by NPI; family and internal medicine combined as "primary-care physicians". If a count reaches the API's 1,200-result ceiling, the page says "more than 1,200", never a guessed number. Verified working for Monrovia on 2026-09-14 (30 dentists, 20 optometrists). |
| Hospitals | California HCAI licensed facility list (the ArcGIS `facilitylist` feature service) | Facility type general acute care hospital, `FacilityStatus = 'A'`, `City` in the city or an adjoining one; a neighbouring hospital is described as nearby, never as in the city. |
| Language at home | U.S. Census Bureau ACS 5-year estimates, table C16001, via Census Reporter (`api.censusreporter.org`; the Census API itself now requires a key) | Spanish = `C16001003 / C16001001`; Chinese (incl. Mandarin, Cantonese) = `C16001021 / C16001001`; one decimal place; release named on the page. Verified 2026-09-14, ACS 2024 5-year: see §4a. |
| Eaton Fire | CAL FIRE incident page; Catalyst California's rebuilding tracker | 9,418 structures destroyed, 19 deaths (CAL FIRE); rebuilding pace as of the tracker's latest figure. |

### 4a. Language figures already verified (ACS 2024 5-year, residents 5+)

| City | Census place | Spanish | Chinese |
|---|---|---|---|
| Alhambra | 16000US0600884 | 23.0% | 33.0% |
| Altadena (CDP) | 16000US0601290 | 21.3% | 1.7% |
| Arcadia | 16000US0602462 | 9.3% | 37.6% |
| Glendale | 16000US0630000 | 13.7% | 0.9% |
| Monrovia | 16000US0648648 | 30.1% | 6.7% |
| Monterey Park | 16000US0648914 | 16.4% | 42.1% |
| Pasadena | 16000US0656000 | 24.2% | 5.5% |
| San Gabriel | 16000US0667042 | 15.1% | 40.1% |
| San Marino | 16000US0668224 | 3.2% | 43.8% |
| South Pasadena | 16000US0673220 | 11.6% | 14.7% |

Implementation re-queries and records these rather than trusting this table,
and confirms each place ID resolves to the named city: on the first attempt
`16000US0648816` was tried for Monterey Park and returned Montebello; the
correct ID, `16000US0648914`, is the one in the table.

## 5. Copy rules

- The register bands apply to every city page in every locale, measured on the
  built page, raised by hand: en FK 13–15, es Fernández Huerta 40–55, zh
  register 0.55–0.85 with no sentence over 85 characters.
- No "leverage", "solutions", "empower", "transformation".
- Every figure carries its date or release; a translation carries the same
  figures and asserts nothing the English does not.
- Product and regulatory names from their owners' localized pages, as in the
  services work; Taiwan usage for `zh-hant`; polarity re-read.
- Altadena: no urgency language, no offer that would read as capitalising on
  the fire.

## 6. Other changes

- **`site.serviceArea`:** add San Gabriel (the footer and homepage city lists
  and the JSON-LD follow it).
- **City hub:** the English hub's hardcoded description and intro, and
  `ui.ts` `citiesTitle` / `citiesDescription` / `citiesIntro` in all four
  locales, re-aimed at practices. With every city in every locale, each
  localized hub and footer lists all ten.
- **`cities.ts` header comment:** rewritten to describe the data-backed method
  and why all four locales now exist, so a later session does not "fix" the
  locale set back to a partial one.
- **CLAUDE.md:** hard rule 1's "expect nothing" example moves from Glendale
  (which gains translations) to an English-only page such as `/glossary/`,
  with a positive control; hard rule 2 records the data-backed method; the
  "city pages: check the facts survived" list is replaced with the new
  figures.

## 7. Verification

- `npm run typecheck`, `npm run test`, `npm run build` green; no build warnings.
- **New tests:** every city has all four locales; every city has at least two
  sources, all `https`; every number in a translated body matches the English
  body's numbers (figure parity); the `cities.test.ts` assertion that Arcadia
  has exactly two locales is replaced, with the reasoning.
- Hard rule 1: each city page emits four alternates plus `x-default`; the new
  English-only example still emits none, and a positive control proves the
  grep matches on a translated page.
- Readability: all 40 city pages in band.
- Chinese script purity on all city copy; grammar guards clean.
- Visual check at 1280px and 400px: the hub, Altadena, San Gabriel, and one
  Chinese city page, including the sources list.

## 8. Out of scope

The practice content plan and blog pillars, success stories, and per-specialty
pages (services spec §9 items 2–4). The 62 scheduled posts keep publishing as
planned (owner decision, 2026-09-14).

## 9. Branching

This branch began stacked on `feat/practice-services`. That base merged as #75
and was deleted, and #76 followed, so the branch was replayed onto `main` with
`git rebase --onto`, dropping the commits #75's squash already carried. It now
opens a pull request against `main` like any other.
