import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/**
 * A plain `.css` file must not contain component-compiler selector constructs.
 *
 * THE BUG THIS EXISTS FOR. `src/styles/global.css` shipped
 *
 *     :global(html[lang^='zh']) body { line-height: 1.8; }
 *
 * for months. `:global(...)` is an Astro compiler construct, stripped only while
 * SCOPING a scoped <style> block — verified against @astrojs/compiler-rs, which
 * leaves it verbatim inside `<style is:global>` too, so the condition is the
 * scoping and not the file extension. `global.css` is a plain stylesheet, so
 * nothing transformed it: the text reached the browser, which discarded the
 * WHOLE RULE because any error in a selector invalidates the entire statement.
 * Every Chinese page rendered at line-height 1.600 instead of 1.800 while
 * CLAUDE.md documented the rule as a working fix.
 *
 * WHY NOTHING CAUGHT IT — worth stating, because it explains the shape of this
 * test rather than a more obvious one:
 *   - `npm run build` exits 0 — but it is NOT silent, and that is the sharper
 *     lesson. lightningcss warns "'global' is not recognized as a valid
 *     pseudo-class" on every build, and did so throughout. Nobody read it.
 *     ci.yml now promotes that warning to a failure, the same treatment the
 *     duplicate-slug warning already gets, which makes this file the second
 *     line of defence rather than the first.
 *   - `npm run typecheck` never reads CSS.
 *   - A linter is not reliable here either: the text is syntactically VALID CSS
 *     — a selector naming a pseudo-class no browser implements — and stylelint
 *     treats `:global` as known, because CSS Modules made it so.
 *   - Looking at the page would not have done it. 1.6 vs 1.8 line-height on
 *     Chinese text is a few pixels with nothing to compare against; you would
 *     have to read the computed value, having already suspected the rule.
 *
 * Every gate in this repo checked that code was WELL-FORMED; none checked that a
 * rule was still DOING anything. Two now do: ci.yml promotes the lightningcss
 * warning, and this file catches the construct at source, before a build.
 */

const STYLES_DIR = fileURLToPath(new URL('.', import.meta.url));
const SRC_DIR = fileURLToPath(new URL('..', import.meta.url));
const DIST_ASTRO = fileURLToPath(new URL('../../dist/_astro', import.meta.url));

/**
 * Constructs owned by a component compiler or a CSS-Modules pipeline. Each is
 * inert-but-plausible in a plain stylesheet, which is exactly the property that
 * lets it survive a build. `:global` is the one that bit us; the others are the
 * same class and cost a line each. Add to this list when a new one is found —
 * that is cheaper and more honest than trying to anticipate all of them.
 */
const SCOPED_ONLY = [':global(', ':local(', ':deep(', '::v-deep'];

/**
 * Comments are stripped BEFORE matching, and that is not incidental: the fix in
 * global.css is documented by a comment containing the literal `:global(...)`,
 * because warning about it is the comment's whole purpose. Matching raw text
 * would fail on that warning, and the obvious way to make the suite green again
 * would be to delete it — returning the file to the state that caused the bug.
 */
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function offenders(css: string): string[] {
  const code = stripComments(css);
  return SCOPED_ONLY.filter((needle) => code.includes(needle));
}

const stylesheets = readdirSync(STYLES_DIR).filter((f) => f.endsWith('.css'));

describe('plain stylesheets carry no component-scoped constructs', () => {
  it('is actually reading the stylesheets it claims to check', () => {
    // Positive control. If src/styles/ moved or the filter broke, `stylesheets`
    // would be [] and every assertion below would pass over nothing — the
    // vacuous-absence failure this repo already documents.
    expect(stylesheets).toContain('global.css');
    const global = readFileSync(join(STYLES_DIR, 'global.css'), 'utf8');
    expect(stripComments(global)).toContain("html[lang^='zh']");
  });

  it('flags the broken form and passes the fixed form', () => {
    // Positive control on the DETECTOR. Without this, refactoring `offenders()`
    // into something that returns [] unconditionally goes unnoticed.
    expect(offenders(":global(html[lang^='zh']) body { line-height: 1.8; }")).toEqual([
      ':global(',
    ]);
    expect(offenders("html[lang^='zh'] body { line-height: 1.8; }")).toEqual([]);
  });

  it('does not flag a construct that appears only inside a comment', () => {
    expect(
      offenders('/* NOT `:global(...)` — an Astro construct. */\nbody { color: red; }'),
    ).toEqual([]);
  });

  it.each(stylesheets)('%s contains no Astro-only selector construct', (file) => {
    const found = offenders(readFileSync(join(STYLES_DIR, file), 'utf8'));
    expect(
      found,
      `${file} contains ${found.join(', ')} — a component-scoped construct in a ` +
        `plain stylesheet. Nothing transforms it, so the browser discards the ` +
        `ENTIRE rule — declarations included. Write the selector globally; this ` +
        `file already is. Adding is:global does NOT help: the transform is keyed ` +
        `on the block being scoped, not on the file type.`,
    ).toEqual([]);
  });
});

describe('the construct stays legitimate where it belongs', () => {
  it('Post.astro still uses :global() inside its <style> block', () => {
    // NEGATIVE CONTROL, and a guard against the wrong fix: the cheapest way to
    // make the checks above pass is to purge `:global(` from the repo. Post.astro
    // needs all 16 of its uses — .post__body renders markdown, so the child <p>,
    // <a>, <h2> elements never carry the data-astro-cid attribute and cannot be
    // reached by scoped styles. Verified in the built HTML:
    // `.post__body :global(p)` compiles to `.post__body[data-astro-cid-…] p`.
    const post = readFileSync(join(SRC_DIR, 'layouts/Post.astro'), 'utf8');
    expect(post).toContain('.post__body :global(');

    const open = post.indexOf('<style>');
    const close = post.indexOf('</style>');
    expect(open).toBeGreaterThan(-1);
    expect(post.indexOf(':global(')).toBeGreaterThan(open);
    expect(post.lastIndexOf(':global(')).toBeLessThan(close);
  });
});

describe('the zh line-height override survives into the built CSS', () => {
  // The OUTCOME check — the only one immune to the construct changing name. It
  // needs dist/, so it skips in the pre-build run; ci.yml re-runs the whole
  // suite after building precisely so tests like this one execute in CI.
  it.skipIf(!existsSync(DIST_ASTRO))('ships as a live rule, not a discarded one', () => {
    const files = readdirSync(DIST_ASTRO).filter((f) => f.endsWith('.css'));
    expect(files.length).toBeGreaterThan(0); // positive control
    const css = files.map((f) => readFileSync(join(DIST_ASTRO, f), 'utf8')).join('\n');
    const flat = css.replace(/['"\s]/g, ''); // the minifier drops quotes and spaces
    expect(flat).toContain('html[lang^=zh]body{line-height:1.8');
    expect(flat).not.toContain(':global(');
  });
});
