---
status: complete
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

**Findings 1 and 2 only** — because on re-verification 2026-09-01, findings 3
and 4 were already gone, each fixed as a side effect of another todo. Neither
was tracked as resolving them.

- **3** was fixed by todo `007`, which rewrote that whole CSS block for the
  `.btn` specificity collision. `Post.astro:232` is now a single
  `border-bottom-color: currentColor` with no `text-decoration` at all.
- **4** was fixed by todo `008`'s Pacific-clock work, which removed `en-CA`
  outright rather than commenting it: `pacificToday()` now uses `en-US` with
  `formatToParts` and explicit numeric fields, plus a comment explaining that a
  locale-shaped shortcut falls back to `8/31/2026` on a small-ICU Node build.
  That pre-empts the "fix" this finding worried about more firmly than the four
  words it asked for.

**The lesson worth keeping:** a todo records a finding as it was true when
written, and nothing in `todos/` cross-invalidates. Half of this one was stale
within a day. Re-verify against the current code before acting on any of them.

## Technical Details

- `src/layouts/Base.astro:57-63`
- `src/data/site.ts:54-58`
- `src/layouts/Post.astro:219,226`
- `scripts/content-status.mjs`

## Acceptance Criteria

- [x] `sameAs` still absent from the JSON-LD when every social value is empty —
      verified by blanking `linkedin` in `site.ts`, rebuilding, and confirming
      the key is gone while the LocalBusiness schema still renders
- [x] `sameAs` still present with one entry when only LinkedIn is set — the
      emitted JSON is byte-identical to the pre-change build
- [x] Prose links still underlined at rest — unchanged, since the CSS edit was
      dropped as already done
- [x] Tests pass and the build is clean — **104** tests, not the 89 written here,
      which was stale before this todo was opened

## Work Log

- **2026-09-01** — Applied 1 and 2; dropped 3 and 4 as already fixed elsewhere
  (see Recommended Action). `profiles` is now computed once above the schema and
  spread as `...(profiles.length && { sameAs: profiles })`, matching the
  `...(x && { y })` idiom `Post.astro:53,55` already uses. The `Base.astro`
  comment is now a pointer to `site.ts`, which keeps the reasoning where the
  placeholder actually gets pasted.

  Both branches were exercised rather than reasoned about: with LinkedIn set the
  emitted JSON-LD is byte-identical to the previous build, and with every profile
  blanked the key disappears while the rest of the schema survives — confirming
  the spread of `0` contributes nothing and does not corrupt the object.
  `site.ts` was restored afterwards and the restore confirmed by SHA-256.
- **2026-08-31** — From the simplicity review during `/ce:review` of PR #9.
  Verified the `...(x && {y})` idiom exists at `Post.astro:53,55` and that the
  hover rule repeats `text-decoration: none`.

## Resources

- PR #9
