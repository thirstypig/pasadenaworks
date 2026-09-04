---
status: pending
priority: p3
issue_id: 019
tags: [code-review, testing, quality]
dependencies: []
---

# Six tests that pass regardless of the behaviour they name

## Problem Statement

The suite is 167 tests and genuinely load-bearing — it is the only thing standing
between a silent content mistake and production. That makes the tests which
*cannot fail* worth removing or fixing: they inflate the count, and a reader
counting coverage sees protection that is not there.

CLAUDE.md already warns about the mirror of this ("an 'expect nothing' grep whose
needle no longer exists passes forever"). Notably the corpus-wide absence checks
all carry positive controls — that failure mode is genuinely absent here. These
are a different shape.

## Findings

**1. `reading-time.test.ts:29-32`** is titled "collapses multiple
whitespace/newlines instead of over-counting", but the body yields 6 tokens with
or without collapsing, and `Math.ceil(6/200)` is 1 — which is also the function's
clamped floor. It passes whether or not the behaviour exists, and duplicates
`:14-17`. Make it falsifiable with ~150 words joined by multiple spaces, where a
non-collapsing implementation tips to 2 minutes.

**2. `content-status.test.mjs:61-63`** asserts
`parseFrontmatter(EN_RAW)['> **TL;DR** — Sometimes, no.']` is undefined.
Unfalsifiable twice: the parser only produces keys via
`line.slice(0, indexOf(':'))`, so a whole line can never become a key — and that
line has no colon anyway (`TL;DR` is a semicolon). It would pass with the
frontmatter regex deleted entirely.

**3. `cities.test.ts:22-31`** asserts every locale `cityLocales()` reports is
defined in `city.t` — but `cityLocales` *is* `Object.keys(city.t).filter(Boolean)`,
so it is true by construction for any content. The regression it means to catch
is already caught more precisely by its two neighbours at `:11-15` and `:17-20`.
It also has no `cities.length` control, so an empty array passes silently.

**4. Assertions implied by their neighbours** — `blog.test.ts:77-79` (strings
already pinned exactly at `:72-75`), `routes.test.ts:38-41` (an exact sorted-array
equality at `:37` already excludes those locales), `tina/utils.test.ts:86-90`
(identical ASCII-English path to `:5-9`, and misfiled under "Non-ASCII titles").
The `routes.test.ts` pair documents intent and is defensible.

**5. Setup out of proportion.** `readability.test.mjs:260` calls `report()` —
full FK / Fernández Huerta / register analysis over all 80 posts — at
describe-collection time, to obtain nothing but `row.locale` and `row.file`.
`tina/config.test.ts:64-70` recursively crawls the entire repo root (because
`docsRoot.path` is `''`) to prove one glob matched something non-empty.

**6. The content-integrity tests only see four hardcoded directories while the
loader glob sees everything.** `blog-content.test.ts:18,42-45` does `readdirSync`
over exactly `['en','es','zh-hans','zh-hant']` and keeps only top-level `.md`;
`content.config.ts:5` is `glob({ pattern: '**/*.md' })`. A post at
`src/content/blog/post.md` or `en/drafts/post.md` is in the collection, gets a
page, and is invisible to every invariant — slug uniqueness included. Tina always
writes `<locale>/<base>`, so this needs a hand-placed file. Cheap to close by
walking recursively.

**7. The orphan check is duplicated over two disagreeing parsers.**
`blog-content.test.ts:116-124` and `content-status.test.mjs:170-177` are the same
algorithm over the same 80 files. Underneath, `field()` and `parseFrontmatter()`
are independent parsers that **already disagree** — `field()` handles only double
quotes and does no doubled-apostrophe unescaping. Latent today (no single-quoted
values in the corpus). This is the third frontmatter parser in the repo.

## Proposed Solutions

### Option A — Rewrite 1–3 to be falsifiable, delete 4, fix 6 and 7
Leave 5 (slow but harmless).

- **Pros:** Every remaining test can fail. #6 closes a real blind spot in the
  invariant that matters most.
- **Cons:** Test count drops, which looks like a regression in a changelog.
- **Effort:** Small–Medium · **Risk:** Low

### Option B — #6 and #7 only
The blind spot and the disagreeing parsers; leave the vacuous assertions.

- **Pros:** Targets the two with real consequences.
- **Cons:** Leaves tests that assert nothing sitting in the count.
- **Effort:** Small · **Risk:** Low

## Recommended Action

**Option A.** Every new test added in the 2026-09-03 PR was falsified against
deliberately broken input before being kept; holding existing tests to the same
bar is the consistent move.

## Acceptance Criteria

- [ ] Each rewritten test fails when the behaviour it names is removed
- [ ] A `.md` file placed outside the four locale directories is caught
- [ ] One frontmatter parser, shared

## Work Log

### 2026-09-03 — Found during full-repo review
Verified by running the arithmetic on #1 and reading the parser for #2 rather
than trusting the titles.
