---
status: complete
priority: p2
issue_id: 003
tags: [code-review, security, seo, structured-data]
dependencies: []
---

# JSON-LD is injected with `set:html` and `JSON.stringify` does not escape `<`

## Problem Statement

Both structured-data blocks serialize an object straight into a `<script>` tag:

- `src/layouts/Base.astro:112` — `<script type="application/ld+json" set:html={JSON.stringify(localBusinessSchema)} />`
- `src/layouts/Post.astro:72` — same shape, for `articleSchema`

`set:html` inserts raw HTML by design, and `JSON.stringify` does not escape `<`,
`>` or `/`. Any value in either schema containing the literal `</script>` closes
the JSON-LD block early; everything after it is parsed as page HTML.

Verified:

```
$ node -e "console.log(JSON.stringify({sameAs:['https://x/a</script><script>']}))"
{"sameAs":["https://x/a</script><script>"]}
```

Unescaped, straight through.

## Findings

PR #9 feeds one more value into the `Base.astro` sink — the new `sameAs` array
built from `site.social`. That particular input is a hardcoded constant in
`src/data/site.ts`, editable only by a repo commit, so it is not itself a
vulnerability.

The `Post.astro` sink is the one that deserves attention. `articleSchema` is
built from post frontmatter — `title`, `description`, `heroImage` — and
`src/content/blog` **is** a Tina collection (`tina/config.ts:64`). So that sink
is reachable from the authoring UI, not only from a commit. A `|` or a stray
angle bracket in a title is a realistic typo; `</script>` is not, but the
distance between "typo" and "breaks the page silently" is short.

Severity is P2 rather than P1 because there is no untrusted input path: no
visitor, form, or third party can reach either sink, and anyone who can edit
`site.ts` or a post can already edit the layouts. The reasons to fix anyway are
that it is one line in each file, and that the failure is silent — the build
succeeds and the page looks correct while emitting a broken script tag.

Corroborated independently by the security review agent, which reproduced it by
building with a payload and observing a live executing `<script>` in
`dist/index.html`. It also confirmed the same string in a `<title>` **is**
correctly escaped, so the gap is specific to these two `ld+json` blocks and not
a general Astro escaping problem.

## Proposed Solutions

### Option A — Escape `<` at both sinks
```js
JSON.stringify(schema).replace(/</g, '\\u003c')
```

- **Pros:** One line each, no dependency. `<` is valid JSON and JSON-LD
  parsers read it identically, so the structured data Google sees is unchanged.
  This is the conventional fix for this exact pattern.
- **Cons:** Two call sites to keep in sync; a third schema block added later
  would need to remember it.
- **Effort:** Small · **Risk:** Low

### Option B — A shared `jsonLd()` helper used by both layouts
Put the escaping in one function in `src/utils/`, call it from both.

- **Pros:** One place to be correct. A future schema block gets it for free.
  Testable in isolation.
- **Cons:** A new module for two call sites; slightly more indirection than the
  problem strictly needs.
- **Effort:** Small · **Risk:** Low

### Option C — Leave it, document the constraint
Add a comment at both sinks noting inputs must stay trusted.

- **Pros:** Zero code change.
- **Cons:** Relies on everyone reading the comment forever, including whoever
  next edits a post title in Tina. Weakest option given the fix is one line.
- **Effort:** Small · **Risk:** Medium

## Recommended Action

_(Leave blank for triage.)_

## Technical Details

- **Affected files:** `src/layouts/Base.astro:112`, `src/layouts/Post.astro:72`
- **Reachable from Tina:** `Post.astro` sink only, via post frontmatter
- **Not reachable by any visitor:** static site, no server, no user input

## Acceptance Criteria

- [ ] A `</script>` sequence in any schema value renders escaped, not literal
- [ ] Google's Rich Results Test still parses the LocalBusiness and Article
      schemas after the change
- [ ] Both sinks fixed, not just the one this PR touched
- [ ] A test covering the escaping, so a future third schema block is caught

## Work Log

- **2026-08-31** — Reported by the security review during `/ce:review` of PR #9
  with a reproduction. Independently confirmed the sink shape and the
  `JSON.stringify` behavior, and confirmed `src/content/blog` is a Tina
  collection, which is what makes the `Post.astro` sink more than theoretical.

## Resources

- `src/layouts/Base.astro:112`, `src/layouts/Post.astro:72`
- `tina/config.ts:64`

---

**RESOLVED 2026-09-01 — Option B.** `src/utils/json-ld.ts` exports `jsonLd()`,
which is `JSON.stringify` plus `.replace(/</g, '<')`, and both layouts now
call it. One place to be correct, and a future schema block gets it for free.

Verified end to end, not just by unit test: put a real `</script><script>
alert(1)</script>` payload into `site.social.instagram`, rebuilt, and confirmed
no live script tag reaches `dist/index.html` — then restored `site.ts` and
confirmed it byte-identical to HEAD. The genuine schema still parses as valid
JSON-LD with the LinkedIn `sameAs` intact.

Fixed before merging rather than after, so this publishes to a public repo as a
closed finding rather than an open advisory with a reproduction.
