---
title: Accessibility overlay widgets did not stop the lawsuits
description: 'Filings rose 27% in 2025 while overlay adoption grew. The mechanical reason is simpler than the argument: the failures that dominate the data are not the kind a script can decide.'
pubDate: 2027-09-06T00:00:00.000Z
pillar: websites
targetKeyword: do accessibility overlays work
author: Pasadena Works
tags:
  - accessibility
  - websites
draft: true
locale: en
translationKey: overlays-did-not-work
slug: accessibility-overlays-did-not-stop-the-lawsuits
---

> **TL;DR** — Federal website accessibility filings rose 27% in 2025 while overlay products were being sold harder than ever, which is correlation rather than proof and is still worth noticing. The mechanical argument is stronger: of the six failure types that make up 96% of everything WebAIM detects, several cannot be resolved by a script, because they require knowing what an image depicts or what a button does. And the Department of Justice has no standard against which anything could be certified in the first place.

Overlays are sold on a specific promise — add one line of script and the accessibility problem is handled — and it is worth examining that promise against the published record rather than against the marketing of either side.

## What the numbers do and do not show

Plaintiffs filed **3,117** website accessibility lawsuits in federal court in 2025, up 27% on the 2,452 filed in 2024, during a period when overlay products were widely marketed and widely adopted.

That is correlation and it is not proof, and anybody presenting it as proof is overreaching in the other direction, and filing volumes move for many reasons — plaintiff firm activity, jurisdictional rulings, sheer fashion — and attributing the change to any single cause would be the same error the overlay vendors make.

The stronger argument against them is not a statistical one at all, but a mechanical one.

## Why a script cannot do most of this

WebAIM's 2026 survey of one million home pages found six failure types accounting for **96%** of all detected errors, and take them in order and ask what a script could do about each.

**Low contrast text**, on 83.9% of pages, is a design decision, and A script can override colors, and doing so either breaks the design or produces a variant nobody chose. It has no way of knowing which of those grays were deliberate design choices.

**Missing alternative text**, on 53.1%, requires knowing what the image depicts and why it is on the page, and automated description has improved considerably and it still cannot know that the photograph is your storefront rather than a generic building, which is the entire informational content.

**Missing form labels**, on 51%, requires knowing what the field is for, and A script can guess from placeholder text when placeholder text exists, and when it does not, it has nothing to work from.

**Empty links and empty buttons**, on 46.3% and 30.6%, are controls with no accessible name, and the name is the thing that was never written down, and there is nowhere for a script to read it from.

**Missing document language**, on 13.5%, is the one item on the list a script genuinely can fix, and it is the least consequential of the six.

That is the whole case, and five of the six failures that dominate the data are missing *information*, not missing *code*, and adding a layer on top does not supply information that was never there.

## The certification claim, separately

Some overlay marketing implies a compliance outcome, and that claim fails on different grounds entirely.

The Department of Justice states that it "does not have a regulation setting out detailed standards" and that businesses "can currently choose how they will ensure" their online offerings are accessible, describing WCAG as "helpful guidance". There is no federal standard against which a product could certify you, so a badge asserting compliance is a marketing artifact regardless of what the underlying product does.

## What overlays are actually good for

This is not an argument that the products do nothing, and pretending otherwise would be the mirror image of the overselling.

They provide user-preference controls — text sizing, spacing, contrast modes, a reading guide — and some people genuinely use those, and offering them is a small courtesy. The error is not in having one; it is in treating it as the work rather than as a supplement to it.

## What to do instead, and what it costs

Fix the six things directly, which is a week of unremarkable effort rather than a subscription.

Contrast is a handful of theme values, and alternative text is written by whoever knows what the pictures are, as pages are touched for other reasons. Form labels are a markup change, and empty links and buttons need names typed in once. Document language is a single attribute on a single line of markup.

Then keep a dated record of what was done, and that record is worth more than a badge if anything ever arrives, because it describes work rather than asserting a status nobody is empowered to confer.

**Sources:** [WebAIM, The WebAIM Million (2026 report)](https://webaim.org/projects/million/) · [ADA.gov, Guidance on Web Accessibility and the ADA](https://www.ada.gov/resources/web-guidance/)
