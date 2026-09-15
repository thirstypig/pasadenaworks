---
status: pending
priority: p3
issue_id: "041"
tags: [code-review, typescript, architecture, seo]
dependencies: []
---

# Three gaps in how services, their sources and their retired URLs are modelled

## Problem Statement

None of these breaks the site today. Each is a place where a reasonable future edit
gives a wrong result that the type checker or tests should catch and would not: a
deleted service the types still accept, a helper that corrupts a link it was not built
for, and a test that would demand redirects from URLs Google never saw.

## Findings

Lines in `services.ts` past ~70 are drifting (it is being edited); search by name.

- **(a) `ServiceId` is hand-written.** `src/data/services.ts:~96` spells out
  `'consulting' | 'digitize' | 'websites'`, unlike `src/data/pillars.ts:25`, which derives
  `Pillar` from an `as const` array. Delete a service record and the type still accepts
  its id; only the runtime throw in `serviceForPillar()` (~436) catches it, at build
  time. The spec (§2, line 85) says "a pillar without a service is a compile error" —
  true for a pillar missing from `PILLAR_SERVICE`, not for a service missing from `services`.
- **(b) `google()` mangles `&amp;` URLs.** The `SOURCES` comment (`services.ts:32-37`)
  requires `&` written as `&amp;`, but `google()` (64-68) parses input with `new URL`.
  On `calBusProf650` (line 50) it returns `...lawCode=BPC&amp%3BsectionNum=650&hl=es-419`,
  a broken link (reproduced in node). Harmless today: only the two Google sources use it.
- **(c) History rebuilt from today's segments.** At review, `retired-services.test.ts` built
  each redirect's *source* path from the current `SEGMENTS.services`, so a segment rename
  would move the expectation with it. **Since addressed by the todo 036 work:** sources are
  now checked against a literal, append-only `PUBLISHED_SERVICE_URLS` list. Verify on merge.

## Proposed Solutions

### Option A — Make the types and data carry the rule

(a) Declare `services` `as const satisfies readonly Service[]` and derive `ServiceId`, or
add a `SERVICE_IDS` array both read. (b) Store raw URLs; escape `&` once, where HTML is
built. (c) Already done by 036.

- **Pros:** Each mistake fails at the point of the edit. **Cons:** (b) touches every
  `href` built from `SOURCES`; `as const` on a large copy object can slow editor hints.
- **Effort:** Medium · **Risk:** Low–Medium

### Option B — Guards instead of restructuring

(a) A test that every `ServiceId` has a record. (b) `google()` throws on `&amp;`.

- **Pros:** Very small. **Cons:** Catches mistakes later than types would.
- **Effort:** Small · **Risk:** Low

## Recommended Action

To be decided in triage.

## Technical Details

- `src/data/services.ts` (`SOURCES`, `google()`, `ServiceId`, `PILLAR_SERVICE`, `serviceForPillar`),
  `src/data/pillars.ts:25` (pattern to copy), `src/data/retired-services.test.ts`

## Acceptance Criteria

- [ ] Removing a service record is a compile error or a named test failure
- [ ] `google()` cannot silently return a corrupted URL for an `&amp;` source
- [ ] (c) confirmed resolved: redirect sources checked against URLs that shipped
- [ ] `npm run typecheck`, `npm run test` and `npm run build` pass

## Work Log

### 2026-09-14 — Found in PR #75 review
Raised by the kieran-typescript, architecture-strategist and pattern-recognition review agents.

## Resources

- PR #75; todo 036 (published-URL ledger)
- Spec: `docs/superpowers/specs/2026-09-14-practice-services-design.md` §2
