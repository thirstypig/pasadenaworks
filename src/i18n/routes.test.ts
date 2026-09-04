import { describe, it, expect } from 'vitest';
import { buildAlternates, localeUrl, absoluteUrl } from './routes';

describe('buildAlternates', () => {
  it('emits zero alternates for an English-only page', () => {
    // This is hard rule #1: a page that exists in only one language must
    // claim zero translations — the regression this guards against is a
    // page silently linking to a 404'd translation.
    expect(buildAlternates({ en: '/websites/pasadena/' })).toEqual([]);
  });

  it('emits zero alternates for an empty map', () => {
    expect(buildAlternates({})).toEqual([]);
  });

  it('ignores a locale whose path is explicitly undefined', () => {
    // Partial<Record<Locale, string>> admits an explicit `undefined`, and
    // Object.entries COUNTS that key — so this map used to clear the "fewer
    // than two locales" guard and emit hreflang="es" href=".../undefined",
    // a 404 alternate produced by the very function written to prevent one.
    // `{ en: enPath, es: sibling?.path }` is how a partial map gets built.
    expect(buildAlternates({ en: '/blog/', es: undefined })).toEqual([]);
  });

  it('drops an undefined locale but still builds the rest', () => {
    const alternates = buildAlternates({
      en: '/blog/',
      es: '/es/blog/',
      'zh-hant': undefined,
    });
    expect(alternates.map((a) => a.hreflang).sort()).toEqual(
      ['en', 'es', 'x-default'].sort()
    );
    expect(alternates.every((a) => !a.href.includes('undefined'))).toBe(true);
  });

  it('emits one alternate per real locale plus x-default, for a 4-locale page', () => {
    const alternates = buildAlternates({
      en: '/websites/alhambra/',
      es: '/es/sitios-web/alhambra/',
      'zh-hans': '/zh-hans/wangzhan-jianshe/alhambra/',
      'zh-hant': '/zh-hant/wangzhan-jianzhi/alhambra/',
    });

    expect(alternates).toHaveLength(5); // 4 locales + x-default
    expect(alternates.map((a) => a.hreflang).sort()).toEqual(
      ['en', 'es', 'x-default', 'zh-Hans', 'zh-Hant'].sort()
    );
  });

  it('emits exactly 2 + x-default for a partial-locale page (e.g. Arcadia: en + zh-hant)', () => {
    const alternates = buildAlternates({
      en: '/websites/arcadia/',
      'zh-hant': '/zh-hant/wangzhan-jianzhi/arcadia/',
    });

    expect(alternates).toHaveLength(3);
    expect(alternates.map((a) => a.hreflang).sort()).toEqual(['en', 'x-default', 'zh-Hant'].sort());
    // Must never fabricate a Spanish or Simplified-Chinese link for a page
    // that only exists in English and Traditional Chinese.
    expect(alternates.find((a) => a.hreflang === 'es')).toBeUndefined();
    expect(alternates.find((a) => a.hreflang === 'zh-Hans')).toBeUndefined();
  });

  it('points x-default at the English path when English exists', () => {
    const alternates = buildAlternates({
      en: '/websites/alhambra/',
      es: '/es/sitios-web/alhambra/',
    });
    const xDefault = alternates.find((a) => a.hreflang === 'x-default');
    expect(xDefault?.href).toBe(absoluteUrl('/websites/alhambra/'));
  });

  it('falls back x-default to whatever locale exists when English is absent', () => {
    // Not a real case in this codebase today (English is always present),
    // but the function is written to handle it rather than crash — lock
    // that behavior in.
    const alternates = buildAlternates({
      es: '/es/sitios-web/alhambra/',
      'zh-hant': '/zh-hant/wangzhan-jianzhi/alhambra/',
    });
    const xDefault = alternates.find((a) => a.hreflang === 'x-default');
    expect(xDefault?.href).toBe(absoluteUrl('/es/sitios-web/alhambra/'));
  });
});

describe('localeUrl', () => {
  it('omits the locale prefix for the default locale (en)', () => {
    expect(localeUrl('en', 'services', 'websites')).toBe('/services/websites/');
  });

  it('adds a locale prefix for non-default locales', () => {
    expect(localeUrl('es', 'servicios', 'sitios-web')).toBe('/es/servicios/sitios-web/');
  });

  it('returns the bare root for no segments', () => {
    expect(localeUrl('en')).toBe('/');
    expect(localeUrl('es')).toBe('/es/');
  });

  it('drops falsy segments instead of producing a double slash', () => {
    expect(localeUrl('en', 'services', '')).toBe('/services/');
  });
});
