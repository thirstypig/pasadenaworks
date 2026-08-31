import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/**
 * Integrity checks over the actual markdown in src/content/blog/.
 *
 * These are deliberately NOT covered by src/utils/blog.test.ts, which mocks
 * `astro:content` and therefore only exercises the query predicate. Everything
 * here is a property of hand-authored files, and every one of these failures is
 * SILENT — the build succeeds and the output looks plausible. Zod already
 * enforces field presence and types at build time, so nothing here re-checks
 * the schema; these are the invariants zod can't see.
 */

const BLOG = fileURLToPath(new URL('../content/blog', import.meta.url));
const LOCALES = ['en', 'es', 'zh-hans', 'zh-hant'] as const;

type Post = {
  path: string;
  dir: string;
  slug: string;
  locale: string;
  translationKey: string;
  pubDate: string;
  body: string;
};

function field(source: string, name: string): string {
  const m = source.match(new RegExp(`^${name}:\\s*"?(.+?)"?\\s*$`, 'm'));
  if (!m) throw new Error(`missing frontmatter field "${name}"`);
  return m[1].trim();
}

const posts: Post[] = LOCALES.flatMap((dir) =>
  readdirSync(join(BLOG, dir))
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const path = join(dir, f);
      const source = readFileSync(join(BLOG, dir, f), 'utf-8');
      return {
        path,
        dir,
        slug: field(source, 'slug'),
        locale: field(source, 'locale'),
        translationKey: field(source, 'translationKey'),
        pubDate: field(source, 'pubDate').split('T')[0],
        body: source.split(/^---$/m)[2] ?? '',
      };
    })
);

describe('blog content integrity', () => {
  it('finds every post (guards against the glob path silently going stale)', () => {
    expect(posts.length).toBeGreaterThan(20);
    for (const locale of LOCALES) {
      expect(posts.some((p) => p.dir === locale)).toBe(true);
    }
  });

  it('gives every post a slug unique across ALL locales, not just within one', () => {
    // Astro's glob loader dedupes on `slug` globally. Two locales sharing a
    // romanization (e.g. both Chinese variants using the same Pinyin) silently
    // drops one entry at build time with only a [glob-loader] warning — the
    // build still succeeds. This has already happened once in this repo.
    const seen = new Map<string, string>();
    const collisions: string[] = [];
    for (const p of posts) {
      const prior = seen.get(p.slug);
      if (prior) collisions.push(`"${p.slug}" in both ${prior} and ${p.path}`);
      else seen.set(p.slug, p.path);
    }
    expect(collisions).toEqual([]);
  });

  it('dates every translation of a post identically, so a set publishes together', () => {
    // Since posts are gated on pubDate, a typo'd date in one language means
    // that language publishes on a different day — the English post goes live
    // with no alternate for it, which is exactly what translating it prevented.
    const byKey = new Map<string, Post[]>();
    for (const p of posts) byKey.set(p.translationKey, [...(byKey.get(p.translationKey) ?? []), p]);

    const mismatched = [...byKey.entries()]
      .filter(([, group]) => new Set(group.map((p) => p.pubDate)).size > 1)
      .map(([key, group]) => `${key}: ${group.map((p) => `${p.locale}=${p.pubDate}`).join(', ')}`);

    expect(mismatched).toEqual([]);
  });

  it('backs every translation with an English post of the same translationKey', () => {
    // A typo'd translationKey builds a page that nothing ever links to as an
    // alternate — an orphan, reachable only by direct URL.
    const english = new Set(posts.filter((p) => p.locale === 'en').map((p) => p.translationKey));
    const orphans = posts
      .filter((p) => p.locale !== 'en' && !english.has(p.translationKey))
      .map((p) => `${p.path} (translationKey: ${p.translationKey})`);
    expect(orphans).toEqual([]);
  });

  it('matches each post\'s locale field to the directory it lives in', () => {
    // Routing reads the frontmatter, not the path, so a mismatch files a post
    // under the wrong language without any error.
    const wrong = posts.filter((p) => p.locale !== p.dir).map((p) => `${p.path} declares locale: ${p.locale}`);
    expect(wrong).toEqual([]);
  });
});

/**
 * Script purity. Checked as explicit character PAIRS rather than Unicode
 * ranges: many Han characters (荒, 中, 生) are identical in both scripts, so a
 * range-based check produces false positives — a broken test is worse than no
 * test. Each pair below is [traditional, simplified].
 */
const PAIRS: [string, string][] = [
  ['這', '这'], ['個', '个'], ['們', '们'], ['時', '时'], ['實', '实'],
  ['業', '业'], ['產', '产'], ['頁', '页'], ['費', '费'], ['錢', '钱'],
  ['價', '价'], ['點', '点'], ['麼', '么'], ['樣', '样'], ['讓', '让'],
  ['動', '动'], ['務', '务'], ['團', '团'], ['隊', '队'], ['經', '经'],
  ['營', '营'], ['間', '间'], ['話', '话'], ['設', '设'], ['計', '计'],
  ['構', '构'], ['訊', '讯'], ['認', '认'], ['寫', '写'], ['覺', '觉'],
  ['處', '处'], ['應', '应'], ['該', '该'], ['決', '决'], ['題', '题'],
  ['選', '选'], ['買', '买'], ['賣', '卖'], ['長', '长'], ['續', '续'],
  ['顧', '顾'], ['條', '条'], ['險', '险'], ['護', '护'], ['級', '级'],
  ['為', '为'], ['現', '现'], ['證', '证'], ['據', '据'], ['員', '员'],
  ['錯', '错'], ['過', '过'], ['導', '导'], ['類', '类'], ['夠', '够'],
  ['圖', '图'], ['確', '确'], ['語', '语'], ['廢', '废'], ['網', '网'],
  ['絡', '络'], ['說', '说'], ['對', '对'], ['開', '开'], ['關', '关'],
  ['檔', '档'],
];

describe('Chinese script purity', () => {
  it('writes zh-hant entirely in Traditional characters', () => {
    const leaks: string[] = [];
    for (const p of posts.filter((x) => x.locale === 'zh-hant')) {
      for (const [trad, simp] of PAIRS) {
        if (p.body.includes(simp)) leaks.push(`${p.path}: found simplified "${simp}" (should be "${trad}")`);
      }
    }
    expect(leaks).toEqual([]);
  });

  it('writes zh-hans entirely in Simplified characters', () => {
    const leaks: string[] = [];
    for (const p of posts.filter((x) => x.locale === 'zh-hans')) {
      for (const [trad, simp] of PAIRS) {
        if (p.body.includes(trad)) leaks.push(`${p.path}: found traditional "${trad}" (should be "${simp}")`);
      }
    }
    expect(leaks).toEqual([]);
  });
});
