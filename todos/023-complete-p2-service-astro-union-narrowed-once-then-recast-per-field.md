---
status: complete
priority: p2
issue_id: 023
tags: [code-review, typescript, type-safety]
dependencies: []
---

# `[service].astro` narrows its discriminated union once, then falls back to ad hoc casts for every actual field read

## Problem Statement

todos/012 replaced `Astro.props as {...}` with real `RouteProps`/`HubProps`
discriminated unions specifically so a `kind` mismatch is a compile error where
it's written. `[locale]/[section]/[service].astro` adopted the union only at its
single destructuring point (`kind`/`locale`) and reverts to untyped, ad hoc
`Astro.props.<field> as <Type>` casts for every other field read — the exact
erasure pattern todos/012 fixed at this file's entry point, still present one
line further downstream in three places.

## Findings

Found by the kieran-typescript-reviewer agent, 2026-09-09 full-repo pass.

```ts
// src/pages/[locale]/[section]/[service].astro
const { kind, locale } = Astro.props as RouteProps;   // line 96 — cast, then only kind/locale kept
...
const props = Astro.props as { post: BlogPost; translations: ... };  // line 106
...
service = Astro.props.service as Service;   // line 128
...
city = Astro.props.city as City;             // line 147
```

Compare the sibling file, which does this correctly:

```ts
// src/pages/[locale]/[section]/index.astro:71-73
const props = Astro.props as HubProps;
const { kind, locale } = props;
const posts = props.kind === 'blog' ? props.posts : undefined;   // narrowed automatically, no further cast
```

**Concrete gap:** if `RouteProps`'s `'city'` variant were ever renamed (`city` →
`cityEntry`), `getStaticPaths`'s typed `paths: {..., props: RouteProps}[]` array
would catch it at construction — but `Astro.props.city as City` would keep
compiling with 0 errors, `city` would be `undefined` at runtime, and
`cityCopy = city.t[locale]!` would throw at build time only if you're lucky (the
`!` assertion masks it further). This is the same shape of bug that shipped 12
pages with an empty `<title>` before todos/012's fix — just one narrowing step
short of where that fix actually lands.

## Proposed Solutions

### Option A — Keep the cast result and narrow through it, matching `index.astro`

```ts
const props = Astro.props as RouteProps;
const { kind, locale } = props;
if (props.kind === 'service') { service = props.service; ... }
if (props.kind === 'city') { city = props.city; ... }
if (props.kind === 'blog-post') { blogPost = props.post; blogTranslations = props.translations; ... }
```
No further `as` needed anywhere in the file — TS narrows `props.service`/
`props.city`/`props.post` for free once branching happens on `props.kind`
instead of the destructured, disconnected `kind`.

- **Pros:** Restores the exact guarantee `RouteProps` was written to provide, at
  a ~10-line, purely mechanical change with no behavioral effect. Matches the
  sibling file's already-correct pattern exactly.
- **Cons:** None identified.
- **Effort:** Small · **Risk:** Low

## Recommended Action

Option A.

## Technical Details

- `src/pages/[locale]/[section]/[service].astro:96,106,128,147`
- Compare: `src/pages/[locale]/[section]/index.astro:71-73` (the correct pattern)

## Acceptance Criteria

- [ ] All `Astro.props.<field> as <Type>` casts in `[service].astro` removed
- [ ] Fields are read through the single narrowed `props` variable instead
- [ ] `npm run typecheck` still passes with 0 errors
- [ ] Verified by the same reproduction todos/012 used: rename one `kind`
      literal and confirm it's now caught as far downstream as the field reads,
      not just at the initial destructure

## Work Log

### 2026-09-09 — Found during full-repo review
Kieran-typescript-reviewer agent, part of an 8-agent intensive review requested
by the owner. No P1s found across all 8 agents; this is one of three P2s.

### 2026-09-09 — Closed, Option A landed
`[service].astro` now casts `Astro.props as RouteProps` once into a `props`
variable, destructures `kind`/`locale` from it for the existing top-level
checks, and every branch narrows through `props.kind === '...'` before reading
`props.<field>` directly — no further `as` casts anywhere in the file. Matches
`index.astro`'s already-correct pattern exactly.

**Escalation confirmed by the same reproduction todos/012 used**, this time
one field further downstream: temporarily renamed the `'city'` variant's field
from `city` to `cityEntry` in `RouteProps` only (not in `getStaticPaths`'s
actual push), leaving a real mismatch. Before this fix, that mismatch would
have kept compiling clean (the blind `Astro.props.city as City` cast asserts
past it). After the fix: **5 real `tsc` errors**, including the exact line
(`city = props.city` → `Property 'city' does not exist on type '{ kind:
"city"; ...; cityEntry: City }'`) that used to slip through. Reverted the test
change immediately after confirming; `npm run typecheck` back to 0 errors.

Verified: `npm run typecheck` (0 errors, 84 files), `npm run test` (308
passing), `npm run build` (71 pages, clean).

## Resources

- Full-repo review, 2026-09-09 (kieran-typescript-reviewer agent)
- todos/012 — the original fix this extends
