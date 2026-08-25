import { describe, it, expect } from 'vitest';
import { cities, cityLocales, cityBySlug } from './cities';

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
    // Every city in the array must only report locales it genuinely has —
    // this is the single source of truth the hreflang/routing code trusts.
    for (const city of cities) {
      const reported = cityLocales(city);
      for (const locale of reported) {
        expect(city.t[locale]).toBeDefined();
      }
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
