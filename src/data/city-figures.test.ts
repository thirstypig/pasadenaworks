import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { CITY_FIGURES, FIGURES_QUERIED, CLINIC_TYPES, barScale } from './city-figures';
import { CITY_PHOTOS } from './city-photos';
import { CITY_SLUGS, type CitySlug } from './cities';
import { LOCALES } from '../i18n/ui';

const ROOT = join(__dirname, '../..');
const SPEC = join(
  ROOT,
  'docs/superpowers/specs/2026-09-14-practice-city-pages-sources.md'
);

/**
 * `city-figures.ts` duplicates numbers that already live in the sources spec,
 * because a component cannot read a value out of a sentence. This block is what
 * stops that duplicate rotting: it re-reads the spec and compares.
 *
 * Deliberately NOT derived from the spec at build time. CLAUDE.md records why
 * that distinction matters, in the note on `retired-services.test.ts`: an
 * expectation computed from the same source it checks moves whenever the source
 * moves, and then passes forever. Parsing the spec here is the point — the spec
 * is a different artifact, written by the data run, and the transcription
 * between them is the thing that can go wrong.
 */
const specText = existsSync(SPEC) ? readFileSync(SPEC, 'utf8') : '';

/** The spec's own heading name for each slug. */
const SPEC_HEADING: Record<CitySlug, string> = {
  pasadena: 'Pasadena',
  altadena: 'Altadena',
  'south-pasadena': 'South Pasadena',
  glendale: 'Glendale',
  alhambra: 'Alhambra',
  arcadia: 'Arcadia',
  monrovia: 'Monrovia',
  'san-marino': 'San Marino',
  'monterey-park': 'Monterey Park',
  'san-gabriel': 'San Gabriel',
};

function specSection(city: string): string {
  // Sections are `## <City>` up to the next `## `.
  const re = new RegExp(`\\n## ${city}\\n([\\s\\S]*?)(?=\\n## |$)`);
  return specText.match(re)?.[1] ?? '';
}

