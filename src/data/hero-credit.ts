/**
 * What a `heroCredit` / `heroCreditUrl` pair is allowed to be, and how the
 * attribution links are built.
 *
 * Plain predicates with no Zod import, for the same reason as its sibling
 * `hero-image.ts`: `src/content.config.ts` imports `z` from the virtual
 * `astro:content` module, which only resolves inside an Astro build, so
 * anything defined there cannot be unit-tested.
 *
 * WHY THIS EXISTS. Signing up for the Unsplash API on 2026-09-08 moved this
 * site from the Unsplash LICENSE, under which attribution is appreciated but
 * optional, to the API GUIDELINES, under which it is required: the application
 * "must attribute Unsplash, the Unsplash photographer, and contain a link back
 * to their Unsplash profile", with `?utm_source=<app>&utm_medium=referral` on
 * both links.
 *
 * `heroCreditUrl` is OPTIONAL on purpose. The 20 images already in
 * `public/blog/` were sourced before the API and remain covered by the plain
 * licence, so requiring a URL would fail the build on 80 existing post files to
 * satisfy a rule that does not reach them. New API-sourced images supply one;
 * the template renders the linked form when it is present and the bare string
 * when it is not.
 *
 * COMPARE THE HOST, NEVER THE STRING. `heroCreditUrl` becomes an outbound link
 * on every rendering of a post, and its value is frontmatter — hand-written, or
 * typed into Tina by someone not reading this file. `https://unsplash.com.evil.example/@x`
 * contains the literal "unsplash.com" and begins with https, so a `startsWith`
 * or `includes` check accepts it and the site publishes an attacker's link
 * under its own byline. Parsing and comparing `url.hostname` is what makes that
 * case fail.
 */

/** The campaign source Unsplash requires. Match the registered app's name. */
export const UTM_SOURCE = 'pasadenaworks';

/** The second link the guidelines require, alongside the photographer's. */
export const UNSPLASH_HOME = 'https://unsplash.com/';

/** Only this exact host counts as Unsplash. */
const UNSPLASH_HOST = 'unsplash.com';

/** A profile path is `/@handle` and nothing deeper. */
const PROFILE_PATH = /^\/@[A-Za-z0-9_-]+$/;

/** True when the value is an https link to an Unsplash photographer's profile. */
export function isUnsplashProfileUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return (
    url.protocol === 'https:' && url.hostname === UNSPLASH_HOST && PROFILE_PATH.test(url.pathname)
  );
}

/**
 * Whether the credit pair is renderable — a link must carry a name.
 *
 * Post.astro renders the linked caption only when BOTH fields are set, and the
 * bare `Photo: name` caption only when the name is set WITHOUT a URL. So the
 * fourth state — a URL with a blank name — renders no caption at all: no
 * photographer, no profile link, no Unsplash link. That is exactly the
 * attribution the API guidelines require, silently absent, on a green build.
 *
 * Nothing prevented it: `heroCredit` and `heroCreditUrl` are two independent
 * optional strings in both schemas, and Tina presents them as two unrelated
 * boxes. This is the same shape as the `heroAlt`/`heroImage` rule beside it —
 * a constraint that has to be conditional, because the 80 pre-API files
 * legitimately carry a name and no URL.
 */
export function hasCreditNameWhenLinked(
  heroCredit: string | undefined,
  heroCreditUrl: string | undefined,
): boolean {
  if (!heroCreditUrl) return true;
  return Boolean(heroCredit?.trim());
}

/**
 * Append the campaign parameters the API guidelines require.
 *
 * PARSED, NOT CONCATENATED. Choosing the separator with `url.includes('?')` is
 * blind to fragments, and `isUnsplashProfileUrl` compares `url.pathname`, which
 * a fragment is not part of — so `https://unsplash.com/@x#bio` validates, and
 * appending to it puts the parameters INSIDE the fragment, where a browser
 * never sends them. Unsplash then receives no referral while the rendered link
 * still looks right. Concatenation also stacks a second `utm_source` onto a URL
 * that already had one. `searchParams.set` fixes both by construction.
 *
 * Assumes an absolute URL, which is what both callers pass: `heroCreditUrl` has
 * already been through `isUnsplashProfileUrl` at the schema, and UNSPLASH_HOME
 * is a constant.
 */
export function withReferral(url: string): string {
  const tagged = new URL(url);
  tagged.searchParams.set('utm_source', UTM_SOURCE);
  tagged.searchParams.set('utm_medium', 'referral');
  return tagged.href;
}
