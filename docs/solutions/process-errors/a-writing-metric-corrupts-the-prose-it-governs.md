---
title: "A metric introduced to govern writing corrupts that writing, unless the formulas, the bands and the edit rules are designed against specific failure modes"
date: 2026-09-03
category: process-errors
component: "scripts/readability.mjs + scripts/readability.test.mjs — the house reading-level target set 2026-09-03, and CLAUDE.md § Register"
symptom: "A metric written to enforce a college-level reading target reported 19/20 Chinese posts already in band before a single word had been rewritten, because it measured characters-per-sentence and Chinese does not raise register by sentence length. Once corrected it failed three more ways: Flesch-Kincaid produced fabricated numbers on Spanish and Chinese, a floor with no ceiling passed a draft at grade 15.9 with 29.8-word sentences that was harder to read than the 6.7 draft it replaced, and four separate edits made purely to move the index produced worse Chinese than the text they replaced."
tags: [readability, metrics, goodharts-law, i18n, cjk, zh-hant, zh-hans, es, content-quality, silent-failure, test-coverage]
status: solved
---

## Summary

The owner set a house target of college-level reading across the whole site, in
four languages. A target needs a number, so `scripts/readability.mjs` was written
to score every post and report which were in band.

The measurement was wrong twice before it was right, and each way of being wrong
failed differently. The single sentence worth carrying away:

> **The index describes the prose. Editing the prose to move the index inverts
> what the index is for.**

That happened four times in one session, and each time the sentence got worse.

## How it surfaced

**The first metric declared the work finished before it started.** The Chinese
target was characters-per-sentence, banded 25–55. Run against the corpus it
reported **19/20 Chinese posts already in band, mean 32.3** — while every one of
those posts was written in plain conversational Chinese. Had the conversion
proceeded on that reading, the Chinese half of a four-language site would have
been marked complete without a word changing.

This is the same shape as
[the Tina glob that matched nothing](../integration-issues/tina-match-include-appends-the-format-and-matches-nothing.md):
a check that cannot fail looks exactly like a check that passes.

**Three further failures followed once the metric was measuring the right thing:**

- Flesch-Kincaid applied to Spanish inflates every score, because Spanish carries
  more syllables per idea. Applied to Chinese it is not merely inaccurate but
  meaningless — the syllable term divides by a vowel count that does not exist in
  Han script, and the word count assumes a segmentation this repo has no
  tokenizer for.
- `how-to-fire-a-customer` started at grade 6.7, the lowest in the corpus.
  Rewritten at higher density it came back at **15.9, at 29.8 words per
  sentence** — comfortably clear of a "college level means 13 or above" floor,
  and genuinely harder to read than the version it replaced. The same post was
  out of range in **both directions within one sitting**.
- Four edits were made to move the number rather than because the sentence wanted
  it. All four read worse:

  | Edit | What was written | Why it is wrong |
  |---|---|---|
  | `其實` wedged mid-clause | `…網站，其實，在讀者尚未讀畢之前…` | Mechanical insertion; the adverb has no work to do there |
  | Trailing `由於` (twice) | `…優於電子郵件，由於簡訊人們確實會讀` | `由於` **introduces** a clause; it does not trail one after a comma the way `因為` does |
  | `此外` introducing an example | `生意是會持續演變的；此外，您當年…零工修繕` | `此外` means "in addition"; what followed was an instance, not an addition |

## Root cause

**English and Chinese raise register through different machinery, and one number
cannot track both.**

English raises register mostly by subordinating clauses, so length and difficulty
move together — which is precisely why Flesch-Kincaid works at all.

Chinese raises register mostly by **lexical choice**: 書面語 over 口語. `所以`
becomes `因此`, `但是` becomes `然而`, `不是` becomes `並非`; sentence-final
particles (`吧` `呢` `啊` `嘛`) drop away. A Chinese post can be rewritten from
conversational to academic and land on **exactly the same characters-per-sentence**.
Length and difficulty come apart. Measuring length therefore measured nothing
about register, and returned a number that looked like a pass.

The deeper cause is that the metric was designed **by analogy** — "readability is
sentence length and word length, so measure that everywhere" — rather than by
asking, per language, what an author actually changes when raising the register.
The other three failures are variations on the same mistake:

