/**
 * The site's locale list — the one runtime declaration of it.
 *
 * WHY THIS FILE IS `.mjs` AND NOT `.ts`. Three consumers need this list, and
 * they do not share a module system:
 *
 *   - `src/i18n/ui.ts` and everything downstream of it (TypeScript, compiled
 *     by Astro/Vite).
 *   - `tina/config.ts` (TypeScript, compiled by @tinacms/cli's esbuild).
 *   - `scripts/readability.mjs` and `scripts/content-status.mjs`, which run
 *     under **bare node with no build step** — `npm run readability` and
 *     `npm run content:status` invoke node directly. They cannot import a
 *     `.ts` file, and giving them one would mean adding a build step to two
 *     scripts whose whole value is that they run instantly.
 *
 * Plain ESM is the only format all three can read. So the list lives here and
 * the TypeScript side re-exports it, rather than the reverse.
 *
 * THE BUG THIS PREVENTS. The list used to be written out in four places
 * (`ui.ts`, `tina/config.ts`, `readability.mjs`, `content-status.mjs`). Adding
 * or removing a locale silently desynchronised them: a post carrying a value
 * that one file knew and another did not validated against the stale enum and
 * then matched nothing — no page, no sitemap entry, and no error. See
 * `todos/016`.
 *
 * WHY THE LIST APPEARS TWICE BELOW, which looks like the very duplication this
 * file exists to remove. It is not the same kind. `Locale` is derived from this
 * array via `(typeof LOCALES)[number]`, and that literal union is load-bearing:
 * hard rule 1's `buildAlternates()`, the `RouteProps`/`HubProps` discriminated
 * unions, and every `Record<Locale, …>` map depend on it. TypeScript widens a
 * bare array in a `.js`/`.mjs` file to `string[]`, which would quietly turn
 * `Locale` into `string` and disable all of that with a green build — measured,
 * not assumed. The JSDoc annotation is what preserves the literals.
 *
 * So the two lines must agree, and nothing in the compiler checks that they do
 * (`checkJs` is off). `locales.test.ts` asserts it, along with every consumer
 * still importing from here rather than re-declaring. Adding a language means
 * editing the two adjacent lines below, then following the checklist in
 * `ui.ts`.
 *
 * @type {readonly ['en', 'es', 'zh-hans', 'zh-hant']}
 */
export const LOCALES = ['en', 'es', 'zh-hans', 'zh-hant'];

/** The locale served at the root, with no path prefix. */
export const DEFAULT_LOCALE = 'en';

/**
 * The locales a post is *translated into* — everything but the default.
 *
 * Derived rather than written out, because `content-status.mjs` used to keep
 * its own copy of exactly this list under the name `TRANSLATIONS`, which is
 * the same drift in a narrower form.
 */
export const TRANSLATED_LOCALES = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);
