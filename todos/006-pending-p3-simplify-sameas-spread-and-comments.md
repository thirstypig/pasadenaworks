---
status: pending
priority: p3
issue_id: 006
tags: [code-review, simplification, quality]
dependencies: []
---

# Four small simplifications in the PR's 32 changed lines

## Problem Statement

The code delta is already close to minimal. Four spots where it can be smaller
or clearer, none of them behavioral.

## Findings

**1. The `sameAs` spread is a third idiom for something the repo does twice
already.** `src/layouts/Base.astro:61-63`:

```js
...(Object.values(site.social).some(Boolean)
  ? { sameAs: Object.values(site.social).filter(Boolean) }
  : {}),
```

Two traversals, a ternary, an empty-object branch. `src/layouts/Post.astro:53,55`
already writes conditional schema keys as:

```js
...(updatedDate && { dateModified: updatedDate.toISOString() }),
...(heroImage && { image: heroImage }),
```

Matching that:

```js
const profiles = Object.values(site.social).filter(Boolean);
...(profiles.length && { sameAs: profiles }),
```

Three lines to one, one traversal, and it stops being a third way of expressing
a pattern the file next door has settled. Semantics hold: `...(0 && {…})` spreads
a number and contributes no properties, so the key still disappears entirely.

**2. The same rationale is written twice.** `src/data/site.ts:54-58` and
`src/layouts/Base.astro:57-60` both explain what `sameAs` is for and that a dead
URL is worse than none. Keep the `site.ts` one — that is where someone is
tempted to paste a placeholder, and it matches the `gaMeasurementId` comment
right below it. Reduce the `Base.astro` one to a pointer.

**3. Redundant `text-decoration: none`.** `src/layouts/Post.astro:226` repeats a
declaration the base rule at line 219 already sets, with nothing in between
re-adding an underline. Pre-existing, but this PR edited that rule to add
`:focus-visible`, so it is the moment to drop it.

**4. The `'en-CA'` locale is unexplained.** `scripts/content-status.mjs` explains
the *timezone* thoroughly but not the locale. `en-CA` is there because it formats
as `YYYY-MM-DD`, not because the site has anything to do with Canada. Four words
would prevent someone "fixing" it to `en-US` and getting `8/31/2026`.

## Explicitly not changing

- **The two-line CSS fallback stays.** Collapsing `border-bottom: 1px solid
  currentColor` + `border-bottom-color: color-mix(...)` into one line means an
  engine without `color-mix()` discards the whole declaration and renders **no
  underline** — reintroducing the exact WCAG 1.4.1 failure the change fixes.
- **The 10-line CSS comment stays.** It carries measured contrast ratios that
  cannot be recovered from reading the CSS, and it pre-empts the simplification
  above.
- **One file per language per post stays.** Astro's glob loader is
  entry-per-file; factoring shared frontmatter into a sidecar would need a custom
  loader to save ~100 lines. The duplicated fields that matter are guarded by
  tests instead, which is the better answer.

## Proposed Solutions

### Option A — Apply all four
- **Pros:** 7 of 32 lines removed, and `Base.astro` starts matching the idiom in
  `Post.astro`.
- **Cons:** Touches a file this PR already touches; needs a rebuild and a glance
  at the emitted JSON-LD to confirm the key still drops when empty.
- **Effort:** Small · **Risk:** Low

### Option B — Apply 1 and 4 only
The `sameAs` idiom and the `en-CA` note; leave the comment dedup and the CSS line.
- **Pros:** The two with real value — consistency and a genuine future footgun.
- **Cons:** Leaves a duplicated comment that will drift.
- **Effort:** Small · **Risk:** Low

## Recommended Action

_(Leave blank for triage.)_

## Technical Details

- `src/layouts/Base.astro:57-63`
- `src/data/site.ts:54-58`
- `src/layouts/Post.astro:219,226`
- `scripts/content-status.mjs`

## Acceptance Criteria

- [ ] `sameAs` still absent from the JSON-LD when every social value is empty
- [ ] `sameAs` still present with one entry when only LinkedIn is set
- [ ] Prose links still underlined at rest after the CSS edit
- [ ] 89 tests still pass; build still clean

## Work Log

- **2026-08-31** — From the simplicity review during `/ce:review` of PR #9.
  Verified the `...(x && {y})` idiom exists at `Post.astro:53,55` and that the
  hover rule repeats `text-decoration: none`.

## Resources

- PR #9
