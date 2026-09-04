---
status: complete
priority: p1
issue_id: 012
tags: [code-review, typescript, seo, silent-failure, ci]
dependencies: []
---

# `npm run typecheck` checks zero `.astro` files, and that is why a one-word typo can ship 12 pages canonicalized to the homepage

## Problem Statement

Two findings that are really one. The second is the bug; the first is why nothing
can catch it.

**1. The typecheck gate covers none of the files that matter.**

```
$ npx tsc --noEmit --listFiles | grep -c '\.astro$'
0          # out of 28 .astro files in src/
$ npx tsc --noEmit --listFiles | grep -c 'public/admin'
94         # minified vendor bundles ARE in the program
```

`tsc` has no `.astro` parser, so all 28 components, layouts and pages are absent
from the program. Meanwhile `tsconfig.json` excludes only `dist`, so ~94 minified
vendor bundles under `public/admin/assets/` (katex, cytoscape, mermaid,
codemirror) *are* being pulled in.

CLAUDE.md currently describes this gate as running "across the repo, including
`tina/`". That wording was written in this repo (PR #16) and is wrong — it is
across `.ts` only. **This is a documentation defect I introduced, and it makes
the gate look stronger than it is.**

**2. The `kind` discriminant is type-erased on both sides.**

`src/pages/[locale]/[section]/[service].astro:27-30` (producing side) types props
as `Record<string, unknown>`, so every `kind:` literal is `unknown`. Line 72-75
(consuming side) recovers it with `Astro.props as { kind: 'service' | 'city' |
'blog-post'; ... }`. An assertion about a value already declared `unknown`
constrains nothing at either end. Same pair at
`src/pages/[locale]/[section]/index.astro:22` and `:49-53`.

So a `kind` value no branch handles is **not** a compile error. `title`,
`description` and `path` keep their `''` initializers (lines 95-97) and
`absoluteUrl('')` resolves to the site root.

## Findings

The review agent proved this rather than arguing it. Changing the single literal
at `[service].astro:64` from `'blog-post'` to `'blog'` — which is the *sibling
file's own word for the same concept* — produced:

| gate | result |
|---|---|
| `npm run typecheck` | **passed** |
| `npm run test` (155) | **passed** |
| `npm run build` | **passed**, exit 0, 67 pages |

and shipped all 12 translated blog posts as:

```html
<title></title>
<link rel="canonical" href="https://pasadenaworks.com/" >
```

Empty title, no meta description, and every translated post declaring the
**homepage** as its canonical — telling Google those twelve URLs are duplicates
of `/`. On a site whose only acquisition channel is organic search, that is the
worst available outcome, and all three gates are green.

The two sibling route files use **different vocabularies for overlapping
concepts** — `'service' | 'city' | 'blog-post'` in one, `'service' | 'city-hub' |
'blog'` in the other, where `'blog'` means the index and `'city'`/`'city-hub'`
swap meaning. Copying a line between them is an ordinary edit.

CLAUDE.md's current mitigation is a human procedure: *"grep the file for every
existing `if`/`else` first."* That guards a machine-checkable invariant by hand,
and it has already failed once (`docs/solutions/logic-errors/
dual-purpose-route-bare-else-broke-on-third-kind.md`).

## Proposed Solutions

### Option A — Add `astro check`, then a shared discriminated union

`npm i -D @astrojs/check`; script becomes `astro sync && astro check && tsc
--noEmit`. Then export one `RouteProps` union, type `getStaticPaths`'s return
with it, drop both `as` casts, and close each branch chain with
`const _exhaustive: never = kind`.

- **Pros:** Makes the whole class a compile error permanently, and fixes the
  false claim in CLAUDE.md. `astro check` is the actual supported tool.
- **Cons:** `astro check` will surface pre-existing errors on first run — unknown
  count until tried. Must add `public/admin` to `tsconfig.exclude` first or the
  result will look catastrophic for an unrelated reason. One more devDependency
  (dev-only; the production five are untouched).
- **Effort:** Medium · **Risk:** Medium (unknown error count)

### Option B — Runtime guard only: `throw` on an unrecognized `kind`

Add `else { throw new Error(...) }` to both files.

- **Pros:** Tiny, no new dependency, converts silence into a loud build failure.
  Catchable today, unlike Option A which needs `astro check` to exist first.
- **Cons:** Fails at build rather than at edit; does nothing for the other unsafe
  casts in `.astro` files. Treats the symptom.
