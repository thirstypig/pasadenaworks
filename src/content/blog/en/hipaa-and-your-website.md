---
title: 'HIPAA and your website: the parts that trip people up'
description: 'A federal court struck down the most aggressive reading of the tracking-pixel rules in 2024. That changed less than vendors claim, and less than practices hope.'
pubDate: 2027-03-29T00:00:00.000Z
pillar: websites
targetKeyword: hipaa website tracking rules
author: Pasadena Works
tags:
  - healthcare
  - websites
draft: true
locale: en
translationKey: hipaa-website-traps
slug: hipaa-and-your-website
---

> **TL;DR** — In June 2024 a federal court vacated the part of the government's online-tracking guidance that treated an IP address plus a visit to a public health page as protected information, finding the agency had acted "in clear excess" of its authority, and the government withdrew its appeal that August. The rest of the guidance stands, anything behind a patient login was never in question, and the Federal Trade Commission runs a separate breach rule that reaches organizations HIPAA does not. The practical answer did not change much: know what your site sends to third parties.

Almost everything a small practice hears about HIPAA and websites arrives from somebody selling either a remedy or a fright. It is worth separating the part that a court has actually ruled on from the part that remains a judgment call, because the two get quoted interchangeably and they are not the same.

## What the court actually decided

In December 2022 the Office for Civil Rights published a bulletin on online tracking technologies, revised in March 2024, which took an expansive view of when tracking on a hospital or practice website implicates protected health information.

The American Hospital Association sued. On 20 June 2024 the United States District Court for the Northern District of Texas vacated a specific portion of that bulletin — the part providing that HIPAA obligations are triggered where an online technology connects an individual's IP address with a visit to an unauthenticated public webpage addressing specific health conditions or providers. The court held that the agency had acted in clear excess of its authority under HIPAA in promulgating it. On 29 August 2024 the government withdrew its appeal, which made the decision final.

That is a narrower holding than the headlines suggested, and it is worth being precise about what survived it.

## What did not change

The vacated portion concerned unauthenticated public pages — the ordinary, logged-out part of a website that anybody can read.

Anything behind a patient login is a different matter entirely and was never the subject of this dispute. If a patient signs in to a portal, views results, requests a refill or messages a physician, the information generated there is exactly what the rules were written for, and a tracking script sitting on those pages is a serious problem regardless of what a court said about public pages.

The rest of the bulletin also stands. The decision struck one specific proposition, not the agency's general position that tracking technologies can implicate protected information when they transmit it to third parties.

## The rule that catches what HIPAA misses

The trap that surprises people most is that HIPAA is not the only regime in play, and a practice can be outside it and still be regulated.

The Federal Trade Commission enforces a Health Breach Notification Rule covering certain organizations handling health information that are not HIPAA-covered entities. Health apps, wellness services and various digital health products have found themselves answering to it. For a medical practice the relevant point is narrower but real: "HIPAA does not apply to this" is not the same statement as "no rule applies to this," and vendors sometimes make the first claim while implying the second.

## What this means for an ordinary practice website

The useful posture is neither the panic that was sold in 2023 nor the relief that followed the ruling, but an ordinary understanding of where your data actually goes.

Find out what third-party scripts your site loads, which is a question your web developer can answer in an afternoon and which most practices have never asked. Analytics, an advertising pixel, a chat widget, an appointment booking embed, a review carousel, a heatmap tool somebody trialled in 2021 and never removed — each of these sends something to somebody, and the total is usually larger than anyone expected.

Then apply a simple separation. Public pages describing services, hours and directions are the ordinary web, and after the 2024 ruling the aggressive reading that made routine analytics on those pages a HIPAA problem no longer stands. Pages behind a login, and any page where the URL itself reveals a condition, deserve a much more conservative approach — which in practice usually means no third-party tracking at all.

## The unglamorous items that cause actual breaches

Tracking pixels attract the attention while more mundane failures cause more trouble.

A contact form that emails patient messages to a personal address is a routine finding and a genuine exposure. So is an appointment form asking for a reason for the visit, which converts an ordinary enquiry into clinical information and sends it wherever the form sends things. So is a departed developer who still has administrative access to the site, and a signed agreement with each vendor that touches patient information — the paperwork nobody enjoys and auditors ask about first.

None of that is exciting, and it is where the real risk sits for a practice of five people.

## The honest summary

This is a subject where the law moved recently, where the movement was narrower than reported, and where anybody offering you certainty is overselling.

What holds up is unremarkable: know what your website sends and to whom, keep third-party scripts off anything behind a login, do not collect clinical detail through a general contact form, and get the vendor paperwork done. Nothing there depends on how the next case is decided, which is precisely why it is the part worth doing now.

**Sources:** [American Hospital Association, Opinion & Order in American Hospital Association et al. v. Becerra et al.](https://www.aha.org/legal-documents/2024-06-29-opinion-order-american-hospital-association-et-al-v-xavier-becerra-et-al) · [Federal Trade Commission, Health Breach Notification Rule](https://www.ftc.gov/legal-library/browse/rules/health-breach-notification-rule)
