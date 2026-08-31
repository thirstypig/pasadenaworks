import { describe, it, expect, vi } from 'vitest';

// blog.ts imports getCollection from 'astro:content'. Stub the virtual module
// so the pure functions below can be imported in isolation. The stub is also
// driven directly in the scheduled-publishing tests at the bottom of this
// file: getCollection is handed the real predicate blog.ts builds, so running
// it against fixture entries tests that predicate for real.
vi.mock('astro:content', () => ({ getCollection: vi.fn() }));

import { getCollection } from 'astro:content';
import {
  postPath,
  blogIndexPath,
  DATE_LOCALE,
  readingLabel,
  updatedLabel,
  byLabel,
  getPostsByLocale,
  getTranslationsFor,
} from './blog';

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

// --- Scheduled publishing -------------------------------------------------
// A post with a pubDate in the future must not be published yet. This is not
// just a listing concern: getPostsByLocale also backs getStaticPaths for both
// /blog/[...slug] and /[locale]/[section]/[service], so a post that survives
// this filter gets a built page and a sitemap entry — i.e. it is public.

const DAY = 24 * 60 * 60 * 1000;
const past = () => new Date(Date.now() - DAY);
const future = () => new Date(Date.now() + DAY);

type Fixture = {
  data: {
    draft: boolean;
    locale: string;
    pubDate: Date;
    slug: string;
    translationKey: string;
  };
};

function entry(over: Partial<Fixture['data']> = {}): Fixture {
  return {
    data: {
      draft: false,
      locale: 'en',
      pubDate: past(),
      slug: 'a-post',
      translationKey: 'key',
      ...over,
    },
  };
}

/** Run blog.ts's real predicate against these fixtures. */
function collectionOf(entries: Fixture[]) {
  vi.mocked(getCollection).mockImplementation((async (
    _collection: string,
    filter?: (e: Fixture) => boolean
  ) => (filter ? entries.filter(filter) : entries)) as never);
}

describe('getPostsByLocale — scheduled publishing', () => {
  it('excludes a post whose pubDate has not arrived yet', async () => {
    collectionOf([entry({ slug: 'tomorrow', pubDate: future() })]);
    const posts = await getPostsByLocale('en');
    expect(posts.map((p) => p.data.slug)).toEqual([]);
  });

  it('includes a post whose pubDate has already passed', async () => {
    collectionOf([entry({ slug: 'yesterday', pubDate: past() })]);
    const posts = await getPostsByLocale('en');
    expect(posts.map((p) => p.data.slug)).toEqual(['yesterday']);
  });

  it('still excludes drafts regardless of date', async () => {
    collectionOf([entry({ slug: 'draft-post', draft: true, pubDate: past() })]);
    expect(await getPostsByLocale('en')).toEqual([]);
  });

  it('still returns only the requested locale', async () => {
    collectionOf([
      entry({ slug: 'english', locale: 'en' }),
      entry({ slug: 'spanish', locale: 'es' }),
    ]);
    const posts = await getPostsByLocale('es');
    expect(posts.map((p) => p.data.slug)).toEqual(['spanish']);
  });

  it('sorts the published posts newest first', async () => {
    collectionOf([
      entry({ slug: 'older', pubDate: new Date(Date.now() - 5 * DAY) }),
      entry({ slug: 'newer', pubDate: new Date(Date.now() - 1 * DAY) }),
    ]);
    const posts = await getPostsByLocale('en');
    expect(posts.map((p) => p.data.slug)).toEqual(['newer', 'older']);
  });
});

describe('getTranslationsFor — scheduled publishing', () => {
  it('never claims a translation whose pubDate is still in the future', async () => {
    // Hard rule #1: an hreflang alternate for an unbuilt page is a 404 alternate.
    const en = entry({ slug: 'english', locale: 'en' });
    collectionOf([en, entry({ slug: 'spanish', locale: 'es', pubDate: future() })]);

    const translations = await getTranslationsFor(en as never);

    expect(Object.keys(translations)).toEqual(['en']);
  });

  it('claims a translation that has already been published', async () => {
    const en = entry({ slug: 'english', locale: 'en' });
    collectionOf([en, entry({ slug: 'spanish', locale: 'es', pubDate: past() })]);

    const translations = await getTranslationsFor(en as never);

    expect(translations.es).toBe('/es/blog/spanish/');
  });
});
