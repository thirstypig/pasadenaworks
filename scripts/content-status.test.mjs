import { describe, it, expect } from 'vitest';
import { parseFrontmatter, renderTable, readPosts } from './content-status.mjs';

/** Frontmatter as it actually appears in src/content/blog — the English
 *  files leave most values bare, the Chinese ones quote nearly everything.
 *  The parser has to accept both. */
const EN_RAW = `---
title: Do I need a website if I have Instagram?
pubDate: 2026-09-14T00:00:00.000Z
pillar: websites
heroImage: 'https://images.unsplash.com/photo-1753164597612?auto=format&w=1600'
draft: false
locale: en
translationKey: instagram-vs-website
---

> **TL;DR** — Sometimes, no.
`;

const ZH_RAW = `---
title: "中小企業網站架設費用要多少？"
pubDate: 2026-08-31T00:00:00.000Z
pillar: websites
draft: false
locale: zh-hant
translationKey: website-cost
---

body text
`;

describe('parseFrontmatter', () => {
  it('reads unquoted values', () => {
    expect(parseFrontmatter(EN_RAW).pillar).toBe('websites');
  });

  it('strips double quotes from CJK values', () => {
    expect(parseFrontmatter(ZH_RAW).title).toBe('中小企業網站架設費用要多少？');
  });

  it('keeps a colon that appears inside an unquoted value', () => {
    const raw = '---\ntitle: Rose Parade season: what to check\nlocale: en\n---\n';
    expect(parseFrontmatter(raw).title).toBe('Rose Parade season: what to check');
  });

  it('keeps a colon that appears inside a single-quoted URL', () => {
    expect(parseFrontmatter(EN_RAW).heroImage).toBe(
      'https://images.unsplash.com/photo-1753164597612?auto=format&w=1600',
    );
  });

  it("unescapes YAML's doubled apostrophe inside a single-quoted value", () => {
    const raw = "---\ntitle: 'Should you redesign, or fix what''s broken?'\nlocale: en\n---\n";
    expect(parseFrontmatter(raw).title).toBe('Should you redesign, or fix what\'s broken?');
  });

  it('reads booleans as booleans, not strings', () => {
    expect(parseFrontmatter(EN_RAW).draft).toBe(false);
  });

  it('ignores the body below the closing delimiter', () => {
    expect(parseFrontmatter(EN_RAW)['> **TL;DR** — Sometimes, no.']).toBeUndefined();
  });
});

/** Minimal post factory — only the fields the table reads. */
function post(over = {}) {
  return {
    title: 'A post',
    pubDate: new Date('2026-09-14T00:00:00.000Z'),
    pillar: 'websites',
    draft: false,
    locale: 'en',
    translationKey: 'k',
    ...over,
  };
}

const TODAY = new Date('2026-08-31T00:00:00.000Z');

describe('renderTable', () => {
  it('marks a fully translated, already-published post live', () => {
    const rows = renderTable(
      [
        post({ pubDate: new Date('2026-08-31T00:00:00.000Z'), translationKey: 'cost' }),
        post({ locale: 'es', translationKey: 'cost' }),
        post({ locale: 'zh-hans', translationKey: 'cost' }),
        post({ locale: 'zh-hant', translationKey: 'cost' }),
      ],
      TODAY,
    );
    expect(rows).toContain('✅ live');
  });

  it('counts down the days for an untranslated future post', () => {
    const rows = renderTable([post({ pubDate: new Date('2026-09-14T00:00:00.000Z') })], TODAY);
    expect(rows).toContain('⏳ 14 days');
  });

  it('flags a published post that has no translations', () => {
    const rows = renderTable([post({ pubDate: new Date('2026-06-01T00:00:00.000Z') })], TODAY);
    expect(rows).toContain('🚩 English-only');
  });

  it('does not flag a published post as English-only once all three exist', () => {
    const rows = renderTable(
      [
        post({ pubDate: new Date('2026-06-01T00:00:00.000Z'), translationKey: 'g' }),
        post({ locale: 'es', translationKey: 'g' }),
        post({ locale: 'zh-hans', translationKey: 'g' }),
        post({ locale: 'zh-hant', translationKey: 'g' }),
      ],
      TODAY,
    );
    expect(rows).not.toContain('🚩');
  });

  it('shows a draft as a draft regardless of its date', () => {
    const rows = renderTable([post({ draft: true, pubDate: new Date('2026-06-01') })], TODAY);
    expect(rows).toContain('✏️ draft');
  });

  it('shows a per-language check only for the languages that exist', () => {
    const rows = renderTable(
      [post({ translationKey: 'p' }), post({ locale: 'es', translationKey: 'p' })],
      TODAY,
    );
    const row = rows.split('\n').find((l) => l.includes('A post'));
    expect(row).toBe('| 2026-09-14 | A post | websites | ✅ | — | — | ⏳ 14 days |');
  });

  it('sorts by publish date ascending', () => {
    const rows = renderTable(
      [
        post({ title: 'Later', pubDate: new Date('2026-10-05'), translationKey: 'b' }),
        post({ title: 'Sooner', pubDate: new Date('2026-09-07'), translationKey: 'a' }),
      ],
      TODAY,
    );
    expect(rows.indexOf('Sooner')).toBeLessThan(rows.indexOf('Later'));
  });

  it('ignores non-English files when choosing which rows to show', () => {
    const rows = renderTable([post({ locale: 'es', translationKey: 'orphan' })], TODAY);
    expect(rows).not.toContain('A post');
  });
});

describe('renderTable grammar', () => {
  it('says "1 day", not "1 days", the day before a post publishes', () => {
    const rows = renderTable([post({ pubDate: new Date('2026-09-01T00:00:00.000Z') })], TODAY);
    expect(rows).toContain('⏳ 1 day |');
  });
});

/** Guards the hand-rolled parser against the real corpus, which mixes
 *  quoted and unquoted values, CJK, em dashes and colons inside titles. */
describe('the real content directory', () => {
  it('parses every post with all the fields the table needs', () => {
    const posts = readPosts();
    expect(posts.length).toBeGreaterThan(0);
    for (const p of posts) {
      expect(p.title, `title missing for a ${p.locale} post`).toBeTruthy();
      expect(p.pillar, `pillar missing for "${p.title}"`).toBeTruthy();
      expect(p.translationKey, `translationKey missing for "${p.title}"`).toBeTruthy();
      expect(Number.isNaN(p.pubDate.getTime()), `bad pubDate on "${p.title}"`).toBe(false);
    }
  });

  it('finds an English anchor for every translation', () => {
    const posts = readPosts();
    const english = new Set(posts.filter((p) => p.locale === 'en').map((p) => p.translationKey));
    const orphans = posts
      .filter((p) => p.locale !== 'en' && !english.has(p.translationKey))
      .map((p) => `${p.locale}/${p.title}`);
    expect(orphans).toEqual([]);
  });
});
