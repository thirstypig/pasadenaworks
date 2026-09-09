---
status: ready
priority: p3
issue_id: 024
tags: [code-review, css, duplication]
dependencies: []
---

# `.service-card`'s bordered-card ruleset is duplicated byte-for-byte across three files

## Problem Statement

todos/016 consolidated `.service-grid` into `global.css` to eliminate exactly
this shape of duplication, in the same files, one rule up. `.service-card`'s
"bordered card" style sits right beside it, byte-for-byte identical in three
places, and wasn't caught in the same pass.

## Findings

Found by the pattern-recognition-specialist review agent, 2026-09-09 full-repo pass.

Identical block in all three:
- `src/pages/services/index.astro:36-48`
- `src/pages/[locale]/index.astro:144-156`
- `src/pages/[locale]/[section]/index.astro:179-192` (same properties, merged
  into a combined selector `.service-card, .city-list a`)

```css
.service-card {
  display: block;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  padding: var(--space-5);
  text-decoration: none;
  color: var(--color-ink);
}
.service-card:hover {
  border-color: var(--color-accent);
}
```

**Not the same as the case todos/016 already adjudicated:** that todo correctly
left `.service-card` unmerged *between the English homepage's label-frame
treatment and everything else* — `src/pages/index.astro:133-145` is a genuinely
different, `transform`/`transition`-based style and should stay separate. The
three occurrences above are not that case — they're the same style, repeated
three times with zero divergence.

## Proposed Solutions

### Option A — Promote the block to `global.css`, same as `.service-grid`

Move the shared ruleset to `global.css` alongside `.service-grid`; leave the
homepage's distinct `.service-card` treatment alone as the documented exception.

- **Pros:** Exactly mirrors the fix already applied one rule up in the same
  files. One place to change border/hover treatment for every non-homepage card.
- **Cons:** None identified.
- **Effort:** Small · **Risk:** Low

## Recommended Action

Option A.

## Technical Details

- `src/pages/services/index.astro:36-48`
- `src/pages/[locale]/index.astro:144-156`
- `src/pages/[locale]/[section]/index.astro:179-192`
- `src/pages/index.astro:133-145` — leave this one alone, it's a different style
- `src/styles/global.css` — where `.service-grid` already lives

## Acceptance Criteria

- [ ] `.service-card`'s bordered-card ruleset exists once, in `global.css`
- [ ] All three non-homepage occurrences removed and rely on the shared rule
- [ ] Homepage's distinct `.service-card` treatment (`src/pages/index.astro`) untouched
- [ ] `npm run build` — visually unchanged output on all three affected pages

## Work Log

### 2026-09-09 — Found during full-repo review
Pattern-recognition-specialist agent, part of an 8-agent intensive review
requested by the owner.

## Resources

- Full-repo review, 2026-09-09 (pattern-recognition-specialist agent)
- todos/016 — the `.service-grid` consolidation this extends
