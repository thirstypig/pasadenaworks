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

/**
 * ── THE PHOTO AND THE DATA STRIP (2026-09-16) ──
 *
 * Both are page furniture, and `mainProse()` in `scripts/readability.mjs` drops
 * them before scoring: the credit because it is a `<figcaption>`, the strip by
 * its `city-strip` class. That exclusion is only correct while the markers it
 * keys on still exist, so these are the PAIRED marker tests CLAUDE.md asks for
 * whenever a `mainProse()` rule is added — the same arrangement `ul.service-area`
 * and `p.page-back` already have.
 *
 * Without them the failure is silent and one-directional: rename the class and
 * the strip's dozen "Dentists 213" rows quietly rejoin the reading-level sample
 * as two-word sentences, which is precisely the defect that bulleted lists
 * caused on the service pages and back-links caused on these ones.
 */
describe('city pages: photo and data strip', () => {
  const built = PUBLISHED.filter((url) => existsSync(file(url)));

  it.skipIf(built.length === 0)('every built city page carries both markers', () => {
    for (const url of built) {
      const html = readFileSync(file(url), 'utf8');
      expect(html, `${url} has no city photo`).toMatch(/<figure class="city-photo"/);
      expect(html, `${url} has no data strip`).toMatch(/<aside[^>]*class="[^"]*city-strip/);
    }
  });

  it.skipIf(built.length === 0)('the strip is an <aside>, which is what its exclusion matches', () => {
    // It is not a <div> on purpose: the strip nests <div> rows, so the
    // non-greedy exclusion regex would stop at the first inner </div> and
    // leave most of the panel in the prose sample.
    for (const url of built) {
      const html = readFileSync(file(url), 'utf8');
      expect(html, `${url}`).not.toMatch(/<div[^>]*class="[^"]*\bcity-strip\b/);
    }
  });

  it.skipIf(built.length === 0)('mainProse() removes the strip and the credit entirely', () => {
    for (const url of built) {
      const html = readFileSync(file(url), 'utf8');
      // Re-derive the same way the scorer does, then assert none of the
      // strip's own vocabulary survives into the scored text.
      const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
      const stripped = main
        .replace(/<aside\b[^>]*\bclass="[^"]*\bcity-strip\b[^"]*"[^>]*>[\s\S]*?<\/aside>/g, ' ')
        .replace(/<figcaption[\s\S]*?<\/figcaption>/g, ' ');
      expect(stripped, `${url} leaks the strip into scored prose`).not.toMatch(/city-strip/);
      expect(stripped, `${url} leaks the credit into scored prose`).not.toMatch(/figcaption/);
    }
  });

  it.skipIf(built.length === 0)('the credit names the photographer and links the license where one is owed', () => {
    for (const url of built) {
      const html = readFileSync(file(url), 'utf8');
      const cap = html.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/)?.[1];
      if (!cap) continue; // public-domain and CC0 pages render no caption at all
      const text = cap.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      expect(text.length, `${url} has an empty credit`).toBeGreaterThan(4);
      expect(cap, `${url} credit does not link a license`).toMatch(
        /href="https:\/\/creativecommons\.org\/licenses\//
      );
    }
  });
});

/**
 * ── THE HOUSE PATTERN, PINNED (2026-09-16) ──
 *
 *   paragraph · photo · paragraph · data strip · paragraph
 *
 * Set as a standard by the owner. Before this the photo and the strip were
 * stacked above the <h1>, which pushed the opening sentence down the page and
 * made the photograph read as a banner rather than an illustration.
 *
 * This asserts ORDER, not merely presence — the markers test above already
 * proves both elements exist, and would keep passing if someone moved them
 * back above the heading or put the strip before the photo.
 */
describe('city pages: the paragraph / photo / paragraph / strip / paragraph pattern', () => {
  const built = PUBLISHED.filter((url) => existsSync(file(url)));

  /** The body's top-level sequence, with the strip and photo as single tokens. */
  function outline(html: string): string[] {
    const inner = html.match(
      /<div class="city-body prose"[^>]*>([\s\S]*?)<h2 class="city-sources__heading"/
    )?.[1];
    if (!inner) return [];
    const strip = inner.match(/<aside[^>]*city-strip[\s\S]*?<\/aside>/)?.[0];
    const figure = inner.match(/<figure[\s\S]*?<\/figure>/)?.[0];
    let flat = inner;
    if (strip) flat = flat.replace(strip, '@STRIP@');
    if (figure) flat = flat.replace(figure, '@PHOTO@');
    const seq: string[] = [];
    for (const chunk of flat.split(/(@STRIP@|@PHOTO@)/)) {
      if (chunk === '@STRIP@' || chunk === '@PHOTO@') {
        seq.push(chunk.replaceAll('@', ''));
        continue;
      }
      for (const m of chunk.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)) {
        if (m[1].replace(/<[^>]+>/g, '').trim()) seq.push('PARAGRAPH');
      }
    }
    return seq;
  }

  it.skipIf(built.length === 0)('every built city page follows the pattern exactly', () => {
    for (const url of built) {
      expect(outline(readFileSync(file(url), 'utf8')), url).toEqual([
        'PARAGRAPH',
        'PHOTO',
        'PARAGRAPH',
        'STRIP',
        'PARAGRAPH',
      ]);
    }
  });

  it.skipIf(built.length === 0)('neither piece is left stranded above the heading', () => {
    // The previous layout put both before <h1>. If someone reverts the
    // interleaving, the pattern test above fails — but this one names the
    // specific regression, so the failure reads as "it moved back" rather
    // than "the order is wrong".
    for (const url of built) {
      const html = readFileSync(file(url), 'utf8');
      const h1 = html.indexOf('<h1');
      const photo = html.indexOf('<figure class="city-photo"');
      const strip = html.search(/<aside[^>]*city-strip/);
      expect(photo, `${url}: photo sits above the h1`).toBeGreaterThan(h1);
      expect(strip, `${url}: strip sits above the h1`).toBeGreaterThan(h1);
    }
  });
});
