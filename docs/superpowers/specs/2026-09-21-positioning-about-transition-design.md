# Positioning, About page, Transition Planning, city pages and blog CTA — design

**Date:** 2026-09-21 · **Status:** approved in conversation, awaiting owner review of this file
**Supersedes, in part:** two 2026-09-15 decisions — "no person on the site" and
"selling or stepping back is not something we market." Both are reversed here
on purpose, by the owner.

## 1. Why

The city pages answer "what does the NPI Registry say about Glendale?" when a
practice owner arrives asking "what is wrong with my practice, and can you fix
it?" The same gap shows up across the site: nothing says why a doctor should
call *us*. The owner supplied a positioning questionnaire; its answers become
the one source every page below draws from.

## 2. Positioning answers (the source for everything else)

Drafted from the owner's own practice work, not from interviews (owner's
choice). They are working answers: any page that quotes one must still meet the
sourcing rule in §7.

1. **Buyer.** The owner-doctor of an independent practice of one to five
   clinicians, mid-to-late career, in the San Gabriel Valley, often serving
   patients who speak Spanish or Chinese at home. The office manager — often a
   spouse or a long-serving employee — is the gatekeeper and decides whether
   anything we set up survives.
2. **Trigger moments.** A front-desk person quits and nobody else knows how
   things work; an EHR vendor ends support or forces an upgrade; a
   chain-backed group opens nearby and new-patient calls fall; a run of bad
   reviews; the doctor starts thinking about retirement and realizes a
   practice on paper charts and one person's memory is hard to sell.
3. **Hope.** Someone who understands both the technology and a small office
   takes the problem off their desk, explains it plainly, and is not selling
   them a product.
4. **What annoys them about the alternatives.** EHR vendors sell software, not
   setup. Agencies sign 12-month contracts and report numbers that are not
   patients. The relative who "does computers" is unavailable. Brokers appear
   at sale time and are paid by the sale.
5. **Why us.** Paid by the practice and nobody else — no vendor commissions,
   no broker fees — so no recommendation is steered. We map how the office
   runs before choosing a tool, and we say when something is not worth the
   money. **Corrected 2026-09-21:** the owner speaks English only. The site is
   translated; the consultant is not bilingual, and every non-English
   booking label says the call is in English.
6. **Competitive advantage, one line.** *Paid by the practice and nobody else,
   run by a product manager who has worked inside offices like yours.*
7. **Positioning challenge (theirs).** Patients cannot tell them apart from
   the chain-backed group with a polished listing and online booking.
8. **Magic wand.** The front office runs on an ordinary day without the doctor.
9. **Already tried.** An agency that produced reports but not patients; an EHR
   the staff never adopted, so paper and software run side by side; a website
   a relative built years ago.

## 3. About page

- **Person:** first name **James**, "8 years in product." No surname, no photo
  required, no industry named (none was given), no family or client names.
- **Claims limited to what happened:** rebuilt practice websites; EHR workflow
  consulting. Nothing else is claimed until the owner adds it.
- **Carries:** answer 6 as the lead, answer 5 as the body, and the hard lines
  from §4 (never brokers, never takes vendor commissions).
- **Four locales, translated segments** (hard rule 3), e.g. `/about/`,
  `/es/sobre-nosotros/`, zh slugs chosen by keyword research, not by
  transliterating English. Linked from the footer and the header nav.
- It is ordinary prose, not a legal page, so it must meet
  the college-level reading bands.

## 4. Transition Planning — a fourth service

**Promise:** a written plan for the day the doctor steps back, made one to
five years before it arrives, with three endings the doctor chooses between:

1. **Sell** the practice.
2. **Hand it on** to an associate or successor.
3. **Close it properly** — records custody, patient notice, listings removed.

Then the readiness work itself, most of which is *Digitize the office* and
*Get more patients* pointed at a date.

