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

## Added 2026-09-21 — Transition Planning (question (c) returns, reshaped)

Spec `docs/superpowers/specs/2026-09-21-positioning-about-transition-design.md` §4
adds a fourth service with three endings: sell, hand on to a successor, close.
The owner set the "sell" boundary on 2026-09-21: **we prepare the practice and
give the doctor a list of licensed brokers to interview; we never contact
buyers, market the practice, or negotiate.** These questions test that line.
Statute text below was checked against leginfo.legislature.ca.gov on 2026-09-21.

**(e) Broker licensing — the one that decides whether the service can launch.**
B&P §10131: a broker is a person who, "for a compensation or in expectation of
a compensation, regardless of the form or time of payment, does or negotiates
to do … (a) Sells or offers to sell … solicits prospective sellers or buyers
of … or negotiates the purchase, sale, or exchange of … a business
opportunity." §10030: "business opportunity" includes "the sale or lease of the
business and goodwill of an existing business enterprise."
1. The practice pays us a planning fee. Could that fee be "compensation" under
   §10131 if any part of the work touches the sale?
2. Is handing the doctor a list of licensed brokers — unpaid by any broker —
   outside "solicits prospective sellers or buyers"? Which preparation tasks
   would cross the line (a practice summary a buyer might see, discussing
   price, attending a broker meeting)?
3. What wording on the page describes this role without "advertising as" a
   broker under §10130?

**(f) Closing a practice — what the page may say is required.**
Primary sources found: B&P §2266 (physician records, "at least seven years
after the last date of service"); B&P §2021(b) (address change to the Medical
Board within 30 days); Medical Board guidance (written notice, at least 15 days
of emergency care and prescriptions); no HIPAA closure-notice duty in 45 CFR
160/164; DEA 21 CFR 1301.52 (registration ends; notify; dispose of stock).
1. Does the Medical Board's "must" language on notice carry regulatory force, or
   only through patient-abandonment and unprofessional-conduct theories?
2. May a non-physician records custodian hold charts after closure, given the
   Board's statement that ownership "should be retained by a California-licensed
   physician"? What must its contract include (BAA, Civ. Code §56.101)?
3. Does Medi-Cal's 10-year retention (W&I §14124.1) reach a fee-for-service
   Medi-Cal physician, or only plan contracts?
4. Does B&P §2266 still bind a retired or lapsed licensee, and who holds it after
   a physician's death?

**(g) Handing on and selling — who owns what afterwards.**
1. At what size does a practice sale trigger the Office of Health Care
   Affordability's 90-day notice (H&S §127507)?
2. On a sale to a successor, how do records-access (H&S §123110) and retention
   duties split between seller and buyer?
3. DEA on an associate handover at the same address: does the successor need its
   own registration first, and are 1301.52(d)'s 14-day notice and DEA consent
   required?

**(h) Dentists and optometrists.**
Primary sources found: B&P §3007 (optometry records "a minimum of seven years
from the date he or she completes treatment", minors until 19); no retention
period found for a dentist's private office; B&P §1680(u) (dental abandonment
"without written notice to the patient that treatment is to be discontinued");
B&P §§1625.3–1625.4 (a deceased or incapacitated dentist's practice may be run
up to 12 months while sold); B&P §3077 (only a licensed optometrist may "have an
office"); fictitious-name permits do not transfer to a buyer in either
profession.
1. What should the page say about retention for a dentist's records, when no
   dental statute sets a period (options: H&S §123145, the malpractice
   limitations period, Medi-Cal's 10 years for Denti-Cal patients, none)?
2. Does §1680(u) require written notice to all active patients on a planned
   closure, or only to those mid-treatment?
3. Where is the line between a management company buying non-clinical assets and
   "managing or conducting" a dental office under §1625(e)?
4. Is there any lawful way for a sole optometrist's estate to keep the practice
   running while it is sold (no optometry counterpart to §1625.3 was found)?
Full findings with quotes: the Transition Planning sources file (to be added
alongside the spec).

## Recommended Action

Bring this list to the attorney hour listed in PR #75's owner checklist.

## Technical Details

- `src/data/services.ts` (Get more patients, all four locales)
- ~~`src/pages/index.astro:66-71` and its localized twin in `src/data/home.ts`~~ (question
  (c), dropped 2026-09-15; the section no longer exists)
- `src/data/glossary.ts:88-91`

## Acceptance Criteria

- [ ] Each of (a), (b) and (d) has a recorded answer from the attorney ((c) was dropped 2026-09-15)
- [ ] (e) is answered before the Transition Planning page says anything about brokers or introductions — the owner chose on 2026-09-21 to ship first with conservative wording that describes preparation only
- [ ] (f) and (g) are answered before the page states any requirement as law beyond what is confirmed from primary text
- [ ] Any copy change the attorney recommends is made in all four locales
- [ ] Answers noted in the spec or `docs/RESOLVED.md` so they are not asked again

## Work Log

### 2026-09-14 — Found in PR #75 review
Collected from legal-adjacent notes across the PR #75 review agents; none was filed as a copy error.

### 2026-09-15 — Sent for review
The owner's healthcare-law contact received a PDF with these questions and eight more (business-associate status, the accessibility paragraph, testimonials, tracking pixels, directory fees, the glossary definition, an engagement agreement, business structure), each quoting the site word for word. The PDF is kept outside this public repo. This todo stays pending until the answers come back; any copy changes they prompt get their own todo.

### 2026-09-15 — Question (c) dropped
The owner dropped question (c), the California business-broker licensing question about "Worth more when you step back". That section was removed from all four homepages in PR #77, and the owner does not market practice sales, so no copy remains for the question to be about. It returns only if sale-preparation work is ever offered. The finding text above is struck through rather than deleted, because this file is a log. The todo stays pending: (a), (b) and (d) are still open.

### 2026-09-21 — Question (c) returns as (e)–(g)
The owner added Transition Planning, so sale-preparation work IS now offered —
the condition the 2026-09-15 entry named for (c) returning. Rather than revive
(c) as written (it was about homepage copy that no longer exists), the broker
question returns as (e), rebuilt on the statute text, with the closing and
handing-on questions from the 2026-09-21 research as (f) and (g). A second PDF
for the attorney is the owner's call.

## Resources

- PR #75 (owner checklist); todos 029 and 031 (related legal-copy findings)
- Spec: `docs/superpowers/specs/2026-09-14-practice-services-design.md` §7
