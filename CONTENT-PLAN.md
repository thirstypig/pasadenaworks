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
A handful are visible today; the rest surface weekly through 2027-01-11 on
their own. **All 20 are translated into Spanish, Simplified, and Traditional
Chinese** (backlog closed 2026-09-01) — the rule that still binds going
forward is translating alongside the English draft, not afterwards, since a
date-gated post whose translations miss its own `pubDate` publishes
English-only with no second chance.

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

All 20 posts are approved and all 20 now exist in every language, so
publication is fully automatic and there is no translation backlog left to
work. The Status column below is therefore a record rather than a queue.

**Do not hand-maintain what is visible today.** `CONTENT-STATUS.md` is
generated from the post frontmatter and is the live answer; this table drifted
out of date within two days of the backlog closing precisely because it was
tracking the same thing by hand.

🌍 = translated (es + zh-hans + zh-hant) · 👁 = already visible on the site

| Target date | Article | Pillar | Status |
|---|---|---|---|
| 2026-08-31 | How much should a small business website cost? | websites | 🌍 translated · 👁 visible |
| 2026-09-07 | How to claim and fix your Google Business Profile | search | 🌍 translated |
| 2026-09-14 | Do I need a website if I have Instagram? | websites | 🌍 translated |
| 2026-09-21 | How to ask customers for reviews without being awkward | search | 🌍 translated |
| 2026-09-28 | Should your website be in Spanish too? | websites | 🌍 translated |
| 2026-10-05 | Why Google Translate on your website does nothing for SEO | search | 🌍 translated |
| 2026-10-12 | Reaching Chinese-speaking customers in the San Gabriel Valley | websites | 🌍 translated |
| 2026-10-19 | Simplified or Traditional Chinese — which does your business need? | websites | 🌍 translated |
| 2026-10-26 | Are Google Ads worth it for a small business? | ads | 🌍 translated |
| 2026-11-02 | What to do when your website traffic drops | search | 🌍 translated |
| 2026-11-09 | Which service should you stop offering? | consulting | 🌍 translated |
| 2026-11-16 | How to fire a customer without burning the relationship | consulting | 🌍 translated |
| 2026-11-23 | Should you redesign your website, or just fix what's broken? | websites | 🌍 translated |
| ~~2026-11-30~~ | *Skipped — Thanksgiving week.* | — | — |
| 2026-12-07 | Getting ready for Rose Parade season: what Pasadena businesses should check every December | search | 🌍 translated |
| 2026-12-14 | Do you need an online store, or just a way to take orders? | websites | 🌍 translated |
| ~~2026-12-21~~ | *Skipped — Christmas week.* | — | — |
| ~~2026-12-28~~ | *Skipped — New Year's week.* | — | — |
| 2027-01-04 | Marketing to the San Gabriel Valley's Lunar New Year crowd | ads | 🌍 translated |
| 2027-01-11 | How to know when to walk away from a bad-fit client | consulting | 🌍 translated |

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

## Phase two — 2027-01-18 onward

The first 90 days answered the questions a small business already asks out
loud. This phase does three jobs: it claims a lane nobody local is writing in,
it follows a deliberate shift in who the customer is, and it takes a position
on the thing every owner is currently being sold.

**Forty-eight articles, weekly Mondays from 2027-01-18 through 2027-12-13**,
with three seasonal pieces placed at the dates they are actually useful —
holiday advice published in May is worthless. Clusters are interleaved rather
than run in blocks, so the blog does not spend seven consecutive weeks on one
subject.

### The calendar

