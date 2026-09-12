---
title: "A leftover git worktree made vitest collect the repo twice, and the doubled test count was written into CLAUDE.md as fact"
date: 2026-09-11
category: process-errors
component: "vitest.config.ts (new) + CLAUDE.md § Commands — the test-count and dist-skip claims"
symptom: "`npm run test` reported 623 tests across 52 files while CI, on a clean checkout, reported 316 across 26. Both runs were green. The local number had been copied into CLAUDE.md as the project's test count, and the suite was silently running against two different commits at once — a git worktree under `.claude/worktrees/` is a full second checkout, and `.claude/` is not in vitest's default exclude list."
tags: [vitest, worktrees, test-infrastructure, silent-failure, measurement, stale-local-state, documentation-drift]
status: solved
---

## Summary

A git worktree created on 2026-09-09 under `.claude/worktrees/` was never
removed. A worktree is a complete second checkout, so every `*.test.ts` in it is
an ordinary file on disk. Vitest had no configuration in this project, and
`.claude/` is not among its default `exclude` patterns, so the runner collected
both copies and ran the suite twice — once against `main`, once against the
older commit the worktree was parked on.

Nothing failed. The only thing that moved was a count, and the count had already
been copied into `CLAUDE.md` as the project's test total.

## How it surfaced

During an end-of-session wrap-up on a repository with **no changes at all**, the
suite was run purely to confirm the checkout was intact after removing that
worktree. It printed:

```
Test Files  26 passed (26)
     Tests  315 passed | 1 skipped (316)
```

`CLAUDE.md` said `vitest, 623 across 52 files`. Roughly half.

The run that would have exposed this any day earlier was never performed,
because running the tests when nothing has changed looks like wasted effort.

## Why the number did not look wrong

A doubled count usually announces itself: 316 becomes 632, and the 2x is
obvious. It did not here, for a reason worth internalising.

The stale copy sat at an **older commit with fewer tests**. So the total was not
2 × 316 but 316 + 307 = **623** — an arbitrary-looking number that reads exactly
like a real measurement of a growing suite. The arithmetic only closes once you
know there are two checkouts.

## Why nothing caught it

Three independent reasons, each sufficient on its own:

- **`git status` was clean.** `.git/info/exclude` lists `.claude/worktrees/`.
  That file is local, uncommitted and per-clone, so nobody reviewing the repo
  would find the rule — and it is a *git* rule, which means nothing to a test
  runner walking the filesystem. The directory was simultaneously invisible to
  git and fully visible to vitest.
- **Every run was green.** A duplicate of a passing suite passes. There is no
  failure to investigate, no flake, no slowdown worth noticing at ~1s.
- **CI disagreed the whole time and nobody compared.** Every CI run since the
  worktree appeared reported 316/26. The disagreement was sitting in the logs
  for two days.

## The mechanism, precisely

Vitest's default `exclude` covers `node_modules`, `dist`, `.git`, `.cache`,
`.idea` and similar. It does not cover `.claude/`, which did not exist as a
convention when those defaults were written. Claude Code puts worktrees there.

So the requirement is not "ignore a stray directory" but something sharper: **a
worktree is indistinguishable from real source to any tool that walks the
filesystem rather than asking git what is tracked.** Anything scanning by glob
— a test runner, a linter, a codemod, a bundler — will find a second copy of
every file in the repository and treat it as first-class.

`npm run typecheck` was re-measured for exactly this reason and was *not*
affected: it reported 84 files with and without the worktree present. Do not
assume the blast radius; measure each tool.

## The fix

`vitest.config.ts`, the project's first vitest configuration:

```ts
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, '.claude/**'],
  },
});
```

Spreading `configDefaults.exclude` is load-bearing. Writing
`exclude: ['.claude/**']` would *replace* the defaults and put `node_modules`
back in scope — trading a small measurement bug for a much larger one.

## Verifying

Proven by mutation rather than by assertion, because "the count changed" is
exactly the kind of evidence that looked convincing last time and was wrong.

One deliberately failing test file, run from two locations:

| Location | Result |
|---|---|
| `src/__exclusion_proof.test.ts` | **RED** — 27 files, 1 failed |
| `.claude/worktrees/exclusion-proof/` | **not collected** — 26 files, 316 tests, green |
| `npx vitest run <that .claude path>` | `No test files found, exiting with code 1` |

The middle row is the one that matters: the same file, still failing, simply
never reached. The proof file was deleted in the same session.

CI then confirmed all three corrected numbers independently, on a clean
checkout: 316 tests across 26 files, 9 skipped before the build, 85 files
typechecked.

## What was corrected in CLAUDE.md

- test count `623 across 52 files` → `316 across 26 files`
- dist-gated skips `6 of these need dist/` → `9` (CI pre-build: 307 passed, 9
  skipped; post-build: 316 passed, 0 skipped) — a second stale number in the
  same sentence, found only because the first one was being checked
- typecheck `84 files` → `85`, which is the new config file itself

## Prevention

The durable rule: **a number measured on a laptop is a claim about that laptop.**
CI on a clean checkout is the authority for anything that gets written down as a
property of the project.

This repository has now been bitten by the same shape three times, which is why
it is worth naming as a class rather than a bug:

- a test needing `dist/` passed locally because a stale `dist/` was lying
  around, and failed the moment CI ran it clean;
- `npm run typecheck` passed locally because `.astro/` types existed from an
  earlier build, and failed in CI on a fresh checkout until `astro sync` was
  added;
- and now a test *count* inflated by a second checkout that only existed
  locally.

Each time, the local machine held state the repository did not describe. Before
writing a measured number into documentation, take it from a CI log — or at
minimum ask what on this machine, and not in the repo, could be contributing to
it.

A second, smaller rule: **run the suite even when nothing changed.** It costs a
second and it is the only reason this was found. The instinct that says "no
changes, so no point" is precisely what kept it hidden.

## Related

- `docs/solutions/logic-errors/static-site-scheduled-publishing-needs-a-clock.md`
  — another case where the missing piece was environmental rather than in the code.
- `CLAUDE.md` § Gotchas, "A review agent and your own verification can share a
  working tree" — the nearest neighbour: a parallel agent's experiment polluted
  `dist/` and produced convincing evidence for a bug that did not exist. Same
  class, same directory, different tool.
