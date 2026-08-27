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
