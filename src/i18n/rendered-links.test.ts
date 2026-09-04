import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES, type Locale } from './ui';
import { SEGMENTS } from './routes';

/**
 * Rendered-link integrity, checked against BUILT pages.
 *
 * WHY THIS CANNOT BE A UNIT TEST. On 2026-09-03 every localized page — all 41
 * of them — carried `<a href="/blog/">` in both the header and the footer,
 * beside a label that WAS translated (部落格 / 博客 / Blog). Readers on
 * /zh-hant/ clicking 部落格 landed on the English index, and the localized
 * blog indexes (/es/blog/, /zh-hans/boke/, /zh-hant/boke/) existed while
 * receiving no navigation links at all — 8 inbound links each, every one from
 * inside the blog cluster itself.
 *
 * `blogIndexPath()` and `SEGMENTS.blog` both already existed. The bug was a
 * component NOT CALLING THEM. So `routes.test.ts` passed the whole time, and
 * always would have: you cannot unit-test a helper into being called. The only
 * evidence is the rendered page.
 *
 * This is the same reasoning as readability.test.mjs's rendered cross-check,
 * and it carries the same caveat: it needs dist/, so it SKIPS when dist/ is
 * absent. `npm run test` runs before the build in both workflows, so ci.yml
 * re-runs the suite AFTER building — otherwise this file would never execute in
 * CI at all, which is exactly how the readability cross-check first shipped
 * broken. See CLAUDE.md.
 */

const DIST = join(dirname(fileURLToPath(import.meta.url)), '../../dist');

/** Every built index.html, as a path relative to dist/. */
function builtPages(dir = ''): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(DIST, dir), { withFileTypes: true })) {
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (entry.name === '_astro' || entry.name === 'admin') continue;
      out.push(...builtPages(rel));
    } else if (entry.name === 'index.html') {
      out.push(rel);
    }
  }
  return out;
}

const PREFIXED = LOCALES.filter((l) => l !== 'en') as Exclude<Locale, 'en'>[];

/** Locale of a built page from its path — English lives at the root. */
function localeOf(page: string): Locale {
  const first = page.split('/')[0];
  return (PREFIXED as string[]).includes(first) ? (first as Locale) : 'en';
}

/** Just the header and footer of a page — the shared navigation chrome. */
function navChrome(html: string): string {
  const header = html.match(/<header[\s\S]*?<\/header>/)?.[0] ?? '';
  const footer = html.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? '';
  return header + footer;
}

/**
 * Site-internal hrefs in a chunk of HTML, excluding two legitimate cases.
 *
 * 1. Anything carrying `hreflang` — that IS the language switcher, whose entire
 *    job is to point at other locales. It lives inside <header>, so it cannot be
 *    excluded by position; the attribute is the honest discriminator.
 * 2. The English-only pages listed below.
 */
const ENGLISH_ONLY = ['/privacy/', '/terms/', '/accessibility/', '/glossary/'];

function internalHrefs(html: string): string[] {
  return [...html.matchAll(/<a\s[^>]*href="(\/[^"#]*)"[^>]*>/g)]
    .filter((m) => !m[0].includes('hreflang='))
    .map((m) => m[1])
    .filter((href) => !ENGLISH_ONLY.includes(href));
}

const pages = existsSync(DIST) ? builtPages() : [];

describe.skipIf(!existsSync(DIST))('rendered navigation stays inside its locale', () => {
  it('found pages to check (positive control)', () => {
    // Without this, every assertion below is satisfied by an empty list — the
    // vacuous-absence failure this repo already documents. If the build layout
    // changes and builtPages() stops matching, this fails loudly rather than
    // reporting success over nothing.
    expect(pages.length).toBeGreaterThan(50);
    for (const locale of PREFIXED) {
      expect(
        pages.some((p) => localeOf(p) === locale),
        `no built pages found for ${locale}`,
      ).toBe(true);
    }
  });

  it('never sends a localized page to an English-root nav destination', () => {
    // THE 2026-09-03 REGRESSION. A localized page's header/footer must not link
    // to a path that belongs to another locale. English-root paths are the
    // dangerous case, because that is what a forgotten helper call produces.
    //
    // Scoped to header+footer because prose links inside <main> may legitimately
    // reference an English page. The LangSwitch is NOT excluded by position — it
    // renders inside <header> — but by its `hreflang` attribute; see
    // internalHrefs above. (An earlier version of this comment claimed it sat
    // outside the header. It does not, and the first run of this test failed on
    // 242 language-switcher links, which is how that was found.)
    //
    // /privacy/, /terms/, /accessibility/ and /glossary/ are English-only from
    // every locale BY DESIGN — CLAUDE.md excludes legal pages and the glossary
    // from translation on purpose (rewriting a privacy policy for reading level
    // risks changing what it commits you to). They are allowlisted above rather
    // than silently tolerated, so if one ever IS translated the allowlist is the
    // single place to update.
    const offenders: string[] = [];

    for (const page of pages) {
      const locale = localeOf(page);
      if (locale === 'en') continue;
      const chrome = navChrome(readFileSync(join(DIST, page), 'utf-8'));

      for (const href of internalHrefs(chrome)) {
        const target = localeOf(href.replace(/^\//, ''));
        if (target !== locale) {
          offenders.push(`${page}: ${locale} page links to ${href} (${target})`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('points each locale at its own translated blog segment', () => {
    // The narrower, positively-stated half: it is not enough that the link
    // avoids English — it must reach THIS locale's blog. `blog` is 'blog' in
    // Spanish (a naturalised loanword) and 'boke' in both Chinese variants, so
    // this also pins hard rule 3's translated segments in rendered output.
    const missing: string[] = [];

    for (const locale of PREFIXED) {
      const home = pages.find((p) => p === `${locale}/index.html`);
      expect(home, `no built homepage for ${locale}`).toBeDefined();

      const chrome = navChrome(readFileSync(join(DIST, home!), 'utf-8'));
      const expected = `/${locale}/${SEGMENTS.blog[locale]}/`;
      if (!chrome.includes(`href="${expected}"`)) {
        missing.push(`${locale}: expected a nav link to ${expected}`);
      }
    }

    expect(missing).toEqual([]);
  });

  it('gives the 404 page no canonical, because /404/ does not exist', () => {
    // Astro emits dist/404.html, not dist/404/index.html, so a canonical at
    // /404/ pointed at a URL that 404s — the only such canonical in the build.
    // It carries `robots: noindex` instead.
    const notFound = join(DIST, '404.html');
    expect(existsSync(notFound), 'dist/404.html should exist').toBe(true);

    const html = readFileSync(notFound, 'utf-8');
    expect(html).toContain('name="robots"');
    expect(html).toContain('noindex');
    expect(html).not.toContain('rel="canonical"');
  });
});
