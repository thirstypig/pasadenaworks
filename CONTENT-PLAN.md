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

| Article | Pillar | Targets |
|---|---|---|
| Why customers can't find your business on Google | search | "why can't customers find my business on google" |
| What a small business website actually needs | websites | "what should a small business website include" |
| How to know if it's time to raise your prices | consulting | "when to raise prices small business" |

---

## Weeks 1–4 — the questions people already ask you

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

Blog posts are English-only by default, and that's the right call for a solo
shop — four-way translation of everything is more work than it's worth. But one
or two articles are worth translating, specifically the ones where the audience
searching in that language is underserved.

Worth translating: the multilingual pieces (weeks 5–8), the pricing article,
and the Google Business Profile guide.

Not worth translating: anything where the reader is equally likely to search in
English, which is most consulting content.

To translate a post you'll need to extend the blog collection with a locale
field and a route under `[locale]/`. The service pages already do exactly this
pattern in `src/pages/[locale]/[section]/[service].astro` — copy the approach
from there rather than inventing a new one.

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
