import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
/* Derived, not re-typed. `LOCALES` in src/i18n/ui.ts is the registry, and its
   own comment says "Adding a language: add it to LOCALES…". Adding one is loud
   either way (Zod rejects the file); RENAMING or removing one was silent —
   posts carrying the old value still validated against a stale hand-written
   enum, getPostsByLocale never matched them, and they vanished from the site
   with no page, no sitemap entry and no error. */
import { LOCALES } from './i18n/ui';
import { PILLARS } from './data/pillars';
import { HERO_IMAGE_PATTERN, isProtocolRelative, hasTraversalSegment } from './data/hero-image';
import { isUnsplashProfileUrl, hasCreditNameWhenLinked } from './data/hero-credit';
import { POST_SLUG_PATTERN } from './data/post-slug.mjs';

/**
 * A hero image must be a root-relative path into `public/`, e.g. `/blog/x.jpg`.
 *
 * This was `z.string().url()` while the heroes were hotlinked from Unsplash.
 * They are self-hosted now (todos/018: every reader's IP and referrer reached
 * Unsplash before any consent interaction), so a URL is exactly what it must
 * NOT be — one pasted here would reintroduce third-party hotlinking silently.
 *
 * THE HOLE THIS SHAPE EXISTS FOR. The first version was one regex,
 * `^\/[A-Za-z0-9._\-\/]+\.(jpg|...)$`. It rejected `https://host/x.jpg` and
 * `http://host/x.jpg` and looked airtight — but ACCEPTED
 * `//images.unsplash.com/photo-1.jpg`. A protocol-relative URL carries no
 * scheme and begins with a slash, so it satisfied "starts with /" while the
 * browser resolves it to `https://images.unsplash.com/...`. The guard rejected
 * the two spellings of an external image that announce themselves, and admitted
 * the one that does not. It also accepted `/blog/../../etc/passwd.jpg`.
 *
 * Three checks rather than one denser regex, so each failure names its own
 * cause: the person pasting a bad value is not the person who wrote the pattern.
 */
export const heroImagePath = z
  .string()
  .regex(
    HERO_IMAGE_PATTERN,
    'heroImage must be a root-relative path into public/, e.g. /blog/my-post.jpg — not an external URL and not a bare filename. Hero images are self-hosted; see todos/018.',
  )
  .refine((value) => !isProtocolRelative(value), {
    message:
      'heroImage starts with "//", a protocol-relative URL: the browser resolves it to https://<host>/... and fetches from a third party. Use a path inside public/.',
  })
  .refine((value) => !hasTraversalSegment(value), {
    message: 'heroImage must not contain a ".." path segment.',
  });


const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    pillar: z.enum(PILLARS),
    targetKeyword: z.string(),
    draft: z.boolean().default(false),
    author: z.string().default('Pasadena Works'),
    tags: z.array(z.string()).min(1).max(3),
      heroImage: heroImagePath.optional(),
    heroAlt: z.string().optional(),
    heroCredit: z.string().optional(),
    /** The photographer's Unsplash profile, e.g. https://unsplash.com/@name.
     *
     *  Optional, and deliberately so. The 20 images already in public/blog/
     *  predate the Unsplash API and are covered by the plain licence, where
     *  attribution is appreciated but not required. Requiring a URL would fail
     *  the build on 80 existing files to satisfy a rule that does not reach
     *  them. Anything sourced THROUGH the API is under the API guidelines,
     *  which do require it — scripts/unsplash.mjs emits this field so that
     *  compliance is automatic rather than remembered. */
    heroCreditUrl: z
      .string()
      .refine(isUnsplashProfileUrl, {
        message:
          'heroCreditUrl must be an https link to an Unsplash profile, e.g. https://unsplash.com/@name. The HOST is compared, not the string, so a lookalike like https://unsplash.com.evil.example/@x fails here.',
      })
      .optional(),
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
      .regex(POST_SLUG_PATTERN, 'lowercase letters, digits and single hyphens only'),
  })
    /* Tina's field description says heroAlt is "Required if a hero image is
       set" and nothing enforced it, so a hero photo could ship with alt="" —
       announced to a screen reader as decorative. Same class as the
       tags/heroImage drift closed in the 2026-09-03 review: a constraint that
       existed only as prose. */
    .refine((data) => !data.heroImage || Boolean(data.heroAlt?.trim()), {
      message: 'heroAlt is required when heroImage is set — describe the photo.',
      path: ['heroAlt'],
    })
    /* A credit LINK with no NAME renders no caption at all — see
       hasCreditNameWhenLinked. The Unsplash API guidelines require the
       photographer to be named and linked, so the state that drops both is the
       one worth failing the build over. Conditional, not `required`, because
       the 80 pre-API files carry a name and no URL. */
    .refine((data) => hasCreditNameWhenLinked(data.heroCredit, data.heroCreditUrl), {
      message:
        'heroCredit is required when heroCreditUrl is set — a credit link with no photographer name renders no attribution at all.',
      path: ['heroCredit'],
    }),
});

export const collections = { blog };