- **Effort:** Small · **Risk:** Low

### Option C — Both, in two changes

Land Option B now, then Option A on its own branch where its error list can be
triaged without blocking anything.

- **Pros:** Closes the live SEO exposure immediately at near-zero risk, and keeps
  the noisy part separable. Matches how `ci.yml`'s other gates were added.
- **Cons:** Two changes instead of one.
- **Effort:** Small then Medium · **Risk:** Low

## Recommended Action

**Option C.** Fix the CLAUDE.md wording as part of the first change — it is
currently telling future readers the repo has a guarantee it does not have, which
is worse than having no gate at all.

Note the ordering constraint: the discriminated union in Option A is only
*enforced* once `.astro` files are actually compiled. Doing the union first would
add correct-looking types that nothing checks.

## Technical Details

- `src/pages/[locale]/[section]/[service].astro:27-30, 64, 72-75, 95-97`
- `src/pages/[locale]/[section]/index.astro:21-22, 49-53, 117`
- `tsconfig.json` — `exclude` needs `public/admin`
- `package.json` — the `typecheck` script
- `CLAUDE.md` — the "across the repo" claim, and the grep-by-hand mitigation

## Acceptance Criteria

- [ ] An unhandled `kind` fails a gate rather than building green
- [ ] Verified by deliberately introducing one, exactly as the agent did
- [ ] `public/admin` is out of the tsc program
- [ ] CLAUDE.md no longer claims the typecheck covers `.astro`
- [ ] `npm run build` still produces 67 pages with correct titles and canonicals

## Work Log

### 2026-09-03 — Found during full-repo review
Reproduced independently: `tsc --listFiles` reports 0 `.astro` and 94
`public/admin` files. The empty-title symptom was also observed directly from
this session's own `dist/` while the agent's experiment was live — which is worth
recording as its own lesson: **verifying against a shared working tree while
parallel agents mutate it produces real-looking evidence for a bug that is not
yours.** Re-verify `dist/` findings after agents finish, not during.

### 2026-09-03 — Half done, deliberately
Option C as recommended. **Landed:** the runtime guard — both dual-purpose routes
now `throw` on an unrecognized `kind` instead of falling through to an empty
title and a homepage canonical. Also corrected CLAUDE.md, which claimed the
typecheck ran "across the repo"; it now states plainly that `.astro` files are
outside the program, with the `tsc --listFiles` evidence.

**Still open:** adopting `astro check`. Kept separate on purpose — it needs
`@astrojs/check` added, `public/admin` excluded from tsconfig first (~94 minified
vendor bundles are in the program today), and it will surface an unknown number
of pre-existing errors that deserve triage on their own branch rather than
inside a fix PR. Until then the discriminated-union refactor is not worth doing:
it would add correct-looking types that nothing compiles.

### 2026-09-03 — Closed, Option A landed after all
The deferred half turned out to be far cheaper than estimated. `astro check` on
first run reported **0 errors, 0 warnings, 24 hints** — the "unknown error
count" that justified deferring it did not exist. Order mattered: `public/admin`
was excluded from tsconfig first, which removed ~94 minified vendor bundles from
the program.

`npm run typecheck` is now `astro sync && astro check && tsc --noEmit`, covering
62 files. With `.astro` actually compiled, the discriminated unions became
worth writing: `RouteProps` and `HubProps` replace `Astro.props as {...}` on both
dual-purpose routes, and `getStaticPaths` returns them, so each `kind:` literal
is checked where it is written.

**Escalation confirmed by experiment.** Renaming `'blog-post'` to `'blog'`:

| gate | before any of this | after the runtime throw | after the unions |
|---|---|---|---|
| `npm run typecheck` | pass | pass | **4 errors, exit 1** |
| `npm run build` | pass, 67 pages | **exit 1** | exit 1 |

`HubProps` also retired `posts?:` plus `posts ?? []` — `posts` is now required on
the blog member and absent on the others, so the blog index can no longer render
with zero cards and no error.

Two things `astro check` surfaced on its own: a dead `ogImage` in Post.astro
(Base.astro computes and uses its own, so posts do get an og:image — but the
dead variable suggests someone intended the post's own `heroImage` there and
never wired it, which is worth a product decision), and a dead `WEAK` constant
in readability.mjs. The 23 remaining hints are `is:inline` script advisories and
`z is deprecated` from Astro's zod re-export — neither actionable here.
