# Content plan — first 90 days

The site's architecture is built. This is what to publish into it, in what
order, and why. Everything here follows your service priority: websites first,
organic search second, consulting third, ads last.

---

## The strategy in one paragraph

You are not competing with national marketing blogs and you should not try.
You're competing for a few hundred people a month in the San Gabriel Valley
who are typing worried, specific questions into their phone. Those searches
have low competition and unusually high intent, because someone asking "why
isn't my business showing up on Google Maps" is a person with a problem they
are willing to pay to solve. Write for exactly that person, in the plain
language the whole site promises, and let the volume be small.

**One article per week is enough.** Twelve honest articles beat forty thin
ones, and consistency matters more than volume — an abandoned blog is worse
than no blog.

---

## What's already published

All 20 planned posts are written and approved (`draft: false`) as of
2026-08-31. That is not the same as visible: since 2026-08-31 the site is
**date-gated**, so a post appears on its own `pubDate` and not before.
Four are visible today; the rest surface weekly through 2027-01-11 on their
own. 5 of the 20 are translated into all three other languages; 15 are not
— that backlog is now the schedule's real constraint, since an untranslated
post publishes English-only when its date arrives.

**For the live picture, see [`CONTENT-STATUS.md`](CONTENT-STATUS.md)** — a
generated table of every post, its publish date, and which translations
exist. Regenerate it with `npm run content:status`, or read it in Tina under
Project Docs. It is derived from the post files themselves, so unlike a
hand-written table here it cannot drift out of date. Don't restate its
contents in this file; keep this one for strategy and target keywords.

**✅ Decided and implemented (2026-08-31).** This section previously flagged
that all the calendar posts had been flipped to `draft: false` at once, so
readers and Google could see articles date-stamped as far out as 2027-01-04.
The owner chose to keep the honest dates and hold the posts back, so
`getPostsByLocale()` now gates on `pubDate <= now` as well as `draft`, and
`.github/workflows/deploy.yml` runs a daily build so a post's date actually
arrives. The calendar below is real again — the dates mean what they say and
nobody has to do anything on the day. Full write-up, including why the filter
had to sit in the shared data function rather than the page template, in
`docs/solutions/logic-errors/static-site-scheduled-publishing-needs-a-clock.md`.

---

## Publishing calendar

The three articles above published roughly weekly from 2026-06-01 through
2026-06-15, then publishing paused for about ten weeks while the site's
i18n mechanism and other infrastructure work happened. Restarting at one
article per week from here, the schedule below is real calendar dates, not
relative week numbers — update it as you actually publish rather than
letting it drift out of sync with reality the way the "weeks 1–12" version
did.

All 20 posts are approved, so publication is automatic — the Status column
tracks the one thing that still needs a person: translations.

🌍 = translated (es + zh-hans + zh-hant) · 🈳 = English only, needs translation
· 👁 = already visible on the site

| Target date | Article | Pillar | Status |
|---|---|---|---|
| 2026-08-31 | How much should a small business website cost? | websites | 🌍 translated · 👁 visible |
| 2026-09-07 | How to claim and fix your Google Business Profile | search | 🌍 translated |
| 2026-09-14 | Do I need a website if I have Instagram? | websites | 🈳 needs translation |
| 2026-09-21 | How to ask customers for reviews without being awkward | search | 🈳 needs translation |
| 2026-09-28 | Should your website be in Spanish too? | websites | 🈳 needs translation |
| 2026-10-05 | Why Google Translate on your website does nothing for SEO | search | 🈳 needs translation |
| 2026-10-12 | Reaching Chinese-speaking customers in the San Gabriel Valley | websites | 🈳 needs translation |
| 2026-10-19 | Simplified or Traditional Chinese — which does your business need? | websites | 🈳 needs translation |
| 2026-10-26 | Are Google Ads worth it for a small business? | ads | 🈳 needs translation |
| 2026-11-02 | What to do when your website traffic drops | search | 🈳 needs translation |
| 2026-11-09 | Which service should you stop offering? | consulting | 🈳 needs translation |
| 2026-11-16 | How to fire a customer without burning the relationship | consulting | 🈳 needs translation |
| 2026-11-23 | Should you redesign your website, or just fix what's broken? | websites | 🈳 needs translation |
| ~~2026-11-30~~ | *Skipped — Thanksgiving week.* | — | — |
| 2026-12-07 | Getting ready for Rose Parade season: what Pasadena businesses should check every December | search | 🈳 needs translation |
| 2026-12-14 | Do you need an online store, or just a way to take orders? | websites | 🈳 needs translation |
| ~~2026-12-21~~ | *Skipped — Christmas week.* | — | — |
| ~~2026-12-28~~ | *Skipped — New Year's week.* | — | — |
| 2027-01-04 | Marketing to the San Gabriel Valley's Lunar New Year crowd | ads | 🈳 needs translation |
| 2027-01-11 | How to know when to walk away from a bad-fit client | consulting | 🈳 needs translation |

**The last two rows are the "Southern California + online marketing" pieces
requested 2026-08-27.** Both are genuinely regional, not generic filler with
a city name swapped in:

