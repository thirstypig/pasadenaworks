/**
 * Reading time from a post's raw markdown body, at 200 words/minute,
 * rounded up, minimum 1 minute. Astro's glob loader exposes the raw
 * markdown source as `post.body` (frontmatter already stripped).
 */
const WORDS_PER_MINUTE = 200;

export function readingTime(body: string | undefined): number {
  if (!body) return 1;
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
