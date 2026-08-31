---
title: "Scheduled publishing on a static site: a date filter is only half the feature (and filtering the listing alone leaks URLs to Google)"
date: 2026-08-31
category: logic-errors
component: "src/utils/blog.ts (getPostsByLocale, getTranslationsFor) + .github/workflows/deploy.yml — Astro blog on GitHub Pages"
symptom: "CONTENT-PLAN.md described a 90-day publishing schedule, but every non-draft post was public the moment it merged — the live blog led with an article datelined 2027-01-04, four months in the future, and eleven posts carried future dates. Nothing in the codebase compared pubDate to the current date; only a `draft` boolean gated visibility."
tags: [astro, static-site, github-pages, github-actions, scheduled-publishing, content-collections, getstaticpaths, sitemap, seo, hreflang, cron]
status: solved
---

## Summary

A content schedule that exists only in a planning document is not a schedule.
This blog had 20 posts with staggered `pubDate`s and a `draft` flag, and the
`draft` flag was the *only* thing gating visibility — so the "90-day schedule"
had actually published itself all at once, leaving future-dated articles live.

Fixing it needed **three** things, and only the first is obvious:

1. Gate on `pubDate` as well as `draft`.
2. Gate it in the **shared data function**, not the page listing — the same
   function backs `getStaticPaths`, so filtering the listing alone would hide
   posts from readers while still building their pages and listing them in
   `sitemap-index.xml`.
3. Add a **cron trigger**, because a static site has no clock. Without it the
   filter is correct and the feature still never happens.

Traps 2 and 3 both fail silently — the build succeeds and the code reads right.

## Symptom

```bash
$ curl -s https://pasadenaworks.com/blog/ | grep -o '<time datetime="[^"]*"' | head -3
<time datetime="2027-01-04T00:00:00.000Z"
<time datetime="2026-12-14T00:00:00.000Z"
<time datetime="2026-12-07T00:00:00.000Z"
```

The blog's newest post was datelined four months ahead. Eleven of fifteen
published posts were future-dated and publicly reachable.

## Root cause

The only visibility gate was `draft`:

```ts
const posts = await getCollection(
  'blog',
  ({ data }) => !data.draft && data.locale === locale
);
```

`pubDate` was used for **sorting only**. Astro has no built-in notion of
scheduled publishing; a date field is inert metadata until something compares it
to `Date.now()`. Two mechanisms were half-applied — five posts were held back
with `draft: true` while eleven equally-future ones were not — so the intent was
clear and the enforcement simply did not exist.

## Solution

### 1. Gate on the date, in the shared function

```ts
export async function getPostsByLocale(locale: Locale): Promise<BlogPost[]> {
  const now = new Date();
  const posts = await getCollection(
    'blog',
    ({ data }) => !data.draft && data.pubDate <= now && data.locale === locale
  );
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
```

**Why the placement is the whole trick.** Every consumer funnels through this
one function — the two index pages, `rss.xml.js`, and critically the
`getStaticPaths` of both post routes (`/blog/[...slug].astro` and
`/[locale]/[section]/[service].astro`). Because `getStaticPaths` is gated, a
future-dated post gets **no page generated at all**, so it also gets no sitemap
entry.

Had the filter gone in the index template instead, the result would have been
strictly worse than the original bug: invisible to human readers, still built,
still submitted to Google via `sitemap-0.xml`. An unlinked page is not a hidden
page.

### 2. Apply the same filter to translation alternates

```ts
const now = new Date();
const all = await getCollection(
  'blog',
  ({ data }) => !data.draft && data.pubDate <= now
);
```

`getTranslationsFor()` uses a *separate* `getCollection` call to build `hreflang`
alternates. Left unfiltered, a live English post whose Spanish sibling is still
future-dated would emit an alternate pointing at a page that no longer builds —
a 404 alternate, which this project's hard rule #1 forbids outright.

### 3. Give the static site a clock

