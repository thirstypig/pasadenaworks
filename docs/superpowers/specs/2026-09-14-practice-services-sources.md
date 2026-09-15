# Sources for the practice services copy

Verified 2026-09-14. One row per key; Tasks 3–4 read these URLs into
`SOURCES` in `src/data/services.ts`. Each link sits on the phrase it supports.
Nothing was cut: all twelve claims sourced.

`hhs.gov`, `ecfr.gov` and `cochranelibrary.com` refuse scripted fetches, so
where the link points at one of them the page was verified through a readable
copy or a law-firm summary quoting it, named in the last column. The link itself
stays on the primary source, because a reader's browser opens it normally.

| Key | URL | What the page says, in brief | Verified via |
|---|---|---|---|
| `section504Extension` | https://www.federalregister.gov/documents/2026/05/11/2026-09266/extension-of-compliance-dates-for-nondiscrimination-on-the-basis-of-disability-accessibility-of-web | Interim final rule (announced May 7, 2026) moving web and mobile accessibility compliance to May 11, 2027 for recipients with 15+ employees and May 10, 2028 for fewer than 15. | WebSearch (Federal Register listing); Reed Smith and Powers Law alerts |
| `medicarePartBCoverage` | https://www.alston.com/en/insights/publications/2026/03/compliance-section-504-rehabilitation-act | "OCR clarified that Medicare Part B reimbursement alone triggers coverage," aligning Section 504 with the 2024 Section 1557 rule. Small practices get a later deadline, not an exemption. (Its dates predate the May 2026 extension; the dates come from the row above.) | WebFetch of the page |
| `googlePractitionerListings` | https://support.google.com/business/answer/3038177 | An individual practitioner "should create a dedicated Business Profile" if public-facing and directly contactable; with several practitioners at one location, the organization gets its own profile, "separate from that of the practitioner." | WebFetch of the page |
| `googleReviewPolicy` | https://support.google.com/contributionpolicy/answer/7400114 | Merchants must not "selectively solicit positive reviews from customers," nor "offer incentives – such as payment, discounts, free goods and/or services – in exchange for posting any review." Both on this one page. | WebFetch of the page |
| `hhsReviewResponseSettlement` | https://www.hhs.gov/about/news/2022/03/28/four-hipaa-enforcement-actions-hold-healthcare-providers-accountable-with-compliance.html | March 28, 2022: OCR imposed a $50,000 civil money penalty on a North Carolina dental practice that disclosed a patient's name and treatment in a reply to a Google review. OCR guidance: a covered entity "may not confirm or deny that a particular person was, in fact, a patient." | ArentFox Schiff summary (WebFetch), which cites this release; title confirmed by a press-wire mirror |
| `hipaaMarketing` | https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/marketing/index.html | HHS guidance on the Privacy Rule's marketing provisions, including the exceptions for a covered entity's communications about its own services and about treatment. | WebSearch result summaries of this page; Bricker Graydon summary of 45 CFR 164.501 |
| `ocrTrackingTech` | https://www.hklaw.com/en/insights/publications/2024/06/american-hospital-assn-v-becerra-are-tracking-tools-ok-again | *AHA v. Becerra* (N.D. Tex., June 20, 2024) vacated only the bulletin's "Proscribed Combination" — an IP address plus a visit to an unauthenticated public page about a health condition. "The remainder of the Revised Bulletin was not vacated." HHS dropped its appeal Aug. 29, 2024. The copy's claim concerns pages where patients enter information, which the vacatur did not reach. | WebFetch of the page |
| `calBusProf650` | https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=650 | For healing-arts licensees, offering or accepting "any … consideration … as compensation or inducement for referring patients" is unlawful. | WebFetch of the page |
| `federalAks` | https://uscode.house.gov/view.xhtml?req=granuleid%3AUSC-prelim-title42-section1320a-7b&num=0&edition=prelim | 42 U.S.C. § 1320a-7b(b)(2): knowingly and willfully paying remuneration to induce a referral for an item or service payable by a Federal health care program. | WebFetch of the page |
| `hipaaRiskAnalysis` | https://www.hhs.gov/hipaa/for-professionals/security/guidance/guidance-risk-analysis/index.html | HHS guidance on the Security Rule's required risk analysis, 45 CFR 164.308(a)(1)(ii)(A): an "accurate and thorough assessment" of risks to electronic protected health information, required of every covered entity. | WebSearch result summaries of this page and of the eCFR text |
| `hipaaCoveredEntities` | https://www.cms.gov/priorities/key-initiatives/burden-reduction/administrative-simplification/hipaa/covered-entities | "Providers who submit HIPAA transactions, like claims, electronically are covered" — doctors, dentists, clinics and chiropractors named. | WebFetch of the page |
| `remindersNoShows` | https://doi.org/10.1002/14651858.CD007458.pub3 | Gurol-Urganci et al., Cochrane Database of Systematic Reviews, 2013: text-message reminders "improved the rate of attendance at healthcare appointments compared to no reminders (RR 1.14, 95% CI 1.03 to 1.26)," 7 studies, 5,841 participants, moderate-quality evidence. | WebFetch of the LSHTM repository record of the review |

## Changes to the approved copy

Two claims turned out to rest on two facts each, so each gained a second link.
One was made more specific to match its source exactly. No claim was softened.

1. **§3.3, risk analysis.** "Which HIPAA requires" links to `hipaaRiskAnalysis`;
   "of practices that bill insurance electronically" is the covered-entity
   definition and links to `hipaaCoveredEntities`.
2. **§3.4, accessibility.** "Practices that accept Medicare Part B" links to
   `medicarePartBCoverage`; the deadlines keep `section504Extension`.
3. **§3.4, review replies.** "a HIPAA violation federal regulators have fined
   practices for" became "a HIPAA violation federal regulators fined one dental
   practice $50,000 for", because the linked action is one civil money penalty
   against one practice. Other review-reply cases (New Vision Dental, $23,000,
   2022; Elite Dental Associates, $10,000, 2019) were settlements rather than
   fines, so the plural "fined practices" overstated the linked page.

## Cut

Nothing.
