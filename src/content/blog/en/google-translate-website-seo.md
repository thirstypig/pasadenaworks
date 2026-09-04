---
title: Why Google Translate on your website does nothing for SEO
description: 'Google Translate widgets help visitors read your site, but Googlebot never sees the translated text as its own page — so it can''t rank for translated searches.'
pubDate: 2026-10-05T00:00:00.000Z
pillar: search
targetKeyword: google translate website seo
author: Pasadena Works
tags:
  - multilingual seo
  - hreflang
heroImage: 'https://images.unsplash.com/photo-1543165796-5426273eaab3?auto=format&fit=crop&w=1600&q=80'
heroAlt: An open dictionary showing rows of printed word definitions
heroCredit: Waldemar Brandt
draft: false
locale: en
translationKey: google-translate-seo
slug: google-translate-website-seo
---

> **TL;DR** — The "Translate this page" widget helps a human visitor read your site in their own language. It accomplishes nothing for search rankings, because Google never encounters the translated text as a genuine page: it is merely JavaScript substituting words inside the visitor's browser after the fact. If you want to appear when somebody searches in Spanish or Chinese, you require actual translated pages at their own URLs, with hreflang tags informing Google that they exist.

Somebody asks us this almost every time we raise the subject of multilingual SEO: "Don't we already have that? There's a Translate button in the corner." The answer is no. That button performs something genuine for the person clicking it and nothing whatsoever for Google, and those are two distinct jobs of which the widget does only one.

## What the widget actually does

A Google Translate widget — the small flag dropdown, or the "Translate this page" banner that Chrome displays automatically — operates entirely within the visitor's browser, after your page has already finished loading. Your server transmits the identical English HTML it always transmits, and JavaScript running in the browser subsequently substitutes Spanish or Chinese words for the English ones, on that particular visitor's screen alone.

Nothing about your site has changed. There exists no new URL, and no file on your server containing the translated words. The translation persists precisely as long as that single browser tab remains open, and it evaporates the moment the tab closes.

Googlebot does execute JavaScript, which is the detail that misleads people, but it does not behave like a person: it does not click a translate dropdown and wait for the page to redraw, because content sitting behind a user interaction is content it never reaches. It requests your page, and what gets indexed is the HTML that left your server in whichever language you actually wrote it. The Spanish or Chinese text a visitor perceives through the widget is never crawled, never stored, and never matched against a Spanish or Chinese query, because as far as Google's index is concerned that translated text does not exist anywhere at all.

## Why a search engine needs a separate page, not a costume over the old one

Search engines rank URLs rather than visual appearances. When somebody searches "diseño de páginas web Pasadena," Google attempts to match that query against a page whose actual indexed content is Spanish, which means the words on the page, held in Google's database, must themselves be Spanish words. A widget that repaints English content into Spanish for one visitor's browser never deposits Spanish words into Google's database, so there is simply nothing available to match against.

That constitutes the entire difference between a genuine translated page and a translation plugin. A real Spanish page resides at its own URL — `/es/` for a page such as this one — and the HTML leaving the server at that address is Spanish, written by a person, sitting in a file, indexed by Google as its own page carrying its own title tag, its own meta description, and its own ranking history. It can outrank a competitor's English page for a Spanish query, and it can appear in Spanish "near me" results. A translation widget can accomplish none of that, because no separate object exists there to link to, rank, or measure.

The remaining piece, which people skip even when they do build genuine translated pages, is `hreflang`: the tag informing Google that this English page and this Spanish page constitute identical content in two languages, so that it may serve whichever one matches the searcher. [Google's own documentation](https://developers.google.com/search/docs/specialty/international/localized-versions) is specific about one requirement that trips people up constantly — every language version must reference itself as well as all the others, and **if two pages do not both point at each other, the tags are ignored entirely**. Real translated URLs and correct, reciprocal hreflang tags are therefore a package: either one without the other leaves the value unclaimed.

## What this actually costs to fix

Building genuine translated pages costs genuine time or genuine money, because somebody has to write authentic Spanish or Chinese copy rather than a machine translation of the English, and a fluent reader can invariably tell the difference. It also entails maintaining more pages going forward, since whenever the English page changes somebody must update the translated ones alongside it.

If your business receives meaningful search traffic in another language — check the country and query data in Google Search Console before assuming that it does not — that expenditure is usually justified, because it represents the only path that appears in results whatsoever. If you receive little or none, do not build it merely to appear thorough. A translation widget is perfectly acceptable as a courtesy toward the occasional visitor who needs one. Simply do not mistake it for a marketing plan, and do not permit anybody to bill you as though it were one.