```yaml
on:
  push:
    branches: [main]
  # Scheduled publishing: getPostsByLocale() in src/utils/blog.ts only builds
  # posts whose pubDate has arrived, so a post dated in the future needs a
  # rebuild ON that date to appear. GitHub Pages is static — without this cron
  # nothing would ever trigger that build and the post would stay invisible.
  # 13:00 UTC ≈ 6am Pacific, so a post dated today is live by breakfast.
  schedule:
    - cron: '0 13 * * *'
  workflow_dispatch:
```

**This is the half that isn't in the code.** The filter runs at build time and
the deploy only ran `on: push`. A post dated 2026-09-07 would have sat invisible
indefinitely — correct filter, passing tests, feature never happens. The daily
build is what turns the date into an event.

⚠️ **GitHub disables scheduled workflows after 60 days without repository
activity.** Regular commits keep it alive; a long quiet stretch silently pauses
scheduled publishing.

## Verification

Test-first, with the new-behavior tests watched failing before implementing
(7 added, 44 → 51 passing). The unit tests drive the real predicate by having
the mocked `getCollection` apply the filter blog.ts builds:

```ts
function collectionOf(entries: Fixture[]) {
  vi.mocked(getCollection).mockImplementation((async (
    _collection: string,
    filter?: (e: Fixture) => boolean
  ) => (filter ? entries.filter(filter) : entries)) as never);
}
```

Then checked the built output rather than trusting the tests:

| Check | Result |
|---|---|
| Pages built | 75 → 64 (the 11 future-dated posts) |
| `dist/blog/<future-post>/index.html` | absent |
| `dist/blog/<past-post>/index.html` | present |
| `sitemap-0.xml` grep for future slugs | no matches |
| `rss.xml` newest `pubDate` | today, not 2027 |
| hreflang regression (`grep` per CLAUDE.md) | unchanged — 0 alternates on untranslated pages, 4 + x-default on translated |

## Prevention

**Scheduled publishing on any static host is two mechanisms, not one.** A date
filter and a build trigger. If you can only remember one thing: after
implementing the filter, ask *"what causes a build to run on that date?"* On
Netlify/Vercel that is a scheduled build or cron function; on GitHub Pages it is
a `schedule:` trigger in the workflow.

**Put the gate in the shared data function, never the template.** The test is:
does this filter also govern `getStaticPaths`? If not, you are hiding links
while still publishing URLs — worse than doing nothing, because the sitemap
actively advertises them.

**Grep for every consumer before changing a shared query.** `getTranslationsFor`
had its own `getCollection` call and would have been missed by anyone editing
only the function they came for. One `grep -rn getCollection src/` found both.

**A build-time filter reads the build machine's clock**, which is why the
adjacent date-rendering bug (`toLocaleDateString` with no `timeZone`) mattered
here — see [the same commit's second fix](../../../src/utils/blog.ts) pinning
display dates to UTC. A UTC runner and a Pacific laptop disagreed by a day.

### Known cost: future-dated content is unverifiable locally

The gate hides future posts from the build, so a translation dated next month
cannot be render-checked at all. Verifying one means temporarily back-dating,
building, reading the output, and restoring.

**That workaround bit us the same day.** A backup loop written as
`for f in $FILES` silently did nothing under zsh (which does not word-split
unquoted parameters), so the "restore" was a no-op and four files stayed
back-dated — with a green build and correct-looking output. If you do this,
verify the restore explicitly:

```bash
git diff --quiet <tracked-file> && echo "restored ✓" || echo "STILL MODIFIED"
```

A `--preview-all` env flag that bypasses the gate would remove the whole dance
and is worth adding if this recurs.

### Regression check

```bash
npm run build
# no future-dated post should have a page or a sitemap entry
grep -rl 'datetime="20[3-9][0-9]' dist/ && echo "LEAK" || echo "OK"
```

## Related

- [Astro dual-purpose route's bare `else` broke on a third `kind`](./dual-purpose-route-bare-else-broke-on-third-kind.md) — the other place a shared blog abstraction failed silently when extended
- `CLAUDE.md` hard rule #1 (never claim a translation that doesn't exist) — why `getTranslationsFor` needed the same filter
- `CONTENT-PLAN.md` — the schedule this change finally made real
