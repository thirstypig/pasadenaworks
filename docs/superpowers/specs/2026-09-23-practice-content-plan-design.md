# A practice-focused content plan

**Date:** 2026-09-23
**Status:** approved in outline; per-post triage still to be written
**Supersedes:** nothing. Completes spec §9 of
`2026-09-14-practice-services-design.md`, which deferred this deliberately.

## The problem, in two parts

### 1. The taxonomy names retired services and hides two gaps

`PILLARS` is still `['websites', 'search', 'consulting', 'ads']` — the
lineup from before the 2026-09-14 repositioning. `search` and `ads` were
folded into **Get more patients** on that date, but they survive as blog
pillars, and `PILLAR_SERVICE` collapses three of the four:

```
websites   → websites    (Get more patients)
search     → websites    (Get more patients)
ads        → websites    (Get more patients)
consulting → consulting  (Practice Checkup)
```

Across all 68 posts that produces:

| Service | Posts pointing at it |
|---|---|
| Get more patients | **48** (71%) |
| Practice Checkup | 20 |
| **Digitize the office** | **0** |
| **Transition Planning** | **0** |

Digitize the office — EHR, records, intake, HIPAA risk analysis, written
procedures — is the most defensible service on the site and has no blog
post pointing at it in any language. Transition Planning likewise.

This is the problem *underneath* the content problem: even a perfectly
re-aimed corpus would still funnel 71% of readers to one service.

### 2. The corpus still addresses small businesses

The 68 posts were written for small businesses generally. The site now
sells to independent medical, dental and eye care practices.

**But 61 of the 68 have never published.** They are date-gated weekly
Mondays through 2027-12-13. No URL exists for any of them, so changing a
slug costs nothing: no redirects, no lost rankings, no broken links.

## What we are NOT fixing, and why

- **The 7 live posts stay as they are.** They have URLs and whatever early
  rankings exist, and their closing `EndCta` already points at practice
  service pages. Re-aiming them would cost redirects for no gain.
- **Success stories** and **per-specialty pages** remain deferred (spec
  §9). Success stories are blocked on consent and the family-disclosure
  rule, not on effort.
- **Transition Planning content stays thin** until the attorney answers
  `todos/046`. A content pipeline implying broker introductions is exactly
  the claim that todo is holding.

## The corpus is stronger than its headline suggests

Read in full, phase two had already drifted toward practices, and it
contains three clusters worth protecting:

| Cluster | Posts | Verdict |
|---|---|---|
| AI search / GEO | ~15 | Adapt. Differentiated; most competitors have nothing on this. |
| California ADA website lawsuits, read from filings | ~6 | Adapt. Directly relevant to a medical office. |
| Domain ownership, developer disputes | ~7 | Adapt. "Who owns your website" is sharper for a practice. |
| Already practice-specific | 6 | Keep. Physician websites, local SEO for practices, HIPAA, two EHR posts, ads for an optometrist. |

**This is why the Digitize target is 14 and not 24.** Only 3 of the 61 are
naturally Digitize posts today. Reaching 24 would mean replacing ~21, which
means cutting roughly eight posts out of the AI or ADA clusters. That trades
good, differentiated work for a number. Rejected on 2026-09-23 after reading
the full list — the first draft of this spec proposed 24.

## Decisions taken (owner, 2026-09-23)

1. **Re-aim the 61 in place.** Same calendar, same cadence, new subjects and
   slugs where needed. Not a parallel track, not a trimmed calendar.
2. **Four pillars, one per service.** `search` and `ads` retire; `digitize`
   and `transition` are added.
3. **Balance target across the 61:**

| Pillar | Service | Target | Source |
|---|---|---|---|
| `websites` | Get more patients | ~24 | language cluster, GBP/reviews, AI-search |
| `consulting` | Practice Checkup | ~18 | pricing, ownership disputes, overcharging, the ADA/compliance cluster |
| `digitize` | Digitize the office | ~14 | 3 existing + 5 retiring `ads` + ~6 weakest replaced |
| `transition` | Transition Planning | ~3 | held thin pending `todos/046` |

