---
status: complete
priority: p3
issue_id: "045"
tags: [code-review, i18n, zh-hans, zh-hant, es, copy]
dependencies: []
---

# Translation polish: Taiwan words in Simplified Chinese, a few Spanish slips, and one Google claim

## Problem Statement

The translations are accurate overall, but a handful of word choices read as foreign or
shift the meaning. A mainland reader notices Taiwan vocabulary the way an American
notices "lorry". One claim about Google listings is wrong for a solo doctor, in every language.

## Findings

Line numbers are approximate: another session is editing `src/data/services.ts`.

- **(a) Simplified Chinese uses Taiwan vocabulary.** `services.ts`: 简报 (~169; mainland
  says 演示文稿), 检视 (~159–172) and 作业流程 (~167, ~269, ~277), 排程 (~382), 转介费
  (~270; mainland 推荐费 / 介绍费). `src/data/home.ts:60` 纸质作业 reads as "paper
  homework" on the mainland. A character-set check found no wrong-script characters, and
  the Traditional vocabulary (資安, 櫃檯, 網域, 簡訊) is correct for Taiwan.
- **(b) "Associate" became "partner".** `home.ts:69` 合伙医生 / `:91` 合夥醫師 mean a partner
  doctor; a dental associate is usually an employee. Suggest 接手的执业医生 / 接手的醫師.
- **(c) Spanish.** "referencias" (`services.ts` ~351) means references; "referidos" is the
  word for referrals — this sentence is also being reworded by todo 031. "da un paso
  atrás" (`home.ts:44`) can read as backsliding. The es meta once said only "sin
  comisiones" ("we charge no commission"); it now reads "sin comisiones de proveedores de
  software" (~259), apparently fixed by concurrent work — verify.
- **(d) "A separate listing for each doctor"** (`services.ts` ~324; twins ~348, ~372,
  ~396) is wrong for a solo doctor. Google's practitioner guidelines say a sole
  public-facing practitioner shares one profile named "[brand]: [practitioner]". Add
  "when several doctors practice at one location".
- **(e) Indirect source.** `ocrTrackingTech` (`services.ts:47`) is a Holland & Knight
  article on *AHA v. Becerra*; it supports the tracking-code claim only through the part
  of HHS's bulletin the court left standing. Citing HHS's tracking-technologies bulletin
  directly would be stronger.

## Proposed Solutions

### Option A — One translation pass across (a)–(e)

Research mainland phrasing for each zh-hans term (don't character-convert), fix the
Spanish, qualify the listing claim in all four locales, swap the source.

- **Pros:** Each locale reads native. **Cons:** Touches register scores. **Effort:** Small–Medium · **Risk:** Low

### Option B — Fix (b) and (d) now, leave vocabulary for the next copy pass

- **Pros:** The two meaning errors go first. **Cons:** The mainland-reader issue stays.
- **Effort:** Small · **Risk:** Low

## Recommended Action

See the 2026-09-15 work-log entry.

## Technical Details

- `src/data/services.ts`, `src/data/home.ts`; use the `writing-taiwan-mandarin-copy` skill and
  CLAUDE.md's translation method (research phrasing, don't character-convert)

## Acceptance Criteria

- [x] No Taiwan-only vocabulary in zh-hans service or homepage copy
- [x] "Associate" rendered as someone taking over the practice, not a partner
- [x] Listing claim qualified for multi-doctor practices, in all four locales
- [x] `npm run readability`, `npm run test` and `npm run build` pass after the edits

## Work Log

### 2026-09-14 — Found in PR #75 review
Raised by the copy-claims review agent.

### 2026-09-15 — Fixed
(a) zh-hans: 简报→演示文稿, 检视→审视, 作业流程→工作流程, 排程→日程, 转介→推荐, 纸质作业→纸质文件; zh-hant keeps its Taiwan terms. (b) 合伙医生→执业医生 and 合夥醫師→醫師, "the doctor taking over". (c) Spanish: referencias→referidos; "da un paso atrás"→"se hace a un lado"; the meta already named software vendors (todo 035). (d) The per-doctor listing advice now applies when several doctors practice at one location, in body and outcomes, all four locales. (e) ocrTrackingTech now links HHS's own tracking-technologies bulletin, which carries the vacatur notice; the sources doc row records how it was checked.

Verified: `npm run typecheck` 0 errors (89 files); `npm run build` clean; `npm run test` 357 passed, 1 skipped (358); 30 tests skip without dist/ (measured by moving dist/ aside); `npm run readability -- --dist` exit 0 with the same out-of-band list as before (listing and legal pages only).

**todos/045 is closed.**

## Resources

- PR #75; todo 031 (rewords the same Spanish sentence)
- Spec: `docs/superpowers/specs/2026-09-14-practice-services-design.md` and its `-sources.md`
