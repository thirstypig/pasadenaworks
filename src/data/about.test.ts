import { describe, it, expect } from 'vitest';
import { about } from './about';
import { LOCALES } from '../i18n/ui';
import { SEGMENTS, aboutPaths } from '../i18n/routes';

/** The one fact each locale must carry, spelled the way that locale spells it.
 *  A translation that drops the number, or the name, fails here rather than
 *  in front of a reader. */
const EIGHT = { en: 'eight', es: 'ocho', 'zh-hans': '八', 'zh-hant': '八' } as const;

describe('about copy', () => {
  it('exists in every locale with three non-empty sections', () => {
    for (const locale of LOCALES) {
      const copy = about[locale];
      expect(copy.sections, locale).toHaveLength(3);
      for (const s of copy.sections) expect(s.body.join('').length, `${locale}: ${s.heading}`).toBeGreaterThan(0);
    }
  });

  it('names James and the eight years in every locale', () => {
    for (const locale of LOCALES) {
      const text = about[locale].sections.flatMap((s) => s.body).join(' ');
      expect(text, locale).toContain('James');
      expect(text, locale).toContain(EIGHT[locale]);
    }
  });

  it('keeps every meta description within 155 characters', () => {
    for (const locale of LOCALES) expect(about[locale].meta.length, locale).toBeLessThanOrEqual(155);
  });
});

describe('SEGMENTS.about', () => {
  it('is pinned, because changing it moves a published URL', () => {
    expect(SEGMENTS.about).toEqual({
      en: 'about',
      es: 'sobre-nosotros',
      'zh-hans': 'guanyu-women',
      'zh-hant': 'guanyu-women',
    });
  });

  it('builds one path per locale', () => {
    expect(aboutPaths()).toEqual({
      en: '/about/',
      es: '/es/sobre-nosotros/',
      'zh-hans': '/zh-hans/guanyu-women/',
      'zh-hant': '/zh-hant/guanyu-women/',
    });
  });
});
