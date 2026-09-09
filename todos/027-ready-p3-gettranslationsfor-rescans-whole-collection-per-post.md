---
status: ready
priority: p3
issue_id: 027
tags: [code-review, performance, blog, scaling]
dependencies: []
---

# `getTranslationsFor()` rescans the whole blog collection per post — fine today, quadratic at scale

## Problem Statement

`getTranslationsFor(post)` does its own fresh `getCollection('blog', ...)` scan
across the entire collection to find translation siblings, called once per post
from two different route files. That's O(posts × total_posts) — quadratic in
post count. Not a problem yet; worth knowing before it is.

## Findings

Found by the performance-oracle review agent, 2026-09-09 full-repo pass.

`src/utils/blog.ts:107-123`, called from `src/pages/blog/[...slug].astro:12` and
`src/pages/[locale]/[section]/[service].astro:88`.

**Impact today:** 20 posts × 4 locales = 80 blog entries, so ~80 calls × ~80-entry
scans ≈ 6,400 cheap in-memory field comparisons across the whole build.
Sub-millisecond; the 1.10s full build confirms nothing here is a bottleneck yet.

**Impact at 10x** (200 posts × 4 locales = 800 entries): ~800 calls × 800-entry
scans ≈ 640,000 comparisons. Still plain-object field checks with no I/O, so
almost certainly still well under a second in aggregate — but it's the one
clearly quadratic pattern in the build path, worth revisiting first if post
count ever grows an order of magnitude and build times start climbing.

## Proposed Solutions

### Option A — Precompute a `translationKey → {locale: path}` map once per build

Single pass over the whole collection up front, then O(1) lookup per post
instead of re-filtering the whole collection each time.

- **Pros:** Removes the quadratic pattern entirely.
- **Cons:** Not worth the churn at current scale (sub-millisecond either way).
- **Effort:** Small-Medium · **Risk:** Low

### Option B — Leave it until it's actually visible in build timing

- **Pros:** Zero effort now; genuinely not a problem at current or 10x scale.
- **Cons:** None real — this is exactly the right call for current scale.
- **Effort:** None · **Risk:** None

## Recommended Action

Option B. Revisit only if post count grows an order of magnitude and build
times start climbing — this todo exists so that future investigation starts
here instead of re-deriving it.

## Technical Details

- `src/utils/blog.ts:107-123` — `getTranslationsFor()`
- `src/pages/blog/[...slug].astro:12`
- `src/pages/[locale]/[section]/[service].astro:88`

## Acceptance Criteria

- [ ] N/A — informational, no action required unless post count grows
      substantially and build time regresses

## Work Log

### 2026-09-09 — Found during full-repo review
Performance-oracle agent, part of an 8-agent intensive review requested by the
owner. Deliberately left as informational, not actioned.

## Resources

- Full-repo review, 2026-09-09 (performance-oracle agent)
