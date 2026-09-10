import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname, relative } from 'node:path';
import { LOCALES, DEFAULT_LOCALE, TRANSLATED_LOCALES } from './ui';
import type { Locale } from './ui';

/**
 * The locale list must be declared once, and must stay a literal type.
 *
 * THE DRIFT THIS EXISTS FOR. The list was written out in four places — `ui.ts`,
 * `tina/config.ts`, `scripts/readability.mjs` and `scripts/content-status.mjs`
 * (as `TRANSLATIONS`, the non-English three). They could not import one another:
 * the two scripts run under bare node with no build step and cannot read a
 * `.ts`, and Tina compiles its config in a separate esbuild pass. So the list
 * was maintained by hand in four files, and adding or removing a language
 * desynchronised them silently — a post carrying a value one file knew and
 * another did not validated against the stale enum and then matched nothing:
 * no page, no sitemap entry, no error. See `todos/016`.
 *
 * `src/i18n/locales.mjs` is now the single declaration, in the only format all
 * three consumers can read.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..');

/**
 * COMPILE-TIME GUARD, and the important one in this file.
 *
 * `Locale` is derived from the array in `locales.mjs`. TypeScript widens a bare
 * array in a `.mjs` to `string[]`, which would make `Locale` equal to `string` —
 * and everything would still compile, while `buildAlternates()`, the
 * `RouteProps`/`HubProps` discriminated unions and every `Record<Locale, …>` map
 * quietly stopped constraining anything. A JSDoc tuple annotation on that array
 * is what prevents it, and nothing in the compiler checks that the annotation is
 * still there.
 *
 * If `Locale` ever widens to `string`, `string extends Locale` becomes true and
 * this line fails to compile. It is checked by `npm run typecheck`, not by
 * vitest — a runtime test cannot see this at all.
 */
type LocaleHasWidenedToString = string extends Locale ? true : false;
const _localeIsStillALiteralUnion: LocaleHasWidenedToString = false;
void _localeIsStillALiteralUnion;

/** Every source file that could plausibly re-declare the list. */
function sourceFiles(): string[] {
  const out: string[] = [];
  /* `.claude` holds git worktrees, which are whole second checkouts of this
     repository. Without it, `.claude/worktrees/<name>/src/i18n/locales.mjs` is
     found and reported as a fifth copy of the list — so simply having a
     worktree open turns this suite red, on a repo whose own tooling creates
     them. The offender is a copy of the file this test exempts by path, and
     the exemption compares a repo-relative path that the copy does not match. */
  const skip = new Set([
    'node_modules',
    'dist',
    '.git',
    '.claude',
    '.astro',
    'public',
    'todos',
    'docs',
  ]);
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      if (skip.has(entry)) continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(ts|mjs|astro)$/.test(entry)) out.push(full);
    }
  };
  walk(REPO);
  return out;
}

describe('the locale list is declared once', () => {
  it('exposes the four locales, with English as the default', () => {
    expect([...LOCALES]).toEqual(['en', 'es', 'zh-hans', 'zh-hant']);
    expect(DEFAULT_LOCALE).toBe('en');
    expect(LOCALES).toContain(DEFAULT_LOCALE);
  });

  it('derives TRANSLATED_LOCALES rather than keeping a second hand-written list', () => {
    expect([...TRANSLATED_LOCALES]).toEqual(
      [...LOCALES].filter((locale) => locale !== DEFAULT_LOCALE),
    );
    expect(TRANSLATED_LOCALES).not.toContain(DEFAULT_LOCALE);
  });

  it('is written out in exactly one file of production code', () => {
    // The guard that actually catches a fifth copy appearing. A hand-written
    // list anywhere but locales.mjs is the drift this whole change removes.
    //
    // TESTS ARE EXCLUDED, DELIBERATELY. A test that imports the list it is
    // checking cannot fail — it would assert the list equals itself. Five test
    // files name these four strings directly, and that independence is the
    // point of them (todos/019, "tests that pass regardless of the behaviour
    // they name"). The one below does the same, three assertions up.
    const pattern = /\[\s*'en',\s*'es',\s*'zh-hans',\s*'zh-hant'\s*\]/;
    const offenders = sourceFiles()
      .filter((file) => pattern.test(readFileSync(file, 'utf8')))
      .map((file) => relative(REPO, file))
      .filter((file) => file !== join('src', 'i18n', 'locales.mjs'))
      .filter((file) => !/\.test\.(ts|mjs)$/.test(file));

    expect(
      offenders,
      `these re-declare the locale list instead of importing it from src/i18n/locales.mjs:\n  ${offenders.join('\n  ')}`,
    ).toEqual([]);
  });

  it.each([
    ['src/i18n/ui.ts', './locales.mjs'],
    ['scripts/readability.mjs', '../src/i18n/locales.mjs'],
    ['scripts/content-status.mjs', '../src/i18n/locales.mjs'],
    ['tina/config.ts', '../src/i18n/locales.mjs'],
  ])('%s imports the list rather than declaring it', (file, specifier) => {
    expect(readFileSync(join(REPO, file), 'utf8')).toContain(specifier);
  });

  it('keeps the JSDoc annotation that preserves the literal types', () => {
    // Belt to the compile-time guard's braces: this names the mechanism, so
    // someone removing the annotation as "redundant" gets a pointed failure
    // rather than a confusing type error three files away.
    const source = readFileSync(join(REPO, 'src', 'i18n', 'locales.mjs'), 'utf8');
    expect(
      source,
      'the @type tuple annotation is what stops TypeScript widening Locale to string',
    ).toMatch(/@type\s*\{readonly\s*\[/);
  });
});
