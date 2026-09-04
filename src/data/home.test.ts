import { describe, it, expect } from 'vitest';
import { home, homeTranslations } from './home';
import { LOCALES, type Locale } from '../i18n/ui';

/**
 * The homepage's hreflang map must be DERIVED from `home`, not asserted.
 *
 * `home` is `Partial<Record<Locale, HomeCopy>>` deliberately, and
 * `[locale]/index.astro` derives its `getStaticPaths` from `Object.keys(home)`.
 * Until 2026-09-04 both homepages hardcoded all four paths instead, so
 * commenting out a locale here stopped generating that page while the English
 * homepage kept advertising it and LangSwitch kept rendering the link — an
 * hreflang alternate pointing at a 404, which is precisely what hard rule #1
 * exists to prevent. TypeScript was satisfied throughout, because `Partial` is
 * the correct type, and the build passed.
 *
 * The homepage was the ONLY page type asserting this. cityLocales(),
 * getTranslationsFor() and the services' total Record all derive.
 */

describe('homeTranslations', () => {
  const translations = homeTranslations();

  it('has copy for at least one non-English locale (positive control)', () => {
    // Everything below is trivially satisfiable if `home` is empty, which is
    // the vacuous-absence shape this repo has been bitten by before.
    expect(Object.keys(home).length).toBeGreaterThan(0);
  });

  it('covers exactly English plus whatever locales `home` actually defines', () => {
    // THE ASSERTION THAT MATTERS. A hardcoded four-locale map passes every
    // other test in this file; it fails this one the moment `home` is partial.
    const expected = ['en', ...Object.keys(home)].sort();
    expect(Object.keys(translations).sort()).toEqual(expected);
  });

  it('never claims a locale `home` does not define', () => {
    for (const locale of Object.keys(translations) as Locale[]) {
      if (locale === 'en') continue; // English copy lives in src/pages/index.astro
      expect(
        home[locale],
        `homeTranslations() claims ${locale}, but home.ts has no copy for it`,
      ).toBeDefined();
    }
  });

  it('maps English to the site root and every other locale to its prefix', () => {
    expect(translations.en).toBe('/');
    for (const locale of Object.keys(home) as Locale[]) {
      expect(translations[locale]).toBe(`/${locale}/`);
    }
  });

  it('only ever produces real locales', () => {
    for (const locale of Object.keys(translations)) {
      expect(LOCALES as readonly string[]).toContain(locale);
    }
  });
});
