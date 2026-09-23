/**
 * The four service pillars a blog post can belong to — declared once.
 *
 * ONE PILLAR PER LIVE SERVICE, since 2026-09-23. The list used to be
 * `websites, search, consulting, ads`, which was the service lineup from
 * before the 2026-09-14 repositioning. `search` and `ads` were folded into
 * Get more patients on that date, but they survived here as pillars, and
 * PILLAR_SERVICE collapsed three of the four onto one service — so 48 of 68
 * posts pointed at Get more patients while Digitize the office and Transition
 * Planning had no blog post in any language. A taxonomy that names retired
 * services also hides the gaps. See
 * docs/superpowers/specs/2026-09-23-practice-content-plan-design.md.
 *
 * A pillar is never rendered to a reader. It exists only to choose the
 * service a post's closing box links to, which is why changing this set
 * needs no translated strings.
 *
 * WHY THIS FILE EXISTS. The same four strings were written out in four places:
 * the Zod enum in `src/content.config.ts`, TypeScript unions in `EndCta.astro`
 * and `Post.astro`, and the `options` list in `tina/config.ts`. Nothing made
 * them agree, and CLAUDE.md leans on this value — "`pillar` must be one of
 * PILLARS, and the build fails on a typo,
 * deliberately". That guarantee is only as good as the enum being complete:
 * adding a fifth pillar to the schema and forgetting Tina's list would let the
 * admin offer a value the build then rejects, and forgetting a component's
 * union would type-erase the new case rather than flag it. See `todos/016`.
 *
 * WHY `.ts` AND NOT `.mjs`, unlike `src/i18n/locales.mjs`. That one is plain
 * ESM because two bare-node scripts (`readability.mjs`, `content-status.mjs`)
 * import the locale list and cannot read TypeScript. Nothing needs the pillar
 * list that way: those scripts pass a post's `pillar` value straight through
 * from frontmatter without ever declaring the set. `tina/config.ts` is
 * TypeScript compiled by @tinacms/cli's own esbuild pass and already imports
 * `./utils`, so a `.ts` module is reachable from every consumer.
 *
 * `as const` is load-bearing: `Pillar` is derived from it, and a bare array
 * would widen to `string[]` and take the union with it.
 */
export const PILLARS = ['websites', 'digitize', 'consulting', 'transition'] as const;

export type Pillar = (typeof PILLARS)[number];
