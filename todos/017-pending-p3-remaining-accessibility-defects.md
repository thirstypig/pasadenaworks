---
status: pending
priority: p3
issue_id: 017
tags: [code-review, accessibility, css, wcag]
dependencies: []
---

# Five accessibility defects below the ones already fixed

## Problem Statement

The 2026-09-03 PR fixed five a11y defects at P2 (button hover contrast, CJK font
stacks, 320px reflow, heading-order regression, cookie-banner focus order).
These five remain. All were measured in a real browser or computed from the
actual token values — none is inferred from reading CSS.

## Findings

**1. The form error message fails AA in light mode.**
`ContactForm.astro:169-171` — `.contact-form__status--error` is
`var(--color-accent)` on `--color-surface` white: **3.04:1**, against 4.5:1
required. Confirmed by injecting the error state: computed `rgb(200,134,43)` on
`rgb(255,255,255)`. Dark mode is fine (5.59:1). `--color-accent-text` exists for
exactly this job and measures 5.74:1 on white. This is the one string a user
*must* be able to read, because it appears only when their message failed to send.

**2. The focus ring is 2.84:1 against the light page background.**
`global.css:426` — `outline: 3px solid var(--color-ochre)` at `outline-offset: 2px`
draws the ring on `--color-bg` #faf7f0, not on the element. Under the 3:1 that
WCAG 1.4.11 expects of a focus indicator. Fine in dark mode (6.13:1).
`--color-accent-text` gives 5.37:1.

**3. `.label-frame` and `:focus-visible` both use `outline`, so focus replaces
the decoration instead of adding to it.** `global.css:369-374` vs `:425-428`.
`.post-card` and `.service-card` are focusable elements carrying `.label-frame`;
when focused, the frame's cream ring is replaced by the ochre one at nearly the
same position — ochre-vs-cream is about 1.6:1, so it reads as "a differently
coloured card", not "the focused card". Giving `.label-frame` its ring via
`box-shadow` frees `outline` for focus alone.

**4. Input boundaries are near-invisible.** `ContactForm.astro:149` — inputs are
`--color-surface` sitting on a `.contact-frame` that is also `--color-surface`,
so the 1px `--color-line` border is the only thing identifying the field:
**1.45:1** light, **1.27:1** dark, against the 3:1 WCAG 1.4.11 wants where the
boundary is the sole indicator. Labels are correctly associated, so it is usable
— just poor, and worst in dark mode where the fields read as ghost boxes.

**5. No `overflow-wrap` anywhere.** `body`, `.prose` and `.post__body` all
compute `overflow-wrap: normal`. Injecting a 61-character unbreakable string at
320px produced **+207px** of overflow on five page types. Nothing is broken today
— the longest real token in the corpus is 19 characters — but posts are freeform
markdown authored through Tina, and one pasted bare URL does it. `global.css:192-207`
already defends `table` and `pre` with exactly this reasoning; long words were
missed. CJK is not at risk (breaks anywhere by default).

## Proposed Solutions

### Option A — Fix all five
Two token swaps (#1, #2), one `outline` → `box-shadow` (#3), a border-colour bump
(#4), one property (#5).

- **Pros:** All five are small and none changes layout. #1 and #5 are real
  user-facing failures rather than audit points.
- **Cons:** #4 changes the visible weight of the form's borders, which is a
  design-adjacent call.
- **Effort:** Small · **Risk:** Low

### Option B — #1 and #5 only
The error message and the overflow guard.

- **Pros:** The two that can actually harm a real visitor.
- **Cons:** Leaves two contrast failures and a focus indicator that reads as decoration.
- **Effort:** Small · **Risk:** Low

## Recommended Action

**Option A**, flagging #4 to the owner as a visible change rather than folding it
in silently.

## Acceptance Criteria

- [ ] Error text ≥ 4.5:1 in both themes, verified by computing from the tokens
- [ ] Focus ring ≥ 3:1 in both themes
- [ ] A focused card is distinguishable from an unfocused one by more than hue
- [ ] A 61-character token does not overflow at 320px on any page type

## Work Log

### 2026-09-03 — Found during full-repo review
Ratios computed from the actual custom-property values, not estimated. Confirmed
clean and not to be re-audited: alt text across all four locales, form label
associations, `role="status" aria-live="polite"`, heading order on the other 51
built pages, and prose link underlines beyond `.post__body`.
