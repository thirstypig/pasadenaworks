/**
 * What a `heroImage` frontmatter value is allowed to be.
 *
 * Plain predicates with no Zod import, deliberately. `src/content.config.ts`
 * composes these into the collection schema, but it imports `z` from the
 * virtual `astro:content` module, which only resolves inside an Astro build —
 * so anything defined there cannot be unit-tested. Zod is not a declared
 * dependency of this project and reaching for it directly would repeat the
 * undeclared-transitive-dependency mistake corrected on 2026-09-03 (picomatch,
 * typescript, @types/picomatch). Keeping the rules here costs nothing and makes
 * them testable in isolation.
 *
 * WHY THESE RULES EXIST. Hero images were hotlinked from images.unsplash.com
 * until 2026-09-06, sending every reader's IP address and referring URL to a
 * third party before they had touched the consent banner (todos/018). They are
 * self-hosted now, and the schema enforces it so a pasted URL fails the build
 * rather than passing review.
 *
 * THE HOLE THAT SPLIT THIS INTO THREE CHECKS. The first version was one regex,
 * `^\/[A-Za-z0-9._\-\/]+\.(jpg|...)$`. It rejected `https://host/x.jpg` and
 * `http://host/x.jpg` and looked airtight — and accepted
 * `//images.unsplash.com/photo-1.jpg`. A protocol-relative URL carries no
 * scheme and starts with a slash, so it satisfied "starts with /" while the
 * browser resolves it to `https://images.unsplash.com/...`. The guard caught
 * the two spellings of an external image that announce themselves and admitted
 * the one that does not. It also accepted `/blog/../../etc/passwd.jpg`.
 *
 * Three checks rather than one denser pattern, so each failure can name its own
 * cause — whoever pastes a bad value is not whoever wrote the pattern.
 */

/** A leading slash, then `/`-separated segments, then a supported extension. */
export const HERO_IMAGE_PATTERN =
  /^\/[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*\.(jpg|jpeg|png|webp|avif)$/;

/**
 * `//host/path` — no scheme, but the browser supplies one and fetches offsite.
 * This is the case the original single-regex guard let through.
 */
export function isProtocolRelative(value: string): boolean {
  return value.startsWith('//');
}

/** A `..` path segment. `/blog/../../etc/x.jpg` is not a path into public/. */
export function hasTraversalSegment(value: string): boolean {
  return value.split('/').includes('..');
}

/** True when the value is a usable root-relative path into `public/`. */
export function isValidHeroImagePath(value: string): boolean {
  return (
    HERO_IMAGE_PATTERN.test(value) && !isProtocolRelative(value) && !hasTraversalSegment(value)
  );
}
