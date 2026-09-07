/**
 * The four service pillars a blog post can belong to — declared once.
 *
 * WHY THIS FILE EXISTS. The same four strings were written out in four places:
 * the Zod enum in `src/content.config.ts`, TypeScript unions in `EndCta.astro`
 * and `Post.astro`, and the `options` list in `tina/config.ts`. Nothing made
 * them agree, and CLAUDE.md leans on this value — "`pillar` must be one of
 * websites, search, consulting, ads, and the build fails on a typo,
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
export const PILLARS = ['websites', 'search', 'consulting', 'ads'] as const;

export type Pillar = (typeof PILLARS)[number];
