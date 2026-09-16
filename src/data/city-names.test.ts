import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CITY_NAMES, cityName } from './city-names';
import { CITY_SLUGS, type CitySlug } from './cities';
import { LOCALES } from '../i18n/ui';

const ROOT = join(__dirname, '../..');

describe('localized city names', () => {
  it('every locale names every city', () => {
    for (const locale of LOCALES) {
      for (const slug of CITY_SLUGS) {
        expect(cityName(slug as CitySlug, locale)?.trim(), `${locale}/${slug}`).toBeTruthy();
      }
    }
  });

  /**
   * The point of the whole module: the strip must not invent a second Chinese
   * name for a city whose page already uses one. Each form is checked against
   * the title shipping in that locale's own copy module, so a page can never
   * carry two spellings of the same place.
   */
  it.each(['zh-hans', 'zh-hant'] as const)(
    '%s names all appear in that locale\'s own city copy',
    (locale) => {
      const copy = readFileSync(join(ROOT, 'src/data/city-copy', `${locale}.ts`), 'utf8');
      for (const slug of CITY_SLUGS) {
        const name = cityName(slug as CitySlug, locale);
        expect(copy, `${locale}: "${name}" (${slug}) appears nowhere in the copy`).toContain(name);
      }
    }
  );

  it('Spanish keeps the English place names, as the Spanish copy does', () => {
    for (const slug of CITY_SLUGS) {
      expect(CITY_NAMES.es[slug as CitySlug]).toBe(CITY_NAMES.en[slug as CitySlug]);
    }
  });
});
