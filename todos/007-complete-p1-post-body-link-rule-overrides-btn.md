---
status: complete
priority: p1
issue_id: 007
tags: [code-review, css, regression, introduced-by-this-pr]
dependencies: []
---

# The new prose-link rule paints a border on the CTA button — the documented `.btn` gotcha, reintroduced

## Problem Statement

The accessibility fix in this PR changed `.post__body a` from a *transparent*
bottom border to a *visible* one. That selector also matches the End CTA
button, which is rendered inside `.post__body`. Result: a visible ochre line
along the bottom edge of the "See how it works →" button, on **every blog post,
in all four languages**.

This is the exact failure CLAUDE.md already documents:

> **`.section--dark a` beats `.btn`.** A bare descendant link rule inside dark
> sections silently overrode button text color. The rule is now
> `.section--dark a:not(.btn)` with explicit button overrides below it. Watch
> CSS specificity when adding section-level link styles.

Same shape, different section. The repo wrote down this lesson and this PR
walked into it anyway.

## Findings

Specificity: the compiled rule is `.post__body[data-astro-cid-g5songws] a`
(0,2,1), which outranks `.btn` (0,1,0).

Built CSS:
```css
.post__body[data-astro-cid-g5songws] a{color:var(--color-accent-text);
  border-bottom:1px solid;
  border-bottom-color:color-mix(in srgb, currentColor 45%, transparent);
  text-decoration:none}
```

Containment verified by walking `<div>` open/close pairs from `.post__body` to
its matching close in the built HTML:

```
post__body opens at 12137, closes at 17411
end-cta   opens at 17085          -> inside
<a class="btn" href="/services/websites/">See how it works →</a>
```

Before this PR the same selector set `border-bottom: 1px solid transparent`, so
the collision existed but was invisible. Making the border visible is what
surfaced it.

There is a second, pre-existing symptom the same selector causes:
`color: var(--color-accent-text)` (#8c5c17) also beats `.btn`'s color, so the
button label is already being drawn in dark ochre on the ochre button. Fixing
the selector fixes both.

**Process note.** My own first verification of this said the CTA was a sibling
of `.post__body`, not a descendant — I compared string offsets and got the
nesting logic backwards. The reviewing agent was right and I was wrong; the
div-depth walk above is the check that settles it. Recorded because the wrong
check looked convincing.

## Proposed Solutions

### Option A — `:not(.btn)`, matching the existing fix in global.css
```css
.post__body :global(a:not(.btn)) { … }
.post__body :global(a:not(.btn):hover),
.post__body :global(a:not(.btn):focus-visible) { … }
```

- **Pros:** Identical shape to the fix already at `global.css:299`, which
  carries a comment explaining this precise hazard. Consistent, obvious to the
  next reader, fixes the color bug too.
- **Cons:** Repeats `:not(.btn)` three times.
- **Effort:** Small · **Risk:** Low

### Option B — Move the End CTA outside `.post__body`
Render the CTA as a sibling of the prose container.

- **Pros:** Removes the collision structurally rather than defending against it.
  Arguably the CTA is not prose and does not belong in the prose container.
- **Cons:** Touches layout and could affect spacing; a larger change than the
  bug warrants, and any future `.btn` in prose would reintroduce it.
- **Effort:** Medium · **Risk:** Medium

### Option C — Raise `.btn`'s specificity
- **Pros:** Fixes every current and future descendant-rule collision at once.
- **Cons:** Specificity arms race; the codebase already chose `:not()` for this
  exact problem, so this would be a second competing convention.
- **Effort:** Small · **Risk:** Medium

## Recommended Action

_(Leave blank for triage.)_

## Technical Details

- **Affected files:** `src/layouts/Post.astro:217-228`
- **Precedent:** `src/styles/global.css:296-299`
- **Affected pages:** every blog post in en / es / zh-hans / zh-hant

## Acceptance Criteria

- [ ] The End CTA button renders with no bottom border on a blog post
- [ ] The button label renders in its intended color, not accent ochre
- [ ] Prose links still underlined at rest, solid on hover and focus
- [ ] Checked visually in a browser, not only by reading CSS — this bug was
      invisible in source and obvious on screen
- [ ] Checked in at least one CJK locale, where the underline sits differently

## Work Log

- **2026-08-31** — Found by the TypeScript/Astro review during `/ce:review` of
  PR #9. Introduced by this PR. Confirmed by div-depth walk of built HTML after
  an initial incorrect check by me concluded the opposite.

## Resources

- `src/layouts/Post.astro`
- `src/styles/global.css:296-299`
- CLAUDE.md, gotchas section

---

**RESOLVED 2026-08-31 — Option A.** `.post__body :global(a:not(.btn))`, matching
`.section--dark a:not(.btn)` in global.css, with a comment pointing at that
precedent. Redundant `text-decoration: none` dropped from the hover rule.
Verified in a browser at localhost:3180, not only in CSS: the End CTA renders
with no border and its correct dark-rose label, and a prose link on
`why-customers-cant-find-your-business-on-google` still shows its underline.
