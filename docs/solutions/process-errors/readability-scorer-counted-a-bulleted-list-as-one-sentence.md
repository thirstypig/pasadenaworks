---
title: "The readability scorer counted a bulleted list as one sentence, and correcting it moved a page the check had filed under something else"
date: 2026-09-14
category: process-errors
component: "scripts/readability.mjs — prose(), mainProse(), LIST_ITEM_END and the Latin/CJK sentence splitters; scripts/readability.test.mjs; CLAUDE.md § Register"
symptom: "A list-heavy service page measured Flesch-Kincaid 25.4 while its paragraphs read near grade 11. Bullets carry no terminal punctuation by house style, and both sentence splitters broke only on punctuation, so every bullet ran into the next and a seven-item list scored as one hundred-word sentence. Fixing that turned each two-word city in the localized homepages' service-area list into a two-word sentence and pulled /es/ from Fernández Huerta 46 to 58, outside the 40–55 band."
tags: [readability, metrics, measurement, sentence-splitting, lists, i18n, es, recalibration, silent-failure, test-coverage, meta-description, falsification]
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

## A third instance, 2026-09-16: the post subtitle is the meta description

The same defect a third time, in the same file, and worth recording because the
shape is now unmistakable — **a non-prose element inside `<main>` quietly
joining the sample**.

`/blog/do-i-need-a-website-if-i-have-instagram/` was the one live post below the
English band: **FK 12.9** on the built page against **13.3** at source. The
prose was never the problem. `Post.astro` renders
`<p class="post__subtitle">{description}</p>` from the same frontmatter string
that becomes `<meta name="description">`, and CLAUDE.md excludes meta
descriptions from scoring on purpose — 155 characters written to win a click in
a search result is a different job from reading well. The markdown path never
saw it, because frontmatter is stripped. That post's description opens
*"Sometimes no. Usually yes."*: two two-word sentences at the head of a
37-sentence sample.

Its siblings `post__author` and `post__meta` were excluded from the start. This
one was simply missed, and the gap sat inside the half-grade cross-check
tolerance (0.4), so nothing was ever red.

**The direction is the part worth carrying.** The bulleted list made pages score
HARDER; the city data strip, added two days earlier, also made them score harder;
this made them score EASIER. Short marketing copy at the top of a post pulls the
number down, long unpunctuated furniture pulls it up. *The sign tells you
nothing about whether an element belongs in the sample — only the element does.*

Fixed by adding `subtitle` to the existing `post__(author|meta)` alternation.
With it excluded the two paths agree exactly at 13.3, and that agreement — not
the verdict flipping — is the evidence nothing else was wrong with the post.
Whole-corpus check, as the rule above requires: 10 of 96 built pages moved, all
in the harder direction, exactly one verdict changed, none moved out of band.

### Two ways the verification nearly lied, both caught

Both belong here because either one would have produced a confident wrong
conclusion, and neither was visible in the output.

- **A comparison that found nothing, because it compared nothing.** The first
  whole-corpus before/after reported **zero of 96 pages moved**, which argued the
  exclusion did nothing and was not worth keeping. The snapshot script read
  `r.score` — a field `reportDist` does not return. Every value was `null`, the
  loop's `if (sb === null) continue` skipped every page, and "no differences"
  was a statement about the script. The real fields are `fkGrade`,
  `fernandezHuerta`, `registerIndex`. **A comparison that finds no differences is
  a claim about the comparison until proven otherwise** — print the field names
  off one real row before trusting a diff of zero.
- **A falsification that passed.** Proving the new dimension test could fail
  meant corrupting a declared width; the first attempt reported a pass, which
  read as "the test is still broken". The `sed` had silently not matched. Redone
  with the edit confirmed applied first, it failed as intended. **A falsification
  that passes is evidence about the setup until you prove otherwise.**

### What guards it now

A unit test that `mainProse()` drops the subtitle, and its **paired marker test**
that `<p class="post__subtitle">` still exists on every built post — the same
arrangement `ul.service-area` and `p.page-back` already have. Both were
falsified before being kept: removing the exclusion fails the first, renaming
the class in `Post.astro` fails the second. The marker test also asserts it
found posts at all, so it cannot pass vacuously.

## A fourth instance, 2026-09-23: the exclusion was coupled to its only caller

The closing box (`EndCta.astro`) is furniture, so `mainProse()` drops it
before scoring. It did that by matching:

```js
/<div class="end-cta[\s\S]*?<\/div>\s*<\/div>/
```

Note the trailing `\s*</div>`. That is not the box's own closing tag — the box
is flat by design and has no nested `<div>`. It is the closing tag of
**`Post.astro`'s wrapper around the box**. The exclusion therefore depended on
the box's SURROUNDINGS rather than on the box.

That held for as long as blog posts were the only caller. On 2026-09-23 the
same box was added to the city pages, where it sits inside a `<section>` with
a `<p class="page-back">` after it rather than a `</div>`. The regex matched
**nothing at all**, and the entire call to action — heading, blurb, service
link, button text, telephone number — was scored as prose.

**Measured when found**, because "it looks excluded" is not evidence:

| | old regex removes | new regex removes |
|---|---|---|
| blog post | 890 chars | 884 |
| city page | **0 chars** | 891 |

The six-character difference on the blog post is the wrapper's own closing
tag, which carries no text. Matching to the box's own first `</div>` is
correct precisely because `EndCta.astro` keeps its children as siblings, and
says so in a comment for this reason.

Re-measured across the whole built corpus before keeping it, as every
correction to this instrument must be: 23 of 30 English pages in band, and the
seven outside are the same legal, glossary and index pages as before. No city
page among them, no blog post moved.

**The generalizable part.** The failure was silent in the safest possible
direction — nothing was deleted, so no text went missing; the score simply
included furniture. The only tell was a number that should have been ~890 and
was 0. A guard can be correct and still be coupled to its only caller, and the
second caller is the test. Three separate instances of that shape landed in one
day: this, a Chinese router that named one project id, and a test asserting a
key that could never exist.

## Related

- [A metric introduced to govern writing corrupts that writing](a-writing-metric-corrupts-the-prose-it-governs.md): the two scoring paths, the half-grade cross-check, and the "measure which one is broken" rule this fix followed.
- [A leftover git worktree made the test suite count itself twice](a-stale-worktree-made-the-test-suite-count-itself-twice.md): another measurement that looked plausible and was wrong, and the rule that a number is only as good as the instrument that produced it.
- `CLAUDE.md` § *Register: college level, set 2026-09-03*: the per-locale bands, the Chinese sentence-ceiling recalibration that defines "recalibration, not a snooze", and the list-item paragraph that points here.
- `todos/039-complete-p3-readability-scorer-hygiene.md`: the escaped marker and the two built-page guards on the service-area class.
- `docs/superpowers/specs/2026-09-14-practice-services-design.md` §3: the record of the Checkup and Get more patients drafts being raised by hand.
