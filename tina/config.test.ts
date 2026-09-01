import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import picomatch from 'picomatch';
import { TinaSchema } from '@tinacms/schema-tools';
import { DOCS_ROOT_INCLUDE, DOCS_SOLUTIONS_INCLUDE } from './utils';

/**
 * Regression tests for the bug that made both docs collections index zero
 * documents: `match.include` was written as '*.md', and Tina appends the
 * format itself, producing the glob '*.md.md'. Nothing matched, and Tina
 * reported no error — the collections just looked empty in the admin.
 *
 * These call Tina's OWN getMatches() rather than re-implementing the rule,
 * so if Tina ever changes how it composes the glob, these tests follow it.
 */
/** Mirrors the two docs collections in tina/config.ts. Only path, format
 *  and match affect glob composition; `fields` is here because
 *  TinaSchema's constructor walks it. */
const BODY_FIELD = [{ type: 'rich-text', name: 'body', isBody: true }];
const COLLECTIONS = [
  {
    name: 'docsRoot',
    path: '',
    format: 'md',
    match: { include: DOCS_ROOT_INCLUDE },
    fields: BODY_FIELD,
  },
  {
    name: 'docsSolutions',
    path: 'docs/solutions',
    format: 'md',
    match: { include: DOCS_SOLUTIONS_INCLUDE },
    fields: BODY_FIELD,
  },
];

const schema = new TinaSchema({ collections: COLLECTIONS } as never);

/** Real files on disk under `dir`, repo-root-relative, skipping dotfiles
 *  and node_modules the way Tina's own crawler does. */
function filesUnder(dir: string, prefix = ''): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(process.cwd(), dir || '.'), { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...filesUnder(join(dir, entry.name), rel));
    else out.push(rel);
  }
  return out;
}

describe.each(COLLECTIONS)('$name match glob', (collection) => {
  const globs = schema.getMatches({ collection: collection as never });

  it('does not double the file extension', () => {
    for (const glob of globs) {
      expect(glob, `Tina appends ".${collection.format}" itself`).not.toContain(
        `.${collection.format}.${collection.format}`,
      );
    }
  });

  it('matches at least one markdown file that really exists', () => {
    const isMatch = picomatch(globs);
    // Tina matches globs against repo-root-relative paths, so seed the
    // prefix with the collection's own path.
    const matched = filesUnder(collection.path, collection.path).filter((f) => isMatch(f));
    expect(matched, `globs ${JSON.stringify(globs)} matched nothing`).not.toEqual([]);
  });
});

describe('the include patterns themselves', () => {
  it('omit the .md extension, because Tina adds it', () => {
    expect(DOCS_ROOT_INCLUDE).not.toContain('.md');
    expect(DOCS_SOLUTIONS_INCLUDE).not.toContain('.md');
  });

  it('keeps the root collection non-recursive so it cannot swallow src/', () => {
    expect(DOCS_ROOT_INCLUDE).not.toContain('**');
  });
});