- **A floor encodes "harder is always better."** That is false past a point, and
  the point arrives quickly. Without a ceiling the metric has no stopping
  condition, and a writer optimising against it gets no signal that they have
  overshot.
- **Goodhart's law, arriving on schedule.** Once a number governs prose, the
  cheapest way to move the number is to edit the prose *at* the number rather
  than *for* the reader.

## The fix

**1. One formula per language, chosen to match how that language encodes register.**

| Locale | Metric | Band |
|---|---|---|
| `en` | Flesch-Kincaid grade | 13–15 |
| `es` | Fernández Huerta (**lower = harder**) | 40–55 |
| `zh-hans` / `zh-hant` | 書面語 `registerIndex` | 0.55–0.85 |

Spanish uses Fernández Huerta with a purpose-written `spanishSyllables()` that
handles diphthongs — a weak vowel beside a strong one is one syllable
(`cui-da-do`) unless accented (`dí-a`). Counting every vowel separately overstates
by roughly 15% and pushes every Spanish post out of band for a reason that is not
real.

Chinese reports **no grade level at all**. It reports:

```
registerIndex = formal / (formal + colloquial + particles)
```

counted from `FORMAL_MARKERS`, `COLLOQUIAL_MARKERS` and `PARTICLES`. Only
multi-character markers are listed: single formal characters (亦, 即, 若, 之, 其)
are more discriminating in principle but occur inside unrelated compounds
constantly — `其` alone appears in 其他, 其中, 尤其 — so counting them would
measure vocabulary unrelated to register.

Re-run against the same corpus, the replacement reported **1/20 in band, mean
0.10** — the honest reading, and the inverse of what characters-per-sentence had
claimed.

**2. Every band carries a maximum, and the maximum is load-bearing.** It earned
its place twice in one session: the first zh-Hant draft came back at
`registerIndex` **1.00** (25 formal markers, zero colloquial relief — legal-filing
Chinese), and `how-to-fire-a-customer` at **15.9**. Both were in band against a
floor alone. `readability.test.mjs` asserts `max > min` and `Number.isFinite(max)`
for every locale, so a future target cannot degenerate into "more is always
better."

**3. A recurring error was promoted from a note to a test.** After a trailing
`由於` was written twice, a corpus guard now fails on `/[，,]\s*由[於于]/` across
every Chinese file, with the reasoning recorded beside it.

**4. Exclude from measurement exactly what is excluded from the rewrite.** UI text
is deliberately not raised — "Contact us" must not become "Initiate
correspondence" — so scoring it would create steady pressure to do precisely what
the house style forbids. `mainProse()` drops buttons, form labels, CTAs and page
furniture; `prose()` drops headings and every blockquote after the opening
summary, because the reviews post carries three templates a reader sends verbatim
to a customer and a text message written at college level is worse advice, not
better.

**5. The rule is not "never change the metric" — it is "measure which one is
broken."** On the Google Ads post the shortfall looked exactly like a scoring
artifact: words-per-sentence was already **23.7**, but polysyllabic density sat at
**14.1%** against roughly 20% elsewhere, because `$5.42` tokenises as two
one-syllable words and that post carries 29 figures. The proposed fix — excluding
numerals — was measured across all twenty English posts **before** being adopted.
Maximum movement was **+0.4**, most were **0.0**, against a **1.3**-grade
shortfall. So the measurement was close enough and the prose genuinely was
thinner. The vocabulary was raised and the metric left alone.

> Change the prose when the prose is the problem. Change the metric only when the
> metric is provably wrong. Run the measurement to find out which — rather than
> picking whichever is more convenient.

## Verifying

The blog is markdown and is scored at source via `prose()`. Service, city and
homepage copy lives in `src/data/*.ts` and reaches the reader through Astro
components, so it is scored from the **built** page via `mainProse()` /
`reportDist()` — whatever sits inside `<main>`.

Two measurement paths over one target is a latent inconsistency, and it surfaced
immediately: the paths disagreed by **1.1 grades** on identical posts. The gap was
neither the metric nor the prose. It was 44 words of page furniture inside
`<main>` — a "Back to blog" link, an image credit, and a closing CTA with a
button. Excluding those closed it to **0.3**.

Blog posts are now scored **both ways deliberately**, because their agreement is
the only evidence either extraction is faithful. That agreement is a test with a
half-grade tolerance, not something checked by hand once.

