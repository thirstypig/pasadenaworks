import { describe, it, expect } from 'vitest';
import {
  analyze,
  prose,
  englishSyllables,
  spanishSyllables,
  verdict,
  TARGETS,
  FORMAL_MARKERS,
  COLLOQUIAL_MARKERS,
} from './readability.mjs';

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
