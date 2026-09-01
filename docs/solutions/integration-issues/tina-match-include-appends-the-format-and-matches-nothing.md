---
title: "Tina collections indexed zero documents because `match.include` already gets the format appended"
date: 2026-08-31
category: integration-issues
component: "tina/config.ts — the `docsRoot` (\"Project Docs\") and `docsSolutions` (\"Debugging Notes\") collections"
symptom: "Both docs collections showed an empty list in the Tina admin. No error, no warning, and `npm run admin` started normally. Querying Tina's own GraphQL API returned `docsRootConnection { edges: [] }` and `docsSolutionsConnection { edges: [] }` while `blogConnection` returned all 35 posts"
tags: [tinacms, cms, config, glob, silent-failure, graphql, vendor-source]
status: solved
---

## Summary

`tina/config.ts` declared both documentation collections with
`match: { include: '*.md' }`. Tina appends the collection's `format` to
whatever you write there, so the glob it actually built was `*.md.md`. That
matched nothing, both collections indexed zero documents, and **Tina reported
no error of any kind** — the admin simply showed an empty list, which is
indistinguishable from having no content.

Both collections had been broken since the day they were added (2026-08-27)
and nobody noticed, because an empty list looks like an empty folder.

## How it surfaced

Not from a bug report. A generated `CONTENT-STATUS.md` was added at the repo
root specifically so it would appear in Tina's "Project Docs" collection —
`docsRoot` uses a glob rather than an explicit file list, so a new root
`.md` file should have shown up automatically. It didn't.

## The red herring

`tinacms dev` printed one error during startup:

```
Error: Body must be a string. Received: undefined.
```

This looks like a markdown body failing to parse, and it is not. Grepping the
vendor tree for the string finds it in graphql-js, bundled inside
`@tinacms/app`'s Vite deps:

```
node_modules/@tinacms/app/node_modules/.vite/deps/chunk-P7DHCRXM.js:726
  typeof body === "string" || devAssert(0, "Body must be a string. Received: " ...)
```

"Body" there is a **GraphQL query string**, not a markdown body. It comes
from the admin app's own bundling and has nothing to do with the empty
collections. Chasing it wastes time.

## Isolating it

Three checks, each ruling something out:

1. **Is it the new file?** Query with `CONTENT-STATUS.md` present, then move
   it aside and query again. Identical: `docsRoot = 0` both times. The
   collections were already broken.
2. **Is it the content?** Plant a trivial `# Probe` / `Plain paragraph.` file
   in `docs/solutions/`. Still zero. Not a parsing problem.
3. **What is different about the collection that works?** `blog` indexed all
   35 posts. Diffing the three collection definitions: **`blog` has no
   `match` key at all; both broken collections have one.**

That third check is what pointed at `match`.

## Root cause

`getMatches()` in `@tinacms/schema-tools/dist/index.js:2103` builds the glob
by appending the format itself:

```js
const match = `${collectionPath}${pathSuffix}${collection.match.include}.${format}`;
```

So the config's `include` values produced:

| Config | Glob Tina built | Matches |
|---|---|---|
| `include: '*.md'`, path `''` | `*.md.md` | nothing |
| `include: '**/*.md'`, path `docs/solutions` | `docs/solutions/**/*.md.md` | nothing |

`match.include` is a glob **without the extension**. Tina's TypeScript types
carry no doc comment saying so, and nothing validates it — an include that
matches nothing is indistinguishable from a collection whose folder is empty.

## The fix

Write the pattern without the extension. The two values are now named
constants in `tina/utils.ts`, alongside the explanation, because
`tina/config.ts` cannot be imported under vitest — it pulls in the whole
`tinacms` browser bundle and fails on a CommonJS interop error:

```ts
// tina/utils.ts
export const DOCS_ROOT_INCLUDE = '*';
export const DOCS_SOLUTIONS_INCLUDE = '**/*';
```

```ts
// tina/config.ts
match: { include: DOCS_ROOT_INCLUDE },       // was '*.md'
match: { include: DOCS_SOLUTIONS_INCLUDE },  // was '**/*.md'
```

## Verifying

Start the Tina backend alone and ask its GraphQL API directly. Note the
`-c "sleep 40"` — `tinacms dev -c "astro dev"` exits immediately here,
because Astro 7 daemonises when it has no TTY and Tina shuts down with its
child:

```bash
npx tinacms dev -c "sleep 40" &
curl -s -X POST http://localhost:4001/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ docsRootConnection { edges { node { _sys { filename } } } } }"}'
```

After the fix: 6 root docs (CLAUDE, CONTENT-PLAN, CONTENT-STATUS,
MASTER-PORTS, PORTS, README), 7 debugging notes, and `blog` still at 35.

## Prevention

`tina/config.test.ts` calls **Tina's own `getMatches()`** rather than
re-implementing the rule, then runs the resulting globs against the real
files on disk:

```ts
const schema = new TinaSchema({ collections: COLLECTIONS } as never);
const globs = schema.getMatches({ collection });
expect(picomatch(globs), 'matched nothing').…
```

Two assertions per collection: the glob must match at least one file that
actually exists, and it must not contain a doubled extension. Because it goes
through Tina's own function, the test follows Tina if the composition rule
ever changes.

The generalisable rule: **a config value that silently matches nothing needs
a test that asserts it matches something.** Validation catches malformed
config; only a positive assertion catches config that is well-formed and
wrong.

## Related

- `docs/solutions/logic-errors/dual-purpose-route-bare-else-broke-on-third-kind.md`
  — the other silent-branch failure in this repo, same shape: valid code, no
  error, wrong result.
- `CLAUDE.md` previously stated both docs collections were browsable in the
  admin. They never were. Claims about what works need the same verification
  as the code.
