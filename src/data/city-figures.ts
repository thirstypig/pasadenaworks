import type { CitySlug } from './cities';

/**
 * The city-page figures as STRUCTURED DATA, for the data strip.
 *
 * These same numbers already appear inside the prose in `city-copy/*.ts`. They
 * are duplicated here on purpose: the strip needs them as values it can draw a
 * bar from, and a component cannot read a number out of a sentence.
 *
 * THE SPEC IS THE AUTHORITY, NOT THIS FILE.
 * `docs/superpowers/specs/2026-09-14-practice-city-pages-sources.md` records
 * every query and its date; each number below is transcribed from it. Hard
 * rule 2 in CLAUDE.md is what makes that matter — a city page has to say
 * something real, and a number that has drifted from its source says something
 * false with total confidence.
 *
 * `city-figures.test.ts` re-reads the spec and fails if any value here stops
 * matching it, so the duplication cannot rot silently. If you re-run
 * `scripts/city-data.mjs`, update the spec first and this file second.
 *
 * Counts are individual clinicians with a practice LOCATION in the city, by
 * primary taxonomy — not offices. Language shares are of residents aged five
 * and over who speak that language at home.
 */
export interface CityFigures {
  /** CMS NPI Registry, primary taxonomy, LOCATION address in the city. */
  dentists: number;
  optometrists: number;
  /** Family + internal medicine, generalist codes only (no subspecialists). */
  primaryCare: number;
  /** ACS 2024 5-year, table C16001, percent of residents aged 5+. */
  spanishAtHome: number;
  chineseAtHome: number;
  /** Licensed general acute care hospitals INSIDE the city. May be empty. */
  hospitals: string[];
  /** Hospitals in an adjoining city. Never described as being in this city. */
  nearbyHospitals: string[];
}

/** Query month shown on the strip, for every figure above. */
export const FIGURES_QUERIED = '2026-09' as const;

export const CITY_FIGURES: Record<CitySlug, CityFigures> = {
  pasadena: {
    dentists: 213,
    optometrists: 93,
    primaryCare: 227,
    spanishAtHome: 24.2,
    chineseAtHome: 5.5,
    hospitals: ['Huntington Hospital'],
    nearbyHospitals: [],
  },
  altadena: {
    dentists: 14,
    optometrists: 1,
    primaryCare: 1,
    spanishAtHome: 21.3,
    chineseAtHome: 1.7,
    hospitals: [],
    nearbyHospitals: ['Huntington Hospital'],
  },
  'south-pasadena': {
    dentists: 45,
    optometrists: 12,
    primaryCare: 11,
    spanishAtHome: 11.6,
    chineseAtHome: 14.7,
    hospitals: [],
    nearbyHospitals: ['Alhambra Hospital Medical Center', 'Huntington Hospital'],
  },
  glendale: {
    dentists: 305,
    optometrists: 66,
    primaryCare: 237,
    spanishAtHome: 13.7,
    chineseAtHome: 0.9,
    hospitals: [
      'Adventist Health Glendale',
      'USC Verdugo Hills Hospital',
      'Glendale Memorial Hospital and Health Center',
    ],
    nearbyHospitals: [],
  },
  alhambra: {
    dentists: 91,
    optometrists: 16,
    primaryCare: 68,
    spanishAtHome: 23.0,
    chineseAtHome: 33.0,
    hospitals: ['Alhambra Hospital Medical Center'],
    nearbyHospitals: [
      'San Gabriel Valley Medical Center',
      'Garfield Medical Center',
      'Monterey Park Hospital',
    ],
  },
  arcadia: {
    dentists: 144,
    optometrists: 35,
    primaryCare: 100,
    spanishAtHome: 9.3,
    chineseAtHome: 37.6,
    hospitals: ['USC Arcadia Hospital'],
    nearbyHospitals: ['Monrovia Memorial Hospital'],
  },
  monrovia: {
    dentists: 25,
    optometrists: 15,
    primaryCare: 13,
    spanishAtHome: 30.1,
    chineseAtHome: 6.7,
    hospitals: ['Monrovia Memorial Hospital'],
    nearbyHospitals: ['USC Arcadia Hospital'],
  },
  'san-marino': {
    dentists: 18,
    optometrists: 2,
    primaryCare: 17,
    spanishAtHome: 3.2,
    chineseAtHome: 43.8,
    hospitals: [],
    nearbyHospitals: ['San Gabriel Valley Medical Center', 'Huntington Hospital'],
  },
  'monterey-park': {
    dentists: 69,
    optometrists: 27,
    primaryCare: 62,
    spanishAtHome: 16.4,
    chineseAtHome: 42.1,
    hospitals: ['Garfield Medical Center', 'Monterey Park Hospital'],
    nearbyHospitals: ['Alhambra Hospital Medical Center'],
  },
  'san-gabriel': {
    dentists: 106,
    optometrists: 31,
    primaryCare: 47,
    spanishAtHome: 15.1,
    chineseAtHome: 40.1,
    hospitals: ['San Gabriel Valley Medical Center'],
    nearbyHospitals: ['Alhambra Hospital Medical Center'],
  },
};

/** Largest clinician count on a page, so the three bars share one scale. */
export function barScale(f: CityFigures): number {
  return Math.max(f.dentists, f.optometrists, f.primaryCare);
}
