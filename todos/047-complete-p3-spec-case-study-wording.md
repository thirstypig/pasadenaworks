---
status: complete
priority: p3
issue_id: "047"
tags: [code-review, privacy, docs]
dependencies: []
---

# The services spec described future case-study clients more specifically than the site's own rule

## Problem Statement

This repository is public. Decision 10 in the services spec described who the
first case studies would feature more narrowly than necessary, and the intro and
the plan repeated it. The general rule the site actually needs is simpler: name a
practice only with the client's written consent, disclose any material connection,
and include nothing that identifies a patient. Decision 13 was also stale — it said
the site promises a BAA, which `todos/029` removed before launch.

## Findings

- `docs/superpowers/specs/2026-09-14-practice-services-design.md` — intro and decisions 10 and 13
- `docs/superpowers/plans/2026-09-14-practice-services.md:25`
- No client or practice was named anywhere (security review of the diff, docs, commit messages and `og.png`).

## Proposed Solutions

### Option A: Reword to the general consent-and-disclosure rule
- **Pros:** says only what the decision needs; matches the site.
- **Cons:** git history keeps the earlier wording.
- **Effort:** Small · **Risk:** Low

### Option B: Leave the wording
- **Pros:** no churn.
- **Cons:** keeps unnecessary detail in a public document.
- **Effort:** None · **Risk:** Low

## Recommended Action

Option A (owner's decision, 2026-09-15).

## Technical Details

- Documentation only; no `src/` change.

## Acceptance Criteria

- [x] Decision 10 states the consent-and-disclosure rule without describing clients
- [x] Decision 13 says the BAA promise is not on the site until a template exists
- [x] The plan's public-repository line matches
- [x] Still no client or practice named anywhere in the repo

## Work Log

### 2026-09-14 — Found in PR #75 review
Security review agent.

### 2026-09-15 — Fixed
Reworded the spec intro, decisions 10 and 13, the spec status line (now
"implemented, merged in #75") and the plan's public-repository line. The same
wording in the city-pages spec is fixed on that branch when it is rebased onto
`main`.

**todos/047 is closed.**

## Resources

- PR #75
