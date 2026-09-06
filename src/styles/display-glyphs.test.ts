import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

/**
 * Markup must not use a glyph the display face cannot render.
 *
 * THE BUG THIS EXISTS FOR. Buttons and back-links used `&rarr;` and `&larr;`,
 * and `.btn` / `.service-card__link` / `.post__back` are all set in Anton. Anton
 * is served by @fontsource in three subsets — latin, latin-ext, vietnamese — and
 * **none of their `unicode-range` declarations covers U+2190 (←) or U+2192 (→)**.
 *
 * That is stronger than "the glyph is missing". `unicode-range` governs whether
 * the browser will even *attempt* a face for a character, so the arrows never
 * reached Anton at all: they fell straight through the stack to Impact on macOS,
 * Franklin Gothic on Windows, Roboto on Android. Same markup, a different arrow
 * on every platform, sitting beside ultra-bold condensed text. See `todos/020`.
 *
 * Fixed by using a glyph Anton actually ships: `&rsaquo;` (U+203A) and
 * `&lsaquo;` (U+2039), both inside the latin subset's range. Measured in the
 * browser afterwards — a `›` set in Anton advances 11.86px where the same glyph
 * in Impact advances 7.91px, and the rendered link matches Anton's figure.
 *
 * Note for anyone re-checking this: `document.fonts.check('16px Anton', '→')`
 * returns **true**, which looks like it contradicts all of the above. It does
 * not — that API answers "can the font stack render this", not "does this face
 * have it". Measure advance widths instead.
 *
 * The curious detail worth keeping: Anton's latin subset DOES cover U+2191 (↑)
 * and U+2193 (↓). It is only the horizontal pair that is absent, which is
 * exactly the pair a call-to-action wants.
 */

const SRC = fileURLToPath(new URL('..', import.meta.url));

/** Glyphs the display face will not be used for, in any subset it ships. */
const OUTSIDE_ANTONS_RANGE: Record<string, string> = {
  '&rarr;': 'use &rsaquo; — U+2192 is outside every Anton subset',
  '&larr;': 'use &lsaquo; — U+2190 is outside every Anton subset',
  '→': 'use &rsaquo; — U+2192 is outside every Anton subset',
  '←': 'use &lsaquo; — U+2190 is outside every Anton subset',
};

function astroFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith('.astro')) out.push(full);
    }
  };
  walk(SRC);
  return out;
}

describe('markup only uses glyphs the display face can render', () => {
  it('has no horizontal arrows in any .astro file', () => {
    const offenders: string[] = [];
    for (const file of astroFiles()) {
      const source = readFileSync(file, 'utf8');
      for (const [glyph, advice] of Object.entries(OUTSIDE_ANTONS_RANGE)) {
        if (source.includes(glyph)) {
          offenders.push(`${relative(SRC, file)}: contains ${glyph} — ${advice}`);
        }
      }
    }
    expect(offenders, `\n  ${offenders.join('\n  ')}\n`).toEqual([]);
  });

  it('still uses the chevrons, so this test is not passing vacuously', () => {
    // Without this, deleting every arrow from the site would satisfy the test
    // above while removing the affordance it exists to protect. todos/019.
    const withChevrons = astroFiles().filter((file) => {
      const source = readFileSync(file, 'utf8');
      return source.includes('&rsaquo;') || source.includes('&lsaquo;');
    });
    expect(withChevrons.length).toBeGreaterThanOrEqual(8);
  });
});
