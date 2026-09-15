# Repositioning Pasadena Works around independent health practices

**Date:** 2026-09-14 · **Status:** design, awaiting owner review · **Branch:** `feat/practice-services`

This document records decisions made in conversation with the owner and the
English copy that implements them. Nothing here is live. Translations, the
build, and the tests follow only after the English copy is approved.

This repository is public. The document deliberately names no client and no
family member; "family practices" is as specific as it gets.

---

## 1. Decisions

| # | Question | Decision |
|---|---|---|
| 1 | Audience | Independent health practices only. General small-business positioning is retired. |
| 2 | What "sellable" means | The *practice* becomes easy to sell when its owner retires. Pasadena Works remains a separate consultancy and is not party to any sale. |
| 3 | Who the homepage addresses first | Growing practices. Sale-readiness is presented as the long-term payoff of the other services, not as a separate offering. |
| 4 | Practice types named | Medical, dental and orthodontic, optometry and eye care, and other independent health practices. No per-specialty pages yet. |
| 5 | Service area | Southern California, with the San Gabriel Valley named first as home base. City pages remain. |
| 6 | Role in a practice sale | Prepare the practice, then introduce a practice broker. Pasadena Works does not broker sales and takes no referral fee from brokers (a fee would also raise the California licensing question this decision avoids). |
| 7 | Equipment sales | Not offered on the site. |
| 8 | How a client starts | Free booking call (existing Cal.com link), then a paid Practice Checkup whose fee is credited toward subsequent work. |
| 9 | Prices | None published. Copy promises "a fixed price, agreed in writing before we start." |
| 10 | Proof | Named family practices with the family connection disclosed, per the FTC's material-connection rule, and no patient-identifying detail. **Not at launch:** added only once real figures and each family member's written consent exist. |
| 11 | Structure | A Practice Checkup plus two offerings: *Digitize the office* (everything inside the office) and *Get more patients* (everything outside it). A first draft split the second into "Online presence" and "Marketing and advertising"; the owner read them as the same thing, so they were merged, keeping "the basics first, then growth" as the page's own order. |
| 12 | Vendor neutrality | No commissions or referral fees from software vendors. Stated on the site. |
| 13 | HIPAA | Pasadena Works signs a business associate agreement (BAA) with each practice whose patient data it handles. Stated on the site. |
| 14 | Explicitly not offered | IT support and repairs, billing and collections, software reselling, social media management, condition-targeted social ads, paid referrals. |

## 2. Service structure and URLs

The four existing service pages are indexed in four languages. Two keep their
URLs and are rewritten; two are retired behind redirects; one is new.

| Order | `id` | New title (en) | English URL | Change |
|---|---|---|---|---|
| 1 | `consulting` | Practice Checkup | `/services/business-advice/` | Rewritten; URL unchanged |
| 2 | `digitize` | Digitize the office | `/services/practice-digitization/` | **New** |
| 3 | `websites` | Get more patients | `/services/websites/` | Rewritten; URL unchanged |
| — | `search` | *(retired)* | `/services/get-found-on-google/` | Redirects to `websites`, per locale |
| — | `ads` | *(retired)* | `/services/paid-advertising/` | Redirects to `websites`, per locale |

**Slugs for the new service** (hard rule 3: segment and slug both translated):
`en` `practice-digitization` · `es` `digitalizacion-del-consultorio` ·
`zh-hans` `zhensuo-shuzihua` (诊所数字化) · `zh-hant` `zhensuo-shuweihua`
(診所數位化). The two Chinese slugs differ because the words differ: mainland
数字化 against Taiwan 數位化.

**Why the merged page lives at `websites`, not `ads`:** `routes.ts:51` derives
the city-hub URL segment from the `websites` service's slugs, so every city page
lives under it and that service cannot be the one retired.