**The angle, sourced.** Practice brokers are paid by the seller at closing,
typically 6–12% of the price and 10–12% for practices under ~$400K a year
(dentaltransitions.com; dentalpracticereporter.com;
practicetransitionsgroup.com — queried 2026-09-21, to be moved into a
`-sources.md` twin). Their advice is paid only if a sale closes. Ours is not.
Our timing is also different: a broker arrives months before a sale; value is
built years before one.

**Hard lines (a review blocks the PR if any is crossed):**
- We never value a practice, never broker, never take a broker's or vendor's
  fee, never give legal or tax advice. We introduce the broker, CPA, attorney
  or records custodian.
- Every legal statement on the page (Medical Board notice, patient
  notification, records retention periods) is checked against the statute or
  the board's own page, **not** a records-custodian vendor's blog. Vendor
  pages were the source of two overstated claims in PR #75.
- Add to todos/046: does planning a sale, and introducing a broker without a
  fee, stay clear of California broker licensing?

**Build shape:** a fourth record in `services.ts` in all four locales, new
slugs in the service segment, the homepage service grid gains a fourth card,
the service parity test and `LocalBusiness` offer catalog pick it up. No
`PILLAR_SERVICE` change — no blog pillar maps to it yet.

## 5. City pages — problem first, data as proof

- **All 40 URLs stay.** Photo, data strip, sources and the order in rule 2b
  stay. Only the three body paragraphs and the summary change.
- **New paragraph job descriptions:**
  1. The problem a practice in *this* city faces, stated in the owner's
     terms, with the city's own figure as the proof.
  2. What that means for the front office or for patients (language share,
     hospital nearby, the fire in Altadena).
  3. What we would do — the service(s) that fit, Transition Planning
     included only where a figure supports it.
- **Constraints kept:** the doorway-page test in `cities.test.ts` (no two
  cities may share a sentence once names and numbers are masked); figure and
  source parity across locales; the readability bands in all four locales,
  reached by hand, never by regex.
- **Every new problem claim needs a checkable source** (hard rule 2). The
  sample line used to approve this design — "most will choose from the first
  screen of Google Maps," "400 reviews" — is unsourced and may not ship as
  written. Either cite it or say only what the page's own figures show.

## 6. Blog closing blurb

- Replace `EndCta.astro`'s generic heading + service tagline with one fixed
  two-sentence blurb (who Pasadena Works is; paid by the practice and nobody
  else), then the pillar's service link as today, then **Book a free call** and the
  phone number.
- One blurb, translated three times, in `ui.ts`. Not per pillar, not per post.
- It bridges the mismatch honestly: the 68 posts still address small
  businesses, the blurb speaks to practices.
- Uses the booking label, which since 2026-09-21 reads "Book a free call"
  (the owner confirmed the call is free) and, outside English, says the call
  is in English.
- Must stay excluded from readability scoring as furniture. Today
  `scripts/readability.mjs` drops it with a non-greedy
  `<div class="end-cta…</div>\s*</div>` match, which assumes the current
  nesting depth. Adding an inner `<div>` (e.g. a phone/button row) would end
  the match early and leak the rest into the score — the trap rule 2b records
  for the data strip. Either keep the nesting unchanged, or make the box an
  `<aside>` and exclude it by element, re-measuring the whole corpus after.

## 7. Rules that apply to all five

- Source anything a reader could check; legal claims from primary sources.
- Four locales for every page and every change; translated URL segments.
- Readability bands met by hand; polarity sentences re-read against English.
- No family or client names anywhere in this public repo.
- `npm run build`, `npm run test`, `npm run typecheck`, and a look at the
  rendered pages before each PR.

## 8. Order — one spec-sized PR each

1. **This spec** (plus a `-sources.md` twin for §4's figures).
2. **About page.**
3. **Transition Planning service.**
4. **Blog closing blurb** — small; reuses §2 answer 5.
5. **City pages rewrite** — largest; 10 cities × 4 locales.

## 9. Not in scope

Practice interviews (owner chose to draft instead — worth revisiting before
the city rewrite), a practice-focused content plan, success stories,
per-specialty pages, prices, and any claim that a named practice is a client.
