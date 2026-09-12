import { configDefaults, defineConfig } from 'vitest/config';

// This project has no other vitest configuration — the suite runs on the
// defaults. The one thing the defaults get wrong here is WHERE they look.
//
// Claude Code creates git worktrees under `.claude/worktrees/`, and a worktree
// is a full second checkout of this repo: every `*.test.ts` in it is a real
// file on disk. `.claude/` is not in vitest's default `exclude` list, so a
// leftover worktree gets collected alongside `src/`, and the suite runs twice
// against two different commits.
//
// That is not a hypothetical. A worktree left behind on 2026-09-09 was still
// there on 2026-09-11, and `npm run test` reported 623 tests across 52 files
// while CI, on a clean checkout, reported 316 across 26 — the doubled number
// went into CLAUDE.md as the project's test count. It is not a 2x tell either,
// because the stale copy sits at an OLDER commit with fewer tests, so the
// inflated total looks like a plausible one (316 + 307 = 623).
//
// `.git/info/exclude` already hides this directory from git, which is why the
// duplicate never showed up in `git status`. That is a git-only rule and does
// nothing for a test runner walking the filesystem.
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, '.claude/**'],
  },
});
