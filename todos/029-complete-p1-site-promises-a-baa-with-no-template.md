---
status: complete
priority: p1
issue_id: "029"
tags: [code-review, copy, legal, hipaa, i18n]
dependencies: []
---

# The Digitize page promises Pasadena Works signs a BAA, and no BAA exists to sign

## Problem Statement

A business associate agreement (BAA) is the HIPAA contract a practice must have
with any outside company that can see its patient records. The "Digitize the
office" page promises one with every vendor, "including us", in all four
languages. The owner has no BAA template yet (PR #75's own checklist). A practice
that asks for it on the first call gets nothing to sign, and signing one makes
Pasadena Works itself responsible for its own HIPAA risk analysis, breach
notification and subcontractor BAAs.

## Findings

- `src/data/services.ts:218` en: "…with every vendor that handles patient information, including us"
- `src/data/services.ts:238` es: "…incluidos nosotros"
- `src/data/services.ts:258` zh-hans: "…我们也不例外"
- `src/data/services.ts:278` zh-hant: "…我們也不例外"
- The outcomes line in each locale (`:225/245/265/285`) promises BAAs "signed with
  every vendor", which some vendors will refuse.
- 45 CFR 164.308(a) applies to "a covered entity or business associate" — verified
  via law.cornell.edu by the copy-claims reviewer.

## Proposed Solutions

### Option A: Drop "including us" now, restore it once a template exists
- **Pros:** unblocks #75; the advice to practices stays intact.
- **Cons:** a practice may still ask; the answer is "yes, we'll sign yours".
- **Effort:** Small · **Risk:** Low

### Option B: Keep the promise, adapt HHS's free sample BAA provisions first
- **Pros:** a stronger trust signal for a HIPAA-adjacent consultancy.
- **Cons:** #75 waits on a legal document; ideally attorney-reviewed.
- **Effort:** Medium (owner) · **Risk:** Medium

## Recommended Action

**Owner chose Option A on 2026-09-14.** Remove the self-promise in all four
locales, and soften the outcomes line so it does not promise every vendor signs.

## Technical Details

- `src/data/services.ts` (Digitize body and outcomes, four locales)

## Acceptance Criteria

- [x] No locale promises a BAA from Pasadena Works (grep for including us / incluidos nosotros / 我们也不例外 / 我們也不例外 returns nothing, and the surrounding sentence still exists)
- [x] Outcomes line no longer guarantees every vendor signs
- [x] `npm run readability -- --dist` keeps the Digitize pages in band

## Work Log

### 2026-09-14 — Found in PR #75 review
Raised by the owner's own PR checklist and confirmed by the copy-claims reviewer,
who listed every location. Owner decided: drop the promise.

### 2026-09-14 — Fixed on the PR #75 branch
Owner chose Option A. Removed "including us" / "incluidos nosotros" / 我们也不例外 / 我們也不例外 from the Digitize body in all four locales, and changed the outcome to "…or a plan to replace any vendor that will not sign one" (and its three translations). Built check: 0 pages carry the self-promise, while the surrounding BAA sentence is still present on all 4 Digitize pages (positive control).

Verified: `npm run typecheck` 0 errors (88 files); `npm run build` no warnings; `npm run test` 349 passed, 1 skipped (350, up from 346); `npm run readability -- --dist` exit 0 with every service page and homepage in band.

**todos/029 is closed.**

## Resources

- PR #75; spec `docs/superpowers/specs/2026-09-14-practice-services-design.md`
- 45 CFR 164.308: https://www.law.cornell.edu/cfr/text/45/164.308
