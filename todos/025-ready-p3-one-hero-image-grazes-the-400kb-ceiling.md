---
status: ready
priority: p3
issue_id: 025
tags: [code-review, performance, images]
dependencies: []
---

# One legacy hero image is 179 bytes over the documented 400KB ceiling

## Problem Statement

CLAUDE.md states the hero-image corpus target as a hard fact ("100–400 KB").
One file doesn't literally satisfy it.

## Findings

Found by the performance-oracle review agent, 2026-09-09 full-repo pass.

Sampled all 20 files in `public/blog/`: sizes run 108,995–404,179 bytes. 19 of
20 sit inside the documented 100–400KB target; `reaching-chinese-speaking-
customers-san-gabriel-valley.jpg` is 404,179 bytes — 179 bytes over the stated
ceiling (dimensions, 1216×1000, are fine). The file predates the Unsplash API
script (dated 2026-09-06, before the 2026-09-08 API key), so it was never
touched by `scripts/unsplash.mjs`'s `HERO_WIDTH=1400` resize logic.

Impact is negligible (0.04% over target) — flagging only because it's the one
file in the corpus that doesn't literally satisfy a documented fact.

## Proposed Solutions

### Option A — Re-compress in passing next time that post is touched

- **Pros:** Zero dedicated effort; the overage is imperceptible.
- **Cons:** Leaves the corpus fact technically false until then.
- **Effort:** None (deferred) · **Risk:** None

### Option B — Re-compress now

- **Pros:** Corpus fact becomes literally true again.
- **Cons:** Not worth a dedicated trip for 179 bytes.
- **Effort:** Small · **Risk:** None

## Recommended Action

Option A — not worth a dedicated trip; fix in passing next time this post is edited.

## Technical Details

- `public/blog/reaching-chinese-speaking-customers-san-gabriel-valley.jpg`

## Acceptance Criteria

- [ ] Next time this post's hero image is touched, re-export under 400KB

## Work Log

### 2026-09-09 — Found during full-repo review
Performance-oracle agent, part of an 8-agent intensive review requested by the
owner. Recorded for completeness; not urgent.

## Resources

- Full-repo review, 2026-09-09 (performance-oracle agent)
