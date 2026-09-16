import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  analyze,
  prose,
  englishSyllables,
  spanishSyllables,
  verdict,
  sentenceGuard,
  guardDetail,
  MAX_SENTENCE_CHARS,
  MAX_MEAN_CHARS_PER_SENTENCE,
  TARGETS,
  FORMAL_MARKERS,
  COLLOQUIAL_MARKERS,
  LOCALES,
  report,
  reportDist,
  mainProse,
  localeFromPath,
} from './readability.mjs';

const BLOG_DIR = join(dirname(fileURLToPath(import.meta.url)), '../src/content/blog');
const DIST_DIR = join(dirname(fileURLToPath(import.meta.url)), '../dist');

describe('prose extraction', () => {
  it('drops frontmatter, code and tables before measuring', () => {
    const body = prose(`---
title: x
---

## A heading that is deliberately a fragment

Real prose lives here and it is measured.

| col | col |
|---|---|
| a | b |

\`\`\`js
const notProse = 1;
\`\`\`
`);
    expect(body).toContain('Real prose lives here');
    expect(body).not.toContain('notProse');
    expect(body).not.toContain('title: x');
  });

  it('strips headings so subheadings cannot game the sentence average', () => {
    // Regression guard: headings are fragments. Counting them as sentences
    // would let a post drop its words-per-sentence — and so its grade —
    // by adding subheadings rather than by rewriting a single sentence.
    const withHeadings = prose('## Short\n\n## Also short\n\nOne sentence of real prose here.');
    expect(withHeadings).not.toContain('Also short');
  });

  it('keeps link text but discards the URL', () => {
    expect(prose('See [the Google guidance](https://example.com/a/b).')).toContain('the Google guidance');
    expect(prose('See [the Google guidance](https://example.com/a/b).')).not.toContain('example.com');
  });
});

describe('English syllables', () => {
  it.each([
    ['the', 1], ['website', 2], ['consulting', 3], ['optimization', 5],
    ['businesses', 3], ['people', 2], ['someone', 2], ['different', 3],
  ])('%s → %i', (word, expected) => {
    expect(englishSyllables(word)).toBe(expected);
  });

  /**
   * KNOWN LIMITATION, measured rather than assumed.
   *
   * The vowel-group heuristic is the standard way FK is implemented and it
   * miscounts a minority of words. The two that matter at this corpus's
   * scale were counted on 2026-09-03: `business` is over-counted by one
   * syllable and occurs 154 times; `actually` is under-counted by one and
   * occurs 85 times. Across 17,448 words those errors substantially cancel,
   * moving the corpus grade by roughly +0.05 — far inside the noise of a
   * 13–15 band.
   *
   * Recorded as a test so the next person finds the measurement instead of
   * rediscovering the miscount and reaching for a special-case dictionary.
   */
  it('over-counts "business" — known, measured, and not worth special-casing', () => {
    expect(englishSyllables('business')).toBe(3); // truly 2 (biz-ness)
    expect(englishSyllables('actually')).toBe(3); // truly 4 (ac-tu-al-ly)
  });
});

describe('Spanish syllables', () => {
  // The diphthong rule is the whole reason this function exists separately.
  it('treats a weak+strong vowel pair as one syllable', () => {
    expect(spanishSyllables('cuidado')).toBe(3);   // cui-da-do, not cu-i-da-do
    expect(spanishSyllables('bueno')).toBe(2);     // bue-no
  });

  it('breaks the diphthong when the weak vowel is accented', () => {
    expect(spanishSyllables('día')).toBe(2);       // dí-a
  });

  it('keeps two strong vowels apart', () => {
    expect(spanishSyllables('poeta')).toBe(3);     // po-e-ta
  });
});

describe('English grading', () => {
  it('scores plain short prose below college and dense prose above it', () => {
    const plain = analyze('The site is slow. Fix it. Then check it again. It should load fast.', 'en');
    const dense = analyze(
      'Because the deployment pipeline revalidates every dependency before promoting a build, '
      + 'the intermittent latency observed in production most plausibly originates in the '
      + 'configuration layer rather than in the application code itself.',
      'en',
    );
    expect(plain.fkGrade).toBeLessThan(6);
    expect(dense.fkGrade).toBeGreaterThan(13);
  });

  it('reports no Spanish or Chinese metric for an English post', () => {
    const r = analyze('A perfectly ordinary English sentence for measurement.', 'en');
    expect(r.fernandezHuerta).toBeNull();
    expect(r.registerIndex).toBeUndefined();
  });
});

describe('Spanish grading', () => {
  it('uses Fernández Huerta, not Flesch-Kincaid', () => {
    const r = analyze('El sitio es lento. Hay que arreglarlo pronto.', 'es');
    expect(r.fernandezHuerta).not.toBeNull();
    expect(r.fkGrade).toBeNull();
  });

  it('scores simple Spanish as easier (higher) than subordinated Spanish', () => {
    const simple = analyze('El sitio es lento. Hay que arreglarlo.', 'es');
    const complex = analyze(
      'Dado que la infraestructura de publicación revalida cada dependencia antes de promover '
      + 'una compilación, la latencia intermitente observada en producción probablemente se '
      + 'origina en la configuración y no en la aplicación.',
      'es',
    );
    expect(simple.fernandezHuerta).toBeGreaterThan(complex.fernandezHuerta);
  });
});

