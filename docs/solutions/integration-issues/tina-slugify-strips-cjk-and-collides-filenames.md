---
title: "Tina wrote every Chinese post to `<locale>/.md`, so the second one overwrote the first"
date: 2026-09-01
category: integration-issues
component: "tina/utils.ts — `slugifyBlogFilename`, used by the blog collection's `ui.filename.slugify`"
symptom: "A blog post created in the Tina admin with a Chinese title produced no visible file. The post appeared to save successfully. On disk it had landed at `src/content/blog/zh-hant/.md` — a hidden dotfile with an empty basename — and creating a second Chinese post silently overwrote it. Spanish titles with accents produced mangled names like `necesito-una-p-gina-web-si-tengo-instagram`"
tags: [tinacms, cms, i18n, cjk, unicode, silent-failure, data-loss, test-coverage]
status: solved
---

## Summary

`slugifyBlogFilename()` derived a new post's filename from its **title** by
lowercasing and replacing every run of non-`[a-z0-9]` characters with a hyphen.
Every Han character is outside that class, so a Chinese title reduced to an
empty string and the file was written to `<locale>/.md`.

The first Chinese post created through the admin became a hidden dotfile. The
second one, with a completely different title, resolved to the same path and
silently replaced it.

Fixed by deriving the filename from the `slug` frontmatter field — which is
already required, already ASCII, and already enforced unique across every
locale — instead of from the title.

The bug was present from the day the Tina blog collection was added. It never
fired because the site's Chinese posts have always been authored as files, and
`tina/utils.test.ts` contained seven cases, all ASCII English.

## How it surfaced

Not from a bug report. It was found during a review of PR #9, which tripled the
site's CJK content, by an agent asked whether an agent authoring posts had
parity with a human using the admin. The answer inverted the usual concern:
**an agent writing markdown files produced correct Chinese posts more reliably
than the owner using the CMS.**

Nobody had hit it yet only because no Chinese post had ever been created through
Tina. The next one would have been the first.

## Root cause

`tina/utils.ts`, as it stood:

```ts
export function slugifyBlogFilename(values: BlogValuesLike | undefined): string {
  const locale = values?.locale || 'en';
  const base = (values?.title || 'untitled')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')   // ← every CJK character matches this
    .replace(/(^-|-$)/g, '');
  return `${locale}/${base}`;      // ← "zh-hant/" when base is ''
}
```

`[^a-z0-9]` is a *deny* list expressed as "anything that is not ASCII
alphanumeric." For Latin text that reads as "replace punctuation and spaces."
For Chinese it means **replace everything**. The trailing
`.replace(/(^-|-$)/g, '')` then strips the resulting hyphens, leaving an empty
string, and the template produces a path ending in a bare slash.

Run against real titles from the repo:

```
"zh-hant/"                                       <- 怎麼開口請客戶留評價，又不尷尬
"zh-hant/"                                       <- 網站流量掉下來了，該怎麼處理
"zh-hans/"                                       <- 怎么开口请顾客留好评，还不尴尬
"es/necesito-una-p-gina-web-si-tengo-instagram"  <- ¿Necesito una página web si tengo Instagram?
"en/how-to-ask-customers-for-reviews"            <- How to ask customers for reviews
```

Two distinct failures in one line. CJK collapses to nothing — silent data loss.
Accented Latin degrades — `página` becomes `p-gina`, cosmetic but wrong, and it
affects most Spanish posts.

**Why nothing caught it.** `tina/utils.test.ts` had seven cases: punctuation,
quotes, a missing title, a missing locale, mixed case. All ASCII English. The
function was well tested against the inputs its author had in mind, on a site
that publishes in four languages, two of which have no ASCII at all.

## The fix

Derive the filename from the field that is already correct.

```ts
/** Lowercase ASCII, hyphen-separated. Anything outside [a-z0-9] is a
 *  separator — which is why this must never be handed a CJK title. */
function asciiSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function slugifyBlogFilename(values: BlogValuesLike | undefined): string {
  const locale = values?.locale || 'en';
  const base =
    asciiSlug(values?.slug ?? '') || asciiSlug(values?.title ?? '') || 'untitled';
  return `${locale}/${base}`;
}
```

`slug` is the right source and it was there the whole time:

