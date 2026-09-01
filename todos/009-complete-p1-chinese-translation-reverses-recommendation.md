---
status: complete
priority: p1
issue_id: 009
tags: [code-review, content, i18n, correctness, introduced-by-this-pr]
dependencies: []
---

# Both Chinese versions of the Spanish-website post recommend the opposite of the English

## Problem Statement

`src/content/blog/zh-hans/wangzhan-xuyao-xibanyayu-ban-ma.md:39`
`src/content/blog/zh-hant/guanwang-yao-zuo-xibanyawen-ban-ma.md:39`

The English (`en/should-your-website-be-in-spanish.md:41`) opens the paragraph:

> **It pays off less** for a consultant whose clients are referred nationally, a
> niche e-commerce shop selling to a hobbyist audience that happens to be
> English-speaking, or a B2B vendor whose buyers are corporate procurement
> departments.

Both Chinese versions open it:

> 而对这些生意就**划算得多**：靠全美转介绍的顾问、卖给某个恰好讲英语的爱好者圈子的
> 小众电商、买家是企业采购部门的 B2B 供应商——

划算得多 means "**much more** worth the money." There is no negation. The lead
clause recommends building a Spanish site for exactly the three business types
the English tells you to skip.

The paragraph then contradicts itself mid-sentence — 只有成本、没有对应回报
("all cost, no matching return") — so a careful reader can reconstruct the
intent. A skimming reader takes away the reversed advice.

This publishes **2026-09-28**, in 27 days.

## Findings

A dropped negation while drafting, not a comprehension error: the second half of
the same sentence is translated correctly, and the Spanish version has the right
polarity (`es/mi-pagina-web-deberia-estar-en-espanol.md:39` — "Se paga menos
para un consultor…"). Only the two Chinese files are affected, and they share
the mistake because the Traditional version was adapted from the Simplified.

Nothing in the toolchain could have caught this. The tests check slug
uniqueness, date parity, translationKey linkage, locale/directory match and
script purity — all structural. Semantic fidelity between a post and its
translation has no automated guard, and this is the failure mode that gap
allows: a fluent, well-formed, confidently wrong sentence.

Suggested wording:
- zh-hans: 而对这些生意就没那么划算：…
- zh-hant: 而對這些生意就沒那麼划算：…

## Proposed Solutions

### Option A — Fix the two lines
Replace 划算得多 with 没那么划算 / 沒那麼划算 in the two files.

- **Pros:** Correct in one edit each. Restores agreement with the English and
  with the rest of the sentence.
- **Cons:** Fixes this instance and nothing structural.
- **Effort:** Small · **Risk:** Low

### Option B — Option A plus a polarity spot-check in the translation method
Add a step to the documented translation method: after drafting, re-read every
sentence containing a comparative or a recommendation against its English twin.

- **Pros:** Targets the actual failure mode. Cheap, and the method doc already
  exists and is followed.
- **Cons:** Still a human check; no automation.
- **Effort:** Small · **Risk:** Low

### Option C — Option A plus a second-pass review of all 45 new files
Treat this as evidence the batch needs a dedicated fidelity pass before merge.

- **Pros:** The audit that found this also found three more polarity/precision
  drifts (see todo 010). One reversed recommendation in a 45-file batch suggests
  reading everything once more is proportionate.
- **Cons:** Real time cost.
- **Effort:** Large · **Risk:** Low

## Recommended Action

_(Leave blank for triage.)_

## Technical Details

- **Affected files:** the two named above, line 39 of each
- **Correct reference:** `en/…:41`, `es/…:39`
- **Publish date:** 2026-09-28

## Acceptance Criteria

- [ ] Both Chinese lines state that a Spanish site pays off *less* for those three business types
- [ ] The lead clause and the rest of the sentence agree
- [ ] Read aloud in full once after the edit — the error survived because the sentence is fluent

## Work Log

- **2026-08-31** — Found by the translation-fidelity audit during `/ce:review`
  of PR #9. Verified against the English and Spanish. Introduced by this PR.

## Resources

- PR #9
- `project-blog-translation-method`

---

**RESOLVED 2026-08-31 — Option A.** 划算得多 → 没那么划算 (zh-hans) and
沒那麼划算 (zh-hant). The lead clause now agrees with the rest of its own
sentence and with the English and Spanish. Option C (a full second pass over all
45 files) was not taken; todo 010 carries the three remaining drifts the same
audit found.
