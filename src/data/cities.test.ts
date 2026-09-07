import { describe, it, expect } from 'vitest';
import { cities, cityLocales, cityBySlug, cityDisplayName } from './cities';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

describe('cityLocales', () => {
  it('reads real locales straight from the data, never assuming all four', () => {
    // Alhambra is written with all 4 locales in the data.
    const alhambra = cityBySlug('alhambra')!;
    expect(cityLocales(alhambra).sort()).toEqual(['en', 'es', 'zh-hans', 'zh-hant'].sort());
  });

  it('returns only the locales a city actually has copy for (en-only city)', () => {
    // Pasadena only has an `en` entry in the data.
    const pasadena = cityBySlug('pasadena')!;
    expect(cityLocales(pasadena)).toEqual(['en']);
  });

  it('returns exactly 2 locales for a partial-translation city (Arcadia: en + zh-hant)', () => {
    const arcadia = cityBySlug('arcadia')!;
    expect(cityLocales(arcadia).sort()).toEqual(['en', 'zh-hant'].sort());
  });

  it('never fabricates a locale absent from a city\'s own data', () => {
    // `cityLocales` is Object.keys(city.t).filter(Boolean), so asserting that
    // every reported locale exists in `city.t` was true BY CONSTRUCTION for any
    // content — it could not fail. What can actually go wrong is the function
    // being rewritten to return a fixed list, which is what hard rule 1 forbids
    // ("Don't hardcode a full four-locale map for consistency"). So assert the
    // property that would break: the reported set must DIFFER between cities.
    expect(cities.length).toBeGreaterThan(3); // control: an empty array must not pass
    const shapes = new Set(cities.map((city) => cityLocales(city).sort().join(',')));
    expect(shapes.size).toBeGreaterThan(1);

    // and it must still agree with the data, per city
    for (const city of cities) {
      expect(cityLocales(city).sort()).toEqual(
        (Object.keys(city.t) as (keyof typeof city.t)[])
          .filter((l) => city.t[l])
          .sort(),
      );
    }
  });
});

describe('cityBySlug', () => {
  it('finds a city by its exact slug', () => {
    expect(cityBySlug('monterey-park')?.slug).toBe('monterey-park');
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
