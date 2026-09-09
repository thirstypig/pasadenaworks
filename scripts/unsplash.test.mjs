import { describe, it, expect } from 'vitest';
import { heroImagePathFor, heroFrontmatter, imageFileUrl, HERO_WIDTH } from './unsplash.mjs';
import { isValidHeroImagePath } from '../src/data/hero-image.ts';
import { isUnsplashProfileUrl } from '../src/data/hero-credit.ts';
import { isValidPostSlug } from '../src/data/post-slug.mjs';

/**
 * WHAT THIS SCRIPT IS FOR. Using the Unsplash API puts this site under the API
 * guidelines rather than the plain licence, which means every API-sourced image
 * must carry a linked credit to the photographer AND to Unsplash, and must
 * trigger the download endpoint. All three are easy to forget and none of them
 * fail loudly when skipped — the page still renders and the build still passes.
 * So the script emits the frontmatter rather than leaving it to be typed.
 *
 * THESE TESTS ASSERT AGAINST THE REAL GUARDS, not against a copy of them. The
 * emitted `heroImage` is checked with `isValidHeroImagePath` and the emitted
 * `heroCreditUrl` with `isUnsplashProfileUrl` — the same predicates
 * `src/content.config.ts` composes into the schema. If the script ever emits
 * something the build would reject, these fail here rather than at the build,
 * and if the guards tighten, the script is re-checked against the new rule for
 * free.
 */

/** A photo object shaped like a real one — field names verified against a live
 *  api.unsplash.com response on 2026-09-08, not assumed. */
const photo = {
  id: 'sxb8StmTfaw',
  alt_description: 'white open signage',
  user: {
    name: 'Tim Mossholder',
    username: 'timmossholder',
    links: { html: 'https://unsplash.com/@timmossholder' },
  },
  links: { download_location: 'https://api.unsplash.com/photos/sxb8StmTfaw/download?ixid=abc' },
  urls: { raw: 'https://images.unsplash.com/photo-1?ixlib=rb-4.0.3' },
};

describe('heroImagePathFor', () => {
  it('produces a root-relative path into public/blog/', () => {
    expect(heroImagePathFor('my-post')).toBe('/blog/my-post.jpg');
  });

  it('produces a path the build’s own guard accepts', () => {
    expect(isValidHeroImagePath(heroImagePathFor('my-post'))).toBe(true);
  });
});

describe('heroFrontmatter', () => {
  it('credits the photographer by name', () => {
    expect(heroFrontmatter(photo, 'my-post').heroCredit).toBe('Tim Mossholder');
  });

  it('links the photographer’s profile, taken from user.links.html', () => {
    const { heroCreditUrl } = heroFrontmatter(photo, 'my-post');
    expect(heroCreditUrl).toBe('https://unsplash.com/@timmossholder');
    expect(isUnsplashProfileUrl(heroCreditUrl)).toBe(true);
  });

  it('uses the photo’s own alt text', () => {
    expect(heroFrontmatter(photo, 'my-post').heroAlt).toBe('white open signage');
  });

  /* Unsplash returns null here often enough that it is the normal case, not an
     edge case. heroAlt is REQUIRED whenever heroImage is set (content.config.ts
     refine), so emitting nothing would produce frontmatter that fails the
     build — and emitting an empty string would produce alt="" on a real photo,
     which a screen reader announces as decorative. */
  it('falls back to a description when Unsplash supplies no alt text', () => {
    const noAlt = { ...photo, alt_description: null };
    const { heroAlt } = heroFrontmatter(noAlt, 'my-post');
    expect(heroAlt).toBeTruthy();
    expect(heroAlt).toContain('Tim Mossholder');
  });

  /* A colon or a quote in alt_description would otherwise break the YAML, or
     silently truncate the value at the colon. Unsplash alt text is arbitrary
     user-supplied prose. */
  it('quotes and escapes values so a colon in the alt text cannot break the YAML', () => {
    const tricky = { ...photo, alt_description: 'a sign: "open" today' };
    const yaml = heroFrontmatter(tricky, 'my-post').yaml;
    expect(yaml).toContain('heroAlt:');
    const altLine = yaml.split('\n').find((l) => l.startsWith('heroAlt:'));
    expect(altLine).toBe('heroAlt: "a sign: \\"open\\" today"');
  });

  it('emits every field the schema needs for an API-sourced image', () => {
    const { yaml } = heroFrontmatter(photo, 'my-post');
    for (const key of ['heroImage:', 'heroAlt:', 'heroCredit:', 'heroCreditUrl:']) {
      expect(yaml, `expected ${key} in the emitted frontmatter`).toContain(key);
    }
  });
});

