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

/** Append the campaign parameters the API guidelines require. */
export function withReferral(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}utm_source=${UTM_SOURCE}&utm_medium=referral`;
}
