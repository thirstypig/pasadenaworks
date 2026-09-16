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

/**
 * Pull `label: **number**` pairs out of a spec section.
 *
 * WHY THIS IS NOT A BAG OF NUMBERS. The first version of this check collected
 * every bolded integer in the section and asserted `toContain` for each figure.
 * That is order-blind and label-blind, so it could not catch the one error it
 * was written to catch — a transcription that puts the right numbers against
 * the wrong fields. Proven 2026-09-16: swapping Arcadia's `acupuncturists: 60`
 * and `physicalTherapists: 83` left the ENTIRE suite green (436 passed), while
 * the page printed both figures under the wrong labels. Monterey Park happened
 * to be caught, but only by the separate Chinese-cities assertion below, and
 * only because that city is in it.
 *
 * So each number is now tied to the label the spec wrote beside it.
 */
function specFigures(section: string): Record<string, number> {
  const out: Record<string, number> = {};
  // "Dentists: **213**", "Primary-care physicians (…): **227**",
  // "; optometrists: **35**", "Physical therapists: **83**".
  for (const m of section.matchAll(/([A-Za-z][A-Za-z- ]*?)\s*(?:\([^)]*\))?\s*:\s*\*\*([\d,]+)\*\*/g)) {
    const key = m[1].trim().toLowerCase().replace(/\s+/g, ' ');
    out[key] = Number(m[2].replace(/,/g, ''));
  }
  return out;
}

/** The spec's label for each field, lower-cased as `specFigures` returns it. */
const SPEC_LABEL: Record<string, string[]> = {
  dentists: ['dentists'],
  optometrists: ['optometrists'],
  primaryCare: ['primary-care physicians'],
  acupuncturists: ['acupuncturists'],
  physicalTherapists: ['physical therapists'],
};

  it.each(CITY_SLUGS)('%s: every count matches the number beside its own label', (slug) => {
    const section = specSection(SPEC_HEADING[slug as CitySlug]);
    expect(section, `no spec section for ${slug}`).not.toBe('');
    const f = CITY_FIGURES[slug as CitySlug];
    const spec = specFigures(section);

    for (const [field, labels] of Object.entries(SPEC_LABEL)) {
      const label = labels.find((l) => l in spec);
      expect(label, `${slug}: spec has no label for ${field}`).toBeDefined();
      expect(spec[label!], `${slug}.${field} disagrees with the spec's "${label}"`).toBe(
        f[field as keyof typeof f] as number
      );
    }
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

/**
 * Read a JPEG's real pixel dimensions from its SOF marker.
 *
 * No dependency: the production five are the whole point of this repo's
 * dependency discipline, and this is ~15 lines. Walks the segment chain from
 * SOI, stopping at the first Start-Of-Frame — 0xC0 baseline or 0xC2
 * progressive, both of which these files use — where height and width sit at
 * offsets 5 and 7 past the marker.
 */
function jpegSize(file: string): { width: number; height: number } | null {
  const b = readFileSync(file);
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i < b.length - 9) {
    if (b[i] !== 0xff) { i++; continue; }
    const marker = b[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    const len = b.readUInt16BE(i + 2);
    // SOF0/1/2/3 and 9/10/11; skip DHT (0xC4), DAC (0xCC), which share the range.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}

  it('every image exists AND is really the size the data claims', () => {
    // The first version of this test carried this name and only called
    // existsSync — a typo in width or height shipped green and produced
    // layout shift on a site whose whole strategy is organic search. The
    // declared numbers drive the <img width>/<height> attributes, so they are
    // what reserves space before the file loads.
    for (const slug of CITY_SLUGS) {
      const p = CITY_PHOTOS[slug as CitySlug];
      const file = join(ROOT, 'public', p.src.replace(/^\//, ''));
      expect(existsSync(file), `missing ${file}`).toBe(true);
      const real = jpegSize(file);
      expect(real, `${slug}: could not read JPEG dimensions`).not.toBeNull();
      expect(real!.width, `${slug} declares width ${p.width}`).toBe(p.width);
      expect(real!.height, `${slug} declares height ${p.height}`).toBe(p.height);
    }
  });

  it('every photo is 3:2 landscape, the shape the layout reserves', () => {
    for (const slug of CITY_SLUGS) {
      const p = CITY_PHOTOS[slug as CitySlug];
      expect(p.width / p.height, `${slug} is not 3:2`).toBeCloseTo(1.5, 2);
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
