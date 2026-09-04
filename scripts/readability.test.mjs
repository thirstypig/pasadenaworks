import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  analyze,
  prose,
  englishSyllables,
  spanishSyllables,
  verdict,
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
  const SIMPLIFIED = '们网这么马电买卖东车间时个简体为说话业应实让经营对开关产资讯页点线钱价评标题过还进发现样种级结给认识记录导际档条单处务动场广华选择显较观觉该误请谢读变属续总联职号术卫装复规视亲览访语议护财责费质轻输农远适乡银错钟闭阳阶随难静愿类飞饭养验';
  const TRADITIONAL = '們網這麼馬電買賣東車間時個簡體為說話業應實讓經營對開關產資訊頁點線錢價評標題過還進發現樣種級結給認識記錄導際檔條單處務動場廣華選擇顯較觀覺該誤請謝讀變屬續總聯職號術衛裝複規視親覽訪語議護財責費質輕輸農遠適鄉銀錯鐘閉陽階隨難靜願類飛飯養驗';

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
    expect(localeFromPath('dist/index.html')).toBe('en');
    expect(localeFromPath('dist/es/servicios/sitios-web/index.html')).toBe('es');
    expect(localeFromPath('dist/zh-hant/fuwu/wangzhan-jianzhi/index.html')).toBe('zh-hant');
    // A city called "es-something" must not read as Spanish.
    expect(localeFromPath('dist/websites/estancia/index.html')).toBe('en');
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
   * THE CROSS-CHECK. Blog posts are the only content measurable both ways,
   * and their agreement is the only evidence the rendered extraction is
   * faithful. They started 1.1 grades apart; the whole gap was page
   * furniture inside <main>. Anything that reopens it should fail here.
   */
  it('agrees with the markdown path on live posts, within half a grade', () => {
    const rendered = reportDist(join(BLOG_DIR, '../../../dist'));
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
