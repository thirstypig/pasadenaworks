import { describe, it, expect } from 'vitest';
import { slugifyBlogFilename } from './utils';

describe('slugifyBlogFilename', () => {
  it('builds locale/kebab-title from a normal title', () => {
    expect(slugifyBlogFilename({ locale: 'en', title: 'How much should a website cost?' })).toBe(
      'en/how-much-should-a-website-cost'
    );
  });

  it('defaults to the "en" locale when none is set yet', () => {
    // Real scenario: a new post is mid-creation in Tina and the locale
    // field hasn't been picked yet when the filename is first generated.
    expect(slugifyBlogFilename({ title: 'Untitled draft' })).toBe('en/untitled-draft');
  });

  it('falls back to "untitled" when there is no title yet', () => {
    expect(slugifyBlogFilename({ locale: 'es' })).toBe('es/untitled');
  });

  it('handles a fully empty values object the same as no title/locale', () => {
    expect(slugifyBlogFilename({})).toBe('en/untitled');
  });

  it('collapses punctuation and whitespace into single hyphens, not one per character', () => {
    // A naive replace would leave "how---do-i---" — collapsing runs of
    // non-alphanumeric characters matters for a readable URL.
    expect(slugifyBlogFilename({ title: "How do I... (really)?!" })).toBe(
      'en/how-do-i-really'
    );
  });

  it('never leaves a leading or trailing hyphen', () => {
    expect(slugifyBlogFilename({ title: '"Quoted Title"' })).toBe('en/quoted-title');
  });

  it('lowercases mixed-case titles', () => {
    expect(slugifyBlogFilename({ title: 'SEO for Small Business' })).toBe(
      'en/seo-for-small-business'
    );
  });
});
