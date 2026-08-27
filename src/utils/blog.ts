import { getCollection, type CollectionEntry } from 'astro:content';
import { LOCALES, type Locale } from '../i18n/ui';
import { SEGMENTS, localeUrl } from '../i18n/routes';

export type BlogPost = CollectionEntry<'blog'>;

/** Published (non-draft) posts in one locale, newest first. */
export async function getPostsByLocale(locale: Locale): Promise<BlogPost[]> {
  const posts = await getCollection(
    'blog',
    ({ data }) => !data.draft && data.locale === locale
  );
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** The path for one post in one locale. */
export function postPath(locale: Locale, slug: string): string {
  return localeUrl(locale, SEGMENTS.blog[locale], slug);
}

/** The blog index path in one locale. */
export function blogIndexPath(locale: Locale): string {
  return localeUrl(locale, SEGMENTS.blog[locale]);
}

/** Locale tag for Date.toLocaleDateString — used on both the index cards
 *  and the post detail page's byline. */
export const DATE_LOCALE: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-ES',
  'zh-hans': 'zh-CN',
  'zh-hant': 'zh-TW',
};

/** "By {author}" prefix, in each language. */
export function byLabel(locale: Locale): string {
  switch (locale) {
    case 'es':
      return 'Por';
    case 'zh-hans':
      return '作者：';
    case 'zh-hant':
      return '作者：';
    default:
      return 'By';
  }
}

/** "Updated" prefix before a post's updated-date, in each language. */
export function updatedLabel(locale: Locale): string {
  switch (locale) {
    case 'es':
      return 'Actualizado';
    case 'zh-hans':
      return '更新于';
    case 'zh-hant':
      return '更新於';
    default:
      return 'Updated';
  }
}

/** "5 min read" in each language. Small and specific enough to keep as a
 *  plain function rather than growing the shared UI strings for it. */
export function readingLabel(minutes: number, locale: Locale): string {
  switch (locale) {
    case 'es':
      return `${minutes} min de lectura`;
    case 'zh-hans':
      return `阅读需 ${minutes} 分钟`;
    case 'zh-hant':
      return `閱讀需 ${minutes} 分鐘`;
    default:
      return `${minutes} min read`;
  }
}

/** Every locale this post has been translated into, mapped to that
 *  translation's path — for the hreflang `translations` prop. Only
 *  includes locales where a sibling file with the same translationKey
 *  actually exists; never assumes a translation that isn't there. */
export async function getTranslationsFor(
  post: BlogPost
): Promise<Partial<Record<Locale, string>>> {
  const all = await getCollection('blog', ({ data }) => !data.draft);
  const siblings = all.filter((p) => p.data.translationKey === post.data.translationKey);

  return Object.fromEntries(
    LOCALES.filter((l) => siblings.some((p) => p.data.locale === l)).map((l) => [
      l,
      postPath(l, siblings.find((p) => p.data.locale === l)!.data.slug),
    ])
  );
}
