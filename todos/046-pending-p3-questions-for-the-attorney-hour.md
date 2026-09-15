---
status: pending
priority: p3
issue_id: "046"
tags: [code-review, legal, copy, owner-decision]
dependencies: []
---

# Three questions to bring to the hour with a healthcare attorney (a fourth was dropped 2026-09-15)

## Problem Statement

These are not copy errors, and no reviewer claims the site is wrong. They are places
where what the site offers to do touches a law a non-lawyer cannot settle alone. Spec
§7 already recommends an hour with a healthcare attorney before merging; this is the
agenda for that hour, so the questions are not reconstructed from memory later.

## Findings

- **(a) Automated review-request texts.** Get more patients offers "an automatic text
  after each appointment asking every patient" for a review (`src/data/services.ts`
  ~324, and the three translations). Texts sent by an automated system can fall under
  the federal Telephone Consumer Protection Act (TCPA), which has consent rules. Ask:
  what consent must the practice hold, and how is it recorded?
- **(b) Recall and reactivation messages under California law.** The same page offers
  messages to overdue patients (~326), citing HIPAA's marketing rules. California's
  Confidentiality of Medical Information Act (CMIA) is stricter in places. Ask: does a
  "you are due for a cleaning" message need anything beyond HIPAA in California?
- **Dropped 2026-09-15:** ~~**(c) "Worth more when you step back."** `src/pages/index.astro:68-69` says a
  well-run practice is "precisely what a buyer … will pay for", and that when the owner
  is ready to sell "we prepare the practice and introduce you to a broker". The copy
  already says "we do not broker practice sales, and we accept no fee from anyone who
  does". Ask: does keeping "prepare for sale" limited to operations — no valuations, no
  buyer outreach — stay clear of California's business-broker licensing?~~ The section
  was removed in PR #77; see the 2026-09-15 work-log entry below.
- **(d) Who needs a BAA.** The glossary (`src/data/glossary.ts:88-91`) says HIPAA requires
  a BAA with "any outside company that handles its patient information". That ignores the
  exceptions: disclosures to another provider for treatment, and pure "conduits" such as
  the postal service or an internet provider. Ask: is the simple definition acceptable for
  a glossary, or should it say "most"?

## Proposed Solutions

### Option A — Take this list to the attorney hour; change copy only on their advice

- **Pros:** Answers come from someone qualified. **Cons:** Waits on scheduling the hour.
- **Effort:** Small (the hour itself) · **Risk:** Low

### Option B — Soften the three remaining passages now, before the hour

For example, drop "every patient" from the texting line and add "most" to the BAA
definition. (This option also proposed removing the sale-price implication in (c); that
section is gone, see the 2026-09-15 work-log entry.)

- **Pros:** Lowers exposure now. **Cons:** Guesses; may weaken copy that turns out fine.
- **Effort:** Small · **Risk:** Low

## Recommended Action

Bring this list to the attorney hour listed in PR #75's owner checklist.

## Technical Details

- `src/data/services.ts` (Get more patients, all four locales)
- ~~`src/pages/index.astro:66-71` and its localized twin in `src/data/home.ts`~~ (question
  (c), dropped 2026-09-15; the section no longer exists)
- `src/data/glossary.ts:88-91`

## Acceptance Criteria

- [ ] Each of (a), (b) and (d) has a recorded answer from the attorney ((c) was dropped 2026-09-15)
- [ ] Any copy change the attorney recommends is made in all four locales
- [ ] Answers noted in the spec or `docs/RESOLVED.md` so they are not asked again

## Work Log

### 2026-09-14 — Found in PR #75 review
Collected from legal-adjacent notes across the PR #75 review agents; none was filed as a copy error.

### 2026-09-15 — Sent for review
The owner's healthcare-law contact received a PDF with these questions and eight more (business-associate status, the accessibility paragraph, testimonials, tracking pixels, directory fees, the glossary definition, an engagement agreement, business structure), each quoting the site word for word. The PDF is kept outside this public repo. This todo stays pending until the answers come back; any copy changes they prompt get their own todo.

### 2026-09-15 — Question (c) dropped
The owner dropped question (c), the California business-broker licensing question about "Worth more when you step back". That section was removed from all four homepages in PR #77, and the owner does not market practice sales, so no copy remains for the question to be about. It returns only if sale-preparation work is ever offered. The finding text above is struck through rather than deleted, because this file is a log. The todo stays pending: (a), (b) and (d) are still open.

## Resources

- PR #75 (owner checklist); todos 029 and 031 (related legal-copy findings)
- Spec: `docs/superpowers/specs/2026-09-14-practice-services-design.md` §7
