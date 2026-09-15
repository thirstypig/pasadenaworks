---
title: "The readability scorer counted a bulleted list as one sentence, and correcting it moved a page the check had filed under something else"
date: 2026-09-14
category: process-errors
component: "scripts/readability.mjs — prose(), mainProse(), LIST_ITEM_END and the Latin/CJK sentence splitters; scripts/readability.test.mjs; CLAUDE.md § Register"
symptom: "A list-heavy service page measured Flesch-Kincaid 25.4 while its paragraphs read near grade 11. Bullets carry no terminal punctuation by house style, and both sentence splitters broke only on punctuation, so every bullet ran into the next and a seven-item list scored as one hundred-word sentence. Fixing that turned each two-word city in the localized homepages' service-area list into a two-word sentence and pulled /es/ from Fernández Huerta 46 to 58, outside the 40–55 band."
tags: [readability, metrics, measurement, sentence-splitting, lists, i18n, es, recalibration, silent-failure, test-coverage]
status: solved
---

## Summary

`scripts/readability.mjs` decides where a sentence ends by looking for
punctuation. House style gives bullet points no terminal punctuation. So a
bulleted list had no sentence ends inside it at all, and the scorer read the
whole list, plus whatever sentence followed it, as one enormous sentence.

That bug made any list-heavy page score harder than its prose really was, and it
did so quietly: the number came out plausible, the build was green, and nothing flagged it. It
was fixed on 2026-09-14 inside PR #75 by commit `246eabd`, which makes every list
item end a sentence on both scoring paths. Twenty-nine minutes later a second
commit, `afa5d4c`, fixed the side effect the first one created on the localized
homepages.

Two lessons, both from the owner:

> **Every correction to the instrument gets the same whole-corpus check as the
> first one.**

> **A score that lands in band because of a measurement bug is not evidence the
> prose is right.**

## How it surfaced

PR #75 rewrote the service pages for health practices, and those pages lean on
bulleted lists. One of them measured **FK 25.4**, far above the 13–15 band,
while its paragraphs read near **grade 11**. A page cannot be both, so either the
prose or the measurement was wrong. It was the measurement.

## Root cause

The site is scored two ways (see
[the metric write-up](a-writing-metric-corrupts-the-prose-it-governs.md)): blog
posts from markdown through `prose()`, and service, city and homepage copy from
the built HTML through `mainProse()`. Both hand their text to the same
splitters in `analyze()`, and before the fix those splitters were:

```js
const CJK_SENTENCE_END = /[。！？!?]+/;
// ...and for English and Spanish:
body.split(/[.!?]+(?=\s|$)/)
```

Neither path marked where a list item ended. `prose()` stripped the `- ` bullet
markers and left no boundary behind. `mainProse()` replaced every tag, `</li>`
included, with a space. Either way, a list reached the splitter as a run of
unpunctuated phrases. The commit message puts it plainly: a seven-bullet list
scored as one hundred-word sentence.

The distortion only ever points one way. Merging sentences raises words per
sentence, and words per sentence feeds both Flesch-Kincaid (higher reads harder)
and Fernández Huerta (lower reads harder). So the bug could only make a list-heavy
page look harder than it is. On a college-level target, that makes thin prose
look like it passes.

The code defect was one missing boundary, and the one-line cause is not the
lesson. It is filed as a process error because what went wrong was
verification. The splitters had been checked against paragraphs only (no test
before `246eabd` fed them a list). The correction itself also moved a page for
a reason its own check did not identify, as described below.

## The fix

**1. One marker, added by both extraction paths and recognized by every
splitter** (`246eabd`):

