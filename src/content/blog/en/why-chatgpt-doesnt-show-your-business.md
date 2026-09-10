---
title: Why doesn't my business come up when someone asks ChatGPT?
description: 'Customers are asking assistants instead of searching. The reason your business is missing is usually ordinary, and the fix is not the one being sold to you.'
pubDate: 2027-01-18T00:00:00.000Z
pillar: search
targetKeyword: business not showing up in ai search
author: Pasadena Works
tags:
  - ai search
  - local seo
draft: false
locale: en
translationKey: chatgpt-business-visibility
slug: why-chatgpt-doesnt-show-your-business
---

> **TL;DR** — Assistants do not keep a directory of businesses to rank. They read the live web when somebody asks, so if your pages are not indexed, or a crawler has been told to stay out, there is nothing for them to find. Google states plainly that appearing in its AI features needs no special files, markup, or optimization beyond ordinary search visibility, and openAI documents one specific crawler that controls whether you can be quoted at all. Almost everything being sold as "AI optimization" sits outside those two facts.

A customer who would once have typed "dry cleaner near me" into Google now asks an assistant instead, and the answer names three businesses within a mile of yours without mentioning you at all. Discovering that is unsettling in a particular way, because unlike a search result there is no page two to console yourself with, and the industry that has assembled itself around the problem over the past two years is more than willing to explain it to you on a monthly retainer.

The genuine explanation is almost always duller than the sales pitch, which is precisely why it is worth setting out.

## Assistants are reading, not ranking

Most owners arrive at this problem carrying a mental model borrowed from search: somewhere there exists a ranking of local dry cleaners, and the work consists of climbing it. That model described search reasonably well for twenty years, which is exactly why it misleads here.

When somebody asks an assistant for a recommendation, the assistant goes and reads. It issues searches of its own, retrieves whatever pages come back, and assembles an answer from what it found, usually citing the sources it leaned on most heavily. Nothing about your business sits in storage beforehand, and there is no queue waiting to be reordered. Because each answer is constructed at the moment it is asked for, the useful question is not where you rank, but whether there is anything about you available to read, and whether the various things that are available agree with one another.

That distinction is not academic, because it determines what is worth paying for. Nobody can sell you a position in something that does not exist until the question is asked.

## The one setting that can shut you out entirely

Before considering anything more elaborate, it is worth ruling out the one genuinely technical way to be invisible, because it is both common and completely silent when it happens.

OpenAI publishes the list of crawlers it operates. The one that matters here is `OAI-SearchBot`, which in OpenAI's own words "is used to surface websites in search results in ChatGPT's search features" — and, more bluntly, "sites that are opted out of `OAI-SearchBot` will not be shown in ChatGPT search answers." A separate crawler, `GPTBot`, is used for training models, and the two settings are independent of one another. You can allow one and refuse the other.

This is not a hypothetical problem. Plenty of sites blocked every AI-associated crawler in 2024 and 2025, when the prevailing advice was to keep your content out of training data, and a fair number did it without distinguishing between the crawler that trains a model and the crawler that decides whether you can be quoted to a customer. If that was done to your site, you opted out of being recommended, and you probably never saw a notification about it.

The file controlling all of this is `robots.txt`, which sits at the root of your domain and can be read by anyone: visit `yourdomain.com/robots.txt` and look at what it actually says. If the contents are not obvious to you, that is an entirely reasonable question to put to whoever maintains the site, and answering it should take them under a minute.

## What Google says, which is not what you are being sold

Google's documentation on AI features is unusually direct, and it is worth quoting rather than paraphrasing, because so much marketing depends on you not having read it.

There are, Google writes, "no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary." It goes further and names the things you do not need: "you don't need to create new machine readable files, AI text files, or markup to appear in these features. There's also no special schema.org structured data that you need to add."

The requirement Google does impose is an ordinary one, and a familiar one: to be eligible, a page "must be indexed and eligible to be shown in Google Search with a snippet," which is the same bar any page has had to clear for the better part of a decade.

If you have been quoted a monthly figure for an AI-specific file, a new markup layer, or a "generative engine optimization" retainer, hold it up against that paragraph. There may still be useful work in the proposal — a site that is genuinely hard to crawl, or business details that contradict each other across the web, are real problems worth paying to fix. But they are the old problems, and they should be priced as such.

## Corroboration does more work than wording

Where assistants do exercise something resembling judgment, it tends to run in favor of claims that more than one independent source is willing to support, and against claims that only you make about yourself.

If your address is one thing on your website, something else on your Google Business Profile, and a third version on an old directory listing that outlived the business that made it, an assembled answer has to choose. It frequently chooses to leave you out rather than assert something it cannot settle. That is not a penalty; it is a system declining to guess.

The unglamorous work of making your name, address, hours and telephone number identical everywhere they appear will do more for you here than any amount of clever phrasing on your homepage, and it has the additional virtue of being work you can finish yourself in an afternoon — which is presumably why nobody has tried to sell it to you.

## What to check this week

Begin with your own `robots.txt`, confirming that nothing in it blocks search crawlers generally or `OAI-SearchBot` in particular. Then search your business name in Google and establish whether your site is indexed at all, since a page that Google cannot show is a page no assistant can retrieve either. Once that is settled, open your Google Business Profile alongside your website's contact page and reconcile every detail that disagrees between them, working outward to whichever directories still carry an old version of you. Finally, ask an assistant the question a customer would actually ask, and read the sources it cites rather than only the answer, because those citations tell you which pages are doing the work and which are being ignored.

None of that amounts to a strategy, and none of it costs anything beyond an afternoon. It is the unglamorous floor beneath a subject that has attracted a remarkable quantity of expensive noise, and the majority of businesses missing from these answers are missing for a reason that appears somewhere on that list.

**Sources:** [OpenAI, Overview of OpenAI Crawlers](https://developers.openai.com/api/docs/bots) · [Google Search Central, AI Features and Your Website](https://developers.google.com/search/docs/appearance/ai-features)
