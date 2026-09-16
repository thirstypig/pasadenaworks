import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cities } from './cities';
import { SEGMENTS, localeUrl } from '../i18n/routes';
import { HTML_LANG, LOCALES } from '../i18n/ui';
import { reportDist } from '../../scripts/readability.mjs';

/**
 * The city pages, checked on the BUILT page rather than in the data.
 *
 * Everything here needs `dist/`, so the whole block skips without it — both
 * workflows run the suite before building, and `ci.yml` re-runs it afterwards,
 * which is when these actually execute (same arrangement as the readability
 * cross-checks).
 */
const DIST = join(dirname(fileURLToPath(import.meta.url)), '../../dist');
const file = (url: string) => join(DIST, url, 'index.html');

/**
 * APPEND-ONLY. Every city URL this site has ever published, written out
 * literally rather than derived from `cities.ts` — a derived expectation moves
 * with a rename and could never catch one. Same reasoning, and the same
 * discipline, as `retired-services.test.ts`.
 *
 * The first block is what was live before this branch: nine English pages and
 * the five translated pages the partial locale sets happened to produce.
 */
const PUBLISHED = [
  '/websites/pasadena/', '/websites/altadena/', '/websites/south-pasadena/', '/websites/glendale/',
  '/websites/alhambra/', '/websites/arcadia/', '/websites/monrovia/', '/websites/san-marino/',
  '/websites/monterey-park/', '/es/sitios-web/alhambra/', '/zh-hans/wangzhan-jianshe/alhambra/',
  '/zh-hant/wangzhan-jianzhi/alhambra/', '/zh-hant/wangzhan-jianzhi/arcadia/',
  '/zh-hans/wangzhan-jianshe/monterey-park/',
  // 2026-09-15
  '/websites/san-gabriel/',
];

/**
 * Only a `<link rel="alternate">` that carries an `hreflang` counts, and both
 * halves of that are load-bearing:
 *
 *   - the language switcher writes `hreflang` on its own anchors, so a bare
 *     /hreflang="…"/ sweep sees every language twice and the assertion stops
 *     being about the SEO tags at all;
 *   - `rel="alternate"` alone also matches the site-wide RSS `<link>`, which
 *     has no `hreflang` and would sort in as an empty string.
 */
function alternates(html: string): string[] {
  return [...html.matchAll(/<link\b[^>]*\brel="alternate"[^>]*>/g)]
    .map((m) => /\bhreflang="([^"]+)"/.exec(m[0])?.[1])
    .filter((lang): lang is string => Boolean(lang))
    .sort();
}

describe.skipIf(!existsSync(DIST))('built city pages', () => {
  it('still builds every city URL ever published', () => {
    for (const url of PUBLISHED) expect(existsSync(file(url)), url).toBe(true);
  });

  it('emits four alternates plus x-default on every city page, in every language', () => {
    // `hreflang` values are BCP-47 tags (zh-Hant), not our locale ids
    // (zh-hant), so the expectation goes through HTML_LANG.
    const expected = [...LOCALES.map((l) => HTML_LANG[l]), 'x-default'].sort();
    let pages = 0;
    for (const city of cities) {
      for (const locale of LOCALES) {
        const html = readFileSync(file(localeUrl(locale, SEGMENTS.cityHub[locale], city.slug)), 'utf8');
        expect(alternates(html), `${locale} ${city.slug}`).toEqual(expected);
        expect(html, `${locale} ${city.slug} has no sources list`).toMatch(/class="city-sources"/);
        pages++;
      }
    }
    expect(pages).toBe(40);
  });

  it('keeps an English-only page free of alternates (hard rule 1, with its control)', () => {
    // Glendale used to be this example and now has four locales, which is
    // exactly how an "expect nothing" check rots into one that can never fail.
    // `/glossary/` is English-only today; the `<h1` assertion is the positive
    // control that proves the file read is a real rendered page.
    const glossary = readFileSync(join(DIST, 'glossary', 'index.html'), 'utf8');
    expect(glossary).toMatch(/<h1/);
    expect(glossary).not.toMatch(/hreflang=/);
  });

  it('scores every city page inside its reading band', () => {
    const urls = new Set(
      cities.flatMap((c) => LOCALES.map((l) => `${localeUrl(l, SEGMENTS.cityHub[l], c.slug)}index.html`)),
    );
    const rows = reportDist(DIST).filter((r: { page: string }) => urls.has(r.page));
    expect(rows).toHaveLength(40);
    for (const r of rows) {
      expect(r.tooShort, `${r.page} is too short to score`).toBe(false);
      expect(r.verdict, r.page).toBe('ok');
    }
  });
});
