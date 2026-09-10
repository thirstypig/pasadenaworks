---
title: Switching EHR without losing your schedule
description: 'The clinical records usually survive a migration. The appointment book, the recall list and the balances are where practices actually get hurt.'
pubDate: 2027-05-10T00:00:00.000Z
pillar: consulting
targetKeyword: switching ehr systems small practice
author: Pasadena Works
tags:
  - healthcare
  - business strategy
draft: true
locale: en
translationKey: switching-ehr
slug: switching-ehr-without-losing-your-schedule
---

> **TL;DR** — Assume the clinical notes will migrate in some form and that the schedule, the recall list and the outstanding balances will not. Pick a cutover date in your quietest month, stop booking into the old system some weeks before it, and keep read-only access to the old system for longer than anybody thinks necessary. If your outgoing vendor obstructs the export, understand that certified systems are required to support an export of electronic health information and that obstruction of access has its own federal name.

Most practices switch systems for a reason that is entirely valid and slightly beside the point: support stopped being responsive, a price rose sharply, or a merger changed the product. The switch itself is then treated as a data problem, which is the part vendors talk about, while the damage almost always lands somewhere else.

## The records are not what breaks

Clinical documentation usually survives, because it is what everybody focuses on and what the migration is scoped around.

What routinely fails to arrive is the operational layer: future appointments, the recall and reminder list, outstanding patient balances, insurance eligibility notes, the internal flags your staff invented and rely on, and document attachments that turn out to be stored differently than anybody assumed. None of that is clinical, all of it is how the practice actually runs, and it is frequently outside the quoted migration scope.

Ask for the migration scope in writing, item by item, and read it looking for what is absent rather than what is present. The list of what is *not* coming across is the useful document, and it is the one you will have to plan around.

## Your leverage is larger than it feels

Practices approach an outgoing vendor apologetically, which is unnecessary, because the regulatory environment is more helpful here than most people realise.

Certification under the federal program includes a criterion for exporting electronic health information, so a certified system is expected to be able to produce your data rather than to hold it. Separately, practices that obstruct or unreasonably interfere with access to electronic health information can be engaged in what the rules call information blocking, and that framework exists precisely because this situation was common enough to legislate about.

None of that means you should open with a legal threat, which mostly slows things down. It means that a vendor telling you your data cannot be extracted, or quoting an implausible figure to extract it, is making a claim worth questioning rather than a fact worth accepting.

## Protect the schedule specifically

The appointment book is where a bad cutover becomes visible to patients, and it deserves its own plan.

Choose a cutover date in your quietest month, which for most practices is not December and not the start of a plan year. Some weeks before that date, stop booking future appointments into the old system and book them into the new one instead, so that the new system accumulates the forward schedule naturally rather than through a migration nobody trusts. Print the forward schedule on paper the week before cutover, because a printed list is the thing that lets a front desk keep working during the afternoon when something is wrong.

Then expect a productivity dip regardless. Reducing the schedule for the first week, and building in longer appointment slots, costs less than the alternative of running a full clinic on an unfamiliar system.

## Keep the old system alive longer than feels necessary

Retain read-only access to the outgoing system for a defined period, and negotiate that period before you sign anything with the new vendor.

The reason is that gaps surface slowly. A patient returns after four months, somebody needs a document from two years ago, a billing question arrives about a claim from before the switch, and the migrated record turns out to have lost the attachment that answers it. Read-only access converts each of those from an incident into an inconvenience.

Also take your own export and keep it yourself, in whatever structured format is available, independent of either vendor. It costs storage and it removes your dependence on a relationship that has, by definition, just ended.

## Train before, not during

The single most common avoidable failure is treating training as something that happens in the first week of live use.

Staff should have completed their own five most common workflows in the new system before go-live, and somebody in the practice should be designated as the person who knows the answers, because a room of people each independently discovering the same thing is how a fortnight disappears. If the vendor's training is a recorded video, supplement it, since a recording cannot answer the question your practice actually has.

## The question worth asking before any of this

Before committing, establish honestly whether the problem is the software or the support, since the two produce identical frustration and have different solutions.

If the system does what you need and the vendor stopped answering, a switch may reproduce that experience in year two with a different logo, because responsive support is a stage most vendors pass through rather than a permanent property. If the system genuinely cannot do what your practice now does, that is a real reason to move, and the plan above is how to move without the patients noticing.

**Sources:** [ONC, Electronic Health Information Export test method](https://www.healthit.gov/test-method/electronic-health-information-export) · [ONC, Information Blocking](https://www.healthit.gov/topic/information-blocking)
