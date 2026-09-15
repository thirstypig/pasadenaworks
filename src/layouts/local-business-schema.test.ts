import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from '../data/site';
import { services } from '../data/services';

/**
 * The homepage's LocalBusiness JSON-LD, read from the BUILT page because the
 * value only exists after Base.astro renders it. Skips without dist/; ci.yml
 * re-runs the suite after building.
 */
const DIST = join(dirname(fileURLToPath(import.meta.url)), '../../dist');

interface Schema {
  description: string;
  areaServed: { '@type': string; name: string; containedInPlace?: { name: string } }[];
  hasOfferCatalog: { itemListElement: { itemOffered: { name: string; url: string } }[] };
}

function schemaOf(page: string): Schema {
  const html = readFileSync(join(DIST, page), 'utf8');
  const raw = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  expect(raw, `no JSON-LD on ${page}`).toBeDefined();
  return JSON.parse(raw!);
}

describe.skipIf(!existsSync(DIST))('LocalBusiness schema on the built homepage', () => {
  it('names the home-base cities and the Southern California counties, placed in California', () => {
    const { areaServed } = schemaOf('index.html');
    const areas = areaServed.map((a) => `${a['@type']}:${a.name}`);
    expect(areas).toContain('City:Pasadena');
    expect(site.regionServed.length).toBeGreaterThan(0);
    for (const county of site.regionServed) {
      const area = areaServed.find((a) => a['@type'] === 'AdministrativeArea' && a.name === county);
      expect(area, county).toBeDefined();
      expect(area!.containedInPlace?.name, `${county} has no state`).toBe('California');
    }
  });

  it('says what the business does, in the page language', () => {
    const html = readFileSync(join(DIST, 'es/index.html'), 'utf8');
    const meta = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
    expect(meta, 'positive control: /es/ has a meta description').toBeTruthy();
    expect(schemaOf('es/index.html').description).toBe(meta);
  });

  it.each([
    ['index.html', 'en'],
    ['es/index.html', 'es'],
    ['zh-hant/index.html', 'zh-hant'],
  ] as const)('%s lists every live service, with a URL that was built', (page, locale) => {
    const offered = schemaOf(page).hasOfferCatalog.itemListElement.map((item) => item.itemOffered);
    expect(offered.map((o) => o.name)).toEqual(services.map((s) => s.t[locale].title));
    for (const { url } of offered) {
      const path = url.replace('https://pasadenaworks.com', '');
      expect(existsSync(join(DIST, path, 'index.html')), `${url} was not built`).toBe(true);
    }
  });
});