describe('Chinese register index', () => {
  // This is the metric that replaced characters-per-sentence. The first
  // version scored 19/20 posts "in band" on length alone, which said the
  // Chinese rewrite was already done. These two strings are the same
  // length and the same content at two registers — length cannot tell them
  // apart, and register must.
  const colloquial = '所以你的网站很慢，但是客户还有别的选择吧。不是每个人都会等呢。';
  const formal = '因此貴公司網站載入緩慢，然而客戶尚有其他選擇。並非所有人皆願等待。';

  it('scores colloquial Chinese low', () => {
    expect(analyze(colloquial, 'zh-hans').registerIndex).toBeLessThan(0.3);
  });

  it('scores formal Chinese high', () => {
    expect(analyze(formal, 'zh-hant').registerIndex).toBeGreaterThan(0.7);
  });

  it('counts sentence-final particles as spoken register', () => {
    const withParticles = analyze('因此如此。然而如此吧。此外如此呢。', 'zh-hant');
    const without = analyze('因此如此。然而如此。此外如此。', 'zh-hant');
    expect(withParticles.registerIndex).toBeLessThan(without.registerIndex);
  });

  it('reports no alphabetic grade for Chinese, ever', () => {
    const r = analyze(formal, 'zh-hant');
    expect(r.fkGrade).toBeNull();
    expect(r.fernandezHuerta).toBeNull();
  });

  it('shares no marker between the formal and colloquial lists', () => {
    // A marker in both lists would count twice with opposite signs and
    // quietly flatten the index toward 0.5 for every post.
    const overlap = FORMAL_MARKERS.filter((m) => COLLOQUIAL_MARKERS.includes(m));
    expect(overlap).toEqual([]);
  });
});

describe('sentenceGuard (the runaway-sentence ceilings)', () => {
  it('passes the whole Chinese blog corpus, with headroom', () => {
    // A tripwire, not a target. If this ever fails, the prose ran away — do not
    // raise a ceiling to make it pass. Blog maxima measured 2026-09-15:
    // longest sentence 176 against a ceiling of 220, mean 49.0 against 85.
    const tripped = report()
      .map((r) => [r, sentenceGuard(r)])
      .filter(([, code]) => code)
      .map(([r, code]) => {
        const { value, max, label } = guardDetail(r, code);
        return `${r.file}: ${value} ${label} (max ${max})`;
      });
    expect(tripped).toEqual([]);
  });

  /**
   * THE DEFECT THIS PAIR PINS, AND IT IS A NAMING FAILURE THAT BECAME A
   * MEASUREMENT FAILURE.
   *
   * `sentenceGuard` compared `result.charsPerSentence` — the page MEAN —
   * against a constant every comment, and CLAUDE.md, described as a
   * per-sentence ceiling ("no sentence over 85 characters"). A mean is not a
   * maximum. On 2026-09-14 a built page carried a sentence of exactly 85
   * characters while the guard reported `ok`, because its mean sat in the
   * forties; only a by-hand measurement found it.
   *
   * The first assertion below FAILS against the old implementation (a
   * 300-character sentence on a page whose mean is 40 returned null) and the
   * second one returns the wrong code (`'runaway'` for what is really a dense
   * page, sending a reader hunting for a long sentence that does not exist).
   * Both are the point of the fix, so both are pinned here rather than left to
   * the corpus checks, which pass either way while nothing is out of band.
   */
  it('reads the LONGEST sentence, not the page mean', () => {
    expect(sentenceGuard({ locale: 'zh-hant', longest: 300, charsPerSentence: 40 })).toBe('runaway');
    expect(sentenceGuard({ locale: 'zh-hans', longest: MAX_SENTENCE_CHARS + 1, charsPerSentence: 30 }))
      .toBe('runaway');
    expect(sentenceGuard({ locale: 'zh-hant', longest: MAX_SENTENCE_CHARS, charsPerSentence: 30 }))
      .toBeNull();
  });

  it('keeps the page mean as a separate check with its own code', () => {
    // Neither statistic subsumes the other: a page of uniformly 70-character
    // sentences has no runaway sentence, and a page with one 200-character
    // monster has an unremarkable mean. 'dense' vs 'runaway' is what tells the
    // reader which one to go looking for.
    expect(sentenceGuard({ locale: 'zh-hans', longest: 90, charsPerSentence: 90 })).toBe('dense');
    expect(sentenceGuard({ locale: 'zh-hans', longest: 90, charsPerSentence: MAX_MEAN_CHARS_PER_SENTENCE }))
      .toBeNull();
    // A runaway sentence outranks a dense page when both are true.
    expect(sentenceGuard({ locale: 'zh-hant', longest: 300, charsPerSentence: 90 })).toBe('runaway');
  });

  it('reports the number that actually tripped, against its own ceiling', () => {
    // Without this, both codes would print the mean and the ❌ line would name
    // a figure nothing compared.
    const r = { locale: 'zh-hant', longest: 300, charsPerSentence: 40 };
    expect(guardDetail(r, 'runaway')).toMatchObject({ value: 300, max: MAX_SENTENCE_CHARS });
    expect(guardDetail(r, 'dense')).toMatchObject({ value: 40, max: MAX_MEAN_CHARS_PER_SENTENCE });
  });

  /**
   * `analyze` must actually populate `longest` for Chinese, or the guard above
   * reads undefined on every real page and can never fire — the exact shape of
   * the bug it replaces. Three sentences, the middle one longest.
   */
  it('measures the longest sentence off real Chinese text', () => {
    const text = '因此如此。然而此事甚為複雜，故須逐項說明其緣由與後果，並列舉相關事例。此外如此。';
    const r = analyze(text, 'zh-hant');
    expect(r.longest).toBe(27);
    expect(r.longest).toBeGreaterThan(r.charsPerSentence);
  });

  /*
   * THE HALF THAT WAS MISSING, AND IT IS THE HALF THAT MATTERS. The assertion
   * above reads markdown, so it covers the blog and nothing else. Service, city
   * and homepage copy lives in src/data/*.ts, has no markdown source, and is
   * measurable only from the built page — and `sentenceGuard` was never called
   * on that path at all. The ceiling was therefore calibrated on a corpus that
   * structurally could not contain the copy most likely to trip it, which is
   * exactly how four service pages sat at 61.5–68.4 under a ceiling of 60
   * without anything noticing.
   *
   * Skips without dist/ like the cross-check below, which is why ci.yml re-runs
   * this suite AFTER the build.
   */
  it.skipIf(!existsSync(DIST_DIR))('passes the built pages too, which is where the copy with no markdown source lives', () => {
    const rendered = reportDist(DIST_DIR);
    const zh = rendered.filter((r) => r.locale?.startsWith('zh') && r.charsPerSentence != null);
    expect(zh.length, 'dist/ yielded no Chinese pages to measure').toBeGreaterThan(0);
    const tripped = zh
      .map((r) => [r, sentenceGuard(r)])
      .filter(([, code]) => code)
      .map(([r, code]) => {
        const { value, max, label } = guardDetail(r, code);
        return `${r.page}: ${value} ${label} (max ${max})`;
      });
    expect(tripped).toEqual([]);
  });

  it('actually fires — positive control', () => {
    // Without this, the assertions above are satisfied by a guard that can
    // never trigger, which is precisely the bug fixed on 2026-09-04: the header
    // claimed this guard existed for months while nothing compared the value to
    // anything.
    expect(sentenceGuard({ locale: 'zh-hant', longest: 400, charsPerSentence: 200 })).toBe('runaway');
    expect(sentenceGuard({ locale: 'zh-hans', longest: MAX_SENTENCE_CHARS + 0.1, charsPerSentence: 30 }))
      .toBe('runaway');
    expect(sentenceGuard({ locale: 'zh-hans', longest: 30, charsPerSentence: MAX_MEAN_CHARS_PER_SENTENCE + 0.1 }))
      .toBe('dense');
  });

  it('does not fire at or below either ceiling, and ignores non-zh locales', () => {
    expect(sentenceGuard({
      locale: 'zh-hant',
      longest: MAX_SENTENCE_CHARS,
      charsPerSentence: MAX_MEAN_CHARS_PER_SENTENCE,
    })).toBeNull();
    // en/es are excluded deliberately: their primary metrics are already
    // length-sensitive and carry upper bounds that catch the same failure.
    expect(sentenceGuard({ locale: 'en', longest: 5000, charsPerSentence: 500 })).toBeNull();
    expect(sentenceGuard({ locale: 'es', longest: 5000, charsPerSentence: 500 })).toBeNull();
  });

  it('reports nothing rather than a false pass when a value is missing', () => {
    expect(sentenceGuard({ locale: 'zh-hant', longest: null, charsPerSentence: null })).toBeNull();
    // A page with no `longest` at all must still be checked on its mean rather
    // than silently passing — the guard reads two fields now, and only one
    // being absent is not a reason to skip the other.
    expect(sentenceGuard({ locale: 'zh-hant', charsPerSentence: 300 })).toBe('dense');
    expect(sentenceGuard({ locale: 'zh-hant', longest: 300 })).toBe('runaway');
    expect(sentenceGuard(null)).toBeNull();
  });
});

