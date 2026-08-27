import { describe, it, expect, vi } from 'vitest';

// blog.ts imports getCollection from 'astro:content' for getPostsByLocale/
// getTranslationsFor (not under test here — those need real Astro content
// collections, which plain vitest can't provide). Stub the virtual module
// so the pure functions below can be imported and tested in isolation.
vi.mock('astro:content', () => ({ getCollection: vi.fn() }));

import { postPath, blogIndexPath, DATE_LOCALE, readingLabel, updatedLabel, byLabel } from './blog';

describe('postPath', () => {
  it('builds the English post path with no locale prefix', () => {
    expect(postPath('en', 'what-a-small-business-website-actually-needs')).toBe(
      '/blog/what-a-small-business-website-actually-needs/'
    );
  });

  it('builds the Spanish post path with the "blog" segment (a naturalized loanword, not translated)', () => {
    expect(postPath('es', 'que-debe-tener-la-pagina-web-de-una-pequena-empresa')).toBe(
      '/es/blog/que-debe-tener-la-pagina-web-de-una-pequena-empresa/'
    );
  });

  it('uses "boke" for both Chinese variants, matching the fuwu/cityHub romanization pattern', () => {
    expect(postPath('zh-hans', 'some-post')).toBe('/zh-hans/boke/some-post/');
    expect(postPath('zh-hant', 'some-post')).toBe('/zh-hant/boke/some-post/');
  });
});

describe('blogIndexPath', () => {
  it('builds the index path for every locale, with the correct segment per locale', () => {
    expect(blogIndexPath('en')).toBe('/blog/');
    expect(blogIndexPath('es')).toBe('/es/blog/');
    expect(blogIndexPath('zh-hans')).toBe('/zh-hans/boke/');
    expect(blogIndexPath('zh-hant')).toBe('/zh-hant/boke/');
  });
});

describe('DATE_LOCALE', () => {
  it('defines a real Intl locale tag for all four site locales', () => {
    // Regression guard: a missing/undefined entry here would make
    // toLocaleDateString silently fall back to the runtime's default
    // locale instead of the page's actual language.
    const locales = ['en', 'es', 'zh-hans', 'zh-hant'] as const;
    for (const locale of locales) {
      expect(DATE_LOCALE[locale]).toBeTruthy();
    }
  });
});

describe('readingLabel', () => {
  it('reads "N min read" in English', () => {
    expect(readingLabel(5, 'en')).toBe('5 min read');
  });

  it('reads "N min de lectura" in Spanish, not a literal word-for-word translation', () => {
    expect(readingLabel(5, 'es')).toBe('5 min de lectura');
  });

  it('places the minute count before the label in both Chinese variants', () => {
    expect(readingLabel(3, 'zh-hans')).toBe('阅读需 3 分钟');
    expect(readingLabel(3, 'zh-hant')).toBe('閱讀需 3 分鐘');
  });

  it('uses simplified characters for zh-hans and traditional for zh-hant (not the same string)', () => {
    expect(readingLabel(1, 'zh-hans')).not.toBe(readingLabel(1, 'zh-hant'));
  });
});

describe('updatedLabel', () => {
  it('returns the correct word for each locale', () => {
    expect(updatedLabel('en')).toBe('Updated');
    expect(updatedLabel('es')).toBe('Actualizado');
    expect(updatedLabel('zh-hans')).toBe('更新于');
    expect(updatedLabel('zh-hant')).toBe('更新於');
  });
});

describe('byLabel', () => {
  it('returns the correct word for each locale', () => {
    expect(byLabel('en')).toBe('By');
    expect(byLabel('es')).toBe('Por');
    expect(byLabel('zh-hans')).toBe('作者：');
    expect(byLabel('zh-hant')).toBe('作者：');
  });
});
