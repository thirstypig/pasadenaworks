/**
 * What a blog post's `slug` may be — THE rule, shared by everything that
 * writes or validates one.
 *
 * Plain ESM, for the same reason as `src/i18n/locales.mjs`: `scripts/` runs
 * under bare `node` with no TypeScript transform, so a `.ts` module cannot be
 * imported there at runtime. `src/content.config.ts` and the scripts therefore
 * meet here rather than each carrying their own copy of the regex.
 *
 * WHY IT MATTERS BEYOND THE SCHEMA. `scripts/unsplash.mjs` joins the slug
 * straight into `public/blog/<slug>.jpg`. A value containing `../` writes
 * outside the image directory entirely, and the script prints its ordinary
 * success message either way. The frontmatter rule and the filesystem rule are
 * the same rule, so they are one constant.
 */

/** Lowercase letters, digits, single hyphens between them. */
export const POST_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** True when `value` is a slug the schema would accept. */
export function isValidPostSlug(value) {
  return typeof value === 'string' && POST_SLUG_PATTERN.test(value);
}
