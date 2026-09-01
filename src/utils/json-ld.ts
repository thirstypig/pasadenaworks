/**
 * Serializes a schema.org object for embedding in a `<script type="application/ld+json">`
 * block.
 *
 * WHY THIS EXISTS: both layouts inject their structured data with Astro's
 * `set:html`, which inserts raw HTML by design. `JSON.stringify` does not
 * escape `<`, so any value containing the literal `</script>` closes the
 * JSON-LD block early and everything after it is parsed as page HTML — a
 * silent break, since the build succeeds and the page looks correct.
 *
 * Nothing untrusted reaches these schemas today: they are built from
 * `src/data/site.ts` and from post frontmatter, both of which take a commit or
 * the local Tina admin to change. This is a guard against a typo and against a
 * future input source, not a live vulnerability — but it is one line, and the
 * failure mode is invisible.
 *
 * `\u003c` is valid JSON and JSON-LD parsers read it identically to `<`, so
 * the structured data search engines see is unchanged.
 */
export function jsonLd(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}
