---
title: "`:global()` in a plain stylesheet is dead CSS — the browser discards the whole rule"
date: 2026-09-04
category: ui-bugs
component: "src/styles/global.css"
symptom: "A CSS rule written with `:global(...)` in a plain .css file never applies. Every Chinese page rendered at line-height 1.600 instead of the intended 1.800, for months, while CLAUDE.md documented the rule as a working fix."
tags: [astro, css, scoped-styles, cjk, i18n, silent-failure, lightningcss, dead-code, documentation-drift]
status: solved
---

## Summary

`src/styles/global.css` contained:

```css
:global(html[lang^='zh']) body {
  line-height: 1.8;
}
```

It never did anything. `:global(...)` is not CSS — it is an Astro compiler
construct — and in a plain stylesheet nothing rewrites it, so the text reached
the browser verbatim. The browser cannot parse `:global` as a pseudo-class, and
because any error anywhere in a selector invalidates the entire statement, it
discarded **the whole rule, declarations included**, then resumed parsing
cleanly at the next one.

Chinese glyphs fill the em box and have no descenders, so CJK text set at Latin
line spacing reads cramped. This rule existed precisely to fix that, on a site
where Chinese is half the content strategy. Measured in Chromium on
`/zh-hant/`: `lineHeight / fontSize = 1.600`, not `1.800`.

The rule was dead from the day it was written. `CLAUDE.md` cited it as a working,
shipped gotcha fix the entire time.

## The mechanism, precisely

**The transform is keyed on the `<style>` block being SCOPED — not on the file
being `.astro`.** This distinction is the whole finding, and getting it wrong
leads directly to the wrong fix.

Verified by driving the installed compiler (`@astrojs/compiler-rs@0.4.0`)
directly with the same options `astro/dist/core/compile/compile.js` passes:

| Style block | `:global(.g) .d` becomes |
|---|---|
| `<style>` (scoped) | `.g .d[data-astro-cid-…]` — stripped correctly |
| `<style is:global>` | `:global(.g) .d` — **verbatim** |
| `<style define:vars={…}>` | `.g .d[data-astro-cid-…]` — stripped |
| `<style is:global define:vars>` | `:global(.g) .d` — **verbatim** |

So `:global()` is equally dead inside `<style is:global>` **in an `.astro`
file**. Anyone who reads "it only works inside an `.astro` file" will reach for
`is:global` as the fix and reproduce the bug in a new location.

The stripping happens in the native binary, not in a Vite plugin and not in
PostCSS. `compile.js` is reached only via `vite-plugin-astro`, for `.astro`
modules; a `.css` file imported from a layout goes straight to Vite's CSS
pipeline and never enters that path.

### What the browser does

Measured in Chrome by injecting six rules and reading back `document.styleSheets`
— six in, four survived:

| Rule | Outcome |
|---|---|
| `:global(html[lang^='zh']) body {…}` | **dropped** |
| `.list-a, :global(.list-b) {…}` | **dropped entirely** — `.list-a` unstyled too |
| `:is(.is-a, :global(.is-b)) {…}` | kept, rewritten to `:is(.is-a)` |
| `:where(html[lang^='zh']) .x {…}` | kept, applies |

A selector **list** is strictly worse than a single selector: one invalid member
kills every sibling. `:is()` and `:where()` are the exception, because they take
forgiving selector lists.

The normative basis, verbatim, CSS 2.2 §4.1.7:

> "CSS 2.2 gives a special meaning to the comma (,) in selectors. However, since
> it is not known if the comma may acquire other meanings in future updates of
> CSS, the whole statement should be ignored if there is an error anywhere in the
> selector, even though the rest of the selector may look reasonable in CSS 2.2."

Selectors Level 4 §3.9 is the modern home for this rule, but its text could not
be retrieved to quote, so cite CSS 2.2 §4.1.7 and MDN's *Selector list* page
rather than paraphrasing Selectors-4 from memory.