| Date | Article | Pillar | Cluster |
|---|---|---|---|
| 2027-01-18 | Why doesn't my business come up when someone asks ChatGPT? | search | AI search |
| 2027-01-25 | Should you let ChatGPT write your website copy? | websites | AI for SMBs |
| 2027-02-01 | What Google's AI Overviews changed for a local business | search | AI search |
| 2027-02-08 | People are getting answers without clicking. What that means for you. | search | AI search |
| 2027-02-15 | What a physician's website actually needs | websites | Clinics |
| 2027-02-22 | Local SEO for medical practices | search | Clinics |
| 2027-03-01 | What AI is genuinely good at for a small business, and what it isn't | consulting | AI for SMBs |
| 2027-03-08 | Who actually owns your website? | consulting | Ownership |
| 2027-03-15 | What to do when your web developer stops answering | consulting | Ownership |
| 2027-03-22 | How to show up in ChatGPT, Claude, Gemini and Perplexity answers | search | AI search |
| 2027-03-29 | HIPAA and your website: the parts that trip people up | websites | Clinics |
| 2027-04-05 | Choosing an EHR: what actually matters for a small practice | consulting | Clinics |
| 2027-04-12 | Using AI to answer customer enquiries without sounding like a robot | consulting | AI for SMBs |
| 2027-04-19 | How to get your domain name back | websites | Ownership |
| 2027-04-26 | What should SEO actually cost? | consulting | Money |
| 2027-05-03 | Is "GEO" real, or SEO with a new name? | search | AI search |
| 2027-05-10 | Switching EHR without losing your schedule | consulting | Clinics |
| 2027-05-17 | Are Google Ads worth it for an optometrist? | ads | Clinics |
| 2027-05-24 | Can AI write your Google Business Profile posts? | search | AI for SMBs |
| 2027-05-31 | How to tell whether you're being overcharged for a website | consulting | Ownership |
| 2027-06-07 | Website accessibility lawsuits in California: what's actually real | websites | Accessibility |
| 2027-06-14 | Making your site accessible without rebuilding it | websites | Accessibility |
| 2027-06-21 | How to tell whether AI search is sending you customers | search | AI search |
| 2027-06-28 | How an independent outranks a chain in local search | search | SoCal |
| 2027-07-05 | AI-generated photos on your website: when it backfires | websites | AI for SMBs |
| 2027-07-12 | What does a marketing consultant charge, and for what? | consulting | Money |
| 2027-07-19 | In-N-Out's website has barely changed in 20 years | websites | SoCal |
| 2027-07-26 | Does your website need an `llms.txt`? | websites | AI search |
| 2027-08-02 | Own your name online: what the Sriracha fight teaches small businesses | websites | SoCal |
| 2027-08-09 | What to tell an employee who wants to "use AI" for marketing | consulting | AI for SMBs |
| 2027-08-16 | Trader Joe's doesn't buy ads. Why that's a bad model to copy. | ads | SoCal |
| 2027-08-23 | What an ADA website lawsuit actually looks like, read from the filing | websites | Use cases |
| 2027-08-30 | The California businesses sued over their websites, and what they had in common | websites | Use cases |
| 2027-09-06 | Accessibility overlay widgets did not stop the lawsuits | websites | Use cases |
| 2027-09-13 | What "ADA compliant" vendors promise, against what the filings say | consulting | Use cases |
| 2027-09-20 | Google Business Profile suspensions: what gets a real business shut out | search | Use cases |
| 2027-09-27 | Q4 checklist: what to fix before the holiday rush | consulting | Seasonal |
| 2027-10-04 | Fake reviews and review extortion: documented cases, and what worked | search | Use cases |
| 2027-10-11 | When a competitor reports your listing: what the appeals record shows | search | Use cases |
| 2027-10-18 | Businesses that lost their own domain name, and how | websites | Use cases |
| 2027-10-25 | What happens to your site when your developer's company dissolves | consulting | Use cases |
| 2027-11-01 | Disputed handovers: who owned the website, according to the record | consulting | Use cases |
| 2027-11-08 | Small Business Saturday: worth the effort? | ads | Seasonal |
| 2027-11-15 | Holiday hours on your Google Business Profile | search | Seasonal |
| 2027-11-22 | What published research says about how people actually use AI search | search | Use cases |
| 2027-11-29 | When an assistant gets your details wrong: documented cases | search | Use cases |
| 2027-12-06 | What agencies actually charge, read from published rate surveys | consulting | Use cases |
| 2027-12-13 | What owners report spending on a website: the survey data | consulting | Use cases |
| 2027-12-20 | *Skipped — Christmas week.* | — | — |
| 2027-12-27 | *Skipped — New Year's week.* | — | — |