**Retiring `search` and `ads`.** Astro's `redirects` config, on a static build with no
adapter, emits a page with `<meta http-equiv="refresh" content="0">`,
`<meta name="robots" content="noindex">` and a canonical link to the target
(`node_modules/astro/dist/core/routing/3xx.js`). Google treats an instant meta
refresh as a permanent redirect. `@astrojs/sitemap` lists only `type === "page"`
routes, so redirects stay out of the sitemap. Eight redirects, two retired
services times four locales, each pointing at the same locale's `websites` page:

| From | To |
|---|---|
| `/services/get-found-on-google/` | `/services/websites/` |
| `/services/paid-advertising/` | `/services/websites/` |
| `/es/servicios/aparecer-en-google/` | `/es/servicios/sitios-web/` |
| `/es/servicios/publicidad-pagada/` | `/es/servicios/sitios-web/` |
| `/zh-hans/fuwu/guge-tuiguang/` | `/zh-hans/fuwu/wangzhan-jianshe/` |
| `/zh-hans/fuwu/fufei-guanggao/` | `/zh-hans/fuwu/wangzhan-jianshe/` |
| `/zh-hant/fuwu/google-tuiguang/` | `/zh-hant/fuwu/wangzhan-jianzhi/` |
| `/zh-hant/fuwu/fufei-guanggao/` | `/zh-hant/fuwu/wangzhan-jianzhi/` |

Segments verified against `SEGMENTS.services` in `routes.ts` (`services`,
`servicios`, `fuwu`, `fuwu`); the build test in §6 asserts them rather than
trusting this table.

**Blog pillars do not change.** The 68 posts keep `websites | search |
consulting | ads`, so `tina/tina-lock.json` is untouched. `EndCta.astro`
currently finds its service with `services.find((s) => s.id === pillar)!`,
which crashes on `search` and `ads` once those services are gone. It is
replaced by an explicit, typed map — `Record<Pillar, ServiceId>`, with
`websites`, `search` and `ads` all → `websites`, and `consulting → consulting` —
so a pillar without a service is a compile error rather than a build crash.

## 3. English copy

The register targets are unchanged: Flesch-Kincaid grade 13–15, and no
"leverage", "solutions", "empower", or "transformation". Every factual claim
the reader could check is marked **[cite]** and ships with a source link or is
cut, per the house rule. `<a>` links go to glossary entries; four new entries
are listed in §5.

### 3.1 Homepage (`src/pages/index.astro`)

- **`<title>`:** Pasadena Works — Consulting for Independent Health Practices
- **Meta description:** We help independent medical, dental, and eye care practices in Southern California digitize the office, get found online, and bring in more new patients.
- **Eyebrow:** San Gabriel Valley &amp; Southern California
- **H1:** For independent practices ready to stop running on paper and word of mouth.
- **Subhead:** We help medical, dental, and eye care practices across Southern California digitize the front office, look trustworthy to the patient who searches for them, and bring in new patients they can trace — and we are never paid by the software companies whose products we recommend.
- **"What we do" intro:** Every engagement begins with a checkup, because a practice that believes it needs advertising frequently needs its intake forms fixed first, and there is no honest way to know which until someone has looked.
- **New section, "Worth more when you step back":** None of this is only about this year. A practice with digital records, written procedures, and a steady flow of new patients runs without its owner in the room, which is precisely what a buyer or an associate taking over will pay for. When you are ready to sell, we prepare the practice and introduce you to a broker who handles the sale itself; we do not broker practice sales, and we accept no fee from anyone who does.
- **Contact intro:** Tell us what is happening at your practice — the phones, the paperwork, the Google listing, or whatever is costing you the most at the moment. We will respond with something specific to your practice rather than a proposal assembled beforehand.

### 3.2 Practice Checkup (`id: consulting`)

