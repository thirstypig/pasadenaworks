---
status: complete
priority: p2
issue_id: "031"
tags: [code-review, copy, legal, i18n]
dependencies: []
---

# Four statements on "Get more patients" say more than the evidence or the service can back

## Problem Statement

Each is a small wording change, but each is a public promise or a legal statement
a practice owner could hold the site to.

1. **The $50,000 fine is tied to the wrong act.** Copy: replies should "never
   confirm that the reviewer is a patient, a HIPAA violation for which federal
   regulators fined one dental practice $50,000". The practice was fined for a reply
   that disclosed a patient's name and health information (and it ignored OCR's
   data request and subpoena). "Don't confirm someone is a patient" is OCR
   guidance, not what drew that fine.
2. **Outcome guarantees.** "with evidence of exactly where each one came from",
   "with every new patient traced to its source", "records where every new patient
   originally came from", "where each new patient came from". Walk-ins and word of
   mouth cannot be traced exactly.
3. **"Meets WCAG 2.1 AA" is a conformance guarantee.** In California, Unruh Act
   accessibility suits make a promised conformance a liability if any page falls
   short.
4. **Anti-kickback wording is broader than the laws.** "pay anyone for referrals,
   which state and federal anti-kickback laws prohibit". Cal. B&P §650 binds
   healing-arts licensees and carves out some advertising; the federal statute
   covers knowing and willful payments for federal-program business.

## Findings

- `src/data/services.ts` Get more patients, en `:306–320`, es `:329–343`,
  zh-hans `:352–366`, zh-hant `:375–389` (tagline, summary, body, outcomes).
- $50,000 facts re-verified 2026-09-14 via press coverage of the March 2022 OCR
  action (HIPAA Journal, ArentFox Schiff, SC Media) — hhs.gov blocks scripted
  fetches.

## Proposed Solutions

### Option A: Reword each claim to match its evidence, all four locales
- Replies "that reveal nothing about a patient, not even that the reviewer is one;
  federal regulators fined one dental practice $50,000 for a reply that disclosed
  a patient's details"
- "…and a clear record of where new patients come from" (drop exactly / every / each)
- "built and tested to the WCAG 2.1 AA accessibility standard"
- "…which state and federal anti-kickback laws generally prohibit"
- **Pros:** same sources, same structure, accurate.
- **Cons:** four locales × four edits; readability re-measured.
- **Effort:** Small–Medium · **Risk:** Low

### Option B: Fix only the $50,000 attribution now, defer the rest to the attorney hour
- **Pros:** smallest diff.
- **Cons:** ships three promises the owner would not want to be held to.
- **Effort:** Small · **Risk:** Medium

## Recommended Action

Option A.

## Technical Details

- `src/data/services.ts`

## Acceptance Criteria

- [x] $50,000 sentence attributes the fine to a disclosure, in all four locales
- [x] No "exactly" / "every new patient" / "each new patient came from" tracking promise remains
- [x] "meets WCAG 2.1 AA" becomes "built and tested to" (body and outcomes)
- [x] "generally prohibit" in all four locales
- [x] Pages stay in band; translation polarity re-read against English

## Work Log

### 2026-09-14 — Found in PR #75 review
Copy-claims reviewer (findings 3, 4, 5, 8).

### 2026-09-14 — Fixed on the PR #75 branch
Option A, all four locales. $50,000 sentence now attributes the fine to "a reply that disclosed a patient's details"; tagline, summary, tracking bullet, outcome and zh metas no longer promise exactly/every/each new patient; "meets WCAG 2.1 AA" is "built and tested to" in body and outcomes (按照…构建并测试 / 依照…建置並測試); anti-kickback laws "generally" prohibit (por lo general / 一般). Checked in a browser at 1280px.

Verified: `npm run typecheck` 0 errors (88 files); `npm run build` no warnings; `npm run test` 349 passed, 1 skipped (350, up from 346); `npm run readability -- --dist` exit 0 with every service page and homepage in band.

**todos/031 is closed.**

## Resources

- https://www.hipaajournal.com/ocr-announces-4-financial-penalties-to-resolve-hipaa-violations/
- https://www.afslaw.com/perspectives/health-care-counsel-blog/disclosing-patient-information-responses-online-reviews
- https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=650
