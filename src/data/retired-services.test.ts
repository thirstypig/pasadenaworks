import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RETIRED_SERVICE_REDIRECTS } from './retired-services.mjs';
import { services } from './services';
import { SEGMENTS, localeUrl } from '../i18n/routes';
import { LOCALES, type Locale } from '../i18n/ui';

/**
 * The service pages retired on 2026-09-14 were indexed in four languages.
 * GitHub Pages has no server, so each one is an Astro static redirect: an
 * instant meta refresh, `noindex`, and a canonical to the page that absorbed it.
 * The source half runs everywhere; the built half needs dist/ and SKIPS without
 * it, which is why ci.yml re-runs the suite after building.
 */
const RETIRED_SLUGS: Record<Locale, string[]> = {
  en: ['get-found-on-google', 'paid-advertising'],
  es: ['aparecer-en-google', 'publicidad-pagada'],
  'zh-hans': ['guge-tuiguang', 'fufei-guanggao'],
  'zh-hant': ['google-tuiguang', 'fufei-guanggao'],
};

const websites = services.find((s) => s.id === 'websites')!;

describe('retired service redirects (source)', () => {
  it("sends every retired slug, in every locale, to that locale's Get more patients page", () => {
    const expected: Record<string, string> = {};
    for (const locale of LOCALES) {
      for (const slug of RETIRED_SLUGS[locale]) {
        const from = localeUrl(locale, SEGMENTS.services[locale], slug).replace(/\/$/, '');
        expected[from] = localeUrl(locale, SEGMENTS.services[locale], websites.slugs[locale]);
      }
    }
    expect(RETIRED_SERVICE_REDIRECTS).toEqual(expected);
  });

  it('never retires a slug that a live service still uses', () => {
    for (const locale of LOCALES) {
      for (const service of services) {
        expect(RETIRED_SLUGS[locale]).not.toContain(service.slugs[locale]);
      }
    }
  });
});

const DIST = join(dirname(fileURLToPath(import.meta.url)), '../../dist');

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

describe.skipIf(!existsSync(DIST))('retired service redirects (built)', () => {
  const entries = Object.entries(RETIRED_SERVICE_REDIRECTS);

  it.each(entries)('%s is an instant, unindexed redirect to %s', (from, to) => {
    const html = readFileSync(join(DIST, from, 'index.html'), 'utf8');
    expect(html).toContain(`content="0;url=${to}"`);
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html).toContain(`<link rel="canonical" href="https://pasadenaworks.com${to}">`);
  });

  it('keeps every redirect out of the sitemap, and every target in it', () => {
    const sitemap = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
    for (const [from, to] of entries) {
      // Positive control first: the target is a real, listed page.
      expect(existsSync(join(DIST, to, 'index.html')), `${to} was not built`).toBe(true);
      expect(sitemap).toContain(`<loc>https://pasadenaworks.com${to}</loc>`);
      expect(sitemap).not.toContain(`<loc>https://pasadenaworks.com${from}/</loc>`);
    }
  });

  it('points no hreflang alternate at a retired address', () => {
    const offenders: string[] = [];
    for (const page of builtPages()) {
      const tags = readFileSync(join(DIST, page), 'utf8').match(/<link[^>]*hreflang[^>]*>/g) ?? [];
      for (const [from] of entries) {
        if (tags.some((tag) => tag.includes(`href="https://pasadenaworks.com${from}/"`))) {
          offenders.push(`${page} → ${from}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
