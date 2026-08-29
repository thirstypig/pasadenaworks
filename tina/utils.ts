/**
 * Pure helpers for the Tina blog collection config, split out of
 * tina/config.ts so they're importable and testable in isolation —
 * Tina's own `ui.filename.slugify` callback isn't unit-testable in
 * place since it's an inline closure inside a config object literal.
 */

interface BlogValuesLike {
  locale?: string;
  title?: string;
}

/** src/content/blog/<slug>.md -> /blog/<slug>/, per the "write a keyword,
 *  not post-14" rule in README.md. Locale determines which subfolder a
 *  new post's file lands in. */
export function slugifyBlogFilename(values: BlogValuesLike | undefined): string {
  const locale = values?.locale || 'en';
  const base = (values?.title || 'untitled')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${locale}/${base}`;
}