## Why it survived for months

Most of the answer is ordinary. One part is not, and it is the useful part.

- **`npm run build` exits 0** — as it does for the duplicate-slug warning this
  repo already promotes to a failure.
- **`npm run typecheck` never reads CSS.** `astro check` covers `.astro` and
  `tsc` covers `.ts`; a stylesheet is in neither program.
- **No test opened `src/styles/global.css`.** All 11 test files at the time
  covered TypeScript logic or markdown content.
- **A linter would probably not have caught it.** The text is *syntactically
  valid CSS* — a selector naming a pseudo-class no browser implements, not a
  parse error. Worse, stylelint's `selector-pseudo-class-no-unknown` treats
  `:global` as known, because CSS Modules made it so.
- **Looking at the page would not have caught it.** CLAUDE.md already requires
  building and visually verifying CSS changes. The difference between 1.6 and 1.8
  line-height on Chinese text is a few pixels with nothing to compare against —
  you would have to open devtools and read the *computed* value, having already
  suspected the rule.
- **Code review would not have caught it.** The line looks right. `:global(...)`
  is a real Astro construct used correctly 16 times in `src/layouts/Post.astro`
  in this same repo. A reviewer pattern-matching on familiarity sees a construct
  they have approved before. The bug is not in the line; it is in *which file the
  line is in*.
- **CLAUDE.md actively made it worse.** It documented the rule as a working fix,
  so anyone wondering about CJK line-height read the gotcha, believed it handled,
  and moved on.

### The part that was not silent

**The build warned on every single run:**

```
[WARN] [vite] [lightningcss minify] 'global' is not recognized as a valid
pseudo-class. Did you mean '::global' (pseudo-element) or is this a typo?
```

This was the surprise of the investigation, and it inverts the lesson. The
failure mode was not "no signal existed." It was **a correct, specific warning
printed on every build for months that nobody read** — including during the
session that eventually found the bug by other means.

That is exactly the shape of the duplicate-slug warning, which `ci.yml` already
handles by grepping the build log and promoting it to a failure. The same
treatment applies, and is now applied.

## The fix

Delete the wrapper. Selectors in a plain stylesheet are already global.

```css
/* before — dead */
:global(html[lang^='zh']) body { line-height: 1.8; }

/* after — live, confirmed in dist/_astro/*.css */
html[lang^='zh'] body { line-height: 1.8; }
```

Confirmed in the built CSS: `html[lang^=zh] body{line-height:1.8}`.

**Do not "fix" it with `is:global`** — see the table above. And do not reach for
`*.module.css`: CSS Modules genuinely honours `:global()` (verified — a
`.module.css` build emitted `html[lang^=zh] body{…}` correctly), which is
precisely why the construct looks plausible to a developer. It is not a remedy
here, because every non-`:global` class in the file would become a hashed local
name and break every `class="…"` in the templates.

## Prevention

Three layers now, in the order they fire:

**1. `ci.yml` promotes the build warning to a failure**, beside the duplicate-slug
check that already existed:

```yaml
if grep -q "is not recognized as a valid pseudo-class" build.log; then
  echo "::error::Unparseable CSS selector — the browser will discard the entire rule."
  exit 1
fi
```

Verified in both directions: it fires on the reintroduced bug and does not fire
on a clean build. This is the general catch — it covers *any* unrecognised
pseudo-class, not just this one.

**2. `src/styles/stylesheets.test.ts`** scans `src/styles/*.css` for constructs
that only mean something to a component compiler (`:global(`, `:local(`,
`:deep(`, `::v-deep`). It runs in `npm run test`, which gates both workflows,
so it catches the mistake before a build exists.

Two details in it are load-bearing rather than decorative:

- **Comments are stripped before matching.** The fix's own comment contains the
  literal `:global(...)`, because warning about it is the comment's purpose.
  Matching raw text fails on that warning, and the obvious way to green the suite
  would be deleting it — restoring the conditions that caused the bug.