**Every Monday from 2027-01-18 to 2027-12-27 now carries a topic**, with
Christmas and New Year's weeks skipped as usual. That is forty-eight articles.
Read the two sections at the end before treating that as a finished plan: the
back half is deliberately placeholders, and the size of this is the main risk
in it.

### AI, in two clusters that are not the same subject

This is the largest bet in the plan — thirteen of thirty-four articles — and it
is deliberately split, because the two halves serve different readers.

**AI search (7)** is about being *found*: what happens to a local business when
customers ask an assistant instead of typing into Google. None of the first
twenty target keywords touch it, so it is a rare topic where this site can rank
without fighting an established page.

**AI for small businesses (6)** is about *using* it: whether to let a chatbot
write your copy, where AI-generated photos backfire, what to say to the
employee who wants to run marketing through it. This is the cluster with the
most immediate commercial value, because it is what owners are actually asking
right now, and most of the answers they are getting come from people selling
them something.

**Write both in the customer's words.** An earlier draft used titles like
*"Is GEO real, or SEO with a new name?"* — read by other agencies, not by a dry
cleaner in Alhambra, who does not search *generative engine optimization*. That
article survives here because the underlying question is fair, but the rule
holds: ask it the way an owner would.

**Keep the evergreen ones evergreen.** Only three articles name specific
products; those need revisiting every six months. The rest should still read
correctly in 2029.

**The honest risk:** thirteen articles is a heavy bet on a subject that may look
different by the time the last one publishes in August 2027. Accepted knowingly
— the lane is empty now, and being early is the entire advantage.

### Ownership — four articles, and the gap that mattered most

This site's most distinctive sentence is *"Holding a client's website hostage
is a bad business model and a worse way to treat people."* Nothing argued it.

Somebody searching *"what to do when my web developer stops answering"* is
actively unhappy with a vendor they are currently paying. That is a buying
moment, not a research one, and most agencies will not write it because it
implicates them. This site can, because it already took the position.

### Clinics — six articles, following a shift in customer base

Physicians and optometrists, covering marketing and EHR consulting.

**Decision frameworks, not software reviews.** No "best EHR for optometrists",
no comparison tables. Reviews mean competing with Capterra and vendor
affiliates on a topic this site has no demonstrated expertise in, and thin
comparison content is the doorway-page trap hard rule 2 exists to prevent.

**No fifth pillar.** EHR consulting is `consulting`; the marketing pieces are
`websites`, `search` and `ads`. A new pillar means touching
`src/data/pillars.ts`, `src/content.config.ts` and `tina/config.ts`, plus a
`tina-lock.json` regeneration that breaks every deploy when forgotten.

**`src/data/services.ts` has to change before any of these ship.** Six articles
positioning this business as a clinic consultant, while the services page never
mentions clinics or EHR, is a page claiming what the site cannot back up.
Sequence the services copy first, in all four languages.

### Accessibility — two articles, because California is where this bites

California carries the highest volume of web-accessibility lawsuits in the
country, and it frightens owners who have no idea whether they are exposed.
This site is credible on it: there is an `/accessibility/` page, and a real
WCAG contrast failure was found and fixed here in September 2026.

Write the first to calm people down and tell the truth about what is and is not
a real risk. The second is practical — most fixes are cheap and need no rebuild.

### Southern California — four articles that have to earn their place

Real names, every factual claim cited to public reporting, no implied
relationship with any of them.

**The test each one has to pass: does the lesson point at something this
business sells?** A first draft was In-N-Out's franchising model, Trader Joe's
loyalty program and the Huy Fong supplier dispute — interesting, and none of it
led a reader near a website, a search problem or an ad budget. Business trivia
with a local accent is still filler. Each now lands on a service: In-N-Out on
what a website is *for*, Sriracha on owning your own brand assets, Trader Joe's
as an argument *against* copying their no-advertising model, and
independent-versus-chain on local search.

