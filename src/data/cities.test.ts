import { describe, it, expect } from 'vitest';
import { cities, cityLocales, cityBySlug, cityDisplayName, type CityCopy } from './cities';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

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
      expect(city.t.en!.title, city.slug).toBe(`More patients for medical and dental practices in ${cityDisplayName(city.slug)}`);
    }
  });

  it('titles every Spanish page with the searched phrase', () => {
    // The owner's pattern, Altadena included. Reads every city rather than
    // skipping a missing locale, so an untranslated page fails here too.
    for (const city of cities) {
      expect(city.t.es?.title, city.slug).toBe(`Más pacientes para consultorios médicos y dentales en ${cityDisplayName(city.slug)}`);
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

  it('cites the same source URLs, in the same order, in every language', () => {
    // Source links are written out per locale, so a link corrected in en.ts
    // would otherwise leave a translation pointing at the old one with nothing
    // failing (Task 3 review, 2026-09-15).
    let compared = 0;
    for (const city of cities) {
      const english = city.t.en!.sources.map((s) => s.url);
      for (const locale of cityLocales(city).filter((l) => l !== 'en')) {
        expect(city.t[locale]!.sources.map((s) => s.url), `${city.slug}/${locale}`).toEqual(english);
        compared++;
      }
    }
    // Control: with no translations at all this would pass vacuously.
    expect(compared).toBeGreaterThan(0);
  });
});

describe('cityBySlug', () => {
  it('finds a city by its exact slug', () => {
    expect(cityBySlug('monterey-park')?.slug).toBe('monterey-park');
    expect(cityBySlug('san-gabriel')?.slug).toBe('san-gabriel');
  });

  it('returns undefined for a slug that does not exist', () => {
    expect(cityBySlug('nonexistent-city')).toBeUndefined();
  });
});

/**
 * `cityDisplayName` had TWO implementations, and they had diverged.
 *
 * THE BUG THIS EXISTS FOR. The helper lived in both `Footer.astro` and
 * `pages/websites/index.astro`. During todo 020 a `.filter(Boolean)` guard was
 * added to the Footer copy — and only to that one. The other kept the original
 * `.map((word) => word[0].toUpperCase() + ...)`, which throws on a slug with a
 * leading or doubled hyphen because `word[0]` on an empty segment is undefined.
 * `noUncheckedIndexedAccess` is off, so it types as `string` and the compiler
 * cannot see it; the failure is a build-time crash pointing at a `.map()`
 * rather than at the bad slug.
 *
 * Measured before fixing, by running both implementations:
 *
 *   slug              guarded          unguarded
 *   south-pasadena    "South Pasadena" "South Pasadena"
 *   -pasadena         "Pasadena"       THROWS
 *   south--pasadena   "South Pasadena" THROWS
 *
 * The unguarded copy even carried a comment claiming it "matches the same
 * derivation Footer.astro uses" — an assertion that had stopped being true and
 * was hiding the divergence. That comment is gone with it.
 */
const REPO = fileURLToPath(new URL('../..', import.meta.url));

describe('cityDisplayName', () => {
  it('title-cases a normal slug', () => {
    expect(cityDisplayName('south-pasadena')).toBe('South Pasadena');
    expect(cityDisplayName('monterey-park')).toBe('Monterey Park');
    expect(cityDisplayName('alhambra')).toBe('Alhambra');
  });

  it('survives a leading or doubled hyphen instead of throwing at build', () => {
    // The regression. Both of these crashed the unguarded copy.
    expect(cityDisplayName('-pasadena')).toBe('Pasadena');
    expect(cityDisplayName('south--pasadena')).toBe('South Pasadena');
    expect(cityDisplayName('pasadena-')).toBe('Pasadena');
  });

  it('renders every real city slug without throwing', () => {
    for (const city of cities) {
      expect(() => cityDisplayName(city.slug)).not.toThrow();
      expect(cityDisplayName(city.slug).length).toBeGreaterThan(0);
    }
  });

  it('is implemented once, not copied into a page or component', () => {
    // The guard that stops it diverging again. A second `const cityDisplayName`
    // anywhere is the exact shape of the bug above.
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        if (entry === 'node_modules' || entry === 'dist') continue;
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.(ts|astro)$/.test(entry) && !entry.includes('.test.')) {
          const source = readFileSync(full, 'utf8');
          if (/(const|function)\s+cityDisplayName/.test(source) &&
              relative(REPO, full) !== join('src', 'data', 'cities.ts')) {
            offenders.push(relative(REPO, full));
          }
        }
      }
    };
    walk(join(REPO, 'src'));
    expect(
      offenders,
      `these redefine cityDisplayName instead of importing it from src/data/cities.ts:\n  ${offenders.join('\n  ')}`,
    ).toEqual([]);
  });
});
