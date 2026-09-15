import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from '../data/site';

/**
 * The homepage's LocalBusiness JSON-LD, read from the BUILT page because the
 * value only exists after Base.astro renders it. Skips without dist/; ci.yml
 * re-runs the suite after building.
 */
const DIST = join(dirname(fileURLToPath(import.meta.url)), '../../dist');

describe.skipIf(!existsSync(DIST))('LocalBusiness schema on the built homepage', () => {
  it('names the home-base cities and the Southern California counties', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf8');
    const raw = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    expect(raw, 'no JSON-LD on the homepage').toBeDefined();
    const areas = (JSON.parse(raw!).areaServed as { '@type': string; name: string }[]).map(
      (a) => `${a['@type']}:${a.name}`,
    );
    expect(areas).toContain('City:Pasadena');
    expect(site.regionServed.length).toBeGreaterThan(0);
    for (const county of site.regionServed) {
      expect(areas).toContain(`AdministrativeArea:${county}`);
    }
  });
});
