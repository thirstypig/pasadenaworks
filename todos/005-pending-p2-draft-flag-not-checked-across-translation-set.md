---
status: pending
priority: p2
issue_id: 005
tags: [code-review, testing, content-integrity]
dependencies: []
---

# `draft` can differ across a translation set and nothing catches it

## Problem Statement

`src/utils/blog.ts` gates publication on two fields together:

```ts
({ data }) => !data.draft && data.pubDate <= now && data.locale === locale   // line 18
({ data }) => !data.draft && data.pubDate <= now                             // line 113
```

`src/utils/blog-content.test.ts` asserts `pubDate` is identical across every
post sharing a `translationKey` — with a comment explaining exactly why ("so a
set publishes together"). It does **not** do the same for `draft`. The field is
not parsed into the test's `Post` type at all.

So a set where the English is `draft: true` and a translation is `draft: false`
publishes a translated page whose English parent does not exist. That is the
orphan state the `translationKey` test was written to prevent, reachable through
the one field that test forgot.

## Findings

Confirmed by grep: `draft` appears nowhere in `src/utils/blog-content.test.ts`,
while `blog.ts` reads it on both the listing path and the `getStaticPaths` path.

The realistic way this happens is Tina. The owner flips drafts through the admin
UI — that is how the last five posts went live — and the UI edits one file at a
time. Flipping the English post's `draft` without flipping its three
translations, or the reverse, is a two-click mistake with no feedback.

Consequences depend on direction:
- English `draft: true`, translation `draft: false` → a live translated page
  with no English parent. `getTranslationsFor()` would emit alternates pointing
  at an unbuilt English URL, which is precisely CLAUDE.md's hard rule #1.
- English `draft: false`, translations `draft: true` → the post publishes
  English-only, silently. Exactly the outcome all 45 translations in this PR
  exist to prevent.

Raised by the simplicity review, which also noted the fix reuses machinery the
test file already has: the `byKey` grouping built for the `pubDate` assertion.

## Proposed Solutions

### Option A — Extend the existing consistency test
Add `draft: field(source, 'draft')` to the parse and one more assertion beside
the `pubDate` one, reusing the `byKey` map already built at line 82.

- **Pros:** ~4 lines. Reuses existing structure. Catches both directions. Sits
  directly next to the test whose reasoning it shares.
- **Cons:** Only runs when the suite runs — see todo 001, which is why that one
  is P1 and this is P2.
- **Effort:** Small · **Risk:** Low

### Option B — Derive `draft` from the English post at build time
Have translations inherit the English post's `draft` rather than declaring it.

- **Pros:** Makes the invariant structurally impossible to violate rather than
  merely tested.
- **Cons:** Changes the content schema and `blog.ts`; a translation could no
  longer be held back individually, which may be wanted while one language is
  still being reviewed.
- **Effort:** Medium · **Risk:** Medium

### Option C — Validate in the Tina UI
A `beforeSubmit` hook warning when a set's `draft` values diverge.

- **Pros:** Feedback at the moment of the mistake, in the tool where it happens.
- **Cons:** Tina's admin is local-only, so it protects the owner's path but not
  a file edit or an agent. Note the repo already learned that a collection-level
  Tina `ui` config can silently no-op.
- **Effort:** Medium · **Risk:** Medium

## Recommended Action

_(Leave blank for triage.)_

## Technical Details

- **Affected files:** `src/utils/blog-content.test.ts` (the gap), `src/utils/blog.ts:18,113` (where `draft` is load-bearing)
- **Related invariant already tested:** `pubDate` parity within a `translationKey`

## Acceptance Criteria

- [ ] A set with mismatched `draft` values fails the test suite
- [ ] Both directions covered (English drafted, translation live — and reverse)
- [ ] `pillar` deliberately left unchecked, or a note explaining why a mismatch
      there is cosmetic

## Work Log

- **2026-08-31** — Raised by the simplicity review during `/ce:review` of PR #9.
  Verified: `draft` is absent from the integrity tests and present on both
  filter paths in `blog.ts`.

## Resources

- `src/utils/blog-content.test.ts`
- `src/utils/blog.ts:18,113`