/**
 * WHY THIS IS NOT THE DOWNLOAD ENDPOINT'S URL. The first working version of
 * this script fetched the file that `download_location` hands back, which is
 * the ORIGINAL: verified 2026-09-08 by running it — 5,596 KB at 9000x6000, on
 * a site whose twenty existing heroes run 1216-1422px wide and 100-400 KB, the
 * largest being 394 KB. Shipping a 5.6 MB hero on a site whose whole strategy
 * is organic search would have been a self-inflicted Core Web Vitals wound,
 * and nothing in the build would have objected.
 *
 * Unsplash serves resized variants from `urls.raw` via query parameters, which
 * is what this builds. The `download_location` call still happens — it is what
 * registers the download for the contributor, and it is required whether or not
 * the bytes come from the URL it returns.
 */
describe('imageFileUrl', () => {
  it('requests a hero-sized image rather than the original', () => {
    const url = new URL(imageFileUrl(photo));
    expect(url.searchParams.get('w')).toBe(String(HERO_WIDTH));
  });

  it('asks for a compressed jpg, since the file is committed to the repo', () => {
    const url = new URL(imageFileUrl(photo));
    expect(url.searchParams.get('fm')).toBe('jpg');
    expect(Number(url.searchParams.get('q'))).toBeLessThan(100);
  });

  it('keeps the parameters Unsplash already put on urls.raw', () => {
    const url = new URL(imageFileUrl(photo));
    expect(url.searchParams.get('ixlib')).toBe('rb-4.0.3');
  });

  it('stays within the house width, so a hero cannot arrive 9000px wide again', () => {
    expect(HERO_WIDTH).toBeLessThanOrEqual(1600);
  });
});

describe('isValidPostSlug', () => {
  /**
   * THE PATH THIS GUARDS. `use()` joins the slug straight into
   * `public/blog/<slug>.jpg`. A slug containing `../` therefore writes OUTSIDE
   * the image directory, and one containing a `/` writes into a directory that
   * may not exist. The slug is typed on a command line by whoever is sourcing
   * the image, so it is exactly the kind of value that is usually fine and
   * occasionally a mistake with no error message.
   *
   * Same rule as the `slug` frontmatter field, imported rather than copied —
   * a second regex here could drift from the schema and let the script emit
   * frontmatter the build then rejects.
   */
  it('accepts the slug shape the schema requires', () => {
    expect(isValidPostSlug('small-business-website-cost')).toBe(true);
    expect(isValidPostSlug('seo101')).toBe(true);
  });

  it('rejects a traversal that would write outside public/blog/', () => {
    expect(isValidPostSlug('../../etc/passwd')).toBe(false);
    expect(isValidPostSlug('nested/slug')).toBe(false);
  });

  it('rejects the spellings the schema also rejects', () => {
    expect(isValidPostSlug('Capitalised')).toBe(false);
    expect(isValidPostSlug('trailing-')).toBe(false);
    expect(isValidPostSlug('double--hyphen')).toBe(false);
    expect(isValidPostSlug('')).toBe(false);
    expect(isValidPostSlug('小型企業')).toBe(false);
  });
});