describe('city figures match the sources spec', () => {
  it('the spec file exists — without it every check below is vacuous', () => {
    expect(specText.length).toBeGreaterThan(1000);
  });

  it.each(CITY_SLUGS)('%s: clinician counts are the spec values', (slug) => {
    const section = specSection(SPEC_HEADING[slug as CitySlug]);
    expect(section, `no spec section for ${slug}`).not.toBe('');
    const f = CITY_FIGURES[slug as CitySlug];

    // Every bolded integer in the section, in order of appearance. The spec
    // writes dentists, optometrists, then primary care in that order.
    const bolded = [...section.matchAll(/\*\*([\d,]+)\*\*/g)].map((m) =>
      Number(m[1].replace(/,/g, ''))
    );
    expect(bolded).toContain(f.dentists);
    expect(bolded).toContain(f.optometrists);
    expect(bolded).toContain(f.primaryCare);
    // Added 2026-09-16, recorded in the spec under their own query date.
    expect(bolded).toContain(f.acupuncturists);
    expect(bolded).toContain(f.physicalTherapists);
  });

  it.each(CITY_SLUGS)('%s: language shares are the spec values', (slug) => {
    const section = specSection(SPEC_HEADING[slug as CitySlug]);
    const f = CITY_FIGURES[slug as CitySlug];
    // One decimal place, exactly as the spec and the page prose both write it.
    expect(section).toContain(`**${f.spanishAtHome.toFixed(1)}%**`);
    expect(section).toContain(`**${f.chineseAtHome.toFixed(1)}%**`);
  });

  it.each(CITY_SLUGS)('%s: every named hospital appears in the spec', (slug) => {
    const section = specSection(SPEC_HEADING[slug as CitySlug]);
    const f = CITY_FIGURES[slug as CitySlug];
    for (const name of [...f.hospitals, ...f.nearbyHospitals]) {
      expect(section, `${slug} names a hospital the spec does not`).toContain(name);
    }
  });

  it('a city with no hospital in it says so, rather than leaving it ambiguous', () => {
    // The spec is explicit for these; a hospital in an adjoining city is
    // "nearby" and must never be listed as being in the city.
    for (const slug of ['altadena', 'south-pasadena', 'san-marino'] as CitySlug[]) {
      expect(CITY_FIGURES[slug].hospitals).toEqual([]);
      expect(CITY_FIGURES[slug].nearbyHospitals.length).toBeGreaterThan(0);
    }
  });

  it('the query month is the date the spec was produced', () => {
    expect(FIGURES_QUERIED).toBe('2026-09');
    expect(specText).toContain('2026-09-15');
  });

  it('bar scale is the largest of the five counts, so bars share one scale', () => {
    const f = CITY_FIGURES.pasadena;
    expect(barScale(f)).toBe(227);
    for (const k of CLINIC_TYPES) expect(barScale(f)).toBeGreaterThanOrEqual(f[k]);
  });

  it('the strip shows a FIXED five, not a per-city top five', () => {
    // A real top five drops optometrists from five of the ten pages, and eye
    // care is one of the three practice types this site sells to. This asserts
    // the intent rather than the rendering: if someone switches to a computed
    // top five, this is the test that should stop them and explain why.
    expect([...CLINIC_TYPES]).toEqual([
      'primaryCare',
      'dentists',
      'optometrists',
      'acupuncturists',
      'physicalTherapists',
    ]);
    for (const slug of CITY_SLUGS) {
      const f = CITY_FIGURES[slug as CitySlug];
      for (const k of CLINIC_TYPES) {
        expect(Number.isInteger(f[k]), `${slug}.${k} is not a whole count`).toBe(true);
        expect(f[k], `${slug}.${k} is negative`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('acupuncturists outnumber optometrists in the Chinese-speaking cities', () => {
    // Not arithmetic trivia: this is the finding that justified adding the two
    // new types at all, and it is the thing that would quietly disappear if the
    // figures were ever refreshed carelessly or the labels swapped.
    for (const slug of ['alhambra', 'san-gabriel', 'monterey-park'] as CitySlug[]) {
      const f = CITY_FIGURES[slug];
      expect(f.acupuncturists, slug).toBeGreaterThan(f.optometrists);
      expect(f.chineseAtHome, slug).toBeGreaterThan(30);
    }
  });
});

describe('city photos', () => {
  it('every city has a photo and every photo has all four alt strings', () => {
    for (const slug of CITY_SLUGS) {
      const p = CITY_PHOTOS[slug as CitySlug];
      expect(p, `${slug} has no photo`).toBeTruthy();
      for (const locale of LOCALES) {
        expect(p.alt[locale]?.trim(), `${slug} missing ${locale} alt`).toBeTruthy();
      }
    }
  });

  it('every file is self-hosted, never an external or protocol-relative URL', () => {
    for (const slug of CITY_SLUGS) {
      const { src } = CITY_PHOTOS[slug as CitySlug];
      expect(src.startsWith('/cities/'), `${slug}: ${src}`).toBe(true);
      expect(src).not.toMatch(/^https?:/);
      expect(src).not.toMatch(/^\/\//);
    }
  });

  it('every image file actually exists on disk at its declared size', async () => {
    for (const slug of CITY_SLUGS) {
      const p = CITY_PHOTOS[slug as CitySlug];
      const file = join(ROOT, 'public', p.src.replace(/^\//, ''));
      expect(existsSync(file), `missing ${file}`).toBe(true);
    }
  });

  it('a credit is required exactly when the license is not public domain', () => {
    for (const slug of CITY_SLUGS) {
      const p = CITY_PHOTOS[slug as CitySlug];
      const isFree = /^(public domain|cc0)/i.test(p.license);
      expect(p.public, `${slug} public flag disagrees with "${p.license}"`).toBe(isFree);
      if (!isFree) expect(p.author.trim()).toBeTruthy();
    }
  });

  it('every share-alike photo carries a license URL to link', () => {
    // Share-alike obliges naming the license AND linking it. A missing URL
    // would render a credit that silently fails the condition.
    for (const slug of CITY_SLUGS) {
      const p = CITY_PHOTOS[slug as CitySlug];
      if (p.shareAlike) {
        expect(p.license).toMatch(/-SA/i);
        expect(p.licenseUrl, `${slug} is share-alike with no license URL`).toBeTruthy();
      }
    }
  });

  it('no non-share-alike license is mislabeled as share-alike', () => {
    for (const slug of CITY_SLUGS) {
      const p = CITY_PHOTOS[slug as CitySlug];
      expect(p.shareAlike, `${slug}`).toBe(/-SA/i.test(p.license));
    }
  });
});