describe('verdict', () => {
  it('reads the right metric per locale', () => {
    expect(TARGETS.en.metric).toBe('fkGrade');
    expect(TARGETS.es.metric).toBe('fernandezHuerta');
    expect(TARGETS['zh-hant'].metric).toBe('registerIndex');
  });

  it('flags below, ok and above against the English band', () => {
    expect(verdict({ locale: 'en', fkGrade: 9.3 })).toBe('below');
    expect(verdict({ locale: 'en', fkGrade: 14 })).toBe('ok');
    expect(verdict({ locale: 'en', fkGrade: 17 })).toBe('above');
  });

  it('has an upper bound on every locale, so "harder" can never pass forever', () => {
    // Without a max, the target degenerates into "more is always better"
    // and the rewrite has no stopping condition.
    for (const [locale, t] of Object.entries(TARGETS)) {
      expect(t.max, locale).toBeGreaterThan(t.min);
      expect(Number.isFinite(t.max), locale).toBe(true);
    }
  });
});

describe('quoted sample text', () => {
  const post = `---
title: x
---

> **TL;DR** — This opening summary constitutes the article's own prose and is
> therefore measured alongside everything else in the piece.

Ordinary article prose that the measurement should certainly include.

> Hey [name], glad the job worked out. No pressure either way.

More ordinary article prose follows the quoted template above.
`;

  it('keeps the opening summary, which is the article speaking', () => {
    expect(prose(post)).toContain("article's own prose");
  });

  it('drops a later quoted sample the reader will send verbatim', () => {
    // A text message to a customer must stay plain. Measuring it as article
    // prose would create pressure to make the template worse advice in
    // order to move a number that is describing something else.
    expect(prose(post)).not.toContain('No pressure either way');
  });

  it('keeps the prose on both sides of a dropped quote', () => {
    const out = prose(post);
    expect(out).toContain('should certainly include');
    expect(out).toContain('More ordinary article prose');
  });

  /**
   * KNOWN HOLE, left open deliberately and recorded rather than hidden.
   *
   * Because every blockquote after the first is dropped, a writer could in
   * principle park ordinary prose in a blockquote to keep it out of the
   * band. Nothing here prevents that. The guard is human: quoting prose you
   * wrote yourself reads as obviously strange in review. Closing it
   * mechanically would mean distinguishing "quoted sample" from "block
   * quotation" by content, which no rule available here does reliably.
   */
  it('can be dodged by parking prose in a blockquote — documented, not fixed', () => {
    const dodge = prose(`---
title: x
---

> **TL;DR** — summary text here for the opening block.

> Short. Simple. Plain. Would drag the grade down if it counted.
`);
    expect(dodge).not.toContain('Would drag the grade down');
  });
});

