---
status: pending
priority: p3
issue_id: "043"
tags: [code-review, docs, copy, seo, duplication]
dependencies: []
---

# Docs and secondary copy still describe the old business, and CLAUDE.md repeats itself

## Problem Statement

The repositioning rewrote the service pages and homepages, but smaller places still say
"small business", count services that no longer exist, or will go stale on the next
change. None is visible damage; together they give a future reader the wrong picture.

## Findings

- **(a) README.md.** Line 3: "a small-business consultancy". Line 29: `serviceArea` alone
  drives the schema (`regionServed` now does too). Line 30: "All four services" (three now).
- **(b) Hardcoded service count.** `src/i18n/ui.ts` `servicesIntro` at 172, 236, 299, 358
  says "the other two" / "los otros dos" / 另外两项 / 另外兩項 — wrong the day a service changes.
- **(c) Glossary audience.** `src/pages/glossary.astro:8` meta says "for small business
  owners", though this PR added EHR, HIPAA, BAA and WCAG entries (`glossary.ts:76-94`).
- **(d) Link text naming a retired service.** Line 46 of the four "can't find your
  business on Google" posts (`en`, `es`, `zh-hans`, `zh-hant`) keeps "getting found on
  Google" / "aparecer en Google" / 在 Google 上被找到 on links that now go to Get more
  patients. Fine to leave for the spec §9 content plan, but listed so it is not lost.
- **(e) CLAUDE.md duplication and stale-prone figures.** The list-item scoring story, with
  the same FK 25.4 / 0.3 figures, is in `scripts/readability.mjs:213-224`,
  `scripts/readability.test.mjs:629-631` and `CLAUDE.md:~726`. The redirect mechanism is
  described five times (`CLAUDE.md:341`, `retired-services.test.ts:10-15`,
  `astro.config.mjs:8-10`, spec lines 57 and 217), plus twice in the plan. "Repositioned"
  (`CLAUDE.md:12-17`) and "Known outstanding work" (~839) both restate the §9 deferral.
  Figures that will go stale: "all three were, to FK 13.0–13.4" (~730), "`/es/` from 46
  to 58" (~734), "88 as of 2026-09-14" (204).
- **(f) Session URL in the plan.** `docs/superpowers/plans/2026-09-14-practice-services.md`
  has the Claude session URL 10 times in commit templates; the same value is already in
  ~189 public commit trailers (security reviewer), so no new exposure. Placeholder optional.

## Proposed Solutions

### Option A — One docs pass now, (d) deferred to §9

Fix README; phrase `servicesIntro` without a number (or derive it); re-aim the glossary
meta; keep each explanation in one home (code comment or CLAUDE.md) with a pointer from
the others; drop dated figures or mark them "at the time".

- **Pros:** Removes misleading statements while they are few. **Cons:** CLAUDE.md is
  edited often by other sessions — merge carefully. **Effort:** Small–Medium · **Risk:** Low

### Option B — Fix (a)–(c) only

- **Pros:** Reader-facing items, in minutes. **Cons:** CLAUDE.md duplication keeps drifting.
- **Effort:** Small · **Risk:** Low

## Recommended Action

To be decided in triage.

## Technical Details

- `README.md`, `src/i18n/ui.ts`, `src/pages/glossary.astro`, `CLAUDE.md`, four blog posts, the plan doc

## Acceptance Criteria

- [ ] README describes a practice consultancy with three services
- [ ] No UI string states the number of services
- [ ] Glossary meta matches its audience; `npm run build` passes
- [ ] Each duplicated explanation has one home; dated counts are removed or marked

## Work Log

### 2026-09-14 — Found in PR #75 review
Raised by the pattern-recognition, code-simplicity, security-sentinel and SEO review agents.

## Resources

- PR #75
- Spec: `docs/superpowers/specs/2026-09-14-practice-services-design.md` §9
