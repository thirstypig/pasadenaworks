import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
/* Derived, not re-typed. `LOCALES` in src/i18n/ui.ts is the registry, and its
   own comment says "Adding a language: add it to LOCALES…". Adding one is loud
   either way (Zod rejects the file); RENAMING or removing one was silent —
   posts carrying the old value still validated against a stale hand-written
   enum, getPostsByLocale never matched them, and they vanished from the site
   with no page, no sitemap entry and no error. */
import { LOCALES } from './i18n/ui';

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
    locale: z.enum(LOCALES),
    /** Shared across every language's version of "the same" post, so
     *  routing can find sibling translations for hreflang. Pick a short,
     *  stable slug-like id (e.g. "website-basics") — it never appears in
     *  a URL itself. */
    translationKey: z.string(),
    /** The real URL slug for this post, in this language. Decoupled from
     *  the filename on purpose: each language gets its own keyword-
     *  appropriate slug, not a literal translation of the English one.
     *
     *  The pattern is load-bearing twice over. It is the URL, so an uppercase
     *  letter or a space would ship in it. And since todo 002, Tina derives a
     *  new post's FILENAME from this field via asciiSlug() — so without the
     *  constraint, `Website-Costs` and `website-costs` are two distinct,
     *  uniqueness-test-passing slugs that both write en/website-costs.md, and
     *  the second Tina save silently overwrites the first. That is the inverse
     *  of the collision todo 002 closed. Verified 2026-09-04: all 80 existing
     *  slugs already satisfy this, and none collide. */
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase letters, digits and single hyphens only'),
  })
    /* Tina's field description says heroAlt is "Required if a hero image is
       set" and nothing enforced it, so a hero photo could ship with alt="" —
       announced to a screen reader as decorative. Same class as the
       tags/heroImage drift closed in the 2026-09-03 review: a constraint that
       existed only as prose. */
    .refine((data) => !data.heroImage || Boolean(data.heroAlt?.trim()), {
      message: 'heroAlt is required when heroImage is set — describe the photo.',
      path: ['heroAlt'],
    }),
});

export const collections = { blog };
