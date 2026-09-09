import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * A blog post's og:image (social-share card), checked against BUILT pages.
 *
 * `astro check` flagged a dead `ogImage` in Post.astro (todos/012,
 * 2026-09-03) — Base.astro was already computing and using its own, so posts
 * did get a share image, but always the site-wide /og.png rather than the
 * post's own hero photo. Fixed 2026-09-09: Base.astro gained an `ogImage`
 * prop (root-relative, defaulting to /og.png), and Post.astro passes its
 * `heroImage` through. This needs dist/ because the value only fully
 * resolves through absoluteUrl() at render time — same reasoning as
 * rendered-links.test.ts. SKIPS when dist/ is absent; ci.yml re-runs the
 * suite after building for exactly this reason.
 */

const DIST = join(dirname(fileURLToPath(import.meta.url)), '../../dist');

function ogImageOf(distPath: string): string {
  const html = readFileSync(join(DIST, distPath), 'utf-8');
  return html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? '';
}

describe.skipIf(!existsSync(DIST))('og:image against built pages', () => {
  it("uses a post's own hero image, not the site-wide default", () => {
    const og = ogImageOf('blog/why-customers-cant-find-your-business-on-google/index.html');
    expect(og).toBe(
      'https://pasadenaworks.com/blog/why-customers-cant-find-your-business-on-google.jpg'
    );
  });

  it('falls back to the site-wide image for a page with no hero of its own', () => {
    expect(ogImageOf('index.html')).toBe('https://pasadenaworks.com/og.png');
  });
});