- **Rose Parade season** is Pasadena's single biggest annual tourism/traffic
  event (New Year's Day parade + the Rose Bowl game) — a real seasonal
  search spike for anything hospitality/retail/service-adjacent, and a
  legitimate reason to remind readers to check their Google Business Profile
  hours/photos before it hits. Timed for early December, ahead of the event.
- **Lunar New Year** is a major commercial season specifically in the west
  San Gabriel Valley (Monterey Park, Alhambra, Arcadia's Chinese-American
  business communities) — ties directly into the multilingual content
  already built this year, and fits the "online marketing" pillar because
  it's a real case for timing a paid + organic push around a known seasonal
  spike, not evergreen SEO. Dated for the first week of January since actual
  Lunar New Year timing (late Jan–Feb depending on year) means outreach and
  ad prep should start weeks ahead — verify the exact date for whatever year
  you're actually publishing this before it goes out.

If a week slips, don't compress two articles into one week to catch up —
just slide every date after it back by the same amount. Consistency at a
slower pace beats a burst followed by another gap.

---

## Weeks 1–4 — the questions people already ask you

_Real target dates: 2026-08-31 through 2026-09-21 — see the publishing
calendar above._

Start here because you already know the answers cold. These are the questions
you field on the phone every week, which means writing them is fast and the
answers are genuinely yours.

| Week | Article | Pillar | Target keyword |
|---|---|---|---|
| 1 | How much should a small business website cost? | websites | "how much does a small business website cost" |
| 2 | How to claim and fix your Google Business Profile | search | "how to claim google business profile" |
| 3 | Do I need a website if I have Instagram? | websites | "do i need a website if i have instagram" |
| 4 | How to ask customers for reviews without being awkward | search | "how to ask customers for google reviews" |

**Why the pricing article is first.** "How much does X cost" is the highest-
intent question in any service business and almost nobody in your space answers
it honestly. Publishing real numbers — even ranges with conditions — will
out-perform every clever piece you write this year. It also pre-qualifies your
leads, which saves you calls you didn't want.

---

## Weeks 5–8 — the multilingual angle nobody else is writing

_Real target dates: 2026-09-28 through 2026-10-19._

This is your genuine differentiator and there is close to no competition for
these terms in your area. Publish the English version first; translate the
strongest one or two into Spanish and Chinese afterward.

| Week | Article | Pillar | Target keyword |
|---|---|---|---|
| 5 | Should your website be in Spanish too? | websites | "should my website be in spanish" |
| 6 | Why Google Translate on your website does nothing for SEO | search | "google translate widget seo" |
| 7 | Reaching Chinese-speaking customers in the San Gabriel Valley | websites | "chinese language website for business" |
| 8 | Simplified or Traditional Chinese — which does your business need? | websites | "simplified vs traditional chinese website" |

**Week 8 is your sharpest piece.** Almost nobody writes it, business owners in
Arcadia and Monterey Park genuinely need the answer, and being the person who
explains it correctly is worth more than the traffic it brings. It also
demonstrates you understand the distinction — which is exactly the thing a
Chinese-speaking owner is quietly checking for before they call you.

---

## Weeks 9–12 — the money questions

_Real target dates: 2026-10-26 through 2026-11-16._

By now you have some search history in Google Search Console. Check it before
committing to these; if real queries are showing up that you didn't predict,
those beat anything on this list.

| Week | Article | Pillar | Target keyword |
|---|---|---|---|
| 9 | Are Google Ads worth it for a small business? | ads | "are google ads worth it small business" |
| 10 | What to do when your website traffic drops | search | "website traffic dropped suddenly" |
| 11 | Which service should you stop offering? | consulting | "which services to cut small business" |
| 12 | How to fire a customer without burning the relationship | consulting | "how to fire a client politely" |

**Week 9 sits in your lowest-priority service on purpose.** An honest article
about when ads *aren't* worth it builds more trust than four articles selling
them, and it converts readers into website and SEO clients — your two top
priorities.

---

## Rules of thumb

**One keyword per article.** Two articles competing for the same phrase split
your own traffic. `targetKeyword` in the frontmatter exists so you can grep the
folder before writing something you've already covered.

**The filename is the URL, so write it as a keyword.** `google-business-profile-setup.md`, not `post-14.md`.

**Answer the question in the first paragraph.** Then explain. People who bury
the answer to seem thorough lose the reader and the ranking.

**Link to a service page at the end of every article.** The `pillar` field does
this automatically — just make sure you picked the right one.

**Update rather than republish.** When an article gets stale, edit it and set
`updatedDate` in the frontmatter. A three-year-old article that stays current
outranks a new one on the same topic.

---

## Translating an article

**Decision (2026-08-27): translate every post, all three languages, going
forward.** Earlier guidance here was selective — translate only where a
language's audience is underserved. The owner overrode that: every future
post gets a Spanish, Simplified Chinese, and Traditional Chinese version as
part of publishing it, not a separate later pass. Translate alongside the
English draft, using a real researched keyword/slug per language (not a
literal translation) — see the gotchas in `CLAUDE.md` for the mechanics
(locale subfolder, `translationKey`, per-language `slug`, and the slug-
uniqueness pitfall to check before publishing).

All three currently-published posts already have all four languages, done
2026-08-27. The four *not-yet-written* posts (the Google Business Profile
guide, and the three multilingual-angle pieces) should be written and
translated together when their turn comes up in the calendar, not English-
first-then-translate-later.

---

## Measuring it, honestly

Set up [Google Search Console](https://search.google.com/search-console),
verify `pasadenaworks.com`, and submit
`https://pasadenaworks.com/sitemap-index.xml`.

Then check exactly two things, monthly:

1. **Which queries you appeared for** — including ones you didn't target. This
   is the single most useful data you'll get, and it will redirect your content
   plan more accurately than any keyword tool.
2. **Whether impressions are trending up.** Not clicks, not rankings —
   impressions. It's the earliest signal that something is working.

Expect roughly nothing for three months. Local SEO compounds slowly and then
noticeably. If you're checking weekly and feeling discouraged, check monthly
instead — the data genuinely isn't meaningful at weekly resolution.