**Verify before drafting.** The load-bearing claims are Huy Fong's trademark
position and Trader Joe's advertising policy. Both are widely reported; both
must be cited, not asserted. Getting a real company's history wrong is worse
than not writing the article.

### Money — two articles, the proven shape

*"What should SEO actually cost?"* and *"What does a marketing consultant
charge, and for what?"* The two most substantial articles written so far are the
cost and the pricing ones, which is the clearest signal available about what
this audience reads. Direct question, number in the answer.

### Use cases — fourteen articles, every one built on a public record

The gap from late August 2027 onward is filled with case-study articles, and
they carry a rule the rest of the plan does not need.

**Never imply these are your own clients.** This is a small consultancy with no
published client work. An article shaped like "how we helped a local dentist
recover from a Google suspension", written from a composite or an imagined
example, is fabrication — the same failure hard rule 2 exists to prevent on
city pages, and considerably worse in a case study, because a reader takes it
as evidence you have done the work. Every one of these is a **publicly
documented case involving someone else**, framed as observed, and cited.

**Why these four seams and not others** — each has a real, checkable record:

- **Accessibility litigation** is public court filings. California carries more
  web-accessibility suits than any other state, the complaints are readable,
  and the overlay-widget articles can be argued from the docket rather than
  from a vendor's marketing. This is the strongest-sourced group here.
- **Profile suspensions, fake reviews and listing reports** are covered in
  trade press and in Google's own documentation, and the appeal outcomes are
  discussed openly by the people they happened to.
- **Domain and handover disputes** are the ownership cluster's evidence.
  Argument is one thing; a business that lost its own name is another.
- **Pricing and AI-usage research** are published surveys. Read them honestly,
  including where the sample is thin or the publisher is selling something.

**Cut anything that will not source.** *"When an assistant gets your details
wrong"* is the weakest of the fourteen — the phenomenon is real and widely
complained about, but a citable, verifiable instance may not exist. If a
credible source cannot be found at drafting time, drop the article and leave
the Monday empty. An uncited case study is worth less than no article, because
it teaches the reader that the citations elsewhere might be decorative too.

### Citations — the standard for every article, not just the case studies

Measured across the twenty English articles written so far: **23 outbound
citations, 14 articles carrying at least one, and 6 carrying none.** That is a
real improvement — an earlier note in this project recorded one citation across
twenty articles — and it is not yet a standard.

From here: **every article cites at least one source a reader could check, and
no article ships with zero.** The register work already established that
raising the reading level without raising the rigour only makes assertions
sound more confident. Citations are what stop that.

Two rules learned the expensive way and worth repeating here:

- **Verify the URL before citing it.** Checking one claim in the postcard
  article is what revealed the article had been overstating it.
- **Cite the localized page.** Google's own documentation takes an `?hl=`
  parameter; a Spanish article citing an English page is a worse citation than
  it looks.

### These fourteen are placeholders, and should be re-cut in March

The plan already says the first ten articles publish by late March 2027, and
that is the point to read Search Console and revise everything after it. These
fourteen sit eight months past that checkpoint.

They are here so that every Monday has an argued topic rather than a blank,
which makes the shape of the year visible and reviewable. They are **not**
commitments. Treat a slot with a topic and a rationale as better than an empty
one and worse than a decision made with data.

### What this costs, stated plainly

Forty-eight articles is **one hundred and ninety-two files** — every one ships
in English, Spanish, Simplified and Traditional Chinese, translated alongside
the English draft rather than after it. A date-gated article whose translations
miss its own `pubDate` publishes English-only and does not get a second chance.

At one article a week this is roughly two years of work, and it lands on top of
fifteen finished articles already queued and unpublished through January.

**That is the real risk in this plan, and it is not the topics.** Publishing
is the bottleneck. Nothing here has been tested against traffic, and the three
oldest live articles run about half the length of everything written since.

**The scoreboard exists — use it.** Search Console is verified for
pasadenaworks.com by a DNS TXT record on the domain, which is why no
verification tag appears anywhere in this repository; looking for one and not
finding it proves nothing. So query performance is available today, and the
plan above was still written without consulting it.

