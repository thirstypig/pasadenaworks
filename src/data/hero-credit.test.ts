import { describe, it, expect } from 'vitest';
import {
  isUnsplashProfileUrl,
  withReferral,
  hasCreditNameWhenLinked,
  UNSPLASH_HOME,
  UTM_SOURCE,
} from './hero-credit';

/**
 * WHY THESE RULES EXIST. Signing up for the Unsplash API on 2026-09-08 moved
 * this site from the Unsplash LICENSE, where attribution is appreciated and
 * optional, to the API GUIDELINES, where it is required: "your application must
 * attribute Unsplash, the Unsplash photographer, and contain a link back to
 * their Unsplash profile", carrying
 * `?utm_source=<app>&utm_medium=referral`.
 *
 * Before this the site rendered `Photo: Campaign Creators` — a bare string with
 * no link and no campaign parameters. That is fine for the 20 images sourced
 * before the API and still covered by the plain licence, which is exactly why
 * `heroCreditUrl` is OPTIONAL: making it required would fail the build on 80
 * existing post files to satisfy a rule that does not apply to them.
 *
 * THE REASON THE HOST CHECK IS STRICT. `heroCreditUrl` becomes an outbound
 * link on every rendering of a post, and its value arrives from frontmatter —
 * hand-written, or typed into Tina by someone who is not reading this file. An
 * unconstrained URL there is an open redirect with the site's own byline
 * attached to it. `https://unsplash.com.evil.example/@x` is the case worth
 * naming: it contains the literal string "unsplash.com", starts with https, and
 * a `startsWith`/`includes` check waves it through. Parse the URL and compare
 * the HOST, never the string.
 */

describe('isUnsplashProfileUrl', () => {
  it.each([
    ['a profile URL', 'https://unsplash.com/@anniespratt'],
    ['a handle with digits', 'https://unsplash.com/@user2024'],
    ['a handle with underscores and hyphens', 'https://unsplash.com/@first_last-name'],
  ])('accepts %s', (_label, value) => {
    expect(isUnsplashProfileUrl(value), `expected ${value} to be accepted`).toBe(true);
  });

  it.each([
    ['http, not https', 'http://unsplash.com/@anniespratt'],
    ['a different host entirely', 'https://evil.example.com/@anniespratt'],
    // The lookalike: "unsplash.com" appears in the string, but the host is not it.
    ['a lookalike host with unsplash.com as a prefix', 'https://unsplash.com.evil.example/@x'],
    ['a subdomain that is not the site', 'https://evil.unsplash.com.attacker.test/@x'],
    ['a photo URL rather than a profile', 'https://unsplash.com/photos/XmfAjdvSZIU'],
    ['the bare homepage', 'https://unsplash.com/'],
    ['a profile path without the @', 'https://unsplash.com/anniespratt'],
    ['an empty string', ''],
    ['a bare handle', '@anniespratt'],
    ['javascript:', 'javascript:alert(1)'],
  ])('rejects %s', (_label, value) => {
    expect(isUnsplashProfileUrl(value), `expected ${value} to be rejected`).toBe(false);
  });
});

describe('withReferral', () => {
  it('adds the required campaign parameters to a bare URL', () => {
    expect(withReferral('https://unsplash.com/@anniespratt')).toBe(
      `https://unsplash.com/@anniespratt?utm_source=${UTM_SOURCE}&utm_medium=referral`,
    );
  });

  it('joins with & when the URL already carries a query string', () => {
    expect(withReferral('https://unsplash.com/@x?foo=bar')).toBe(
      `https://unsplash.com/@x?foo=bar&utm_source=${UTM_SOURCE}&utm_medium=referral`,
    );
  });

  it('tags the Unsplash home link too, which the guidelines require alongside the profile', () => {
    expect(withReferral(UNSPLASH_HOME)).toContain(`utm_source=${UTM_SOURCE}`);
    expect(withReferral(UNSPLASH_HOME)).toContain('utm_medium=referral');
  });
  /**
   * A FRAGMENT MUST NOT SWALLOW THE PARAMETERS. `isUnsplashProfileUrl` compares
   * `url.pathname`, and a fragment is not part of the path — so
   * `https://unsplash.com/@x#bio` is a valid profile URL and reaches this
   * function. Appending with a bare `?` puts the campaign parameters INSIDE the
   * fragment, which a browser never sends, so Unsplash receives no referral at
   * all while the rendered link still looks correct. Silent, exactly like the
   * other three obligations this file exists to keep.
   */
  it('keeps the parameters in the query when the URL carries a fragment', () => {
    const tagged = new URL(withReferral('https://unsplash.com/@x#bio'));
    expect(tagged.searchParams.get('utm_source')).toBe(UTM_SOURCE);
    expect(tagged.searchParams.get('utm_medium')).toBe('referral');
    expect(tagged.hash).toBe('#bio');
  });

  /** Re-tagging must not stack a second copy of either parameter. */
  it('replaces existing campaign parameters rather than appending a duplicate', () => {
    const tagged = new URL(withReferral('https://unsplash.com/@x?utm_source=somewhere-else'));
    expect(tagged.searchParams.getAll('utm_source')).toEqual([UTM_SOURCE]);
    expect(tagged.searchParams.getAll('utm_medium')).toEqual(['referral']);
  });
});

describe('hasCreditNameWhenLinked', () => {
  /**
   * THE STATE THIS EXISTS TO FORBID. Post.astro renders the linked caption only
   * when BOTH fields are set and the bare caption only when the name is set
   * without a URL — so a URL with no name renders NO caption at all: no
   * photographer, no profile link, no Unsplash link. That is precisely the
   * attribution the API guidelines require, absent, on a build that passes.
   */
  it('rejects a credit link with no photographer name', () => {
    expect(hasCreditNameWhenLinked('', 'https://unsplash.com/@x')).toBe(false);
    expect(hasCreditNameWhenLinked(undefined, 'https://unsplash.com/@x')).toBe(false);
    expect(hasCreditNameWhenLinked('   ', 'https://unsplash.com/@x')).toBe(false);
  });

  it('accepts the linked pair the API guidelines require', () => {
    expect(hasCreditNameWhenLinked('Annie Spratt', 'https://unsplash.com/@anniespratt')).toBe(true);
  });

  /** The 80 pre-API files carry a name and no URL, and must keep building. */
  it('accepts a bare name with no link, which is what the pre-API images have', () => {
    expect(hasCreditNameWhenLinked('Annie Spratt', undefined)).toBe(true);
  });

  /** A post with no hero image at all has neither field. */
  it('accepts both fields absent', () => {
    expect(hasCreditNameWhenLinked(undefined, undefined)).toBe(true);
  });
});
