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
  pubDateRaw: string;
  draft: boolean;
  body: string;
  raw: string;
};

/**
 * Minimal frontmatter reader. Handles BOTH quote styles.
 *
 * It used to strip only double quotes, which made it disagree with
 * scripts/content-status.mjs's parseFrontmatter() over the same 80 files — the
 * two run the same orphan check and would have reached different answers on a
 * single-quoted value (`slug: 'foo'` came back as `'foo'`, quotes included).
 * Latent only because nothing in the corpus is single-quoted today; the schema
 * places no constraint on which style an author or Tina writes.
 */
function field(source: string, name: string, fallback?: string): string {
  const m = source.match(new RegExp(`^${name}:\\s*["']?(.+?)["']?\\s*$`, 'm'));
  // Fields with a zod default (`draft`) may legitimately be absent from a file;
  // absent must read as the default, not as a parse error.
  if (!m) {
    if (fallback !== undefined) return fallback;
    throw new Error(`missing frontmatter field "${name}"`);
  }
  return m[1].trim();
}

/**
 * Every `.md` under src/content/blog, at any depth — NOT just the four locale
 * directories' top level.
 *
 * The loader is `glob({ pattern: '**\/*.md' })`, so a file at
 * src/content/blog/post.md or src/content/blog/en/drafts/post.md IS in the
 * collection and DOES get a page. The old walk read exactly
 * ['en','es','zh-hans','zh-hant'] and kept only top-level files, so such a post
 * was invisible to every invariant below — slug uniqueness included, which is
 * the one that silently drops a post at build time with only a warning.
 *
 * Returns paths relative to BLOG, so `dir` is still the first segment.
 */
function markdownFiles(dir = ''): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(BLOG, dir), { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...markdownFiles(rel));
    else if (entry.name.endsWith('.md')) out.push(rel);
  }
  return out;
}

const posts: Post[] = markdownFiles().map((path) => {
  const dir = path.split('/')[0];
  const source = readFileSync(join(BLOG, path), 'utf-8');
  return {
    path,
    dir,
    slug: field(source, 'slug'),
    locale: field(source, 'locale'),
    translationKey: field(source, 'translationKey'),
    pubDate: field(source, 'pubDate').split('T')[0],
    pubDateRaw: field(source, 'pubDate'),
    draft: field(source, 'draft', 'false') === 'true',
    body: source.split(/^---$/m)[2] ?? '',
    // Whole file, frontmatter included. The polarity tripwires check this
    // rather than `body`: a reversed comparative in a `description` is at
    // least as damaging as one in the prose, because that is the line the
    // search result shows. (Distinct from readability, which deliberately
    // excludes meta descriptions — different job, different rule.)
    raw: source,
  };
});