/**
 * THE BAND ITSELF, ASSERTED AGAINST THE REAL CORPUS.
 *
 * Everything else in this file tests the scoring ENGINE — syllable counting,
 * the grading formulas, the sentence guard, the grammar guards — against
 * synthetic sample text. Nothing asserted that an actual post lands inside
 * the house band, and `npm run readability` reports but does not fail, so
 * the only thing standing between a below-band post and `main` was somebody
 * remembering to read the output.
 *
 * They did not. Thirteen English posts and roughly as many Spanish ones
 * shipped outside the 13-15 / 40-55 bands with nothing red in CI, and were
 * only found when the owner asked for the numbers directly (2026-09-10).
 *
 * Proven before this guard was written, on the corpus as it then stood: a
 * post mangled into short declaratives dropped the English report to 67/68
 * in band while `npm run test` still reported 623 passing and
 * `npm run readability -- --dist` still exited 0.
 *
 * The `--dist` CLI exits non-zero only on a RUNAWAY SENTENCE, never on a
 * band miss, so it does not cover this either. That is what this test is
 * for. The bands are a house standard the owner set deliberately after
 * seeing the measurements; a standard nothing enforces is a preference.
 */
describe('corpus reading level', () => {
  const rows = report();

  it.each([...LOCALES])('every %s post sits inside the house band', (locale) => {
    const mine = rows.filter((r) => r.locale === locale);
    // A locale that silently stopped being scored would pass an "all in band"
    // check vacuously — the same absence-cannot-be-proven trap the script
    // purity table documents. Assert the corpus is actually there.
    expect(mine.length, `no ${locale} posts were scored at all`).toBeGreaterThan(0);

    const target = TARGETS[locale];
    const offenders = mine
      .filter((r) => verdict(r) !== 'ok')
      .map((r) => `${locale}/${r.file}: ${r[target.metric]} (${verdict(r)}, target ${target.label})`);
    expect(offenders).toEqual([]);
  });
});

