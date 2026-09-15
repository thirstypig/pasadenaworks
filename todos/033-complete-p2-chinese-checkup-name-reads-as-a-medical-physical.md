---
status: complete
priority: p2
issue_id: "033"
tags: [code-review, seo, i18n, zh-hans, zh-hant, copy]
dependencies: []
---

# The Chinese name for the Practice Checkup reads as a patient's physical exam

## Problem Statement

"Practice Checkup" is 诊所全面体检 (zh-hans) and 診所全面健檢 (zh-hant). 体检 and 健檢
are the everyday words for a medical physical, so the title, H1 and meta read as
"full physicals at a clinic". A Chinese-speaking patient in the San Gabriel Valley
searching for a checkup matches this page and bounces; a practice owner looking for
business help does not find it. The SGV Chinese-speaking audience is a core market.

## Findings

- `src/data/services.ts:148,162,164` (zh-hans) and `:167,181,183` (zh-hant)
- `src/i18n/ui.ts:291–292` and `:349–350` (services index description + intro)
- `src/data/home.ts:66` and `:88`
- Search check 2026-09-14: "營運健檢 診所 OR 企業" returns only health-check centres
  (even 企業健檢 means employee physicals), so qualifying 健檢 does not escape it.
  "經營診斷" (Taiwan) and "企业经营诊断" (mainland) both return management-consulting
  firms describing a business diagnosis — the established term in both regions.
- Unrelated: two blog posts use 体检/體檢 metaphorically ("第一道体检"); leave them.

## Proposed Solutions

### Option A: 诊所经营诊断 / 診所經營診斷 ("clinic business diagnosis")
- **Pros:** established consulting term in both regions; no physical-exam word;
  matches the existing `jingying-zixun` slug (经营).
- **Cons:** 诊断 is also a medical word, though 经营诊断 as a compound is unambiguous.
- **Effort:** Small · **Risk:** Low

### Option B: 诊所经营健检 / 診所營運健檢
- **Pros:** keeps the "checkup" metaphor.
- **Cons:** search results for the compound are still medical.
- **Effort:** Small · **Risk:** Medium

## Recommended Action

Option A, applied to every place the service name appears (title, body, index,
homepage), with 体检/健檢 used as the service's name replaced consistently.

## Technical Details

- `src/data/services.ts`, `src/i18n/ui.ts`, `src/data/home.ts`

## Acceptance Criteria

- [x] No 体检/健檢 in `src/data` or `src/i18n` (blog metaphors excepted), and the new name is present
- [x] Simplified characters only in zh-hans, Traditional only in zh-hant
- [x] zh pages stay in the register band; built titles show the new name

## Work Log

### 2026-09-14 — Found in PR #75 review
Raised independently by the agent-native and SEO/i18n reviewers. Term researched
by web search the same day.

### 2026-09-14 — Fixed on the PR #75 branch
Option A: 诊所经营诊断 / 診所經營診斷, replacing the service name everywhere it appeared — services.ts title, fee outcome and meta; ui.ts services description and intro; home.ts services intro. The two metaphorical 体检/體檢 uses in blog posts were left alone. Built check: 0 service or homepage pages contain 全面体检/全面健檢; 6 contain the new name.

Verified: `npm run typecheck` 0 errors (88 files); `npm run build` no warnings; `npm run test` 349 passed, 1 skipped (350, up from 346); `npm run readability -- --dist` exit 0 with every service page and homepage in band.

**todos/033 is closed.**

## Resources

- https://www.isoleader.com.tw/home/iso-coaching-detail/%E4%BC%81%E6%A5%AD%E8%A8%BA%E6%96%B7%E8%88%87%E6%B5%81%E7%A8%8B%E8%A8%BA%E6%96%B7%E6%9C%8D%E5%8B%99
- https://wiki.mbalib.com/wiki/%E5%92%A8%E8%AF%A2%E6%9C%8D%E5%8A%A1