**Re-cut the back half against real data.** The first ten articles publish by
late March 2027. That is the natural point to read which pillar actually earns
impressions and revise everything after it. A plan this size should be revised
once in flight, not written once and followed to the end — and unlike most such
promises, this one has the data to keep it.

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

**All twenty posts have all four languages as of 2026-08-31.** The backlog is
gone and there is no longer a translation deadline attached to any scheduled
post — every one of them will publish complete. The rule still applies to
anything written from here on: translate alongside the English draft, because
a date-gated post that misses its own `pubDate` publishes English-only and
does not get a second chance. The four *not-yet-written* posts (the Google Business Profile
guide, and the three multilingual-angle pieces) should be written and
translated together when their turn comes up in the calendar, not English-
first-then-translate-later.

### Place names

**Pasadena is 帕薩迪納 (Traditional) / 帕萨迪纳 (Simplified).** Not a
judgement call — it is how the City of Pasadena writes its own name in its
official trilingual election materials (「市級民選市長，帕薩迪納市」), and
LA County ballot material is Traditional Chinese by law. Chinese Wikipedia
and Baidu Baike carry the Simplified form. Variants exist in the wild
(帕薩迪那 with a final 那, Cantonese 帕莎甸娜) — don't use them.

Write it 帕薩迪納（Pasadena）on first mention in a post, then plain Latin
`Pasadena` after that: the Chinese term is what someone actually searches,
and the English keeps it recognizable for a reader who knows the city by
its English name. San Gabriel Valley is 聖蓋博谷 / 圣盖博谷.

**Never touch the `author: "Pasadena Works"` byline** — that is the
business's name, not a place, and it stays in English in every language.

In Spanish, Pasadena is just Pasadena. The valley stays `San Gabriel
Valley`, which is what people here say, rather than a translated
"Valle de San Gabriel."

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

## Triage of the 61 unpublished posts (2026-09-23)

Every unpublished post gets one verdict. Recorded here rather than in a
conversation, because the work is staged over fifteen months.

- **KEEP** — already right for a practice. Change nothing.
- **ADAPT** — same subject and usually the same slug. Customers become
  patients, examples become clinical, and the closing argument points at the
  right service. About a paragraph of change, plus three translations.
- **REPLACE** — the subject does not survive the repositioning. New title,
  new slug, new post, new translations.

Work in DATE ORDER, about eight weeks ahead of the publishing front. The
`→` column is the pillar the post should end on; where it differs from the
pillar it carries today, the frontmatter changes with the rewrite.

