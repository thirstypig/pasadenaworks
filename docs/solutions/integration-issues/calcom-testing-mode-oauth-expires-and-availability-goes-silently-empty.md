---
title: "A Google OAuth app left in Testing status expires its refresh token after 7 days, and Cal.com answers an unreadable calendar with zero bookable slots rather than an error — the booking CTA was dead for nine days"
date: 2026-09-07
category: integration-issues
component: "Cal.com (self-hosted on Railway, schedule.pasadenaworks.com) → Google Calendar OAuth client in Google Cloud project `pasadena-works-scheduling`; reached from the site via `site.bookingUrl`"
symptom: "The public booking page offered no times at all. It skipped the current month and opened on the next one, and every month answered with a dialog reading \"No availability in <month>\". The availability schedule was present and correct (Mon–Fri 09:00–12:00 America/Los_Angeles), the event type was configured and rendering its description and duration, the Cal.com service was deployed and healthy, and no error was shown to a visitor — the page simply had nothing to click."
tags: [calcom, google-calendar, oauth, refresh-token, railway, fail-closed, silent-failure, lead-loss, scheduling]
status: solved
---

## Summary

Two independent things had to be true for this to happen, and neither announced
itself.

**The credential died on a timer nobody set.** The Google Cloud project holding
the Calendar OAuth client was in **Testing** publishing status. Google expires
refresh tokens after **7 days** for any External app left in Testing —
unconditionally, regardless of whether the test user is still listed. Cal.com's
stored credential simply stopped working about a day after it was set up.

**Cal.com then failed closed, silently.** It checks the connected calendar for
conflicts before offering a time. When it cannot read that calendar, it declines
to offer any time rather than risk a double-booking — so an unreadable calendar
renders as *zero slots in every month*, which to a visitor is indistinguishable
from "completely booked". No error, no banner, no degraded mode.

The fix was to move the OAuth app from Testing to **In production**, which
removes the 7-day expiry, then reconnect the calendar.

## Why it went unnoticed for nine days

Every surface that could have reported it reported health instead:

| Surface | What it said |
|---|---|
| Railway | `Cal.com Web App` deployment `SUCCESS`, 1 replica |
| `schedule.pasadenaworks.com` | 307 to the login page — normal |
| The booking page | HTTP 200, event title, duration and description all rendering |
| The availability schedule | Present and correct — and it was never the problem |
| The site | A working "Book a call" link, styled and clickable |

The one place it *was* visible required being logged in and knowing where to
look: `/availability/troubleshoot?eventType=<slug>` names the calendar and marks
it **Not found**, and `/apps/installed/calendar` shows the destination degraded
to the literal string `undefined` — `Add events to: undefined (undefined -
…@gmail.com)`.

**The deeper failure is in the design, not the configuration.** A booking page
whose conflict calendar is unreadable is in a state its operator would certainly
want to know about, and Cal.com renders that state as an ordinary empty
calendar. Failing closed is the right call for double-booking; failing *silently*
is not. If this matters to you, monitor it externally — assert that the public
booking page offers at least one slot in the next N days — because nothing
inside the stack will tell you.

## Two wrong turns worth recording

**"The test user lapsed" was wrong.** An earlier note in this project recorded
that Testing-mode *test-user access* can lapse after 7 days, so the first
hypothesis was a missing test user. The Audience tab showed the test user
present and correct. The real mechanism is not about test-user membership at
all — it is the refresh token, and it expires for Testing-mode apps whether or
not the user is still listed. Re-adding a test user would have fixed nothing and
looked like a plausible attempt.

**The Cal.com login and the connected calendar are different Google accounts,
and confusing them cost an hour.** Signing in to Cal.com with the *calendar's*
address failed, and its "Forgot password" sent nothing — Cal.com will not
disclose that an address has no account, so silent non-delivery looks exactly
like the SMTP outage this project had already fixed once. Chrome had a saved
credential under the wrong address, marked "Last used", which made the wrong
account look right.

**Railway's own logs settled both questions in one call**, and should have been
the second step rather than the fifth. Any `api_book_event` line carries the
answer to both:

```
"organizer": { "email": "<the Cal.com account>", "username": "pasadenaworks" }
"destinationCalendar": [{ "primaryEmail": "<the calendar account>", … }]
```

Those same logs also dated the breakage precisely — `EventManager.create
failure … "appName":"Google Calendar","success":false` with
`errorCode: "BookingCreatingMeetingFailed"` — showing bookings had been failing
since **2026-08-29**, not since the date the 7-day theory implied. Two test
bookings made in that window had silently reached no calendar at all.

## The fix

1. Google Cloud → the project holding the OAuth client → **Audience** →
   **Publish app** (Testing → In production). This is what removes the 7-day
   expiry. The app stays unverified, so the consent screen warns "Google hasn't
   verified this app" — click through Advanced; that is expected for Calendar
   scopes and is not a blocker. Reversible via "Back to testing", which
   reinstates the expiry.
2. Cal.com offers **no in-place reconnect** — only Disconnect, then a fresh
   install. Removing an already-broken connection loses nothing.
3. Reconnect, choosing the intended Google account deliberately. The account
   chooser is where this goes wrong: it is easy to grant from whichever account
   the browser happens to be signed into.
4. Set the destination calendar and the conflict-checking toggles, which do not
   survive the disconnect.

## How to tell it is fixed

Not by the absence of an error — there was never an error. Load the public
booking page and confirm **real times render**, then check that the pattern
differs across days:

```
Tue 08 → 9:00, 9:30
Tue 15 → 9:00, 9:30
Thu 17 → 9:30, 10:30, 11:00, 11:30
```

Slots varying by day prove Cal.com is reading genuine free/busy data. An
all-or-nothing pattern would mean it is applying the schedule blindly, which is
the same shape as the broken state.

Note that enabling conflict-checking on personal calendars really does remove
business slots — that is the feature working, not a regression.

## Generalise

- **A self-hosted integration that authenticates fine and dies about a week
  later is a Testing-mode refresh-token expiry until proven otherwise.** Check
  publishing status before touching credentials or config.
- **`SERVER_URL`-style config is a red herring for anything request-derived**,
  and publishing status is a red herring for anything about *scopes*. Match the
  symptom's shape to the mechanism's shape: a timer-shaped failure needs a
  timer-shaped cause.
- **When a system fails closed, ask what it shows the operator.** Failing closed
  plus failing silently is how a conversion path stays dead for nine days on a
  site whose owner checks it regularly.
