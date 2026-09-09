#!/usr/bin/env node
/**
 * Source a blog hero image from Unsplash, compliantly.
 *
 *   node scripts/unsplash.mjs search "small business storefront"
 *   node scripts/unsplash.mjs use <photoId> <post-slug>
 *
 * WHY THIS IS A SCRIPT AND NOT A NOTE IN A README. Using the Unsplash API puts
 * this site under the API guidelines rather than the plain Unsplash licence,
 * and they add three obligations that all fail SILENTLY when skipped — the page
 * renders, the build passes, nothing complains:
 *
 *   1. the photographer must be credited with a LINK to their profile,
 *   2. Unsplash must be linked too, both carrying utm_source/utm_medium,
 *   3. the `download_location` endpoint must be called when a photo is
 *      actually used. Fetching the image file does NOT count; Unsplash counts
 *      downloads for its contributors from that endpoint alone.
 *
 * So the script does all three and prints frontmatter ready to paste, rather
 * than leaving them to be remembered. `heroCreditUrl` then satisfies the schema
 * guard in src/content.config.ts, and Post.astro renders the required linked
 * form. See src/data/hero-credit.ts.
 *
 * THE IMAGE IS DOWNLOADED, NEVER HOTLINKED. Hero images were hotlinked from
 * images.unsplash.com until 2026-09-06, sending every reader's IP address and
 * referring URL to a third party before they had touched the consent banner
 * (todos/018). The build now rejects an external heroImage outright, so the
 * file has to land in public/blog/ — which is what `use` does.
 *
 * Choosing the photo stays human: `search` lists candidates and stops. Picking
 * the image for an article is an editorial decision, not one to automate.
 *
 * No dependencies — .env is parsed here rather than pulling in dotenv, matching
 * the project's rule about not adding packages without a reason.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isValidPostSlug } from '../src/data/post-slug.mjs';
import { isMain } from './is-main.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.unsplash.com';

/**
 * How wide a hero image is fetched. The existing twenty run 1216-1422px and
 * 100-400 KB; the ORIGINAL behind a typical Unsplash photo is around 9000px and
 * several megabytes, which is what `download_location` hands back. On a site
 * whose whole acquisition strategy is organic search, shipping that would be a
 * self-inflicted Core Web Vitals wound that no build step would object to.
 */
export const HERO_WIDTH = 1400;

/**
 * The URL to actually fetch the bytes from: Unsplash resizes on delivery from
 * `urls.raw` via query parameters. Distinct from `links.download_location`,
 * which must still be called — that is what registers the download for the
 * contributor, and it is required regardless of where the bytes come from.
 */
export function imageFileUrl(photo, width = HERO_WIDTH) {
  const url = new URL(photo.urls.raw);
  url.searchParams.set('w', String(width));
  url.searchParams.set('fm', 'jpg');
  url.searchParams.set('q', '80');
  url.searchParams.set('fit', 'max');
  return url.toString();
}

/** Where a post's hero image lives, as the schema requires it be written. */
export function heroImagePathFor(slug) {
  return `/blog/${slug}.jpg`;
}

/**
 * Quote a value for YAML. Unsplash alt text is arbitrary user-supplied prose,
 * so a colon in it would otherwise truncate the value where the parser splits
 * key from value, and a quote would break the document outright.
 */
function yamlString(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/**
 * Build the frontmatter block for a photo. Field names verified against a live
 * api.unsplash.com response on 2026-09-08 rather than assumed — in particular
 * the profile URL is `user.links.html`, not a string built from `username`.
 */
export function heroFrontmatter(photo, slug) {
  const heroImage = heroImagePathFor(slug);
  const heroCredit = photo.user.name;
  const heroCreditUrl = photo.user.links.html;
  /* alt_description is null often enough to be the normal case. heroAlt is
     required whenever heroImage is set, and an empty one would announce a real
     photograph to a screen reader as decorative. */
  const heroAlt = photo.alt_description?.trim() || `Photograph by ${heroCredit}`;

  const yaml = [
    `heroImage: ${heroImage}`,
    `heroAlt: ${yamlString(heroAlt)}`,
    `heroCredit: ${yamlString(heroCredit)}`,
    `heroCreditUrl: ${heroCreditUrl}`,
  ].join('\n');

  return { heroImage, heroAlt, heroCredit, heroCreditUrl, yaml };
}

/* ---------------------------------------------------------------- CLI ---- */

function accessKey() {
  if (process.env.UNSPLASH_ACCESS_KEY) return process.env.UNSPLASH_ACCESS_KEY;
  const envPath = path.join(ROOT, '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const match = line.match(/^UNSPLASH_ACCESS_KEY=(.*)$/);
      if (match) return match[1].trim();
    }
  }
  console.error('No UNSPLASH_ACCESS_KEY — set it in .env (it is gitignored).');
  process.exit(1);
}

