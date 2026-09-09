---
status: complete
priority: p3
issue_id: 028
tags: [code-review, documentation, typescript]
dependencies: []
---

# The "a fourth kind is a compile error" code comment overstates the actual guard

## Problem Statement

Both dual-purpose route files carry a comment claiming an unhandled `kind` is a
compile error. The real guard that catches it is a runtime `throw` during
`astro build`, not a `tsc` exhaustiveness check. Practically equivalent in
effect (both fail loudly, both are CI-visible), but the comment describes the
wrong mechanism, which could mislead a future reader into over-trusting
`tsc`/`typecheck` alone to catch a brand-new `kind` with no branch at all.

## Findings

Found by the architecture-strategist review agent, 2026-09-09 full-repo pass.

The pattern is genuinely sound: both files narrow on `kind` via strict-equality
comparisons against a literal union type, so TS emits `TS2367` ("no overlap")
if a comparison literal doesn't belong to the union — this is what the
2026-09-03 "rename one kind literal, get 4 errors" result actually rests on,
and it's real (confirmed no `checkJs`-style escape hatch undermines it).

But there is no exhaustiveness check (`satisfies`, a `never`-typed default
branch, etc.) — grepped both files for `never`/`satisfies`/`exhaustive`, found
none. If someone added a genuinely new `kind` member to the union *and* wrote a
valid branch for it in `getStaticPaths`, but forgot the render-side branch,
nothing at the type level would force that omission to fail `tsc`. What
actually catches it is the runtime `throw` at the bottom of each file
(`[service].astro:171-176`, `index.astro:85-91`) — which fails the **build**
(during `astro build`'s render execution), not `typecheck`.

## Proposed Solutions

### Option A — Correct the comment to describe the real mechanism

Soften "compile error" language to something like "the build throws loudly"
in both files' header comments.

- **Pros:** Cheap, immediately removes the misleading claim.
- **Cons:** Doesn't add the missing exhaustiveness check itself.
- **Effort:** Small · **Risk:** None

### Option B — Also add a genuine exhaustiveness assertion

Add `const _exhaustive: never = kind` in a final `else` in both files, making
the "compile error" claim literally true rather than just correcting the prose.

- **Pros:** Closes the actual gap, not just the documentation of it — a future
  new `kind` with a missing branch would then fail `typecheck`, not just the
  build.
- **Cons:** More invasive than a comment fix; needs care to fit the existing
  `if`/`else if` structure without disturbing the working runtime throw.
- **Effort:** Small-Medium · **Risk:** Low

## Recommended Action

Option A now (cheap, removes the misleading claim immediately); Option B as a
follow-up if the owner wants the stronger guarantee — the runtime throw is
already a sound belt-and-suspenders layer either way, so this isn't urgent.

## Technical Details

- `src/pages/[locale]/[section]/[service].astro:28-29` (the comment), `:171-176` (the actual throw)
- `src/pages/[locale]/[section]/index.astro:85-91` (the actual throw)

## Acceptance Criteria

- [ ] Comment language corrected in both files (Option A)
- [ ] If Option B taken: exhaustiveness assertion added, verified by the
      standard reproduction (add a kind with a missing branch, confirm `tsc` fails)

## Work Log

### 2026-09-09 — Found during full-repo review
Architecture-strategist agent, part of an 8-agent intensive review requested by
the owner.

### 2026-09-09 — Closed, Option A landed
Corrected both files' header comments (`[service].astro:25-34`,
`index.astro:20-25`) to describe the real two-layer mechanism: a `kind`
literal typo IS a genuine `tsc` compile error (comparison against a literal
outside the union), but a brand-new, unhandled `kind` is caught by the runtime
throw at the bottom of each file instead, which fails the build, not
`typecheck` — there's no exhaustiveness check. Option B (adding a real
`const _exhaustive: never = kind` assertion) left as a possible future
follow-up, not done now — the runtime throw is already a sound guard.

Verified: `npm run typecheck` still 0 errors (comment-only change).

## Resources

- Full-repo review, 2026-09-09 (architecture-strategist agent)
- todos/012 — where the current (real, but overstated) guard was added