- **A negative control asserts `Post.astro` still uses `:global()`** inside its
  `<style>` block. All 16 uses are load-bearing: `.post__body` renders markdown,
  so its child `<p>`/`<a>`/`<h2>` never carry the scoping attribute and cannot be
  reached otherwise. The cheapest way to satisfy the new check is to purge the
  construct repo-wide, and this is what stops that.

**3. An outcome check** asserts the built CSS actually contains
`html[lang^=zh]body{line-height:1.8` — the only assertion immune to the construct
changing name. It needs `dist/`, so `ci.yml` now re-runs the whole suite after
the build rather than naming one file, which also protects the next
dist-dependent test somebody adds.

### A general dead-CSS checker would be overreach

Considered and rejected. The browser does not tell you what it discarded;
lightningcss already drops what it cannot parse. Reimplementing "what will a
browser discard" means embedding a selector grammar and keeping it current with
`:has()`, `@container`, `@layer`, `color-mix()` — get it slightly wrong and you
block a legitimate modern feature. And "selector matches no element" is a much
weaker signal: `html[lang^='zh'] body` matched nothing before the Chinese pages
existed, and state-dependent selectors (`:hover`, `[data-theme='dark']`) make
static matching unreliable exactly where CSS bugs live.

A named-needle list has a zero false-positive rate by construction and grows one
line at a time when a new instance is found. That is the right size.

## The reverse trap

`:where()` is fine in a plain stylesheet but is **not** special-cased by Astro's
scoper. Moving `:where(html[lang^='zh']) .x` *into* a scoped `<style>` block
produces:

```css
[data-astro-cid-…]:where(html[lang^=zh]) .x[data-astro-cid-…] { … }
```

The scope attribute lands on `<html>`, which never carries it — so the rule
matches nothing. Same silence, opposite direction. Worth knowing before moving a
lang-scoped rule the other way.

## Related

- [Astro dual-purpose route's bare `else` broke silently when a third `kind` was added](../logic-errors/dual-purpose-route-bare-else-broke-on-third-kind.md) — the same "valid code, no error, wrong result" shape, in the same codebase
- [Tina collections indexed zero documents because `match.include` already gets the format appended](../integration-issues/tina-match-include-appends-the-format-and-matches-nothing.md) — the closest cousin: a construct that means one thing in one context and nothing in another, with no error either way, and an empty result indistinguishable from a correct one
- [Tina wrote every Chinese post to `<locale>/.md`](../integration-issues/tina-slugify-strips-cjk-and-collides-filenames.md) — another CJK-specific failure that ASCII-only checking could not see
- `CLAUDE.md` § *Gotchas already found in this codebase* — corrected in the same
  change; it had asserted this rule worked
- Astro styling docs: https://docs.astro.build/en/guides/styling/ — documents
  `:global()` as working "inside of an Astro component". It never claims it works
  in a plain stylesheet, and never warns that it does not. That gap is the bug.

## Postscript: the pattern this belongs to

Four defects fixed in the same batch shared one shape — **code that stopped being
true, or was never true, while its documentation kept asserting it**:

- this rule, dead while CLAUDE.md called it a working fix
- a honeypot field rendered but never read by the handler, and misnamed so
  Formspree ignored it too
- `readability.mjs`'s header describing a runaway-sentence guard that did not exist
- `ci.yml` claiming a duplicate-slug check protected the Tina path, on which it
  never ran

One more surfaced while writing *this document*: removing the now-obsolete
hero-underline override left `global.css`'s comment pointing at it — a stale
reference created one commit earlier, inside the very block documenting a rule
that had itself been dead for months.

The generalisable rule is not "write better comments." It is that **a comment
asserting a mechanism is not evidence the mechanism runs**, and the cheap
counter is to make the assertion executable: a test, or a grep in CI, that fails
when the claim stops being true.
