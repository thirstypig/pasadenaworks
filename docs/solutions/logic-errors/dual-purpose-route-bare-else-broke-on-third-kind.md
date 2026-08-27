---
title: "Astro dual-purpose route's bare `else` broke silently when a third `kind` was added"
date: 2026-08-27
category: logic-errors
component: "src/pages/[locale]/[section]/[service].astro — the shared route for translated services, cities, and (newly) blog posts"
symptom: "Build-time crash only on the newly-added branch: `TypeError: Cannot read properties of undefined (reading 't')`, thrown from inside the route file while rendering a translated blog post; the pre-existing service and city pages kept building and rendering correctly the whole time"
tags: [astro, typescript, routing, dual-purpose-route, control-flow, i18n]
status: solved
---

## Summary

`src/pages/[locale]/[section]/[service].astro` is a single file that renders
three different kinds of translated pages (services, city landing pages, and
— as of this session — blog posts), branching on a `kind` prop, per the
file's own documented reason: Astro can't have two dynamic routes claim the
same path depth, so a third `[locale]/blog/[slug].astro` file would collide
with the existing `[locale]/[section]/[service].astro`.

The original two-kind version of this file used:

```ts
if (kind === 'service') {
  service = Astro.props.service as Service;
  serviceCopy = service.t[locale];
  // ...
} else {
  city = Astro.props.city as City;
  cityCopy = city.t[locale]!;   // <-- assumes "not service" means "city"
  // ...
}
```

That `else` was correct *at the time it was written* — there really were
only two kinds. It became wrong the moment a third kind (`'blog-post'`) was
added and routed through the same file: for a blog post, `kind` is neither
`'service'` nor `'city'`, so it fell into the `else` branch anyway, tried to
read `Astro.props.city` (which is `undefined` for a blog post), and crashed
on `city.t[locale]`.

## Solution

### Symptom as it actually appeared

```
[ERROR][build] Caught error rendering /es/blog/que-debe-tener-la-pagina-web-de-una-pequena-empresa:
TypeError: Cannot read properties of undefined (reading 't')
```

The error message pointed at a compiled chunk, not the source line, so the
first instinct was to suspect the *new* code (the blog-post branch just
added). The actual bug was in code that had shipped weeks earlier and never
needed to change — it broke as a side effect of a change made somewhere
else in the same file.

### Root cause

```ts
const { kind, locale } = Astro.props as {
  kind: 'service' | 'city' | 'blog-post';   // <-- type was updated to 3 options
  ...
};

if (kind === 'service') {
  ...
} else {
  // still assumes kind === 'city' unconditionally
  city = Astro.props.city as City;
  cityCopy = city.t[locale]!;
}
```

The TypeScript union type for `kind` *was* updated to include `'blog-post'`
when the third branch was added — but TypeScript doesn't flag a bare
`if/else` as non-exhaustive the way a `switch` with `never`-check or a
discriminated-union exhaustiveness check would. `Astro.props` is typed as
`any`/unknown-ish per Astro's props system, so `Astro.props.city` being
`undefined` for a blog post silently type-checked as fine, and the crash
only surfaced at runtime (build time, in this case) when that code path
actually executed.

### Working fix

Change the bare `else` to an explicit `else if (kind === 'city')`, matching
the pattern already used one file over
(`src/pages/[locale]/[section]/index.astro`, which used an explicit
three-way ternary chain — `kind === 'blog' ? (...) : kind === 'service' ?
(...) : (...)` — from the start, because it was written with three kinds in
mind):

```ts
if (kind === 'service') {
  service = Astro.props.service as Service;
  serviceCopy = service.t[locale];
  // ...
} else if (kind === 'city') {
  city = Astro.props.city as City;
  cityCopy = city.t[locale]!;
  // ...
}
```

(The `'blog-post'` kind is handled as its own separate top-level branch
earlier in the file, rendering a completely different layout — `<Post>`
instead of `<Base>` — so it never needed to reach this `if/else` at all;
the fix is really "stop this block from silently claiming to handle a case
it doesn't.")

## Prevention

1. **A bare `else` in a file with a `kind`-style discriminated union is a
   latent bug the moment a second person (or a later you) adds a third
   variant.** Prefer `else if (kind === 'x')` for every known case, even
   when only two cases currently exist — it costs nothing today and fails
   loudly (TypeScript can warn on an unhandled case with the right
   exhaustiveness pattern) instead of silently mis-branching later.
2. **When a dual/triple-purpose route file exists specifically to work
   around a framework routing collision** (as this one's own header
   comment explains), expect it to keep growing new `kind`s over time —
   that's the whole reason it exists instead of being three separate
   files. Grep the file for every `kind ===` / `else` before adding a new
   kind, not just the `getStaticPaths` function where the new paths are
   generated.
3. **A crash pointing at a compiled chunk, not a source line, in code you
   just touched doesn't mean the bug is in the code you just touched.**
   The actual fault here was in an untouched `if/else` from a much earlier
   commit; the new branch only *triggered* it by finally exercising a
   `kind` value the old code never anticipated.

## Related

- This bug surfaced while building the blog i18n mechanism — see the
  `git log` around 2026-08-27 ("Add blog i18n mechanism") for the full
  context of why a third `kind` was added to this route file at all.
- [Railway custom domain stuck at "Validating Ownership"](../integration-issues/railway-custom-domain-stuck-validating-ownership.md) —
  unrelated bug, same session, same pattern of "the fix is obvious once
  you stop assuming the newest code is where the fault lives."
