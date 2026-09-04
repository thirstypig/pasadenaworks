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
