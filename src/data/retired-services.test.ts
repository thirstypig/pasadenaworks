import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RETIRED_SERVICE_REDIRECTS } from './retired-services.mjs';
import { services } from './services';
import { SEGMENTS, localeUrl } from '../i18n/routes';
import { LOCALES } from '../i18n/ui';

/**
 * The service pages retired on 2026-09-14 were indexed in four languages.
 * GitHub Pages has no server, so each one is an Astro static redirect: an
 * instant meta refresh, `noindex`, and a canonical to the page that absorbed it.
 * The source half runs everywhere; the built half needs dist/ and SKIPS without
 * it, which is why ci.yml re-runs the suite after building.
 */

/**
 * Every service URL this site has ever published, written out literally and
 * APPEND-ONLY. A URL Google has indexed is a historical fact, so this list is
 * never derived from `services.ts` or `SEGMENTS` — deriving it would let a
 * rename move the expectation along with the page.
 *
 * Each entry must stay reachable: either a live service page, or a key in
 * RETIRED_SERVICE_REDIRECTS. Renaming a slug or deleting a service without a
 * redirect fails the first test below; adding a service fails the second
 * until its URLs are appended here.
 */
const PUBLISHED_SERVICE_URLS = [
  // websites — "Get more patients" since 2026-09-14
  '/services/websites/',
  '/es/servicios/sitios-web/',
  '/zh-hans/fuwu/wangzhan-jianshe/',
  '/zh-hant/fuwu/wangzhan-jianzhi/',
  // consulting — "Practice Checkup" since 2026-09-14
  '/services/business-advice/',
  '/es/servicios/asesoria-de-negocios/',
  '/zh-hans/fuwu/jingying-zixun/',
  '/zh-hant/fuwu/jingying-zixun/',
  // digitize — added 2026-09-14
  '/services/practice-digitization/',
  '/es/servicios/digitalizacion-del-consultorio/',
  '/zh-hans/fuwu/zhensuo-shuzihua/',
  '/zh-hant/fuwu/zhensuo-shuweihua/',
  // search — retired 2026-09-14
  '/services/get-found-on-google/',
  '/es/servicios/aparecer-en-google/',
  '/zh-hans/fuwu/guge-tuiguang/',
  '/zh-hant/fuwu/google-tuiguang/',
  // ads — retired 2026-09-14
  '/services/paid-advertising/',
  '/es/servicios/publicidad-pagada/',
  '/zh-hans/fuwu/fufei-guanggao/',
  '/zh-hant/fuwu/fufei-guanggao/',
];

const liveServiceUrls = services.flatMap((service) =>
  LOCALES.map((locale) => localeUrl(locale, SEGMENTS.services[locale], service.slugs[locale]))
);

/** Redirect keys carry no trailing slash (Astro writes `<key>/index.html`). */
const redirectFrom = Object.keys(RETIRED_SERVICE_REDIRECTS).map((key) => `${key}/`);

const localeOf = (url: string) => LOCALES.find((l) => l !== 'en' && url.startsWith(`/${l}/`)) ?? 'en';

describe('published service URLs (source)', () => {
  it('keeps every service URL ever published reachable, live or redirected', () => {
    const unreachable = PUBLISHED_SERVICE_URLS.filter(
      (url) => !liveServiceUrls.includes(url) && !redirectFrom.includes(url)
    );
    expect(
      unreachable,
      'these indexed URLs would 404 — add each to src/data/retired-services.mjs, pointing at the page that replaced it'
    ).toEqual([]);
  });

  it('records every live service URL in the published list', () => {
    const unrecorded = liveServiceUrls.filter((url) => !PUBLISHED_SERVICE_URLS.includes(url));
    expect(unrecorded, 'append new service URLs to PUBLISHED_SERVICE_URLS').toEqual([]);
  });

  it('redirects only URLs that were really published and are no longer live', () => {
    for (const from of redirectFrom) {
      expect(PUBLISHED_SERVICE_URLS, `${from} was never a published service URL`).toContain(from);
      expect(liveServiceUrls, `${from} is both live and redirected`).not.toContain(from);
    }
  });

  it("sends each redirect to a live service page in the same language", () => {
    for (const [key, to] of Object.entries(RETIRED_SERVICE_REDIRECTS)) {
      expect(liveServiceUrls, `${key} → ${to}`).toContain(to);
      expect(localeOf(to), `${key} → ${to} changes language`).toBe(localeOf(`${key}/`));
    }
  });
});

const BLOG = join(dirname(fileURLToPath(import.meta.url)), '../content/blog');

function markdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? markdownFiles(join(dir, entry.name)) : entry.name.endsWith('.md') ? [join(dir, entry.name)] : []
  );
}

describe('service links inside blog posts (source)', () => {
  // Read from source, not dist/: most posts carry a future pubDate and are not
  // built yet, so a built-page check cannot see the links they will publish.
  it('points every service link written in a post at a live service page', () => {
    const segments = [...new Set(Object.values(SEGMENTS.services))].join('|');
    const link = new RegExp(`(?:\\]\\(|href=")((?:/(?:es|zh-hans|zh-hant))?/(?:${segments})/[a-z0-9-]+/?)`, 'g');
    const found: string[] = [];
    const broken: string[] = [];
    for (const file of markdownFiles(BLOG)) {
      for (const [, url] of readFileSync(file, 'utf8').matchAll(link)) {
        found.push(url);
        const normalized = url.endsWith('/') ? url : `${url}/`;
        if (!liveServiceUrls.includes(normalized)) broken.push(`${file.slice(BLOG.length + 1)} → ${url}`);
      }
    }
    expect(found.length, 'positive control: posts link to service pages').toBeGreaterThanOrEqual(12);
    expect(broken).toEqual([]);
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

  it('links no built page to a retired address, in any href', () => {
    const offenders: string[] = [];
    let serviceLinks = 0;
    for (const page of builtPages()) {
      const hrefs = [...readFileSync(join(DIST, page), 'utf8').matchAll(/href="(?:https:\/\/pasadenaworks\.com)?([^"#?]*)"/g)].map(
        (m) => m[1]
      );
      serviceLinks += hrefs.filter((href) => liveServiceUrls.includes(href)).length;
      for (const [from] of entries) {
        if (hrefs.includes(from) || hrefs.includes(`${from}/`)) offenders.push(`${page} → ${from}`);
      }
    }
    expect(serviceLinks, 'positive control: built pages link to live service pages').toBeGreaterThan(0);
    expect(offenders).toEqual([]);
  });
});
