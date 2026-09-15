---
status: complete
priority: p3
issue_id: "044"
tags: [code-review, seo, i18n, urls, owner-decision]
dependencies: []
---

# The Practice Checkup's web address still says "business advice" — owner decision

## Problem Statement

The Practice Checkup lives at the old "Business advice" addresses. Hard rule 3 treats
the words in a URL as the keyword a searcher types, and these now name the market the
site just left. The spec kept them on purpose (no redirects, no lost history). The
question is whether that is still the right trade now that redirects are cheap here.

## Findings

- Addresses, from `src/data/services.ts` (`consulting` slugs, ~line 109):
  `/services/business-advice/`, `/es/servicios/asesoria-de-negocios/`,
  `/zh-hans/fuwu/jingying-zixun/`, `/zh-hant/fuwu/jingying-zixun/` (经营咨询, "business
  consulting").
- Spec §2, line 40: `consulting` → "Rewritten; URL unchanged" — a deliberate choice.
- **History at stake is small.** The site's first commit was 2026-08-24, so these pages
  have about three weeks of search history. Words in a URL are a light ranking signal;
  the title and page text matter more (see todo 034).
- **A rename is now cheap.** `src/data/retired-services.mjs` already carries redirects
  for two retired services; renaming the Checkup is four more entries plus the internal
  links. Todo 036 (P2) must land first, or a rename can break old URLs silently.
- **Related:** Get more patients lives at the `websites` slug. That one cannot move
  cheaply — `src/i18n/routes.ts:51` builds every city page's URL from it.

## Proposed Solutions

### Option A — Rename now, with researched keywords per language

Pick each locale's slug from real search phrasing (e.g. something like
`practice-checkup` / `practice-consulting`; Spanish and both Chinese variants researched
separately, not translated word for word), add four redirects, update links.

- **Pros:** URL, title and copy all say the same thing; cheapest while history is three
  weeks old — the architecture-strategist called this PR the cheapest moment to do it.
- **Cons:** Redirects cost a little of whatever signal exists; needs keyword research in
  four languages; depends on 036 and pairs naturally with 033/034.
- **Effort:** Small–Medium · **Risk:** Low–Medium

### Option B — Keep the addresses and write the reason into spec §2

- **Pros:** No redirect churn; rankings are driven by titles and text, which other todos
  address. The SEO and agent-native reviewers recommended this for now.
- **Cons:** The URL keeps naming the old market; renaming later costs more history.
- **Effort:** Small · **Risk:** Low

## Recommended Action

Owner decision. Two of three reviewers (SEO, agent-native) recommended Option B for now;
the architecture-strategist recommended Option A in this PR.

## Technical Details

- `src/data/services.ts` (`consulting` slugs), `src/data/retired-services.mjs`
- `src/i18n/routes.ts:51`; spec §2 table, line 40

## Acceptance Criteria

- [x] Decision recorded in spec §2, with the reason
- [x] If renamed: four redirects added, each old URL verified in `dist/` to redirect
- [x] If renamed: new slugs researched per locale, not character-converted
- [x] `npm run test` and `npm run build` pass; hreflang set for the page still has 4 + x-default

## Work Log

### 2026-09-14 — Found in PR #75 review
Raised by the SEO, agent-native and architecture-strategist review agents.

### 2026-09-15 — Fixed
Owner chose to rename (2026-09-15). Slugs are now practice-checkup / revision-del-consultorio / jingying-zhenduan (both Chinese variants, matching 经营诊断 / 經營診斷 from todo 033). Four redirects from the old URLs were added to retired-services.mjs, the new URLs appended to PUBLISHED_SERVICE_URLS, and the four posts linking the old URL updated. The guard proved itself in real use: with the slugs renamed and no redirects yet, the test failed naming all four old URLs. Checked in a browser: /services/business-advice/ lands on /services/practice-checkup/.

Verified: `npm run typecheck` 0 errors (89 files); `npm run build` clean; `npm run test` 357 passed, 1 skipped (358); 30 tests skip without dist/ (measured by moving dist/ aside); `npm run readability -- --dist` exit 0 with the same out-of-band list as before (listing and legal pages only).

**todos/044 is closed.**

## Resources

- PR #75; todos 033, 034, 036
- Spec: `docs/superpowers/specs/2026-09-14-practice-services-design.md` §2
