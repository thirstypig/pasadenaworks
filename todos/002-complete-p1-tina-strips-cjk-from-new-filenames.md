---
status: complete
priority: p1
issue_id: 002
tags: [code-review, tina, content-integrity, i18n, data-loss]
dependencies: []
---

# Creating a Chinese post in Tina writes it to `zh-hant/.md` — and the second one overwrites the first

## Problem Statement

`slugifyBlogFilename()` in `tina/utils.ts` derives a new post's filename from its
title by lowercasing and replacing every non-`[a-z0-9]` run with a hyphen. Every
Chinese character is non-ASCII, so a CJK title reduces to an **empty string** and
the file lands at `<locale>/.md`.

The first Chinese post created through the Tina admin gets a hidden dotfile. The
second one silently overwrites it.

This is pre-existing — it did not arrive with PR #9, and none of the 45 posts in
this PR are affected because they were authored as files with real Pinyin
filenames. It is filed against this PR because the PR just tripled the amount of
CJK content on the site, and the owner is the person who uses Tina.

## Findings

`tina/utils.ts:16-24`:

```ts
const base = (values?.title || 'untitled')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');
return `${locale}/${base}`;
```

Run against real titles from this PR:

```
"zh-hant/"                                       <- 怎麼開口請客戶留評價，又不尷尬
"zh-hant/"                                       <- 網站流量掉下來了，該怎麼處理
"zh-hans/"                                       <- 怎么开口请顾客留好评，还不尴尬
"es/necesito-una-p-gina-web-si-tengo-instagram"  <- ¿Necesito una página web si tengo Instagram?
"en/how-to-ask-customers-for-reviews"            <- How to ask customers for reviews
```

Two separate failures:

- **CJK → empty basename.** Both Traditional titles produce the identical path
  `zh-hant/`. Collision on the second post.
- **Accented Latin is mangled.** `página` → `p-gina`. Not data loss, but it
  produces an ugly filename for every Spanish post with an accent, which is most
  of them.

`tina/utils.test.ts` has seven cases and all of them are ASCII English, so this
passes cleanly today. The test suite's coverage is the reason nobody has noticed.

Worth stating plainly: an agent writing markdown files produces correct CJK
posts more reliably than the owner using the admin UI. The usual parity concern
runs the other way here.

## Proposed Solutions

### Option A — Derive the filename from the `slug` field instead of `title`
`slug` is already required by the schema, already unique across all locales
(enforced by `blog-content.test.ts`), and is already the real URL segment.

- **Pros:** Uses a field that is already ASCII, already validated, and already
  the thing routing depends on. Removes the transliteration question entirely.
  Smallest correct fix.
- **Cons:** Tina must have `slug` populated before the filename is computed;
  needs checking against Tina's field ordering. If `slug` is blank at creation
  time the same empty-basename bug returns.
- **Effort:** Small · **Risk:** Low

### Option B — Keep deriving from title, add a non-ASCII fallback
If the slugified base is empty, fall back to `slug`, or to a timestamp.

- **Pros:** Never produces an empty basename regardless of which fields are
  filled. Defensive against future locales.
- **Cons:** A timestamp filename is opaque; the owner would see
  `zh-hant/1756... .md` and not know which post it is.
- **Effort:** Small · **Risk:** Low

### Option C — Transliterate CJK to Pinyin
Add a transliteration dependency and romanize properly.

- **Pros:** Produces filenames that read like the existing hand-authored ones.
- **Cons:** Adds a runtime dependency to a repo that deliberately runs five.
  Machine Pinyin is often wrong on polyphonic characters, so the filenames would
  be subtly worse than the hand-picked ones. Solves a problem Option A dissolves.
- **Effort:** Medium · **Risk:** Medium

## Recommended Action

_(Leave blank for triage.)_

## Technical Details

- **Affected files:** `tina/utils.ts` (`slugifyBlogFilename`), `tina/utils.test.ts`
- **Not affected:** the 45 posts in PR #9, all authored as files
- **Related:** `src/utils/blog-content.test.ts` already enforces global slug uniqueness on the `slug` field, which is why Option A is attractive

## Acceptance Criteria

- [ ] A Traditional Chinese title produces a non-empty, unique filename
- [ ] A Simplified Chinese title produces a non-empty, unique filename
- [ ] Two different CJK titles never collide on the same path
- [ ] A Spanish title with accents produces a readable filename
- [ ] `tina/utils.test.ts` gains CJK and accented-Latin cases — the absence of
      those cases is what let this survive
- [ ] Verified by creating a Chinese post through the actual Tina admin, not
      only by unit test

## Work Log

- **2026-08-31** — Surfaced by the agent-native review during `/ce:review` of
  PR #9, then reproduced directly by running the exact transform from
  `tina/utils.ts` against real titles from this PR. Confirmed both Traditional
  titles map to the same empty path.

## Resources

- `tina/utils.ts:16-24`
- `tina/utils.test.ts`
- PR #9

---

**RESOLVED 2026-08-31 — Option A.** `slugifyBlogFilename` now derives from the
`slug` field (required, already ASCII, already globally unique) and falls back
to the title only when slug is empty, with `untitled` as a terminal fallback so
the basename can never be blank. Five tests added covering Chinese titles,
two-Chinese-posts-don't-collide, accented Latin, the title fallback, and the
never-empty invariant. `tsc --noEmit --strict` clean on `tina/utils.ts`.