Two bugs were found by that test rather than by reading:

- The button exclusion matched only when `class` was the first attribute. The
  homepage CTA is written `<a href={…} … class="btn">`, so "Schedule a call now"
  was being scored as prose.
- `reportDist()` built its `page` key by stripping a literal `"dist"` prefix, so
  the returned path depended on whether the caller passed `"dist"` or an absolute
  path. The cross-check passed an absolute path, matched nothing, ran zero
  comparisons — and **failed its own positive control**, which is exactly what
  that control is for. The CLI passes an absolute path too, so `--dist` had never
  actually worked.

## Prevention

**Any category of text exempted from a standard must also be exempted from the
measurement of that standard.** Otherwise the measurement is quietly arguing
against the standard, and whoever is chasing the number eventually loses that
argument. The homepage was three grades short largely because "Company / Email /
Message / Send" were being counted as prose.

**Every absence check needs a paired presence check.** Applied throughout, per
[the greps-go-stale rule](../logic-errors/static-site-scheduled-publishing-needs-a-clock.md):
`hreflang` was verified positively (Alhambra emits four locales plus `x-default`)
**and** negatively (Glendale, English-only, emits zero). Sourced city facts were
re-asserted present in the built output after editing — 1926, Laura Scudder, 400
storefronts, 1895, Renaissance Plaza, Huntington Drive, 1887 — rather than trusted
from reading the diff.

**A denylist is a sample, not an alphabet.** The Simplified/Traditional script
guard failed its own verification: an injected `个/简/体` passed because only
twelve characters were listed. Widened to roughly ninety with a positive control.
Widening it immediately found a real mix that turned out to be **correct** —
`整體還是簡體官網` opens with the gloss `簡體（简体）`, and showing the reader both
systems is the entire subject of that article — so the exemption is per file and
carries its reason, with a test asserting every exempted filename still exists.

**Structural tests cannot see meaning, and register work lives in their blind
spot.** Every content test here checks shape: slug uniqueness, `pubDate` parity,
`translationKey` linkage, script purity. A fluent, confidently wrong sentence
passes all of them — this repo previously shipped `划算得多` ("much *more* worth
it") where the English says it pays off **less**. Register conversion rewrites
exactly the polarity-bearing sentences, so those need a human read against the
English twin. See
[the CJK slugify write-up](../integration-issues/tina-slugify-strips-cjk-and-collides-filenames.md)
for the sibling lesson: a test corpus must contain a sample from every locale the
product ships in.

### Regression check

```bash
npm run build                      # --dist scores the built pages
npm run readability                # source: expect 20/20 in all four locales
npm run readability -- --dist      # rendered: out-of-band pages only
npm test -- readability            # includes the two-path cross-check

# The cross-check must actually compare something. If dist/ is stale the
# comparison count is zero and the positive control fails rather than
# passing on an empty loop.
```

Adding any component inside `<main>` will fail the cross-check and name the post.
That is intended: it means the rendered extraction needs a new exclusion, or the
new component is prose that ought to be measured.

## Related

- [Tina collections indexed zero documents because `match.include` already gets the format appended](../integration-issues/tina-match-include-appends-the-format-and-matches-nothing.md) — the same failure shape: a check that cannot fail is indistinguishable from a check that passes.
- [Tina wrote every Chinese post to `<locale>/.md`](../integration-issues/tina-slugify-strips-cjk-and-collides-filenames.md) — CJK handling plus the "a test corpus must contain every locale the product ships in" rule.
- [Scheduled publishing on a static site needs a clock](../logic-errors/static-site-scheduled-publishing-needs-a-clock.md) — a correct rule plus the thing that runs it; also the source of the paired-presence-check discipline.
- [Astro dual-purpose route's bare `else` broke on a third kind](../logic-errors/dual-purpose-route-bare-else-broke-on-third-kind.md) — the repo's canonical silent-branch failure: valid code, no error, wrong result.
- `scripts/readability.mjs` — the design rationale lives in the file header, deliberately, so it is read before the targets are changed.
- `scripts/readability.test.mjs` — the band-has-a-ceiling assertion, the trailing-`由於` corpus guard, the script-mixing guard and its exemption check, and the two-path cross-check.
- `CLAUDE.md` § *Register: college level, set 2026-09-03* — the house rule, the per-locale targets, and what is deliberately not raised.
