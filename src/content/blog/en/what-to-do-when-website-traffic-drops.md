---
title: What to do when your website traffic drops
description: 'A sudden traffic drop usually has one of five causes. Here''s the diagnostic order to find yours fast, before you guess and waste money fixing the wrong thing.'
pubDate: 2026-11-02T00:00:00.000Z
pillar: search
targetKeyword: website traffic dropped what to do
author: Pasadena Works
tags:
  - seo
  - google search console
heroImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80'
heroAlt: A laptop screen showing declining analytics graphs and charts
heroCredit: Luke Chesser
draft: false
locale: en
translationKey: traffic-drop
slug: what-to-do-when-website-traffic-drops
---

> **TL;DR** — Check Google Search Console first: manual actions, then whether the drop is sitewide or on specific pages, then whether it lines up with a site change or a known Google update. Most small-business traffic drops trace back to one of five things, and you can usually tell which within twenty minutes.

Your traffic dropped and you want to know if it's an emergency. Most of the time it isn't, but you won't know until you look in the right places, in the right order. Guessing wastes money — paying someone to "fix your SEO" before you know what's broken is how small businesses burn a few thousand dollars solving the wrong problem.

## Check these things, in this order

**1. Search Console: manual actions first.** Log into Google Search Console, go to Security & Manual Actions. If there's a manual action listed, that's your answer — something on the site violated Google's guidelines (usually spammy links, thin content, or cloaking) and a human reviewer flagged it. This is rare for a small local business site, but it's a five-second check and it rules out the scariest cause immediately.

**2. Is it sitewide or specific pages?** In Search Console's Performance report, look at clicks by page over the last three months. If one or two pages tanked and the rest held steady, that's not an algorithm problem — it's something specific to those pages: outdated content, a title tag that got changed, a competitor that just published something better on the same topic. If every page dropped at once, that points somewhere bigger: a technical issue or an algorithm update.

**3. Did anything on the site change right before the drop?** This is the most common cause we see and the easiest to miss, because it's often something that felt unrelated. A redesign that changed URLs without redirects. A "quick fix" that accidentally left a `noindex` tag on a template. A robots.txt edit that blocked more than intended. A plugin update. A hosting migration. Line up the date of the drop against your site's change history — git commits, CMS revision history, or just "what did we touch that week." If they match, you've found it, and the fix is usually mechanical: restore the redirect, remove the block, revert the tag.

**4. Check Google Business Profile, if local search matters to you.** If a chunk of your traffic comes from Google Maps or the local pack, log into your Business Profile directly, not just Search Console. Suspensions have gotten more common in 2026 — Google's spam detection is stricter, and things as ordinary as a burst of quick edits to your hours or a name that includes a keyword ("Jim's Plumbing - Best Plumber Pasadena") can trigger an automatic review. If your profile shows suspended or under review, that alone can explain a big drop, since Maps traffic often outweighs organic search for local service businesses. Reinstatement takes real documentation — a utility bill or business license showing your name and address — and usually one to three weeks. Don't create a new profile while you wait; that forfeits the reviews and history on the old one.

**5. Is it a known Google update?** Google announces core updates and confirms rollout dates on its Search Status Dashboard. If your drop started on or just after a confirmed rollout date, and it hit multiple pages rather than one, that's your cause. The honest bad news: there's no quick fix for a core update. It's Google re-weighing what "good" content looks like, and the only real response is improving the actual content on the pages that dropped — more specific, more useful, more clearly written by someone who knows the subject — not a technical trick. Give it a full week after the rollout finishes before you draw conclusions; rankings bounce around while an update settles.

## What's probably not the cause

Seasonality gets blamed a lot and is real for some businesses — landscaping, tax prep, holiday retail — but it should look familiar. Pull up the same months from last year in Google Analytics. If last November looked the same, it's seasonal and not worth panicking over. If this November looks nothing like last November, it's not seasonal, and you're back to the four causes above.

A competitor "stealing" your ranking is also usually not really the cause, even though it's the first thing people suspect. Someone else did rank you out, but not by tricking Google — they published something more thorough, faster, or better matched to what the searcher actually wanted. The fix there is the same as for a core update: make the page better, not more optimized.

## What we'd actually do first

If you called us about a traffic drop, the first thing we'd ask for is Search Console access, not a description of the problem. Twenty minutes in there tells you more than an hour of speculation. If the answer turns out to be "your content needs to be better" — that's not a fun answer, and it's not one that gets fixed by anyone claiming they can get you back to page one by next Tuesday. It gets fixed by writing something genuinely more useful than what's currently outranking you.
