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

/* ── Non-ASCII titles ──────────────────────────────────────────────────
   The bug these pin: the filename used to be slugified from `title`, so every
   Han character was stripped and a Chinese post landed at `<locale>/.md`. The
   first one became a hidden dotfile and the second silently overwrote it. The
   old test cases were all ASCII English, which is why it survived. */
describe('slugifyBlogFilename with non-ASCII titles', () => {
  it('uses the slug field, so a Chinese title produces a real filename', () => {
    expect(
      slugifyBlogFilename({
        locale: 'zh-hant',
        title: '怎麼開口請客戶留評價，又不尷尬',
        slug: 'ruhe-qing-kehu-liu-pingjia',
      }),
    ).toBe('zh-hant/ruhe-qing-kehu-liu-pingjia');
  });

  it('never collapses two different Chinese posts onto the same path', () => {
    const a = slugifyBlogFilename({
      locale: 'zh-hant',
      title: '怎麼開口請客戶留評價，又不尷尬',
      slug: 'ruhe-qing-kehu-liu-pingjia',
    });
    const b = slugifyBlogFilename({
      locale: 'zh-hant',
      title: '網站流量掉下來了，該怎麼處理',
      slug: 'wangzhan-liuliang-xiahua-zenme-chuli',
    });
    expect(a).not.toBe(b);
    expect(a).not.toBe('zh-hant/');
    expect(b).not.toBe('zh-hant/');
  });

  it('does not mangle accented Latin, because it no longer reads the title', () => {
    expect(
      slugifyBlogFilename({
        locale: 'es',
        title: '¿Necesito una página web si tengo Instagram?',
        slug: 'necesito-una-pagina-web-si-tengo-instagram',
      }),
    ).toBe('es/necesito-una-pagina-web-si-tengo-instagram');
  });

  it('falls back to the title when the slug field is still empty', () => {
    expect(slugifyBlogFilename({ locale: 'en', title: 'How to ask for reviews' })).toBe(
      'en/how-to-ask-for-reviews',
    );
  });

  it('never returns an empty basename, whatever it is given', () => {
    for (const values of [
      { locale: 'zh-hans', title: '網站' },
      { locale: 'zh-hans' },
      { locale: 'es', title: '¿¿¿' },
      undefined,
    ]) {
      expect(slugifyBlogFilename(values)).not.toMatch(/\/$/);
    }
  });
});
