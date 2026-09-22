import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, builtPages } from '../utils/built-pages';
import { mainProse } from '../../scripts/readability.mjs';
import { t } from './utils';
import { LOCALES, type Locale } from './ui';
import { site } from '../data/site';

/**
 * The box that closes every blog post.
 *
 * It carries the one sentence the whole site is positioned on — paid by the
 * practice and nobody else — so each locale is checked for it rather than
 * merely for a non-empty string. A translation that drops the clause loses
 * the reason to call us.
 */
const PAID_BY_THE_PRACTICE: Record<Locale, string> = {
  en: 'paid by the practice and nobody else',
  es: 'Nos paga el consultorio y nadie más',
  'zh-hans': '只收取诊所的报酬，别无他人',
  'zh-hant': '只收取診所的報酬，別無他人',
};

describe('the blog closing blurb', () => {
  it('states in every locale that the practice alone pays us', () => {
    for (const locale of LOCALES) {
      expect(t(locale).endCta.blurb, locale).toContain(PAID_BY_THE_PRACTICE[locale]);
    }
  });

  it('gives every locale a heading and a label for the related service', () => {
    for (const locale of LOCALES) {
      const { heading, related } = t(locale).endCta;
      expect(heading.length, `${locale} heading`).toBeGreaterThan(0);
      expect(related.length, `${locale} related label`).toBeGreaterThan(0);
    }
  });
});

const posts = existsSync(DIST) ? builtPages().filter((p) => /(^|\/)blog\/[^/]+\/index\.html$/.test(p)) : [];

describe.skipIf(!existsSync(DIST))('the blog closing blurb, on built posts', () => {
  it('found built posts to check (positive control)', () => {
    // Posts are date-gated, so the number varies; an empty list would satisfy
    // every assertion below without testing anything.
    expect(posts.length).toBeGreaterThan(0);
  });

  it('closes each post with the blurb, the booking link and the telephone number', () => {
    const missing: string[] = [];
    for (const page of posts) {
      const html = readFileSync(join(DIST, page), 'utf-8');
      const locale = (LOCALES.find((l) => l !== 'en' && page.startsWith(`${l}/`)) ?? 'en') as Locale;
      const strings = t(locale);
      if (!html.includes(strings.endCta.blurb)) missing.push(`${page}: blurb`);
      if (!html.includes(site.bookingUrl)) missing.push(`${page}: booking link`);
      if (!html.includes(site.phoneDisplay)) missing.push(`${page}: telephone number`);
    }
    expect(missing).toEqual([]);
  });

  it('keeps the whole box out of the reading score', () => {
    // The scorer drops the box with a non-greedy match ending at the first
    // `</div>\s*</div>`, so anything that moves this copy OUT of the box lands
    // in the reading sample — the defect a back-link, a list and a subtitle
    // each caused before.
    //
    // What this test is proven to catch, measured 2026-09-22 rather than
    // assumed: rendering the blurb outside the box fails it on every post.
    // What it does NOT catch, also measured: nesting a <div> at the END of the
    // box still leaks nothing, because the inner and outer closings sit
    // adjacent and the match ends where it always did. So the nesting rule in
    // EndCta.astro's comment is a margin, not a cliff — do not rely on this
    // test alone to prove a structural change is safe.
    const leaked: string[] = [];
    for (const page of posts) {
      const locale = (LOCALES.find((l) => l !== 'en' && page.startsWith(`${l}/`)) ?? 'en') as Locale;
      const prose = mainProse(readFileSync(join(DIST, page), 'utf-8'));
      const strings = t(locale);
      for (const [what, needle] of [
        ['heading', strings.endCta.heading],
        ['blurb', strings.endCta.blurb],
        ['telephone', site.phoneDisplay],
      ] as const) {
        if (prose.includes(needle)) leaked.push(`${page}: ${what}`);
      }
    }
    expect(leaked).toEqual([]);
  });
});
