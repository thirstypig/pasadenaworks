import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';
import { PILLARS } from './pillars';
import type { Pillar } from './pillars';

/**
 * The four service pillars are declared once.
 *
 * THE DRIFT THIS EXISTS FOR. The same four strings were written out in four
 * places: the Zod enum in `src/content.config.ts`, TypeScript unions in
 * `EndCta.astro` and `Post.astro`, and the `options` list in `tina/config.ts`.
 *
 * CLAUDE.md leans on this value — "`pillar` must be one of websites, search,
 * consulting, ads, and the build fails on a typo, deliberately" — and that
 * guarantee is only as strong as the four copies agreeing. Adding a fifth
 * pillar to the schema and forgetting Tina's list would let the admin offer a
 * value the build then rejects; forgetting a component's union would type-erase
 * the new case instead of flagging it. See `todos/016`.
 */

const REPO = fileURLToPath(new URL('../..', import.meta.url));

/**
 * COMPILE-TIME GUARD. `Pillar` is derived from `PILLARS` via
 * `(typeof PILLARS)[number]`, which needs the `as const`. Without it the array
 * widens to `string[]`, `Pillar` becomes `string`, and every `pillar:` prop
 * silently stops constraining anything while still compiling. This line fails
 * `npm run typecheck` if that happens — vitest cannot see it.
 */
type PillarHasWidenedToString = string extends Pillar ? true : false;
const _pillarIsStillALiteralUnion: PillarHasWidenedToString = false;
void _pillarIsStillALiteralUnion;

function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry === 'dist' || entry === '__generated__') continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(ts|astro)$/.test(entry) && !entry.includes('.test.')) out.push(full);
    }
  };
  walk(join(REPO, 'src'));
  walk(join(REPO, 'tina'));
  return out;
}

describe('the pillar list is declared once', () => {
  it('holds the four pillars the content plan uses', () => {
    expect([...PILLARS]).toEqual(['websites', 'search', 'consulting', 'ads']);
  });

  it('is not written out anywhere else', () => {
    // Catches a fifth copy appearing. `tina/__generated__` is excluded: it is
    // generated from the config, so it legitimately restates the values.
    const pattern = /\[\s*'websites',\s*'search',\s*'consulting',\s*'ads'\s*\]|'websites'\s*\|\s*'search'\s*\|\s*'consulting'\s*\|\s*'ads'/;
    const offenders = sourceFiles()
      .filter((file) => pattern.test(readFileSync(file, 'utf8')))
      .map((file) => relative(REPO, file))
      .filter((file) => file !== join('src', 'data', 'pillars.ts'));

    expect(
      offenders,
      `these re-declare the pillar list instead of importing it from src/data/pillars.ts:\n  ${offenders.join('\n  ')}`,
    ).toEqual([]);
  });

  it.each([
    ['src/content.config.ts', 'z.enum(PILLARS)'],
    ['src/components/EndCta.astro', 'Pillar'],
    ['src/layouts/Post.astro', 'Pillar'],
    ['tina/config.ts', '[...PILLARS]'],
  ])('%s consumes the shared list', (file, needle) => {
    expect(readFileSync(join(REPO, file), 'utf8')).toContain(needle);
  });

  it('keeps the as const that makes Pillar a literal union', () => {
    // Belt to the compile-time guard's braces: names the mechanism, so removing
    // it as "redundant" gives a pointed failure rather than a confusing type
    // error in an unrelated file.
    const source = readFileSync(join(REPO, 'src', 'data', 'pillars.ts'), 'utf8');
    expect(source, 'without `as const`, Pillar widens to string').toMatch(/\]\s*as const;/);
  });
});