These are approximate and sum to about 59 of the 61 on purpose: the last
two or three are slack for posts whose right home only becomes obvious
during triage. A target that had to sum exactly would force the last posts
into whichever pillar was short, which is the opposite of what this table
is for.

## The method: triage, not rewrite

Every one of the 61 gets exactly one verdict:

- **KEEP** — already right for a practice. Change nothing.
- **ADAPT** — same subject, same slug where the keyword still works.
  "Customers" becomes "patients", examples become clinical, and the closing
  argument points at the right service. Roughly a paragraph of change plus
  the three translations.
- **REPLACE** — the subject does not survive the repositioning. New title,
  new slug, new post, new translations.

The triage is recorded in `CONTENT-PLAN.md`, not in a conversation.

### One post is a landmine, and must not be adapted

**2026-11-16 — "How to fire a customer without burning the relationship."**

Dismissing a *patient* is not dismissing a customer. Patient abandonment is
a regulated concept carrying notice-period and continuity-of-care
obligations, and California has its own requirements. A naive retitle to
"How to dismiss a patient" would put unsourced legal guidance on a site
where a review has already caught two overstated legal claims.

**Verdict: REPLACE**, or write it properly against primary sources — the
Medical Board of California and the relevant professional bodies — with the
same sourcing standard the city pages hold. Never adapt.

## Staging: just-in-time, in date order

Re-aiming 61 posts is 61 × 4 = **244 pieces of writing** under the
translate-alongside rule. Attempted as one project it stalls, and a stalled
rewrite publishes whatever was already in the file on its `pubDate`.

So: work in date order, staying about **eight weeks ahead of the publishing
front**. The next post publishes **2026-09-28**.

The first four dates are nearly free — the language cluster (2026-09-28
through 2026-10-19) is already more on-message for practices than it ever
was for small businesses, because language is what the city-page research
found to be the differentiator in these cities.

## Constraints that bind this work

Every one of these already exists in the project and is enforced somewhere:

- **Translate alongside the English draft, never afterwards.** A date-gated
  post whose translations miss its own `pubDate` publishes English-only and
  does not get a second chance.
- **A post's `slug` must be unique across ALL locales**, not within one. The
  glob loader dedupes globally and drops the collision with a warning, not
  an error.
- **Reading bands per locale** — en FK 13–15, es Fernández Huerta 40–55, zh
  register 0.55–0.85. Met by hand, post by post. Never a regex over prose.
- **Source anything a reader could check.** Raising register without raising
  rigor just makes assertions sound more confident.
- **Re-read every negation, comparative and modal** against the English twin
  before shipping a translation set.
- **`pillar` must be one of `PILLARS`** — the build fails on a typo,
  deliberately, so every re-pillared post is checked by the build.

## Implementation shape

1. **Pillar migration first.** `src/data/pillars.ts`, `PILLAR_SERVICE` in
   `services.ts`, Tina's schema, and the 68 posts' frontmatter. Small,
   mechanical, fully testable — and it makes the imbalance *visible* in
   `CONTENT-STATUS.md` rather than hidden. Do this before any prose.
2. **Triage all 61** into KEEP / ADAPT / REPLACE with a target pillar each,
   written into `CONTENT-PLAN.md`.
3. **Work the front**, eight weeks ahead, in date order.

## Verification

- `npm run test` — the build fails on an unknown pillar; `retired-services`
  keeps every published service URL resolving.
- `npm run content:status` after any frontmatter change; `CONTENT-STATUS.md`
  is generated and is the live answer to "what points where."
- `npm run readability` for the corpus bands, per locale.
- `npm run build` and `npm run typecheck` before finishing.

## Open questions

- **Balance is a target, not a quota.** If the triage finds that a post
  genuinely belongs in another pillar, the post wins and the table moves.
- **GSC Performance has not been read yet.** If the city pages turn out to
  earn impressions and the blog does not, the staging order should follow
  that evidence rather than the calendar. Worth revisiting once the numbers
  exist; not worth blocking on, since the next post publishes in five days.