- **title:** Practice Checkup
- **tagline:** Find out what is actually costing you patients before you pay anyone to fix it.
- **summary:** One fixed-price review of the whole practice — the phones and intake forms, the records and the EHR, the website and the Google listing — ending in a short written plan that ranks what to fix first. If you continue with us, the fee is credited toward that work.
- **body:**
  1. Most practices that call us believe they have a marketing problem. Some do, but just as often the new patients are already calling and the practice is losing them somewhere between a voicemail nobody returns and a clipboard of forms that takes twenty minutes to complete. Advertising cannot fix either of those, which is why we look before we recommend anything.
  2. **How it works**
     - A conversation with you and your front-desk staff, since the people answering the phones know where the day goes wrong
     - A walk through one patient's path, from the first search or phone call to the reminder for their next visit
     - A review of your <a href="/glossary/#ehr">EHR</a> setup, your patient records, your <a href="/glossary/#google-business-profile">Google Business Profile</a> and reviews, and your website
     - A short written plan ranked by what will pay off first, with a fixed price for any follow-on work agreed in writing before we start
  3. Sometimes the plan says the practice is in better shape than you feared, and that the most valuable next step costs very little. We will write that down just as plainly.
- **outcomes:**
  - A map of one patient's path through your practice, with the places patients drop off marked
  - A plain assessment of your records, EHR, and front-desk workflow
  - A look at how the practice appears to a patient who searches for it: Google, reviews, website, and health directories
  - A written plan ranked by what to fix first, not a slide deck
  - The checkup fee credited toward any work you go on to do with us
- **meta:** A fixed-price checkup for independent medical, dental, and eye care practices in Southern California: records, EHR, front desk, and online presence, ranked.

### 3.3 Digitize the office (`id: digitize`, new)

- **title:** Digitize the office
- **tagline:** Less paper, fewer phone calls, and a front desk that is not drowning.
- **summary:** We move patient records, scheduling, intake forms, and reminders onto systems that work together, starting from how patients actually move through your office rather than from whatever software someone wants to sell you. We take no commissions from software vendors.
- **body:**
  1. Many independent practices run on an <a href="/glossary/#ehr">EHR</a> that is only half set up, a phone line the front desk is always behind on, and paper forms that someone retypes after the visit. Each of those costs staff time, and several of them cost patients who gave up before anyone answered.
  2. **How it works**
     - We follow one patient from the first call to the follow-up reminder, and fix the steps where time and money leak out
     - Online scheduling, intake and consent forms that patients complete on their phone before the visit, and automated reminders that reduce no-shows **[cite]**
     - Paper charts scanned and organized, and your EHR configured so your staff actually use it
     - A <a href="/glossary/#hipaa">HIPAA</a> security risk analysis, which HIPAA requires of practices that bill insurance electronically **[cite]**, and a signed <a href="/glossary/#business-associate-agreement">business associate agreement</a> with every vendor that handles patient information, including us
     - Written office procedures, so the practice runs the same way on the days you are not there
  3. We recommend software on its merits and accept no commissions or referral fees from any vendor, which is the only way advice about which system to buy can be worth anything. We also stay out of IT repairs and billing, and will point you to people who do those well.
- **outcomes:**
  - Patients who book, complete their forms, and receive reminders without calling the front desk
  - Paper charts digitized, and an EHR set up the way your practice actually works
  - A completed HIPAA security risk analysis, with the fixes it turns up
  - A business associate agreement signed with every vendor that touches patient data
  - Written procedures for the front desk and back office
  - Advice from someone paid by you and nobody else
- **meta:** EHR setup, digital intake, online scheduling, and HIPAA risk analysis for independent practices in Southern California. No commissions from software vendors.

### 3.4 Get more patients (`id: websites`)

Merges the draft "Online presence" and "Marketing and advertising" pages
(decision 11). The page keeps their order: the basics first, then growth.

