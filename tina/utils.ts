/**
 * Pure helpers for the Tina blog collection config, split out of
 * tina/config.ts so they're importable and testable in isolation —
 * Tina's own `ui.filename.slugify` callback isn't unit-testable in
 * place since it's an inline closure inside a config object literal.
 */

interface BlogValuesLike {
  locale?: string;
  title?: string;
  slug?: string;
}

/** Lowercase ASCII, hyphen-separated. Anything outside [a-z0-9] is a
 *  separator — which is why this must never be handed a CJK title. */
function asciiSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * src/content/blog/<locale>/<name>.md -> /<locale>/blog/<name>/, per the
 * "write a keyword, not post-14" rule in README.md.
 *
 * DERIVED FROM `slug`, NOT `title`. The earlier version slugified the title,
 * which silently destroyed every Chinese post created through the admin: each
 * Han character is outside [a-z0-9], so the whole basename collapsed to an
 * empty string and the file landed at `<locale>/.md`. The first such post
 * became a hidden dotfile; the second overwrote it. Accented Latin degraded
 * too — `página` became `p-gina`.
 *
 * The `slug` field is the right source: it is `required: true`, it is already
 * the real URL segment, and `blog-content.test.ts` already enforces that it is
 * unique across every locale. Falling back to the title preserves the old
 * behaviour for an English post typed before the slug field is filled in.
 */
export function slugifyBlogFilename(values: BlogValuesLike | undefined): string {
  const locale = values?.locale || 'en';
  const base =
    asciiSlug(values?.slug ?? '') || asciiSlug(values?.title ?? '') || 'untitled';
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
/* `!(CLAUDE)`, not `*`. Tina appends the format, so this becomes the glob
 * `!(CLAUDE).md` — every markdown file at the repo root EXCEPT CLAUDE.md.
 *
 * Why: the collection sets `allowedActions: { create: false, delete: false }`
 * and its comment says that protects "a load-bearing file like CLAUDE.md". But
 * what makes CLAUDE.md load-bearing is its CONTENT, and `update` was still
 * allowed — so a Tina editor scoped to blog content could rewrite the
 * instructions Claude Code follows and commit them to main unreviewed.
 *
 * The extglob keeps CONTENT-PLAN.md, CONTENT-STATUS.md, README.md, PORTS.md and
 * MASTER-PORTS.md editable; CONTENT-STATUS.md's visibility here is the whole
 * reason scripts/content-status.mjs writes it to the root.
 *
 * `match` is serialized into the Tina schema, so changing this requires
 * tina/tina-lock.json to be regenerated and committed alongside. */
export const DOCS_ROOT_INCLUDE = '!(CLAUDE)';
export const DOCS_SOLUTIONS_INCLUDE = '**/*';