describe('Chinese corpus grammar guards', () => {
  const zh = report().filter((r) => r.locale.startsWith('zh'));

  it('has Chinese posts to check', () => {
    // Positive control. An empty corpus would make every guard below pass
    // vacuously, which is the failure mode this repo has hit before.
    expect(zh.length).toBeGreaterThan(0);
  });

  /**
   * 由於 / 由于 introduces a clause; it does not trail one after a comma the
   * way 因為 does. Written twice during the 2026-09-03 register conversion,
   * both times while swapping a colloquial marker for a formal one purely to
   * move the register index — and both times it produced worse Chinese than
   * what it replaced.
   *
   * The lesson generalises past this one word: the index describes the
   * prose. Editing the prose to move the index, rather than editing it to
   * read better, inverts what the measurement is for.
   */
  it('never trails 由於/由于 after a comma', () => {
    const offenders = [];
    for (const row of zh) {
      const raw = readFileSync(join(BLOG_DIR, row.locale, row.file), 'utf8');
      for (const m of raw.matchAll(/[，,]\s*由[於于]/g)) {
        offenders.push(`${row.locale}/${row.file}: …${raw.slice(Math.max(0, m.index - 18), m.index + 8)}…`);
      }
    }
    expect(offenders).toEqual([]);
  });

  /**
   * `之所以…是因為` is a formal construction whose first half CONTAINS 所以,
   * which COLLOQUIAL_MARKERS counts. Raising a post's register by rewriting
   * 所以→因此 therefore mangles it into `之因此…`, which is not Chinese.
   *
   * This is not hypothetical. It happened twice in one session — ten
   * occurrences the first time, two the second — because the fix for a
   * below-band register score is a blanket connective swap, and 之所以 is the
   * one place where 所以 is not the colloquial word it looks like.
   *
   * The right repair is not 之所以 either, since that re-adds the colloquial
   * hit the swap was made to remove. Rewrite the clause as `X 的重要性在於…`
   * or `X 的要緊之處在於…`, which is higher register and carries no marker.
   */
  it('never mangles 之所以 into 之因此', () => {
    const offenders = [];
    for (const row of zh) {
      const raw = readFileSync(join(BLOG_DIR, row.locale, row.file), 'utf8');
      for (const m of raw.matchAll(/之因此/g)) {
        offenders.push(`${row.locale}/${row.file}: …${raw.slice(Math.max(0, m.index - 18), m.index + 10)}…`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

/**
 * The Latin-script twin of the two guards above, and it exists for exactly
 * the same reason: a below-band reading score tempts a blanket edit, and a
 * blanket edit damages prose in a way the score itself cannot see.
 *
 * English and Spanish are graded partly on words-per-sentence, so the cheap
 * way to raise a post is to splice adjacent sentences together with a
 * conjunction. Done mechanically that leaves the second sentence's capital
 * letter stranded mid-clause — `..., and A brochure site with a telephone
 * number presents less of one.` The grade goes up. The sentence is broken.
 *
 * This is not hypothetical either. Eighteen of these shipped to main across
 * four merged pull requests before anybody read the prose again, in eight
 * English posts and one Spanish one, and every one of them was produced by
 * the same automated join. They were split back apart on 2026-09-10.
 *
 * The repair is always to restore the sentence break, never to lowercase the
 * stranded word — the two sentences were joined because of a number, not
 * because they belonged in one sentence.
 */
describe('Latin-script corpus grammar guards', () => {
  const latin = report().filter((r) => r.locale === 'en' || r.locale === 'es');

  it('never strands a capitalized word mid-sentence after a conjunction', () => {
    const offenders = [];
    for (const row of latin) {
      const raw = readFileSync(join(BLOG_DIR, row.locale, row.file), 'utf8');
      for (const m of raw.matchAll(/,\s+(?:and|y)\s+(?:A|An|The|It|This|That|These|Those|There)\s/g)) {
        offenders.push(`${row.locale}/${row.file}: …${raw.slice(Math.max(0, m.index - 40), m.index + 24)}…`);
      }
    }
    expect(offenders).toEqual([]);
  });

  /**
   * The same join, caught from the other end. Where the swallowed sentence
   * began with a BRAND rather than an article, the mechanical edit lowercased
   * it instead of stranding a capital — `..., and google publishes those
   * conditions`, `..., and huy Fong cannot stop them`. Fourteen of these were
   * live on main alongside the eighteen above, and they are invisible to the
   * capitalized-word check because nothing about them looks capitalized.
   *
   * A SAMPLE, NOT AN INVENTORY — the same caveat the script-purity table
   * carries. These are the proper nouns this corpus actually uses; passing
   * means the common cases are clean, never that no brand was lowercased.
   * Widen it when a new one gets past.
   *
   * Matching is deliberately anchored to `, and` / `, y` rather than to the
   * bare lowercase word, because URLs, slugs, frontmatter keys and tag lists
   * legitimately carry `google` in lower case all over this corpus.
   */
  const BRANDS = ['google', 'yelp', 'instagram', 'venmo', 'shopify', 'squarespace',
    'stripe', 'wix', 'facebook', 'bing', 'chatgpt', 'perplexity', 'gemini',
    'huy Fong', 'trader Joe'];

  it('never lowercases a brand name after a joining conjunction', () => {
    const offenders = [];
    const re = new RegExp(`,\\s+(?:and|y|but|pero)\\s+(?:${BRANDS.join('|')})(?![A-Za-z-])`, 'g');
    for (const row of latin) {
      const raw = readFileSync(join(BLOG_DIR, row.locale, row.file), 'utf8');
      for (const m of raw.matchAll(re)) {
        offenders.push(`${row.locale}/${row.file}: …${raw.slice(Math.max(0, m.index - 40), m.index + 30)}…`);
      }
    }
    expect(offenders).toEqual([]);
  });

  /**
   * `..., y Y cerca del 80% de lo que vende` — the join ran into a sentence
   * that already opened with a conjunction and produced two in a row. One of
   * these was live in the Spanish Trader Joe's post.
   */
  it('never doubles a conjunction', () => {
    const offenders = [];
    for (const row of latin) {
      const raw = readFileSync(join(BLOG_DIR, row.locale, row.file), 'utf8');
      for (const m of raw.matchAll(/\b(?:and|y|but|pero|or|o)\s+(?:And|Y|But|Pero|Or|O)\b/g)) {
        offenders.push(`${row.locale}/${row.file}: …${raw.slice(Math.max(0, m.index - 40), m.index + 24)}…`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('Chinese corpus script purity', () => {
  const zh = report().filter((r) => r.locale.startsWith('zh'));

  /**
   * A SAMPLE, NOT AN ALPHABET. These are ~90 of the most common characters
   * that differ between the scripts, chosen for frequency in this corpus.
   * A first version used twelve and let an injected 个/简/体 through during
   * its own verification — the guard fired only once the injected character
   * happened to be on the list.
   *
   * Same shape of hole as the British-spelling denylist described in
   * `writing-american-english-copy`: passing means "the common cases are
   * clean", never "the scripts do not mix". Widen it when a leak gets past.
   */
  /* This list is now a strict SUPERSET of the PAIRS table in
 * src/utils/blog-content.test.ts. The two guards check the same invariant on
 * the same corpus and had drifted in BOTH directions — 18 characters were
 * caught only there, 70 only here — so each was silently missing leaks the
 * other would have caught. The 18 were merged in on 2026-09-03.
 *
 * They are kept separate rather than merged into one because of the exemption
 * asymmetry: this file carries exemptions (two posts deliberately gloss
 * 簡體（简体）) and blog-content.test.ts has no exemption mechanism at all. It
 * survives only because 简/体 happen to be absent from its table, so merging
 * the missing characters the other way would break the build on a deliberate
 * editorial choice with nowhere to record it. If they are ever unified, this
 * file is the one to keep. */
const SIMPLIFIED = '们网这么马电买卖东车间时个简体为说话业应实让经营对开关产资讯页点线钱价评标题过还进发现样种级结给认识记录导际档条单处务动场广华选择显较观觉该误请谢读变属续总联职号术卫装复规视亲览访语议护财责费质轻输农远适乡银错钟闭阳阶随难静愿类飞饭养验员图团够写废据构决确络计设证长队险顾';
  const TRADITIONAL = '們網這麼馬電買賣東車間時個簡體為說話業應實讓經營對開關產資訊頁點線錢價評標題過還進發現樣種級結給認識記錄導際檔條單處務動場廣華選擇顯較觀覺該誤請謝讀變屬續總聯職號術衛裝複規視親覽訪語議護財責費質輕輸農遠適鄉銀錯鐘閉陽階隨難靜願類飛飯養驗員圖團夠寫廢據構決確絡計設證長隊險顧';

  /**
   * One post is allowed to mix, and it is the post about mixing.
   *
   * "整體還是簡體官網" explains the difference between the two scripts to a
   * reader choosing between them, and its opening gloss is 簡體（简体） — the
   * Traditional term followed by the actual Simplified form in parentheses.
   * Showing the reader the thing being described is the correct editorial
   * call, so the exemption is per file and carries its reason, rather than
   * the guard being weakened for all twenty.
   */
  const SCRIPT_GUARD_EXEMPT = {
    'zhengti-haishi-jianti-guanwang.md':
      'glosses 簡體（简体） deliberately; the post is about the two scripts',
    'jianti-haishi-fanti-wangzhan.md':
      'same post in zh-hans; glosses the Traditional form for the same reason',
  };

  it('keeps Simplified and Traditional scripts from mixing', () => {
    const bad = [];
    for (const row of zh) {
      if (SCRIPT_GUARD_EXEMPT[row.file]) continue;
      const raw = readFileSync(join(BLOG_DIR, row.locale, row.file), 'utf8');
      const wrong = row.locale === 'zh-hant' ? SIMPLIFIED : TRADITIONAL;
      const hits = [...raw].filter((ch) => wrong.includes(ch));
      if (hits.length) bad.push(`${row.locale}/${row.file}: ${[...new Set(hits)].join('')}`);
    }
    expect(bad).toEqual([]);
  });

  it('every exemption names a file that still exists', () => {
    // An exemption for a renamed file silently widens the hole it was
    // opened for, and nothing else would ever notice.
    const present = new Set(zh.map((r) => r.file));
    for (const file of Object.keys(SCRIPT_GUARD_EXEMPT)) {
      expect(present.has(file), `${file} is exempted but not in the corpus`).toBe(true);
    }
  });

  it('the script guard actually fires on a mixed-script string', () => {
    // Positive control for the guard above, so it can never pass vacuously.
    const hitsInHant = [...'這裡有个簡體字'].filter((ch) => SIMPLIFIED.includes(ch));
    expect(hitsInHant).toContain('个');
    expect([...'这里有個简体字'].filter((ch) => TRADITIONAL.includes(ch))).toContain('個');
  });
});

describe('rendered-page extraction', () => {
  it('reads the locale off the built path', () => {
    // Paths are relative to the BUILD ROOT now — no fabricated 'dist' prefix.
    expect(localeFromPath('/index.html')).toBe('en');
    expect(localeFromPath('/es/servicios/sitios-web/index.html')).toBe('es');
    expect(localeFromPath('/zh-hant/fuwu/wangzhan-jianzhi/index.html')).toBe('zh-hant');
    expect(localeFromPath('index.html')).toBe('en');
    // A city called "es-something" must not read as Spanish.
    expect(localeFromPath('/websites/estancia/index.html')).toBe('en');
  });

  it('takes only what is inside <main>', () => {
    const html = '<header>site nav here</header><main><p>The prose that counts.</p></main><footer>footer text</footer>';
    const out = mainProse(html);
    expect(out).toContain('The prose that counts');
    expect(out).not.toContain('site nav');
    expect(out).not.toContain('footer text');
  });

  /**
   * Buttons, forms and calls to action are excluded because UI text is
   * deliberately NOT raised to college register — "Contact us" must not
   * become "Initiate correspondence". Measuring it would create pressure to
   * do exactly what the house style forbids.
   *
   * The attribute-order case is a real bug this caught: the homepage CTA is
   * written <a href={...} ... class="btn">, and an earlier version anchored
   * on `class` appearing first, so it silently measured the button text.
   */
  it('excludes buttons regardless of attribute order', () => {
    expect(mainProse('<main><a class="btn" href="/x">Press Here</a><p>Real prose.</p></main>')).not.toContain('Press Here');
    expect(mainProse('<main><a href="/x" rel="noopener" class="btn">Press Here</a><p>Real prose.</p></main>')).not.toContain('Press Here');
  });

  it('excludes form field labels', () => {
    const out = mainProse('<main><p>Real prose.</p><form><label>Company</label><label>Email</label><button>Send</button></form></main>');
    expect(out).toContain('Real prose');
    expect(out).not.toContain('Company');
    expect(out).not.toContain('Send');
  });

  it('drops headings, matching the markdown path', () => {
    expect(mainProse('<main><h2>Short Heading</h2><p>Body prose here.</p></main>')).not.toContain('Short Heading');
  });

  /**
   * LIST ITEMS END SENTENCES, on both paths and in every script. Bullets carry
   * no terminal punctuation by house style, and both splitters break only on
   * punctuation, so a seven-bullet list used to score as ONE sentence of a
   * hundred words. Found 2026-09-14 when a list-heavy service page measured
   * FK 25.4 while its paragraphs read near grade 11. Measured across the whole
   * corpus before adopting it: no blog post in any locale changed verdict
   * (largest shift 0.3), and the only pages that did were the ones being
   * rewritten in the same change.
   */
  it('counts each list item as its own sentence on the built page', () => {
    const two = '<main><ul><li>First plain item on the list</li><li>Second plain item on the list</li></ul></main>';
    expect(analyze(mainProse(two), 'en').sentences).toBe(2);
    expect(analyze(mainProse(two), 'es').sentences).toBe(2);
  });

  it('counts each list item as its own sentence in markdown, so the two paths agree', () => {
    const md = '- First plain item on the list\n- Second plain item on the list\n';
    expect(analyze(md, 'en').sentences).toBe(2);
    expect(analyze(mainProse('<main><ul><li>First plain item on the list</li><li>Second plain item on the list</li></ul></main>'), 'en').sentences)
      .toBe(analyze(md, 'en').sentences);
  });

  it('counts each list item as its own sentence in Chinese too', () => {
    const zh = '<main><ul><li>第一項服務內容的簡短說明</li><li>第二項服務內容的簡短說明</li></ul></main>';
    expect(analyze(mainProse(zh), 'zh-hant').sentences).toBe(2);
    expect(analyze('- 第一项服务内容的简短说明\n- 第二项服务内容的简短说明\n', 'zh-hans').sentences).toBe(2);
  });

  /**
   * A list of place names is furniture, not prose — the same category as the
   * nav and the form. Once list items became sentence ends, each two-word city
   * ("South Pasadena", "Monterey Park") scored as a two-word sentence and
   * dragged the localized homepages' averages toward zero; before that change
   * the names merely ran together unnoticed. Found 2026-09-14 on /es/.
   */
  it('excludes the service-area city list', () => {
    const out = mainProse('<main><p>Real prose about the practice.</p><ul class="service-area"><li>South Pasadena</li><li>Monterey Park</li></ul></main>');
    expect(out).toContain('Real prose');
    expect(out).not.toContain('South Pasadena');
  });

  /**
   * A city page's source list is citations, not prose: "CMS NPI Registry,
   * queried September 2026" would score as a five-word sentence per item and
   * drag every city page toward the bottom of its band.
   */
  it('excludes a city page’s source list', () => {
    const out = mainProse('<main><p>Real prose about the practice.</p><ul class="city-sources"><li><a href="https://x.example/">CMS NPI Registry, queried September 2026</a></li></ul></main>');
    expect(out).toContain('Real prose');
    expect(out).not.toContain('NPI Registry');
  });

  /**
   * The back-link at the foot of a service or city page is interface text — the
   * same category as the nav, the buttons, the form and the blog's own
   * `a.post__back`, all excluded above — and it was the last member of that
   * category still reaching a score. It lands as a three-word sentence on every
   * service and city page in all four locales.
   *
   * That is not arithmetic trivia. It drags words-per-sentence down, and
   * somebody then pays for it by merging two real sentences: the Spanish city
   * pages were carrying 60–71-word sentences against English twins whose
   * longest ran 25–37 (found 2026-09-15). The metric corrupting the prose it
   * governs, for the third time in this file's history.
   */
  it('excludes a service or city page’s back-link', () => {
    const out = mainProse('<main><p>Real prose about the practice.</p><p class="page-back"><a href="/websites/">&lsaquo; All cities</a></p></main>');
    expect(out).toContain('Real prose');
    expect(out).not.toContain('All cities');
  });

  it('does not double-count an item that already ends in punctuation', () => {
    const punctuated = '<main><ul><li>This item is a full sentence.</li><li>So is this second one here.</li></ul></main>';
    expect(analyze(mainProse(punctuated), 'en').sentences).toBe(2);
  });

  /**
   * THE CROSS-CHECK. Blog posts are the only content measurable both ways,
   * and their agreement is the only evidence the rendered extraction is
   * faithful. They started 1.1 grades apart; the whole gap was page
   * furniture inside <main>. Anything that reopens it should fail here.
   */
  /**
   * SKIPPED, not passed, when dist/ is absent. Both workflows run the unit
   * suite BEFORE the build, so this cannot see rendered output there — it is
   * an integration check wearing a unit test's clothes, and CI runs it again
   * as an explicit post-build step where dist/ does exist.
   *
   * Skipping is not the vacuous pass this test was written to avoid. That
   * danger is a dist/ which EXISTS but yields zero comparisons, and the
   * positive control below still covers exactly that.
   */
  it.skipIf(!existsSync(DIST_DIR))('agrees with the markdown path on live posts, within half a grade', () => {
    const rendered = reportDist(DIST_DIR);
    const live = [
      'why-customers-cant-find-your-business-on-google',
      'what-a-small-business-website-actually-needs',
      'when-to-raise-prices-small-business',
      'how-much-should-a-small-business-website-cost',
    ];
    let compared = 0;
    for (const slug of live) {
      const md = analyze(readFileSync(join(BLOG_DIR, 'en', `${slug}.md`), 'utf8'), 'en');
      const html = rendered.find((r) => r.page === `/blog/${slug}/index.html`);
      if (!html) continue; // date-gated out of the build
      compared += 1;
      expect(Math.abs(html.fkGrade - md.fkGrade), `${slug}: md ${md.fkGrade} vs html ${html.fkGrade}`).toBeLessThanOrEqual(0.5);
    }
    // Positive control: if the build is missing the comparison is vacuous.
    expect(compared, 'no live posts found in dist/ — run npm run build first').toBeGreaterThan(0);
  });

  /**
   * THE MARKER THE CITY-LIST EXCLUSION DEPENDS ON. mainProse() drops the
   * localized homepages' city list by its CSS class, and the hand-written
   * test above cannot notice a rename in the template
   * (src/pages/[locale]/index.astro). Nothing else would either: the rename
   * builds green, and `readability -- --dist` exits non-zero only on a runaway
   * sentence, never on a band miss. Skips without dist/, like the cross-check.
   */
  const SERVICE_AREA_UL = /<ul\b[^>]*\bclass="[^"]*\bservice-area\b[^"]*"[^>]*>/;
  const LOCALIZED_HOMEPAGES = ['es', 'zh-hans', 'zh-hant'];

  it.skipIf(!existsSync(DIST_DIR))('finds the service-area class on every built localized homepage', () => {
    for (const locale of LOCALIZED_HOMEPAGES) {
      const html = readFileSync(join(DIST_DIR, locale, 'index.html'), 'utf8');
      expect(
        SERVICE_AREA_UL.test(html),
        `dist/${locale}/index.html has no <ul class="service-area">. mainProse() drops the city list `
        + 'by that class, so renaming it silently puts every city name back into the score as its own '
        + 'two-word sentence. On /es/ that moved Fernández Huerta from 46 to 58 when found (2026-09-14), '
        + 'outside the 40–55 band, and from 47 to 55 on the 2026-09-15 build. Rename the class in '
        + 'mainProse() too, or restore it in src/pages/[locale]/index.astro.',
      ).toBe(true);
    }
  });

  /**
   * THE MARKER THE BACK-LINK EXCLUSION DEPENDS ON — the twin of the
   * service-area check above, and written for the same reason: mainProse()
   * drops the service and city pages' back-links by the `page-back` class, and
   * the hand-written unit test cannot notice a rename in
   * src/pages/websites/[city].astro, src/pages/services/[service].astro or
   * src/pages/[locale]/[section]/[service].astro.
   *
   * It is expressed as an invariant over the WHOLE BUILD rather than as a list
   * of paths, which buys two things a path list would not. It covers every
   * locale and both page types without restating the route table (a fifth
   * hand-written copy of it, in the terms this file's own localeFromPath
   * comment uses), and it fails on a NEW page type that grows an unclassed
   * back-link, not only on a rename of an existing one.
   *
   * The chevron ‹ (U+2039) is the house marker for a back-link — see
   * src/styles/display-glyphs.test.ts, which requires it because ← is outside
   * every Anton subset. So: inside <main>, after removing the two classes that
   * mainProse() excludes, no chevron may remain.
   */
  // Astro preserves the source entity, so a built page carries `&lsaquo;`
  // rather than the literal character. Match either, or this check sweeps the
  // whole build and finds nothing — which is exactly the vacuous pass the
  // positive control below exists to catch, and did catch while it was wrong.
  const CHEVRON = /&lsaquo;|‹/;
  const distPages = () => {
    const out = [];
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name === 'index.html') out.push(full);
      }
    };
    walk(DIST_DIR);
    return out;
  };

  it.skipIf(!existsSync(DIST_DIR))('leaves no unexcluded back-link inside <main> on any built page', () => {
    const offenders = [];
    let carried = 0;
    const locales = new Set();
    for (const file of distPages()) {
      const html = readFileSync(file, 'utf8');
      const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
      if (!CHEVRON.test(main)) continue;
      carried += 1;
      locales.add(localeFromPath('/' + relative(DIST_DIR, file).replace(/\\/g, '/')));
      const stripped = main
        .replace(/<p\b[^>]*\bclass="[^"]*\bpage-back\b[^"]*"[^>]*>[\s\S]*?<\/p>/g, ' ')
        .replace(/<a class="post__back"[\s\S]*?<\/a>/g, ' ');
      if (CHEVRON.test(stripped)) {
        offenders.push(relative(DIST_DIR, file));
      }
    }
    expect(
      offenders,
      'a back-link inside <main> carries neither class="page-back" nor class="post__back", so mainProse() '
      + 'scores it as its own three-word sentence. That drags words-per-sentence down and invites somebody '
      + 'to merge two real sentences to compensate — which is exactly how the Spanish city pages ended up '
      + 'with 60–71-word sentences against English twins running 25–37 (2026-09-15). Add the class in the '
      + 'template, or widen the exclusion in mainProse().',
    ).toEqual([]);
    // Positive controls: an empty sweep would pass vacuously, and a sweep that
    // only ever saw English would miss a rename in the localized route.
    expect(carried, 'no built page carries a back-link at all — the check is vacuous').toBeGreaterThan(40);
    expect([...locales].sort()).toEqual(['en', 'es', 'zh-hans', 'zh-hant']);
  });

  it.skipIf(!existsSync(DIST_DIR))('actually removes the back-link from a built city page’s score', () => {
    const html = readFileSync(join(DIST_DIR, 'websites', 'arcadia', 'index.html'), 'utf8');
    const withExclusion = mainProse(html);
    const withoutExclusion = mainProse(html.replace(/\bpage-back\b/g, 'renamed-back'));
    expect(withExclusion, 'the back-link reached the Arcadia score').not.toContain('All cities');
    expect(withoutExclusion, 'renaming the class should let it through; the control is vacuous').toContain('All cities');
    expect(analyze(withoutExclusion, 'en').sentences).toBeGreaterThan(analyze(withExclusion, 'en').sentences);
    // And it is worth a grade, not a rounding error: Arcadia read 14.7 with the
    // back-link counted and 15.7 without it (2026-09-15).
    expect(analyze(withExclusion, 'en').fkGrade - analyze(withoutExclusion, 'en').fkGrade).toBeGreaterThan(0.5);
  });

  /**
   * Positive control for the check above, so it is not decorative: on the
   * built /es/ page the exclusion must actually remove a city and change the
   * score. "Monrovia" appears inside <main> only in that list. If the prose
   * ever mentions it, pick another city that the list alone carries.
   */
  it.skipIf(!existsSync(DIST_DIR))('actually removes the city list from the built /es/ score', () => {
    const html = readFileSync(join(DIST_DIR, 'es', 'index.html'), 'utf8');
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
    expect(main.split('Monrovia').length - 1, 'Monrovia should appear in <main> exactly once, inside the city list').toBe(1);

    const withExclusion = mainProse(html);
    const withoutExclusion = mainProse(html.replace(/\bservice-area\b/g, 'renamed-area'));
    expect(withExclusion, 'the city list reached the /es/ homepage score').not.toContain('Monrovia');
    expect(withoutExclusion, 'renaming the class should let the list through; the control is vacuous').toContain('Monrovia');
    expect(analyze(withoutExclusion, 'es').sentences).toBeGreaterThan(analyze(withExclusion, 'es').sentences);
  });
});

describe('degenerate input', () => {
  /**
   * `reportDist` runs `analyze` over every built page, including tiny ones
   * whose <main> is almost entirely nav and buttons. If a short page threw or
   * produced NaN, `npm run readability -- --dist` would break on the whole
   * site rather than on the one page — so this pins the floor rather than any
   * particular score.
   */
  it.each(['en', 'es', 'zh-hans', 'zh-hant'])('never throws or returns NaN for %s', (locale) => {
    for (const text of ['', ' ', 'Word', '網', 'no terminator here']) {
      const r = analyze(text, locale);
      const value = r[TARGETS[locale].metric];
      expect(Number.isNaN(value), `${locale} / ${JSON.stringify(text)}`).toBe(false);
      expect(verdict(r) === null || ['below', 'ok', 'above'].includes(verdict(r))).toBe(true);
    }
  });

  /**
   * REGRESSION: the early return used to hardcode `fkGrade: null` for every
   * locale, so a one-word Spanish page came back carrying English's metric key
   * and no `fernandezHuerta` at all. `JSON.stringify` drops undefined, so
   * `--json` emitted no Spanish field whatsoever — a consumer could not
   * distinguish "no value" from "key not emitted".
   */
  it("keeps every locale's own metric key present, so --json cannot drop it", () => {
    for (const locale of LOCALES) {
      const json = JSON.parse(JSON.stringify(analyze('Word', locale)));
      const key = TARGETS[locale].metric;
      expect(Object.hasOwn(json, key), `${locale} lost "${key}" through JSON`).toBe(true);
      expect(json[key], `${locale} ${key}`).toBeNull();
    }
  });

  it('reports no verdict rather than a false "below" when nothing is measurable', () => {
    // A page with no measurable prose is not failing the band; it is silent
    // about it. Returning 'below' would put unmeasurable pages on the
    // out-of-band list and invite someone to pad them.
    expect(verdict(analyze('', 'en'))).toBeNull();
    expect(verdict(analyze('Hola', 'es'))).toBeNull();
  });
});