- **title:** Get more patients
- **tagline:** More of the patients you want, and proof of where they came from.
- **summary:** Before most patients call, they check your Google listing, your reviews, and your website, so we get those right first. Then we bring back the patients who are overdue and advertise only the treatments worth advertising, with every new patient traced to its source.
- **body:**
  1. A prospective patient usually wants to know five things: whether you take their insurance, whether you are accepting new patients, which languages you speak, where to park, and whether they can book online. A practice that answers those questions quickly often gets the call over one down the street that does not, which is why no amount of advertising helps until the basics are right.
  2. **First, the basics**
     - Your <a href="/glossary/#google-business-profile">Google Business Profile</a> completed and verified, with a separate listing for each doctor, since patients often search by name **[cite: Google's individual-practitioner guidelines]**
     - A steady flow of <a href="/glossary/#reviews">reviews</a>: a text after each visit asking every patient, never only the satisfied ones, and never with anything offered in return **[cite: Google review policy; FTC consumer review rule]**
     - Replies to reviews written so they never confirm that the reviewer is a patient, a HIPAA violation federal regulators have fined practices for **[cite: HHS OCR enforcement]**
     - Healthgrades, Zocdoc, WebMD, and your insurers' provider directories made consistent with Google
     - A fast website that meets the <a href="/glossary/#wcag">WCAG 2.1 AA</a> accessibility standard, in Spanish or Chinese where your patients speak it
  3. Practices that accept Medicare Part B are now required by federal rule to make their websites meet that accessibility standard, by May 2027 for practices with fifteen or more employees and by May 2028 for smaller ones **[cite: Federal Register 2026-09266]**.
  4. **Then, growth.** The least expensive appointment most practices will ever book comes from a patient who is already overdue: the annual eye exam, the six-month cleaning, the follow-up that never got scheduled. Most practices remind those patients poorly or not at all, so growth starts there, before a dollar goes to advertising.
     - Tracking that records where every new patient came from, so the monthly report can answer whether the spending paid for itself
     - Recall and reactivation messages for patients who are overdue for a visit, written within HIPAA's rules on marketing to patients **[cite]**
     - A page for each high-value treatment you offer, written for the way patients actually search for it
     - Google search ads only for treatments where a new patient is worth the cost, with a budget cap that cannot quietly run away from you
  5. Some things we will not do: target advertising at people based on a health condition, place ad-tracking code on appointment or intake pages where it can pass patient information to an advertising platform **[cite: HHS OCR tracking-technologies guidance]**, or pay anyone for referrals, which state and federal anti-kickback laws prohibit **[cite: Cal. Bus. &amp; Prof. Code § 650; 42 U.S.C. § 1320a-7b(b)]**. You retain ownership of the website, the domain, and the content, because holding a client's website hostage is a poor business model and a worse way to treat people.
- **outcomes:**
  - Google Business Profile listings for the practice and for each doctor, verified
  - A review request that reaches every patient after every visit, and replies that never confirm anyone is a patient
  - Health directory and insurer listings that match Google
  - A website that loads quickly on a phone, answers the questions patients ask first, and meets WCAG 2.1 AA, in Spanish or Chinese if your patients need it
  - Recall messages that bring overdue patients back
  - Search ads with a hard budget cap, only where the numbers work
  - A monthly note: what you spent, what it returned, and where each new patient came from
- **meta:** Websites, Google profiles, reviews, patient recall, and search ads for independent medical, dental, and eye care practices in Southern California, tracked.

### 3.5 Other English strings

- **`ui.ts` `serviceAreaBlurb` (footer):** Consulting for independent health practices, based in the San Gabriel Valley.
- **`ui.ts` `servicesDescription` (services index meta):** A practice checkup, office digitization, and more new patients, for independent medical, dental, and eye care practices throughout Southern California.
- **`public/og.png`:** same design; eyebrow "San Gabriel Valley &amp; Southern California"; tagline "Consulting for independent medical, dental, and eye care practices — paid by you, and nobody else." Regenerated the way it was last time: an HTML template screenshotted in headless Chrome.

## 4. Translations

Spanish, Simplified Chinese and Traditional Chinese versions of everything in §3
except `og.png`, which is English-only as it is today. Method, per the existing
blog translation practice:

- Take phrasing from research and every fact from the English. A translation may never assert more than its English twin.
- Take product and regulatory names from the vendor's or regulator's own localized pages, not from translation: Google Business Profile, Medicare Part B, EHR, and HIPAA. Verify before writing.
- Re-read every polarity-bearing sentence against the English: "never", "only", "not", every modal. §3.4's "things we will not do" paragraph is the highest-risk sentence in this document.
- Taiwan lexis and 正體字 for `zh-hant`, via the `writing-taiwan-mandarin-copy` skill.

Every service carries all four locales because `Service.t` is `Record<Locale, ServiceCopy>`,
so hard rule 1 is enforced by the type: the new page emits four alternates plus `x-default`.

## 5. Other changes

- **Glossary** (`src/data/glossary.ts`, English only): add `ehr`, `hipaa`, `business-associate-agreement`, and `wcag`. The glossary is excluded from the register targets on purpose.
- **JSON-LD** (`Base.astro`): `areaServed` keeps the service-area cities and adds Los Angeles, Orange, Riverside and San Bernardino counties as `AdministrativeArea`, from a new `site.regionServed` list.
- **Localized homepages** (`src/data/home.ts`, `[locale]/index.astro`): the §3.1 content, including the new "worth more" section, in all three languages. The shared layout and `homepage-parity.test.ts` keep the four homepages one design.
- **`services.ts` header comment:** rewrite the "never change `id`" rule to describe the redirect mechanism, since this change is the first to retire an id.
- **CLAUDE.md:** the positioning paragraph, the service list, the retired-id redirect mechanism, and the pillar→service map.

## 6. Verification

- `npm run build`, `npm run typecheck`, `npm run test`: all green.
- `npm run readability -- --dist`: all three service pages and all four homepages in band for every locale (en FK 13–15; es Fernández Huerta 40–55; zh register 0.55–0.85 and at most 85 characters per sentence). Bands are met by hand edits, one page at a time, never by a sweep. Blog posts are also re-scored, because `EndCta` renders each service's tagline inside every post's `<main>`.
- **Redirect test** (new; skips without `dist/`): each of the eight retired URLs contains `http-equiv="refresh"` pointing at the same locale's `websites` page and carries `noindex`; none appears in the sitemap; no page's `hreflang` points at one. **Paired positive assertion:** each redirect target exists in `dist/` and is itself listed in the sitemap.
- **Hard rule 1:** the new service page emits four alternates plus `x-default` in every locale, and `glendale` still emits none.
- **`homepage-parity.test.ts:113`:** its needle is the English hero. Replace it with the new hero, and assert first that the needle appears in `dist/index.html`, so the absence check cannot pass vacuously.
- **`services.test.ts`:** a lookup for the new slugs in every locale; `search` slugs resolve to nothing; every pillar maps to an existing service.
- **Visual check:** serve `dist/` and look at the homepage, the services index, all three service pages, and one redirect per locale at desktop and phone widths, in English and one Chinese locale.
- **Every [cite] resolved:** each has a working source link in the copy, or its claim is cut.

## 7. Before merging (owner)

These are not code, and the site makes promises that depend on them:

1. **A BAA template ready to sign.** The site says Pasadena Works signs one.
2. **No existing vendor commissions.** The site says there are none.
3. **Recommended: an hour with a healthcare attorney** on the HIPAA, BAA, anti-kickback and accessibility statements. It is inexpensive relative to a claim on a public page being wrong.

## 8. Consequences, stated plainly

- Rankings for general queries such as "small business website design Pasadena" will decline over the following months as the homepage and service pages stop targeting them. That is the intended trade.
- The 68 existing posts remain live and unchanged. Each still ends in a call to action, which now leads to practice-focused service copy, so a reader of a post about bakery websites will land on a page for practices. This is accepted until later content catches up (§9).

## 9. Out of scope — separate specs later

1. **City pages**, re-angled for practices. Hard rule 2 requires real, sourced facts about each city's medical districts, which is research, not copy.
2. **Content plan and blog pillars** for practice topics, including whether to add a `digitize` pillar. That changes Tina's schema and lock, so it gets its own change.
3. **Success stories**, once real figures and written consent exist (decision 10).
4. **Per-specialty pages** (dental, eye care), if one type becomes a steady source of clients.