```js
const LIST_ITEM_END = '';

// prose(), markdown: end every bullet or numbered line with the marker
body = body.replace(/^(\s*(?:[-*+]|\d+\.)\s+.*\S)\s*$/gm, `$1 ${LIST_ITEM_END}`);

// mainProse(), built HTML: end every list item with it
t = t.replace(/<\/li>/g, ` ${LIST_ITEM_END} </li>`);

// analyze(): all three splitters treat it as a sentence end
const CJK_SENTENCE_END = new RegExp(`[。！？!?${LIST_ITEM_END}]+`);
const CJK_CLAUSE_END = new RegExp(`[。！？，、；：!?,;:${LIST_ITEM_END}]+`);
const LATIN_SENTENCE_END = new RegExp(`[.!?${LIST_ITEM_END}]+(?=\\s|$)`);
```

Two details carry weight here:

- **It is a private-use code point on purpose.** A real separator such as
  U+2029 counts as whitespace to JavaScript's `\s`, and `mainProse()` ends by
  collapsing all whitespace, which would silently erase it.
- **Both paths change together.** The blog is scored both ways, and a test
  requires the two scores to agree within half a grade. Fixing only one path
  would have broken that agreement, or worse, hidden the bug on the other path.

An item that already ends in a period is not counted twice. The splitter breaks
at the period and again at the marker, and the empty fragment between them is
thrown away, because fragments of one word or less never count as sentences.

As first committed, the constant held the raw U+E000 character, which editors,
diffs and GitHub all display as `''`. A well-meaning cleanup would have broken
sentence splitting in all four languages. The PR #75 review flagged this
(`todos/039`), and on 2026-09-15 it was rewritten as the escape `''`, with
the same value at runtime.

**2. The side effect, and its fix** (`afa5d4c`). The localized homepages carry a
service-area list of city names. Before the fix, those names ran together into
one sentence that nobody noticed. After it, each city became its own sentence.
The Latin splitter throws away one-word fragments, so a city like "Monrovia"
dropped out, but "South Pasadena" and "Monterey Park" each counted as a two-word
sentence. That dragged the page's average sentence length toward zero and pulled
**/es/ from Fernández Huerta 46 to 58**, outside the 40–55 band.

A list of place names is page furniture, the same category as the nav and the
contact form, which `mainProse()` already drops:

```js
// The localized homepages' service-area list is place names, not prose.
t = t.replace(/<ul\b[^>]*\bclass="[^"]*\bservice-area\b[^"]*"[^>]*>[\s\S]*?<\/ul>/g, ' ');
```

After the exclusion, the blog corpus was re-checked and stayed at 68/68 in band
in every locale.

**3. The prose the bug had been flattering was raised by hand.** Once lists were
scored fairly, the approved English drafts of the Checkup and Get more patients
pages measured **FK 7.1 and 10.7**, below the band. Both were raised by hand to
**13.4 and 13.0**, with the same meaning and no new promises (`7b60756`; spec
§3). The third service, Digitize the office, was written after the fix and
measured **FK 13.0** on the built page (`cf2f17f`). No score from before the fix
was recorded for either draft, so there is no record of how far the bug had
lifted them. What is recorded is where they landed once it was gone.

## Verifying: the whole-corpus check

The rule for changing the instrument comes from the Chinese sentence-ceiling
recalibration in `CLAUDE.md`: a change to the metric is a correction, not a way
to snooze a failure, only if it was measured against the complete corpus before
anyone adopted it. `246eabd` was measured that way. Every blog post in all four
locales kept its verdict, and the largest shift was **0.3**.

In practice the check is short:

1. Score every item twice, once with the old scorer and once with the new one:
   every markdown post in every locale, and every built page.
2. Join the two runs item by item. List **every** row whose verdict changed or
   whose score moved at all, not just the rows that left the band.
3. Explain each row that moved. A row nobody can explain means the check has not
   finished.

Two traps make that check easier to get wrong than it looks:

- **`npm run readability -- --dist` prints only out-of-band pages.** Comparing
  its output before and after hides every page that moved but stayed in band.
  Take per-page scores from `reportDist()` directly. Running the script under
  `node -e` throws, because `isMain()` reads `process.argv[1]`, so call it from
  a file.
