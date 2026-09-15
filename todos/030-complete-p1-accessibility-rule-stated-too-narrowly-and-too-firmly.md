---
status: complete
priority: p1
issue_id: "030"
tags: [code-review, copy, legal, accessibility, i18n]
dependencies: []
---

# The website-accessibility paragraph misleads dentists and states an unsettled rule as fixed

## Problem Statement

"Get more patients" says: "Practices that accept Medicare Part B are now required
by federal regulation to make their websites meet that accessibility standard, by
May 2027 … and by May 2028." Two problems, both on a legal claim a practice owner
will act on:

1. **The trigger is too narrow.** The HHS Section 504 rule reaches any recipient of
   HHS financial assistance, which includes Medicaid (Medi-Cal, Denti-Cal).
   Medicare rarely covers dental care, so a Denti-Cal dentist reads this and
   concludes they are exempt.
2. **"Now required" is too firm.** The May 2026 interim final rule that set these
   dates also says HHS "will consider issuing an NPRM … including any changes that
   would affect the web content and mobile app accessibility requirements."

## Findings

- `src/data/services.ts:312` en, `:335` es, `:358` zh-hans, `:381` zh-hant.
- Dates verified correct via the Federal Register API (document 2026-09266):
  May 11, 2027 for 15+ employees, May 10, 2028 for fewer.
- Future-rulemaking sentence verified verbatim from the Federal Register full text
  on 2026-09-14.
- Alston & Bird (the linked source) confirms "Medicare Part B reimbursement alone
  triggers coverage" and that the rule applies to "any program or activity
  receiving federal financial assistance from HHS".

## Proposed Solutions

### Option A: Widen the trigger and add the caveat, keeping both sources
"Practices that accept Medicare Part B or Medi-Cal must make their websites meet
that standard by May 2027 (fifteen or more employees) or May 2028, under a federal
rule HHS has said it may revise."
- **Pros:** accurate, still actionable, same two links.
- **Cons:** slightly longer; all four locales re-measured.
- **Effort:** Small · **Risk:** Low

### Option B: Cut the paragraph
- **Pros:** no legal statement to maintain.
- **Cons:** loses the most concrete, time-bound reason a practice should act.
- **Effort:** Small · **Risk:** Low

## Recommended Action

Option A.

## Technical Details

- `src/data/services.ts` (Get more patients body, four locales)

## Acceptance Criteria

- [x] Medi-Cal named alongside Medicare Part B in all four locales
- [x] "now required" replaced with wording that notes HHS may revise the rule
- [x] Dates and both source links unchanged
- [x] Get more patients pages stay in band

## Work Log

### 2026-09-14 — Found in PR #75 review
Copy-claims reviewer. Re-verified against the Federal Register abstract, the
Federal Register full text and the Alston & Bird page before acting.

### 2026-09-14 — Fixed on the PR #75 branch
Option A. All four locales now name Medi-Cal (加州医疗补助 / 加州醫療補助) beside Medicare Part B, say "must … under a federal regulation" instead of "now required", and add that HHS said in the same notice it may still revise the requirements (zh as a separate sentence, naming 美国卫生与公众服务部 / 美國衛生及公共服務部). Both source links and the dates unchanged. The revision sentence was verified verbatim in the Federal Register full text before writing it.

Verified: `npm run typecheck` 0 errors (88 files); `npm run build` no warnings; `npm run test` 349 passed, 1 skipped (350, up from 346); `npm run readability -- --dist` exit 0 with every service page and homepage in band.

**todos/030 is closed.**

## Resources

- https://www.federalregister.gov/documents/2026/05/11/2026-09266/extension-of-compliance-dates-for-nondiscrimination-on-the-basis-of-disability-accessibility-of-web
- https://www.alston.com/en/insights/publications/2026/03/compliance-section-504-rehabilitation-act
