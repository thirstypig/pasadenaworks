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

> **TL;DR** — The "Translate this page" widget helps a human visitor read your site in their language. It does nothing for search rankings, because Google never sees the translated text as a real page — it's just JavaScript swapping words in the visitor's browser after the fact. If you want to show up when someone searches in Spanish or Chinese, you need actual translated pages at their own URLs, with hreflang tags telling Google they exist.

Someone asks us this almost every time we bring up multilingual SEO: "Don't we already have that? There's a Translate button in the corner." No. That button is doing something real for the person clicking it, and nothing at all for Google. Those are two different jobs, and the widget only does one of them.

## What the widget actually does

A Google Translate widget — the little flag dropdown, or the "Translate this page" banner Chrome shows automatically — runs entirely in the visitor's browser, after your page has already loaded. Your server sends the same English HTML it always sends. JavaScript in the browser then swaps the English words for Spanish or Chinese ones, on the fly, on that visitor's screen only.

Nothing about your site changed. There's no new URL. There's no file on your server with the translated words in it. The translation exists for exactly as long as that one browser tab is open, and it evaporates the moment it closes.

Googlebot doesn't sit there like a person, clicking a translate dropdown and waiting for the page to redraw. It requests your page, and what gets indexed is the HTML that came off your server, in whatever language you actually wrote it in. The Spanish or Chinese text a visitor sees through the widget never gets crawled, never gets stored, and never gets matched against a Spanish or Chinese search query — because as far as Google's index is concerned, that translated text doesn't exist anywhere.

## Why a search engine needs a separate page, not a costume on top of the old one

Search engines rank URLs, not visual appearances. When someone searches "diseño de páginas web Pasadena," Google is trying to match that query against a page whose actual indexed content is in Spanish — the words on the page, in Google's database, need to be Spanish words. A widget that repaints English content into Spanish for one visitor's browser never puts Spanish words into Google's database. There's nothing to match against.

That's the entire difference between a real translated page and a translate plugin. A real Spanish page lives at its own URL — `/es/` for a page like this one. The HTML that comes off the server at that address is Spanish, written by a person, sitting in a file, indexed by Google as its own page with its own title tag, its own meta description, and its own ranking history. It can outrank a competitor's English page for a Spanish query. It can show up in Spanish "near me" results. A translate widget can do none of that, because there's no separate thing there to link to, rank, or measure.

The other piece, and the one people skip even when they do build real translated pages, is `hreflang`. That's the tag that tells Google "this English page and this Spanish page are the same content in two languages — show whichever one matches the searcher." Without it, Google might index your `/es/` page just fine but never realize it should be served to Spanish-language searchers instead of the English one. Real translated URLs and correct hreflang tags are a package deal — one without the other leaves value on the table.

## What this actually costs to fix

Building real translated pages costs real time or real money — someone has to write genuine Spanish or Chinese copy, not a machine translation of the English, because a fluent reader can tell the difference. It also means maintaining more pages going forward: when the English page changes, someone has to update the translated ones.

If your business gets meaningful search traffic in another language — check Google Search Console's country and query data before assuming you don't — that cost is usually worth it, because it's the only path that shows up in results at all. If you get little to none, don't build it just to look thorough. A translate widget is fine as a courtesy for the occasional visitor who needs it. Just don't mistake it for a marketing plan, and don't let anyone bill you as if it were one.