| Date | Post | Verdict | → | Note |
|---|---|---|---|---|
| 2026-09-28 | Should your website be in Spanish too? | **ADAPT** | `·` | Patients, not customers. Add the intake-form half — a Spanish page is the cheap part. |
| 2026-10-05 | Why Google Translate on your website does nothing for SEO | **ADAPT** | `·` | Same argument, unchanged; examples become clinical. |
| 2026-10-12 | Reaching Chinese-speaking customers in the San Gabriel Val | **ADAPT** | `digitize` | Re-aim from the website to the FRONT DESK and intake forms — the Monterey Park city-page argument, which is the expensive half. |
| 2026-10-19 | Simplified or Traditional Chinese — which does your busine | **ADAPT** | `·` | The city pages already make this case; reuse their framing. |
| 2026-10-26 | Are Google Ads worth it for a small business? | **ADAPT** | `·` | For a practice. Pairs with the optometrist version in May. |
| 2026-11-02 | What to do when your website traffic drops | **ADAPT** | `·` | Generic; examples become clinical. |
| 2026-11-09 | Which service should you stop offering? | **ADAPT** | `·` | Becomes sharper: which PROCEDURES to stop offering. |
| 2026-11-16 | How to fire a customer without burning the relationship | **REPLACE** | `digitize` | ⚠ Patient dismissal is regulated — notice periods, continuity of care. Never retitle. Replace with a Digitize subject. |
| 2026-11-23 | Should you redesign your website, or just fix what''s brok | **ADAPT** | `·` | Generic. |
| 2026-12-07 | Getting ready for Rose Parade season: what Pasadena busine | **ADAPT** | `·` | Genuinely local: Pasadena practices face closures and access problems that week. |
| 2026-12-14 | Do you need an online store, or just a way to take orders? | **REPLACE** | `digitize` | A practice needs online booking and intake, not a store. Natural Digitize replacement. |
| 2027-01-04 | Marketing to the San Gabriel Valley's Lunar New Year crowd | **ADAPT** | `·` | Real in the SGV: clinic hours and closures over the holiday. |
| 2027-01-11 | How to know when to walk away from a bad-fit client | **ADAPT** | `·` | ⚠ Do NOT make this about declining patients. Re-aim to walking away from an INSURANCE CONTRACT — a real decision, and safe. |
| 2027-01-18 | Why doesn't my business come up when someone asks ChatGPT? | **ADAPT** | `·` |  |
| 2027-01-25 | Should you let ChatGPT write your website copy? | **ADAPT** | `·` |  |
| 2027-02-01 | What Google's AI Overviews changed for a local business | **ADAPT** | `·` |  |
| 2027-02-08 | People are getting answers without clicking. What that mea | **ADAPT** | `·` |  |
| 2027-02-15 | What a physician's website actually needs | **KEEP** | `·` | Already practice-specific. |
| 2027-02-22 | Local SEO for medical practices | **KEEP** | `·` | Already practice-specific. |
| 2027-03-01 | What AI is genuinely good at for a small business, and wha | **ADAPT** | `digitize` | Re-aim to AI inside the office — notes, scheduling, reminders. |
| 2027-03-08 | Who actually owns your website? | **ADAPT** | `·` |  |
| 2027-03-15 | What to do when your web developer stops answering | **ADAPT** | `·` |  |
| 2027-03-22 | How to show up in ChatGPT, Claude, Gemini and Perplexity a | **ADAPT** | `·` |  |
| 2027-03-29 | HIPAA and your website: the parts that trip people up | **KEEP** | `·` | Already practice-specific. |
| 2027-04-05 | Choosing an EHR: what actually matters for a small practic | **KEEP** | `·` | Already practice-specific. |
| 2027-04-12 | Using AI to answer customer enquiries without sounding lik | **ADAPT** | `digitize` | The front desk and the telephone — squarely Digitize. |
| 2027-04-19 | How to get your domain name back | **ADAPT** | `consulting` |  |
| 2027-04-26 | What should SEO actually cost? | **ADAPT** | `·` |  |
| 2027-05-03 | Is "GEO" real, or SEO with a new name? | **ADAPT** | `·` |  |
| 2027-05-10 | Switching EHR without losing your schedule | **KEEP** | `·` | Already practice-specific. |
| 2027-05-17 | Are Google Ads worth it for an optometrist? | **KEEP** | `·` | Already practice-specific. |
| 2027-05-24 | Can AI write your Google Business Profile posts? | **ADAPT** | `·` |  |
| 2027-05-31 | How to tell whether you're being overcharged for a website | **ADAPT** | `·` |  |
| 2027-06-07 | Website accessibility lawsuits in California: what's actua | **ADAPT** | `consulting` |  |
| 2027-06-14 | Making your site accessible without rebuilding it | **ADAPT** | `consulting` |  |
| 2027-06-21 | How to tell whether AI search is sending you customers | **ADAPT** | `·` |  |
| 2027-06-28 | How an independent outranks a chain in local search | **ADAPT** | `·` | Strong re-aim: an independent practice against a hospital-owned group. |
| 2027-07-05 | AI-generated photos on your website: when it backfires | **ADAPT** | `·` |  |
| 2027-07-12 | What does a marketing consultant charge, and for what? | **ADAPT** | `·` |  |
| 2027-07-19 | Websites that barely change: what restraint is actually wo | **ADAPT** | `·` |  |
| 2027-07-26 | Does your website need an llms.txt file? | **ADAPT** | `·` |  |
| 2027-08-02 | Own your name online: what the Sriracha fight teaches smal | **ADAPT** | `consulting` |  |
| 2027-08-09 | What to tell an employee who wants to "use AI" for marketi | **ADAPT** | `digitize` | ⚠ For a practice this is a PHI question, not a marketing one. Staff putting patient details into a chatbot. Differentiated and worth doing properly. |
| 2027-08-16 | Trader Joe's doesn't buy ads. Why that's a bad model to co | **ADAPT** | `·` | Re-aim to referral-based growth. |
| 2027-08-23 | What an ADA website lawsuit actually looks like, read from | **ADAPT** | `consulting` |  |
| 2027-08-30 | The California businesses sued over their websites, and wh | **ADAPT** | `consulting` |  |
| 2027-09-06 | Accessibility overlay widgets did not stop the lawsuits | **ADAPT** | `consulting` |  |
| 2027-09-13 | What "ADA compliant" vendors promise, against what the rec | **ADAPT** | `·` |  |
| 2027-09-20 | Google Business Profile suspensions: what gets a real busi | **ADAPT** | `·` |  |
| 2027-09-27 | Q4 checklist: what to fix before the holiday rush | **ADAPT** | `digitize` | Re-aim to the December benefits rush — deductibles resetting, capacity. A real practice phenomenon. |
| 2027-10-04 | Fake reviews and review extortion: what the rule actually  | **ADAPT** | `·` |  |
| 2027-10-11 | When a competitor reports your listing, or quietly edits i | **ADAPT** | `·` |  |
| 2027-10-18 | Businesses that lost their own domain name, and how | **ADAPT** | `consulting` |  |
| 2027-10-25 | What happens to your site when your developer's company di | **ADAPT** | `·` |  |
| 2027-11-01 | Disputed handovers: who owned the website, according to th | **ADAPT** | `·` |  |
| 2027-11-08 | Small Business Saturday: worth the effort? | **REPLACE** | `digitize` | A retail holiday has no practice analogue. Weakest post in the run. |
| 2027-11-15 | Holiday hours on your Google Business Profile | **ADAPT** | `·` |  |
| 2027-11-22 | What published research says about how people actually use | **ADAPT** | `·` |  |
| 2027-11-29 | When an assistant gets your business details wrong | **ADAPT** | `·` |  |
| 2027-12-06 | What agencies actually charge, and why the \"rate surveys\ | **ADAPT** | `·` |  |
| 2027-12-13 | What owners report about their websites: the survey data | **ADAPT** | `·` |  |

