---
status: complete
priority: p2
issue_id: 021
tags: [code-review, tina, schema-drift, i18n, needs-lock-regen]
dependencies: []
---

# `tina/config.ts`'s `slug` field has no `ui.validate`, unlike every sibling field with a build-side rule

## Problem Statement

`src/data/post-slug.mjs` exists specifically to be the one shared rule for a post's
`slug` — imported into `src/content.config.ts`'s Zod schema (`content.config.ts:101-103`)
so the Astro build rejects an invalid slug. It is **not** imported into
`tina/config.ts`. Every other field with a build-side regex/refine constraint
(`heroImage`, `heroAlt`, `heroCredit`, `heroCreditUrl`) got a mirrored `ui.validate`
calling the exact same predicate, specifically because this repo has already paid
for the "Tina accepts what the build rejects" bug twice (heroImage protocol-relative
URLs, hero-credit host lookalikes). `slug` is the one field in the collection that
skipped that treatment.

## Findings

Found by the architecture-strategist review agent, 2026-09-09 full-repo pass.

`tina/config.ts`'s import list (`slugifyBlogFilename`, `DOCS_ROOT_INCLUDE`,
`DOCS_SOLUTIONS_INCLUDE`, `LOCALES`, `PILLARS`, `isValidHeroImagePath`,
`isProtocolRelative`, `hasTraversalSegment`, `isUnsplashProfileUrl`,
`hasCreditNameWhenLinked`) stops short of `POST_SLUG_PATTERN`/`isValidPostSlug`.
The `slug` field (`tina/config.ts:298-305`) has `required: true` and a description,
but no `ui.validate`.

**Concrete failure mechanism:** `tina/utils.ts:40-45` (`slugifyBlogFilename`) derives
the **filename** from the raw `slug` value via `asciiSlug()` (lowercases, strips
non-`[a-z0-9]`, collapses to hyphens) — so an editor typing `Website Costs` as the
slug gets a *file* at `en/website-costs.md`, but the **frontmatter field itself** is
saved verbatim as `slug: Website Costs`. Tina commits straight to `main` (no PR
gate, per CLAUDE.md). The next build's Zod regex then rejects that value and fails
— after merge, on the branch that also gates the daily scheduled-publish cron.
Not yet observed in production (no such incident is recorded in `docs/RESOLVED.md`),
but the mechanism is identical in shape to two incidents already paid for in this
codebase.

## Proposed Solutions

### Option A — Mirror the existing pattern: add `ui.validate` calling `isValidPostSlug`

Import `isValidPostSlug` from `src/data/post-slug.mjs` into `tina/config.ts`
(already `.mjs`, importable from Tina's esbuild pass exactly like `LOCALES`/
`PILLARS` are) and add a `ui.validate` to the `slug` field, same shape as the
`heroImage`/`heroCredit` fields beside it.

- **Pros:** Exactly the proven fix pattern already used for every sibling field.
  Closes the gap with the smallest possible change.
- **Cons:** Adding `ui.validate` on a field that currently has none changes the
  field's `ui` shape, which per CLAUDE.md's "what counts as a schema change"
  section requires regenerating `tina/tina-lock.json` (`npx tinacms dev --no-server
  --noWatch`) and committing it in the same change, or every deploy fails with
  `ERR_CLOUD_CHECK_FAILED`.
- **Effort:** Small · **Risk:** Low (mechanical, well-understood lock-regen step)

### Option B — Leave it, rely on the Zod build-side check alone

- **Pros:** Zero effort now.
- **Cons:** The whole point of the `ui.validate` mirror pattern is catching the bad
  value *before* it's committed to `main`, not after. Leaving this field unguarded
  means an editor typing a slug with spaces/punctuation finds out only when the
  next build fails — potentially blocking the daily scheduled-publish cron for
  every post, not just the bad one.
- **Effort:** None · **Risk:** Medium (live exposure until it's hit once)

## Recommended Action

Option A.

## Technical Details

- `tina/config.ts:298-305` — the `slug` field definition
- `src/data/post-slug.mjs:18-23` — `isValidPostSlug`/`POST_SLUG_PATTERN`, already exported
- `src/content.config.ts:101-103` — the Astro-side Zod usage of the same pattern
- `tina/tina-lock.json` — must be regenerated and committed alongside

## Acceptance Criteria

- [ ] `tina/config.ts` imports `isValidPostSlug` from `src/data/post-slug.mjs`
- [ ] The `slug` field has a `ui.validate` calling it, matching the sibling fields' style
- [ ] `tina/tina-lock.json` regenerated and committed in the same change
- [ ] `npx tinacms dev --no-server --noWatch` run to confirm the lock matches
- [ ] Manually verified in `npm run admin`: entering a slug with a space or uppercase letter shows a validation error before save

## Work Log

### 2026-09-09 — Found during full-repo review
Architecture-strategist agent, part of an 8-agent intensive review (security, performance, architecture, pattern-recognition, code-simplicity, TypeScript, agent-native, learnings-researcher) requested by the owner. No P1s found across all 8 agents; this is one of three P2s.

### 2026-09-09 — Closed, Option A landed
`tina/config.ts` now imports `isValidPostSlug` from `src/data/post-slug.mjs` and
the `slug` field has a `ui.validate` mirroring the sibling `heroImage`/
`heroCredit` fields exactly. `tina/tina-lock.json` regenerated
(`npx tinacms dev --no-server --noWatch`) and committed in the same change —
the field's `ui` shape changed (empty → a `validate` function), which per
CLAUDE.md's "what counts as a schema change" section requires the lock to be
regenerated or every deploy fails with `ERR_CLOUD_CHECK_FAILED`.

Verified: `npm run typecheck` (0 errors, 84 files), `npm run test` (308
passing), `npm run build` (71 pages, clean).

## Resources

- Full-repo review, 2026-09-09 (architecture-strategist agent)
- `docs/RESOLVED.md` — the two prior incidents this mirrors (hero-image protocol-relative URLs, hero-credit host lookalikes)