- **A page that moves needs its own cause, even when you expected it to move.**
  The comment `246eabd` added to the scorer lists the Spanish homepage among the
  pages that moved, grouped with "the service pages and Spanish homepage being
  rewritten in the same change." Nothing in that commit separated the rewrite
  from the scorer change. The city list, which had nothing to do with the
  rewrite, was the real cause, and `afa5d4c` fixed it half an hour later. The
  second correction got the same corpus check as the first, which is the rule.

Run on 2026-09-15 with a scratch copy of the scorer that had the marker blanked
out, this method reproduced the recorded result on the markdown corpus: no verdict
changed, and the largest shift was 0.3. On the built site, the only pages that
moved were the English and Spanish service pages. Their Chinese twins did not
move, because `registerIndex` measures word choice rather than sentence length.

## Prevention

**Tests that pin the behavior**, all in `scripts/readability.test.mjs` under
`rendered-page extraction`:

- `counts each list item as its own sentence on the built page` (English and
  Spanish)
- `counts each list item as its own sentence in markdown, so the two paths agree`
- `counts each list item as its own sentence in Chinese too` (zh-hant from HTML,
  zh-hans from markdown)
- `does not double-count an item that already ends in punctuation`
- `excludes the service-area city list`, on hand-written HTML
- `finds the service-area class on every built localized homepage` (added in
  #76, `todos/039`). The exclusion depends on a CSS class, and renaming the
  class in `src/pages/[locale]/index.astro` builds green. It would also pass
  `readability -- --dist`, which fails only on a runaway sentence, never on a
  band miss. The failure message records both measurements: 46 → 58 when the
  bug was found, and 47 → 55, right at the band edge, on the 2026-09-15 build.
- `actually removes the city list from the built /es/ score`, the positive
  control for the test above. "Monrovia" appears inside `<main>` only in that
  list. The test checks that the exclusion removes it, that renaming the class
  lets it back in, and that letting it back in raises the sentence count, so
  the guard cannot pass vacuously.

The two built-page tests need `dist/` and skip without it, which is why
`ci.yml` re-runs the suite after the build.

**The rules:**

- **Every correction to the instrument gets the whole-corpus check,** including
  the correction that fixes a side effect of the previous correction. The first
  check in this story was done properly and still missed the homepage. The
  second check is what caught it.
- **A score earned partly by a measurement bug is not evidence the prose is
  right.** When a scorer fix drops a page out of band, raise the prose by hand,
  post by post, and measure after each change. Do not assume the page was ever
  really in band, and do not change the metric back to recover the old number.
  Two of the three service pages landed below the band once lists were scored
  fairly, and both had to be rewritten.
- **When text is exempt from the standard, keep it out of the measurement too.**
  This is the same principle that already drops the nav, buttons and form labels.
  A list of city names is not prose, so scoring it was always wrong. The list-item
  fix just made the error big enough to see.
- **Test a splitter or extractor on every shape of text the site publishes, not
  just paragraphs.** Paragraphs were the one shape these splitters already
  handled, and they were the only shape anyone had tested.

## Related

- [A metric introduced to govern writing corrupts that writing](a-writing-metric-corrupts-the-prose-it-governs.md): the two scoring paths, the half-grade cross-check, and the "measure which one is broken" rule this fix followed.
- [A leftover git worktree made the test suite count itself twice](a-stale-worktree-made-the-test-suite-count-itself-twice.md): another measurement that looked plausible and was wrong, and the rule that a number is only as good as the instrument that produced it.
- `CLAUDE.md` § *Register: college level, set 2026-09-03*: the per-locale bands, the Chinese sentence-ceiling recalibration that defines "recalibration, not a snooze", and the list-item paragraph that points here.
- `todos/039-complete-p3-readability-scorer-hygiene.md`: the escaped marker and the two built-page guards on the service-area class.
- `docs/superpowers/specs/2026-09-14-practice-services-design.md` §3: the record of the Checkup and Get more patients drafts being raised by hand.