**Verdicts:** 6 keep · 52 adapt · 3 replace.

**Where that lands, against the spec's target:**

| Pillar | Triage | Target | |
|---|---|---|---|
| `websites` | 30 | ~24 | +6 |
| `consulting` | 20 | ~18 | +2 |
| `digitize` | 11 | ~14 | -3 |
| `transition` | 0 | ~3 | -3 |

**The gap is reported, not closed, and that is deliberate.** The spec says
the balance is a target rather than a quota: where a post genuinely belongs
in another pillar, the post wins and the table moves. Two honest reasons it
moved:

- **`transition` is 0 because `todos/046` (e) is unanswered.** Transition
  Planning describes preparation only until the attorney rules on broker
  licensing. Writing three posts into that gap now would be writing the
  claim the todo is holding. The three arrive when the answer does.
- **`digitize` reaches 11, not 14.** Getting to 14 means three more
  REPLACEs, and the only remaining candidates sit inside the AI-search
  cluster — which the spec protects by name, on the grounds that it is the
  most differentiated writing on the site. Trading three of those for a
  quota is the trade the spec already rejected once at 24.

Digitize the office still goes from **0 posts to 11**, which was the point.

**Two posts carry a legal hazard and are marked in the table.** 2026-11-16
is REPLACE, never adapt: dismissing a patient is regulated, with notice and
continuity-of-care obligations. 2027-01-11 looks like the same hazard and is
not — re-aimed to walking away from an insurance contract, which is a real
decision and carries none of it.

