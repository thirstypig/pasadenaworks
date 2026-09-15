import type { Locale } from '../i18n/ui';
import { LOCALES } from '../i18n/ui';
import { copy as en } from './city-copy/en';
import { copy as es } from './city-copy/es';
import { copy as zhHans } from './city-copy/zh-hans';
import { copy as zhHant } from './city-copy/zh-hant';

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CITY LANDING PAGES — READ THIS BEFORE ADDING OR EDITING A CITY.
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  Near-identical pages with the city name swapped out are the classic
 *  "doorway page" pattern. Google indexes them and ranks none of them.
 *
 *  Every page rests on figures a reader can check: registered clinicians
 *  practicing in the city (CMS NPI Registry), the licensed general acute care
 *  hospitals in or beside it (California HCAI), and the languages residents
 *  speak at home (Census ACS 5-year, table C16001). Each page lists its
 *  sources, and `sources` is a required, non-empty field, so a page cannot
 *  build without them. A paragraph that would read the same with another
 *  city's name and numbers swapped in is rewritten, not shipped;
 *  `cities.test.ts` masks names and figures and fails on a repeat.
 *
 *  The figures come from `scripts/city-data.mjs` and are recorded, with the
 *  query date and method, in
 *  `docs/superpowers/specs/2026-09-14-practice-city-pages-sources.md`. That
 *  file is the only source copy may cite. Re-run the script and update it
 *  before reusing a number past its query date.
 *
 *  The copy itself lives in `city-copy/<locale>.ts`, one module per language.
 *
 *  WHY EVERY CITY EXISTS IN ALL FOUR LANGUAGES. The reader of a city page is
 *  the practice owner, not the neighborhood, and an owner may read Spanish or
 *  Chinese wherever the practice is. So the Census language shares are page
 *  CONTENT, not the rule for which translations exist. Do not "fix" the
 *  locale set back to a partial one because a city's Chinese share is small.
 *
 *  `cityLocales()` still reads the data rather than assuming four locales, so
 *  a future city can exist in fewer languages without the routing or hreflang
 *  code ever claiming a translation that does not exist (hard rule 1).
 */

export interface CitySource {
  /** What the reader sees, e.g. "CMS NPI Registry, queried September 2026". */
  label: string;
  /** https only. Rendered as a link. */
  url: string;
}

export interface CityCopy {
  /** Page <title> and <h1> text. */
  title: string;
  /** One sentence shown under the heading. */
  summary: string;
  /** Exactly three plain-text paragraphs. No HTML. */
  body: string[];
  meta: string;
  /** Required and non-empty: a city page cannot build without its sources. */
  sources: [CitySource, ...CitySource[]];
}

export const CITY_SLUGS = [
  'pasadena', 'altadena', 'south-pasadena', 'glendale', 'alhambra',
  'arcadia', 'monrovia', 'san-marino', 'monterey-park', 'san-gabriel',
] as const;
export type CitySlug = (typeof CITY_SLUGS)[number];

export interface City {
  /** URL slug. Not translated — city names read the same across languages
   *  in the URL, only the surrounding path segments translate. */
  slug: CitySlug;
  /** Copy per locale, read from the `city-copy` modules. */
  t: Partial<Record<Locale, CityCopy>>;
}

const COPY: Record<Locale, Partial<Record<CitySlug, CityCopy>>> = { en, es, 'zh-hans': zhHans, 'zh-hant': zhHant };

export const cities: City[] = CITY_SLUGS.map((slug) => ({
  slug,
  t: Object.fromEntries(LOCALES.flatMap((l) => (COPY[l][slug] ? [[l, COPY[l][slug]]] : []))),
}));

/**
 * "south-pasadena" -> "South Pasadena".
 *
 * ONE implementation, deliberately. This existed twice — in `Footer.astro` and
 * in `pages/websites/index.astro` — and the two had DIVERGED: the `.filter(Boolean)`
 * guard below was added to the Footer copy during todo 020 and never to the
 * other. Measured, not assumed: on `-pasadena` or `south--pasadena` the
 * unguarded copy threw `Cannot read properties of undefined (reading
 * 'toUpperCase')` at build time, pointing at a `.map()` rather than at the bad
 * slug. That is todos/016's whole thesis caught in the act — a fix applied to
 * one copy of a duplicated answer and not the other.
 *
 * `.filter(Boolean)`: a doubled or leading hyphen yields an empty segment, and
 * `word[0]` on it is undefined — `noUncheckedIndexedAccess` is off, so it types
 * as `string` and throws at runtime instead of being caught by the compiler.
 */
export function cityDisplayName(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

/** The locales a given city has real, published copy for. This is the only
 *  source of truth routing/hreflang code should use — never assume a city
 *  has all four locales. */
export function cityLocales(city: City): Locale[] {
  return (Object.keys(city.t) as Locale[]).filter((locale) => Boolean(city.t[locale]));
}

export function cityBySlug(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}
