---
status: complete
priority: p2
issue_id: 010
tags: [code-review, content, i18n, introduced-by-this-pr]
dependencies: [009]
---

# Three places where a translation states something more strongly or more narrowly than the English

## Problem Statement

Separate from the reversed recommendation in todo 009, the fidelity audit found
three spots where a translation does not match the English's strength or range.
None reverses meaning; all overstate certainty or narrow a figure.

## Findings

**1. "can" hardened to "will" — zh-hant only.**
`zh-hant/gaiban-haishi-xiu-huaidiao-de-difang.md:18`

- English: "a careless redesign **can** tank the rankings"
- zh-hant: 一次草率的重做，**會**把您現有網站已經掙到的排名一起賠進去
- zh-hans (correct): 一次草率的重做，**能**把…

會 reads as "will." The Simplified twin uses 能 correctly, and line 57 of the
same Traditional file uses 可能 correctly for the parallel clause — so this is a
single slip, not a systematic register choice.

**2. A cost range narrowed — both Chinese.**
`zh-hans/…-bufen.md:45`, `zh-hant/…-difang.md:45`

- English: "a few hundred to **low four figures** total"
- Chinese: 通常总共几百到**一两千**美元

一两千 caps at roughly $2,000; "low four figures" runs to about $3,000. This
understates rather than over-asserts, so it is not a rule violation — but it
quotes the owner's own pricing narrower than intended. Spanish is fine ("unos
cientos a unos pocos miles").

**3. "Most of the time" hardened to "almost never" — Spanish.**
`es/que-hacer-cuando-baja-el-trafico-de-tu-sitio.md:20`

- English: "Most of the time it isn't [an emergency]"
- Spanish: "**Casi nunca lo es**"

Both Chinese versions render this correctly (多数时候不算).

## Not in scope, but noted

The audit also flagged an added terminology gloss at
`zh-hans/renling-guge-shangjia-ziliao.md:22`. That file is **not part of this
PR** — confirmed against the branch diff — so it belongs to the earlier
translation batch. Worth a look separately; not a blocker here.

Minor omissions the audit judged acceptable and I agree with: `2026` dropped
from two meta descriptions, the "Sheep or Ram" aside dropped from both Chinese
lunar-new-year posts, and the hongbao/lai see/li xi gloss dropped from the same.
The last one is worth restoring — it reinforces the article's own
multi-community argument.

## Proposed Solutions

### Option A — Fix all three, restore the hongbao gloss
- **Pros:** Small, and brings every file into agreement with its English twin.
- **Cons:** None material.
- **Effort:** Small · **Risk:** Low

### Option B — Fix 1 and 3 only
Modal strength is a fidelity rule; the cost range under-asserts.
- **Pros:** Focuses on the rule that exists.
- **Cons:** Leaves the owner's own price range misquoted in two files.
- **Effort:** Small · **Risk:** Low

## Recommended Action

**Option A** — all three, plus the hongbao gloss. Done 2026-09-01.

## Acceptance Criteria

- [x] 會 → 可能 in the zh-hant redesign post
- [x] The cost range reaches roughly $3,000 in both Chinese versions
- [x] The Spanish traffic-drop line matches "most of the time," not "almost never"
- [x] Decision recorded on the hongbao/lai see/li xi gloss — restored, adapted

## Work Log

- **2026-09-01** — Fixed all four. Details:
  - **1.** Used 可能, not 能. Line 57 of the same Traditional file already writes
    the parallel clause as 一次草率的改版，可能讓您失去半年的排名 — so 可能 matches
    the file's own established register rather than importing the Simplified
    twin's word.
  - **2.** 一兩千 → 兩三千 in Traditional, 一两千 → 两三千 in Simplified. Caps at
    roughly $3,000, which is where "low four figures" lands.
  - **3.** "Casi nunca lo es" → "La mayoría de las veces no lo es".
  - **4.** Gloss restored, but *adapted rather than translated*: the English
    glosses all three terms because an English reader knows none of them. A
    Chinese reader already knows 紅包, so glossing it would be noise — the two
    that carry the article's multi-community point are the Cantonese and
    Vietnamese ones. Rendered as 紅包（粵語稱「利是」，越南語稱 lì xì）/
    红包（粤语称「利是」，越南语称 lì xì）.
  - All four verified in the **rendered HTML**, not the source. Every affected
    post is future-dated (2026-11-02 through 2027-01-04) and therefore excluded
    from an ordinary build, so the three translation sets were temporarily
    back-dated to build them, then restored from `git show HEAD:<file>` and the
    restore confirmed by an empty `pubDate` delta in `git diff`.
- **2026-08-31** — From the translation-fidelity audit during `/ce:review` of
  PR #9. All three verified directly against the English and against the
  sibling translation that got it right.

## Resources

- PR #9, todo 009
