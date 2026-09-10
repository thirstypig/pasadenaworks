---
title: How to tell whether AI search is sending you customers
description: 'You mostly cannot separate it out, and understanding why is more useful than any dashboard. What you can read is the shape of the change, and where the assistants do leave a trace.'
pubDate: 2027-06-21T00:00:00.000Z
pillar: search
targetKeyword: measure traffic from ai search
author: Pasadena Works
tags:
  - ai search
  - google search console
draft: false
locale: en
translationKey: measuring-ai-search
slug: how-to-tell-if-ai-search-sends-customers
---

> **TL;DR** — Google folds clicks from its AI features into ordinary Web search reporting in Search Console rather than breaking them out, so there is no line to read that says "AI Overviews sent you this much." What you can read is the pattern: stable impressions with falling click-through is the signature of answers resolving without a click. Separately, the standalone assistants do arrive as ordinary referral traffic in your analytics, which is the one place you can count them directly.

This question arrives from business owners who have been told that AI search is changing everything and would reasonably like to know whether it is changing anything for them. The answer involves more measurement literacy than most vendors admit, and being clear about what cannot be measured is the most useful part.

## Why there is no clean number

Google's documentation on its AI features explains the reporting, and the explanation is the important part.

Sites appearing in AI features are counted within your overall Search performance data rather than separately, reported under the Web search type in the performance report. That is a deliberate design choice, and its consequence for you is that the click that arrived after somebody read an AI Overview looks identical, in your reporting, to one that arrived from an ordinary blue link.

So when somebody offers to show you your AI Overview traffic as a distinct figure for Google, ask how it was derived. It will be an estimate built on assumptions, which is not disqualifying, and it should be labelled as one.

## The pattern you can actually read

What survives is the shape of the change over time, and it is legible if you look at the right two numbers together.

Open the performance report and compare impressions against clicks across several months rather than week to week. **Impressions roughly stable while clicks and click-through rate decline** is the characteristic signature of queries increasingly being answered before anybody clicks. It means you are still visible; it means visibility is converting to visits less often.

That is uncomfortable and it is not the same as losing rankings, which is why the distinction matters. A response of "we must be dropping, spend more on SEO" misreads it. A better response is to ask which queries lost the clicks, because there is usually a clear split: purely informational questions lose them heavily, while questions with intent behind them — a price, a booking, a location, a specific problem — hold up considerably better.

## Where the assistants do leave a trace

The standalone products are a different matter, and this is the part most people miss.

When somebody clicks a link inside ChatGPT, Perplexity or a similar assistant, that visit typically arrives at your site as ordinary referral traffic, with the assistant's domain as the referrer. Look in your analytics under referrals and you can count those sessions directly, see which pages they land on, and see whether they do anything once they arrive.

The volumes are usually small compared with search, and they are frequently high quality, because somebody who followed a link out of an answer has already been given a reason to. Watch the trend rather than the absolute number, and note which of your pages they land on, since that tells you what the assistants consider your useful content.

## Ask the customers

The most reliable instrument available to a small business remains the least technical one, and it costs nothing beyond consistency.

Add "how did you hear about us" to your intake, ask it the same way every time, and record the answer somewhere you will actually look. "I asked ChatGPT for a roofer in Alhambra" is a data point no dashboard will give you, and a handful of those in a quarter tells you more about whether this channel matters to your business than any estimate of AI Overview impressions.

## What to do with the answer

If informational queries are losing clicks while commercial ones hold, that is the expected pattern and the right response is to make sure the commercial pages are excellent rather than to write more informational articles.

If assistant referrals are appearing and converting, note which pages they land on and make those pages better, since they are evidently doing the work. If nothing is appearing anywhere, that is also information, and it is a reason to check the fundamentals — crawlability, the profile, whether your facts are stated in text — before it is a reason to buy anything.

The realistic position is that this is one input among several, that it is measurable in outline rather than in detail, and that a business making decisions on the outline will do better than one waiting for a number that is not going to arrive.

**Sources:** [Search Console Help, Performance report (Search results)](https://support.google.com/webmasters/answer/7576553?hl=en) · [Google Search Central, AI Features and Your Website](https://developers.google.com/search/docs/appearance/ai-features?hl=en)