async function api(url) {
  const response = await fetch(url, {
    headers: { Authorization: `Client-ID ${accessKey()}`, 'Accept-Version': 'v1' },
  });
  if (!response.ok) {
    console.error(`Unsplash returned ${response.status} for ${url}`);
    /* 403 here is almost always the Demo tier's 50 requests/hour, not a bad
       key. Say so rather than sending the reader to re-check credentials. */
    if (response.status === 403) {
      console.error('A 403 is usually the hourly rate limit (Demo apps get 50/hour), not the key.');
    }
    process.exit(1);
  }
  return response.json();
}

async function search(query) {
  const url = `${API}/search/photos?query=${encodeURIComponent(query)}&per_page=8&orientation=landscape`;
  const { results } = await api(url);
  if (!results.length) {
    console.log(`No results for "${query}".`);
    return;
  }
  console.log(`\nTop results for "${query}" — pick one and run:\n`);
  console.log(`  node scripts/unsplash.mjs use <id> <post-slug>\n`);
  for (const photo of results) {
    console.log(`  ${photo.id.padEnd(14)} ${photo.user.name}`);
    console.log(`  ${''.padEnd(14)} ${photo.alt_description ?? '(no alt text supplied)'}`);
    console.log(`  ${''.padEnd(14)} https://unsplash.com/photos/${photo.id}\n`);
  }
}

async function use(photoId, slug) {
  /* Checked BEFORE the network calls, because the second of them registers a
     download against the photographer — there is no point spending that on a
     run that cannot write its file. `slug` is typed on a command line and is
     joined straight into a path below, so `../` would land the image outside
     public/blog/ with the ordinary success message still printed. */
  if (!isValidPostSlug(slug)) {
    console.error(
      `"${slug}" is not a valid post slug: lowercase letters, digits and single hyphens only.\n` +
        'Use the same slug as the post’s frontmatter — the image is shared by all four locales.',
    );
    process.exit(1);
  }

  const destination = path.join(ROOT, 'public', 'blog', `${slug}.jpg`);
  /* Overwriting is almost always a mistyped slug rather than an intended
     replacement, and it is silent: the four locale files of an existing post
     all point at this one path, so the wrong photo appears on a published post
     in every language at once. */
  if (fs.existsSync(destination)) {
    console.error(
      `public/blog/${slug}.jpg already exists.\n` +
        'Delete it first if you mean to replace that post’s hero image.',
    );
    process.exit(1);
  }

  const photo = await api(`${API}/photos/${photoId}`);

  /* REQUIRED by the API guidelines, and the reason this is not just a curl of
     the image URL: Unsplash counts a download for the contributor only when
     this endpoint is called. The URL it returns is deliberately DISCARDED — it
     points at the original, which is ~9000px and several megabytes. The
     obligation is to call it, not to fetch what it returns. */
  await api(photo.links.download_location);

  const response = await fetch(imageFileUrl(photo));
  if (!response.ok) {
    console.error(`Downloading the image failed with ${response.status}.`);
    process.exit(1);
  }
  fs.writeFileSync(destination, Buffer.from(await response.arrayBuffer()));

  const { yaml } = heroFrontmatter(photo, slug);
  const size = (fs.statSync(destination).size / 1024).toFixed(0);
  console.log(`\nSaved public/blog/${slug}.jpg (${size} KB), download registered with Unsplash.`);
  console.log(`\nPaste into the post's frontmatter — all four locales share the image:\n`);
  console.log(yaml);
  console.log('');
}

const [command, ...args] = process.argv.slice(2);

// See scripts/is-main.mjs for why this can't be a naive string comparison.
if (isMain(import.meta.url)) {
  if (command === 'search' && args[0]) {
    await search(args.join(' '));
  } else if (command === 'use' && args.length === 2) {
    await use(args[0], args[1]);
  } else {
    console.log(`
Source a blog hero image from Unsplash, with attribution and the download
trigger the API guidelines require.

  node scripts/unsplash.mjs search "small business storefront"
  node scripts/unsplash.mjs use <photoId> <post-slug>

The image is saved to public/blog/<post-slug>.jpg and the frontmatter is
printed. Hero images are self-hosted; the build rejects an external URL.
`);
    process.exit(1);
  }
}