- `required: true` in the collection schema, so it is always populated
- already ASCII by convention — it is the actual URL segment
- already enforced unique across *all* locales by
  `src/utils/blog-content.test.ts`
- decoupled from the title on purpose, because each language gets its own
  keyword-appropriate slug rather than a translation of the English one

The title fallback preserves the old behaviour for an English post typed before
the slug field is filled in, and `'untitled'` guarantees the basename is never
empty — the specific failure that caused the overwrite.

**A consequence worth knowing:** the filename is now coupled to `slug`, so a
slug collision would collide two files on disk as well as dropping one from
Astro's collection. That makes the global slug-uniqueness test more
load-bearing than it was. It is a net improvement — CJK titles previously
collided *always*, whereas slug collisions are already caught by a test — but
the coupling is deliberate rather than incidental.

## Verifying

```
zh-hant/ruhe-qing-kehu-liu-pingjia             <- 怎麼開口請客戶留評價，又不尷尬
zh-hant/wangzhan-liuliang-xiahua-zenme-chuli   <- 網站流量掉下來了，該怎麼處理
es/necesito-una-pagina-web-si-tengo-instagram  <- ¿Necesito una página web…?
```

Six cases added to `tina/utils.test.ts`: a Chinese title producing a real
filename, two different Chinese posts never colliding, accented Latin no longer
mangled, the title fallback still working, and a property-style check that the
result never ends in `/` for any input including `undefined`.

`npx tsc --noEmit --strict` clean on `tina/utils.ts`. Note that
`npx tinacms build` validates schema *shape* only and would not have caught
this — see Related.

## Prevention

**The rule that would have caught it: a test corpus must contain a sample from
every locale the product ships in.** Not "write more tests" — the function had
seven. The gap was that all seven came from one writing system on a site that
publishes in four languages across three writing systems. When a project adds a
locale, its test fixtures are part of what needs adding.

**Prefer an allow-list you can reason about over a deny-list you cannot.**
`[^a-z0-9]` silently classifies every writing system on earth as punctuation.
If a transform must be ASCII-only, the honest version says so out loud and
refuses or falls back on non-ASCII input, rather than quietly returning
something empty.

**Derive identifiers from fields that are already constrained.** The strongest
version of this fix is not better slugification — it is noticing that a
validated, unique, ASCII field already existed and that deriving from free text
was the mistake. Look for that field before writing a transform.

**Where else this could hide in this repo:** searched, and it does not.
`[a-z0-9]` now appears in exactly one place, `tina/utils.ts`, where it runs only
as a fallback on a title. No other filename, URL, or id derivation in `src/`,
`scripts/`, or `tina/` transforms free text.

**No cheap automated check exists for the general case.** A lint rule banning
`[^a-z0-9]` would fire on legitimate ASCII-only transforms and be turned off
within a week. The test-corpus rule above is the enforceable one.

## Related

- [`tina-match-include-appends-the-format-and-matches-nothing.md`](./tina-match-include-appends-the-format-and-matches-nothing.md)
  — the other silent Tina failure. Same investigation shape: no error, no
  warning, and the only way to find it was to look at what the config actually
  produced rather than whether it parsed.

- **The pattern across all three Tina failures in this repo** — the
  `match.include` glob, the `itemProps` config that silently no-opped, and this
  one. `tinacms build` validates that the schema *parses and has the right field
  names*. It does not validate that the config *does anything*: that a glob
  matches a file, that a `ui` key is read in that context, or that a callback
  handles the inputs it will actually receive. **Any test of Tina config must
  assert on its real-world output, never on the fact that the build succeeded.**
  All three were found by checking outputs; none produced an error.

- **CLAUDE.md, the global slug-uniqueness gotcha** — now more load-bearing,
  since the filename derives from `slug`. Worth reading together with this doc.

- **CLAUDE.md, the CJK `sort`/`uniq` collation gotcha** — relevant to
  *verifying* work like this: auditing filenames or built output for duplicates
  across CJK text needs `LC_ALL=C`, or the comparison lies.

- `src/utils/blog-content.test.ts` — enforces the slug uniqueness this fix now
  depends on, and its `PAIRS` array documents why Traditional/Simplified purity
  is checked as explicit character pairs rather than Unicode ranges.
