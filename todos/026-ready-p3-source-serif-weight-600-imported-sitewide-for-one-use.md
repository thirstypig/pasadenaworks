---
status: ready
priority: p3
issue_id: 026
tags: [code-review, performance, fonts]
dependencies: []
---

# Source Serif 4 weight 600 is imported site-wide for a single usage spot

## Problem Statement

`Base.astro` imports four `@fontsource` stylesheets on every page. One of them
(weight 600) backs a single, narrow use.

## Findings

Found by the performance-oracle review agent, 2026-09-09 full-repo pass.

`src/layouts/Base.astro:15-18` imports `anton/latin-400`, `source-serif-4/
latin-400`, `latin-600`, and `latin-400-italic`. `grep -rn "font-weight:\s*600"`
across `src/` finds exactly **one** use (`src/layouts/Post.astro:225`). Each
extra weight/style CSS file pulls its own woff+woff2 pair (~20-25K each per
`dist/_astro/`), so roughly 90K of font binary ships site-wide for a style used
in one spot. Not render-blocking — `@fontsource`'s generated CSS uses
`font-display: swap` by default, and these are bundled into the single
`Base.*.css`, not separate blocking `<link>`s — so this is a modest, easy trim,
not an urgent one.

## Proposed Solutions

### Option A — Drop the `latin-600.css` import, let that one spot fall back to 400

- **Pros:** Removes ~20-25K of unused-almost-everywhere font binary.
- **Cons:** Browser fake-bolds a 400-weight face at that one spot instead of
  rendering a real 600 glyph set — visually similar but not identical.
- **Effort:** Small · **Risk:** Low (one visual spot to check after)

### Option B — Leave it

- **Pros:** Zero effort; the cost is small in absolute terms.
- **Cons:** ~90K of font binary continues shipping for a style used once.
- **Effort:** None · **Risk:** None

## Recommended Action

No strong recommendation — this is a genuine "nice to have," not a real cost.
Owner's call based on whether the visual difference at that one spot
(`Post.astro:225`) matters enough to trade for the trim.

## Technical Details

- `src/layouts/Base.astro:15-18`
- `src/layouts/Post.astro:225` — the one weight-600 usage

## Acceptance Criteria

- [ ] If Option A taken: `latin-600.css` import removed, the one usage spot
      checked visually before/after

## Work Log

### 2026-09-09 — Found during full-repo review
Performance-oracle agent, part of an 8-agent intensive review requested by the
owner. Recorded for completeness; genuinely optional.

## Resources

- Full-repo review, 2026-09-09 (performance-oracle agent)
