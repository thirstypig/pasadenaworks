---
status: complete
priority: p2
issue_id: "035"
tags: [code-review, seo, i18n, es, tests]
dependencies: []
---

# Spanish meta descriptions run past Google's cut-off, and the length test only checks English

## Problem Statement

CLAUDE.md sets meta descriptions at about 155 characters ("155 characters to win a
click in a search result"). The rewritten Spanish ones run 169–176, so Google cuts
them mid-phrase. The new test named for the 150–158 rule checks `t.en.meta` only, so
it stays green.

## Findings

Built pages (pattern and SEO reviewers, independently):
- `/es/servicios/sitios-web/` 176 (`src/data/services.ts:348`)
- `/es/servicios/digitalizacion-del-consultorio/` 171 (`:249`)
- `/es/` 169 and title 70 characters (`src/data/home.ts:33`, `:35`)
- `/es/servicios/` 169 (`src/i18n/ui.ts:229`)
- On `main`, the Spanish homepage description was 130 and its title 61.
- Test: `src/data/services.test.ts:91` iterates English only.

## Proposed Solutions

### Option A: Trim the Spanish copy by hand; extend the service meta test to Spanish
- **Pros:** fixes the four pages; Latin-script length rule applies cleanly to Spanish.
- **Cons:** Chinese still unguarded (a character count means something different there).
- **Effort:** Small · **Risk:** Low

### Option B: Per-locale bands table (Latin ~150–160, CJK a character ceiling)
- **Pros:** covers every locale.
- **Cons:** a CJK ceiling needs its own calibration against the corpus.
- **Effort:** Medium · **Risk:** Low

## Recommended Action

Option A now; Option B only if a Chinese description ever overruns.

## Technical Details

- `src/data/services.ts`, `src/data/home.ts`, `src/i18n/ui.ts`, `src/data/services.test.ts`

## Acceptance Criteria

- [x] All four Spanish descriptions ≤ 160 characters on the built pages; Spanish homepage title ≤ 62
- [x] Service meta length test covers `es`, and fails on an injected 176-character description
- [x] Meaning preserved (no dropped "de proveedores de software"-style qualifiers)

## Work Log

### 2026-09-14 — Found in PR #75 review
Pattern-recognition (P2), kieran-typescript (P3) and SEO/i18n (P3) reviewers.

### 2026-09-14 — Fixed on the PR #75 branch
Option A. Spanish descriptions trimmed by hand: Digitize 171→154 (and now keeps "de proveedores de software"), Get more patients 176→154, /es/ 169→150 with title 70→55, /es/servicios/ 169→147. The service meta test became a per-locale band (en 150–158, es 130–160). Falsified: an injected 206-character Spanish meta failed it, then the file was restored byte-identical from backup.

Verified: `npm run typecheck` 0 errors (88 files); `npm run build` no warnings; `npm run test` 349 passed, 1 skipped (350, up from 346); `npm run readability -- --dist` exit 0 with every service page and homepage in band.

**todos/035 is closed.**

## Resources

- PR #75
