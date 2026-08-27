import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    pillar: z.enum(['websites', 'search', 'consulting', 'ads']),
    targetKeyword: z.string(),
    draft: z.boolean().default(false),
    author: z.string().default('Pasadena Works'),
    tags: z.array(z.string()).min(1).max(3),
    heroImage: z.string().url().optional(),
    heroAlt: z.string().optional(),
    heroCredit: z.string().optional(),
    /** Which of the site's four locales this file is written in. Each
     *  translation of a post is its own file — see translationKey. */
    locale: z.enum(['en', 'es', 'zh-hans', 'zh-hant']),
    /** Shared across every language's version of "the same" post, so
     *  routing can find sibling translations for hreflang. Pick a short,
     *  stable slug-like id (e.g. "website-basics") — it never appears in
     *  a URL itself. */
    translationKey: z.string(),
    /** The real URL slug for this post, in this language. Decoupled from
     *  the filename on purpose: each language gets its own keyword-
     *  appropriate slug, not a literal translation of the English one. */
    slug: z.string(),
  }),
});

export const collections = { blog };
