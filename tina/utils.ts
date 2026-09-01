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

/**
 * `match.include` globs for the two docs collections.
 *
 * **Tina appends the collection's `format` to whatever you write here** —
 * `getMatches()` in @tinacms/schema-tools builds
 * `` `${path}/${include}.${format}` ``. So writing `'*.md'` produces the
 * glob `*.md.md`, matches nothing, and the collection indexes **zero
 * documents with no error and no warning** — the admin just shows an empty
 * list. Both docs collections were written that way and were silently
 * broken from the day they were added (2026-08-27) until 2026-08-31.
 *
 * Write the pattern WITHOUT the extension. Exported here so
 * tina/config.test.ts can assert they still match real files, since
 * tina/config.ts itself can't be imported under vitest.
 */
export const DOCS_ROOT_INCLUDE = '*';
export const DOCS_SOLUTIONS_INCLUDE = '**/*';
