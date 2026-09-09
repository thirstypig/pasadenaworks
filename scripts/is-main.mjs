/**
 * Is this module the one Node was actually invoked on (`node scripts/x.mjs`),
 * as opposed to one imported by something else (e.g. a test file)?
 *
 * THE NAIVE FORM IS WRONG. `import.meta.url === \`file://${process.argv[1]}\``
 * builds the right-hand side as a plain string rather than a URL:
 * `import.meta.url` percent-encodes spaces and non-ASCII characters, so on a
 * checkout path containing either, the comparison is false and the script
 * exits 0 having done nothing at all — no output, no error, indistinguishable
 * from success. `content-status.mjs` shipped with exactly this form until
 * 2026-09-09, found during a full-repo review after `unsplash.mjs` had
 * already fixed the identical bug in itself and left a comment explaining
 * why — the fix never propagated to its sibling script. One shared helper
 * instead of three independently-maintained comparisons.
 */
import { pathToFileURL } from 'node:url';

export function isMain(moduleUrl) {
  return moduleUrl === pathToFileURL(process.argv[1]).href;
}
