import { describe, it, expect } from 'vitest';
import { isValidHeroImagePath, isProtocolRelative, hasTraversalSegment } from './hero-image';

/**
 * THE REGRESSION THESE EXIST FOR. Hero images were hotlinked from
 * images.unsplash.com until 2026-09-06, sending every reader's IP address and
 * referring URL to a third party before they had touched the consent banner
 * (todos/018). The images were self-hosted and the schema changed from
 * `z.string().url()` to a path check, so pasting a URL back in fails the build
 * rather than passing review.
 *
 * That first check had a hole, found by probing it rather than by reading it.
 * It rejected `https://host/x.jpg` and `http://host/x.jpg` — and ACCEPTED
 * `//images.unsplash.com/photo-1.jpg`, because a protocol-relative URL carries
 * no scheme and begins with a slash. It satisfied "starts with /" while
 * resolving in the browser to `https://images.unsplash.com/...`. The guard
 * caught the two spellings of an external image that announce themselves and
 * admitted the one that does not.
 *
 * `blog-content.test.ts` already asserts that no post currently hotlinks. That
 * is a corpus check: it passes trivially on a clean corpus and says nothing
 * about what the schema would ACCEPT. These are the cases the corpus does not
 * contain and, if the guard works, never will.
 */

describe('isValidHeroImagePath', () => {
  it.each([
    ['a file in an asset folder', '/blog/my-post.jpg'],
    ['nested folders', '/blog/2026/my-post.jpg'],
    ['a file at the web root', '/logo-lockup.png'],
    ['jpeg', '/blog/my-post.jpeg'],
    ['webp', '/blog/my-post.webp'],
    ['avif', '/blog/my-post.avif'],
    ['hyphens, underscores and dots in the name', '/blog/my-post_v2.final.jpg'],
  ])('accepts %s', (_label, value) => {
    expect(isValidHeroImagePath(value), `expected ${value} to be accepted`).toBe(true);
  });

  it.each([
    ['an https URL — the original hotlink', 'https://images.unsplash.com/photo-1.jpg'],
    ['an http URL', 'http://evil.example.com/x.jpg'],
    ['a PROTOCOL-RELATIVE URL — the hole', '//images.unsplash.com/photo-1.jpg'],
    ['a protocol-relative URL to any host', '//evil.example.com/x.png'],
    ['a path traversal', '/blog/../../etc/passwd.jpg'],
    ['a traversal segment in the middle', '/blog/2026/../secret.png'],
    ['a bare relative path', 'blog/my-post.jpg'],
    ['a bare filename', 'my-post.jpg'],
    ['an unsupported extension', '/blog/my-post.gif'],
    ['no extension at all', '/blog/my-post'],
    ['an empty string', ''],
    ['a data URI', 'data:image/png;base64,iVBORw0KGgo='],
  ])('rejects %s', (_label, value) => {
    expect(isValidHeroImagePath(value), `expected ${value} to be REJECTED`).toBe(false);
  });
});

describe('the individual rules, so a failure names its own cause', () => {
  it('identifies a protocol-relative URL', () => {
    expect(isProtocolRelative('//images.unsplash.com/x.jpg')).toBe(true);
    expect(isProtocolRelative('/blog/x.jpg')).toBe(false);
  });

  it('identifies a traversal segment without tripping on a dotted filename', () => {
    expect(hasTraversalSegment('/blog/../x.jpg')).toBe(true);
    // `..` only counts as a whole segment — a filename may legitimately
    // contain dots, and `my..post.jpg` is not a traversal.
    expect(hasTraversalSegment('/blog/my..post.jpg')).toBe(false);
    expect(hasTraversalSegment('/blog/my-post.final.jpg')).toBe(false);
  });
});