/** Posts grouped by translationKey — one set (English + its translations) per entry. */
const byKey = new Map<string, Post[]>();
for (const p of posts) byKey.set(p.translationKey, [...(byKey.get(p.translationKey) ?? []), p]);

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
    const mismatched = [...byKey.entries()]
      .filter(([, group]) => new Set(group.map((p) => p.pubDate)).size > 1)
      .map(([key, group]) => `${key}: ${group.map((p) => `${p.locale}=${p.pubDate}`).join(', ')}`);

    expect(mismatched).toEqual([]);
  });

  it('gives every translation of a post the same draft flag, so a set publishes together', () => {
    // blog.ts gates on `draft` AND `pubDate` together, so a set that disagrees
    // on `draft` fails the same way a mismatched date does — but this one is a
    // two-click mistake in Tina, which edits one file at a time. English drafted
    // with a translation live builds a translated page whose English parent does
    // not exist, emitting an hreflang alternate at an unbuilt URL (hard rule #1).
    // English live with its translations drafted publishes English-only, in
    // silence — the exact outcome the translations were written to prevent.
    // `pillar` is deliberately not checked here: it only groups posts, so a
    // mismatch is cosmetic and costs nothing at build time.
    const mismatched = [...byKey.entries()]
      .filter(([, group]) => new Set(group.map((p) => p.draft)).size > 1)
      .map(([key, group]) => `${key}: ${group.map((p) => `${p.locale}=${p.draft}`).join(', ')}`);

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

  it('gives each locale at most one post per translationKey', () => {
    // getTranslationsFor() does `siblings.find((p) => p.data.locale === l)`, so
    // a translationKey reused by two posts in the SAME locale silently binds the
    // alternates to whichever one the loader happened to return first. Verified
    // during the 2026-09-03 review by duplicating a key: the affected post
    // shipped hreflang="en" and x-default pointing at a DIFFERENT URL than its
    // own canonical, which is the standard way to get dropped from a cluster.
    // Build exited 0 with 68 pages and every test passed.
    //
    // Realistic route: copying an existing post's frontmatter in Tina to start a
    // follow-up. translationKey is a free string there and nothing else looks at
    // it. The orphan check below is the mirror of this one — that catches a key
    // used by NO English post, this catches one used TWICE in a locale.
    const collisions = [...byKey.entries()].flatMap(([key, group]) => {
      const seen = new Map<string, string[]>();
      for (const post of group) seen.set(post.locale, [...(seen.get(post.locale) ?? []), post.path]);
      return [...seen.entries()]
        .filter(([, paths]) => paths.length > 1)
        .map(([locale, paths]) => `${key} has ${paths.length} ${locale} posts: ${paths.join(', ')}`);
    });

    expect(collisions).toEqual([]);
  });

  it('dates every post at midnight UTC, so the daily build cannot miss it', () => {
    // Publication is an INSTANT comparison (`pubDate <= now` in blog.ts) but the
    // clock that makes a date arrive is a single cron at 13:00 UTC. A pubDate of
    // T17:00Z is therefore not published on its own day — it waits for the next
    // day's run. Worse, the parity test above compares only the date PART, so
    // English at T17:00Z and Spanish at T09:00Z on the same calendar day pass as
    // identical while the 13:00Z build ships one and not the other: the exact
    // half-published set the draft-parity test was added to prevent, reachable
    // through the other half of the same gate.
    //
    // The corpus is all midnight today. The exposure is Tina, whose datetime
    // field seeds a new post from `new Date()` — i.e. the current time of day.
    // Pinning the invariant here makes the whole class impossible.
    const notMidnight = posts
      .filter((p) => {
        const raw = p.pubDateRaw.trim().replace(/^['"]|['"]$/g, '');
        if (!raw.includes('T')) return false; // a bare YYYY-MM-DD is midnight
        return !/T00:00:00(\.000)?Z$/.test(raw);
      })
      .map((p) => `${p.path} has pubDate ${p.pubDateRaw}`);

    expect(notMidnight).toEqual([]);
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

/**
 * A TRIPWIRE ON SENTENCES THAT HAVE ALREADY SHIPPED BACKWARDS — not a
 * semantic check, and it should never pretend to be one.
 *
 * Every other test in this file checks SHAPE: slug uniqueness, pubDate
 * parity, translationKey linkage, script purity. A fluent, well-formed,
 * confidently wrong sentence passes all of them. That is not hypothetical
 * here: both Chinese versions of the Spanish-website post once shipped
 * 划算得多 — "much MORE worth it" — where the English says it pays off
 * LESS, recommending a Spanish site to precisely the three business types
 * the post tells you to skip. Every structural test was green.
 *
 * The 2026-09-03 register conversion rewrote every post in four languages,
 * and register work rewrites exactly the polarity-bearing clauses:
 * comparatives, "more/less", "should/shouldn't", and modals. So the one
 * sentence known to have inverted before is pinned here, in each locale,
 * with a negative control on the inverted wording.
 *
 * This does not verify meaning in general and cannot. It is a place to add
 * a line each time a polarity error is found, so the same sentence cannot
 * flip twice.
 */
const POLARITY_TRIPWIRES: {
  translationKey: string;
  note: string;
  expected: Record<string, string>;
  forbidden: string[];
}[] = [
  {
    translationKey: 'spanish-website',
    note: 'a Spanish site pays off LESS for national-referral, niche-ecommerce and B2B-procurement businesses',
    expected: {
      en: 'pays off considerably less',
      es: 'Se paga considerablemente menos',
      'zh-hant': '回報便低得多',
      'zh-hans': '回报便低得多',
    },
    forbidden: ['划算得多', '更划算', 'más rentable', 'pays off considerably more'],
  },
  // Added 2026-09-03 after a fidelity audit found each of these had drifted.
  // All four are the shape the automated checks cannot see: a comparative, a
  // modal, a range, or a direction — correct-looking prose that says something
  // the English does not.
  {
    translationKey: 'redesign-or-fix',
    note: 'a redesign runs WELL INTO five figures — open-ended, not capped at the middle of the range',
    expected: {
      en: 'well into five figures',
      es: 'bien entradas las cinco cifras',
      'zh-hant': '五位數以上',
      'zh-hans': '五位数以上',
    },
    // 中段 ("mid-range") pins this to roughly $40-60k. It is the owner's own
    // pricing, and the same sentence renders "low four figures" correctly as
    // 四位數低段 — so the idiom was known and the wrong half was chosen.
    forbidden: ['五位數中段', '五位数中段'],
  },
  {
    translationKey: 'stop-offering-a-service',
    note: 'keeping a mismatched service CAN confuse customers — possibility, not assertion',
    expected: { 'zh-hant': '可能會讓潛在客人搞不清楚', 'zh-hans': '可能会让潜在顾客搞不清楚' },
    forbidden: ['反而會讓潛在客人', '反而会让潜在顾客'],
  },
  {
    translationKey: 'traffic-drop',
    note: 'you LIFT a suspension; 恢復停權 reads as restoring one',
    expected: { 'zh-hant': '解除停權', 'zh-hans': '解除停用' },
    forbidden: ['恢復停權', '恢复停用'],
  },
  {
    translationKey: 'google-ads-worth-it',
    note: 'the account needs watching WEEKLY — the body says so three times; the meta used to say daily',
    expected: { en: 'watching the account weekly' },
    forbidden: ['watching the account daily'],
  },
];

describe('polarity tripwires', () => {
  it('has a tripwire table that still matches real posts', () => {
    // Positive control. If a translationKey is renamed the table silently
    // guards nothing, and every assertion below passes on an empty set.
    for (const t of POLARITY_TRIPWIRES) {
      const set = posts.filter((p) => p.translationKey === t.translationKey);
      expect(set.length, `no posts for translationKey "${t.translationKey}"`).toBeGreaterThan(0);
    }
  });

  it.each(POLARITY_TRIPWIRES)('keeps $translationKey pointing the same way in every locale', (t) => {
    for (const [locale, needle] of Object.entries(t.expected)) {
      const post = posts.find((p) => p.translationKey === t.translationKey && p.locale === locale);
      expect(post, `${t.translationKey} missing its ${locale} version`).toBeDefined();
      expect(
        post!.raw.includes(needle),
        `${post!.path}: expected "${needle}" — ${t.note}`,
      ).toBe(true);
    }
  });

  it.each(POLARITY_TRIPWIRES)('never states the inverse of $translationKey anywhere in the corpus', (t) => {
    // Negative control, corpus-wide rather than per-file: the inversion has
    // to be absent everywhere, because the wrong claim is just as damaging
    // in a post that merely mentions the topic.
    for (const bad of t.forbidden) {
      const offenders = posts.filter((p) => p.raw.includes(bad)).map((p) => p.path);
      expect(offenders, `inverted wording "${bad}" — ${t.note}`).toEqual([]);
    }
  });
});
