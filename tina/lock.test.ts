import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * `tina/tina-lock.json` must match the schema compiled from `tina/config.ts`.
 *
 * THE INCIDENT THIS EXISTS FOR (2026-09-04). Four commits edited tina/config.ts
 * without regenerating the lock. Every production deploy then failed inside
 * `npx tinacms build` with ERR_CLOUD_CHECK_FAILED, and the daily cron that
 * publishes date-gated posts failed with it. Nothing local caught it: build,
 * typecheck and the whole test suite were green, because the cloud check runs
 * only in deploy.yml, which runs only on main. The first signal was a red
 * deploy after merge, and it took two hotfixes and a full revert to recover.
 *
 * WHY THE LOCK IS THE THING. Tina Cloud does not compile tina/config.ts. Its
 * "remote schema" IS this committed file — it indexes tina-lock.json from main
 * on every push (verified: the cloud's /schemaSha endpoint returns exactly the
 * SHA-256 of this file's `schema` member). The deploy's cloud check compiles
 * config.ts fresh, hashes the result the same way, and compares. Change
 * config.ts without regenerating the lock and the two disagree forever, no
 * matter how many times the cloud re-indexes — it is re-indexing the stale
 * lock. There is nothing to "sync in the dashboard"; the commit is the sync.
 *
 * THIS TEST reproduces the deploy's comparison locally and deterministically:
 * same hashing recipe as checkTinaSchema in @tinacms/cli (strip `version`,
 * JSON.stringify, sha256), lock vs freshly compiled schema. No network, no
 * credentials. It needs tina/__generated__/_schema.json, which is gitignored
 * and written by `npx tinacms dev --no-server --noWatch` (~4s) — so it SKIPS on
 * a fresh checkout, and ci.yml runs that command first so it executes there.
 *
 * WHAT COUNTS AS A SCHEMA CHANGE — learned by bisecting: field `type`, `list`,
 * `required`, `options`, `label`, `description`, `match.include`, the SHAPE of
 * any `ui` object (a `ui.validate` function is dropped by JSON.stringify but
 * leaves `ui: {}` behind, which is a new key), and even key ORDER inside a
 * field. Comments and function bodies are the only edits that do not reach the
 * hash. Which is to say: after touching tina/config.ts or tina/utils.ts, run
 * `npx tinacms dev --no-server --noWatch` and commit the lock. Every time.
 */

const TINA = dirname(fileURLToPath(import.meta.url));
const LOCK = join(TINA, 'tina-lock.json');
const GENERATED = join(TINA, '__generated__', '_schema.json');

/** The exact recipe from @tinacms/cli's checkTinaSchema. */
function tinaSchemaSha(schema: Record<string, unknown>): string {
  const copy = { ...schema };
  delete copy.version;
  return createHash('sha256').update(JSON.stringify(copy)).digest('hex');
}

describe('tina-lock.json', () => {
  it('exists and is tracked, because Tina Cloud reads the schema from it', () => {
    // Positive control for everything below. Tina's docs: it "must be checked
    // into source control and pushed to your repo."
    expect(existsSync(LOCK)).toBe(true);
    const lock = JSON.parse(readFileSync(LOCK, 'utf8'));
    expect(lock).toHaveProperty('schema');
    expect(lock).toHaveProperty('graphql');
    expect(lock).toHaveProperty('lookup');
  });

  it('hashes deterministically with the recipe the deploy uses (positive control)', () => {
    // If someone later "simplifies" tinaSchemaSha into something that always
    // agrees, this is what notices.
    const a = tinaSchemaSha({ version: { fullVersion: '1' }, collections: [{ name: 'x' }] });
    const b = tinaSchemaSha({ version: { fullVersion: '2' }, collections: [{ name: 'x' }] });
    const c = tinaSchemaSha({ version: { fullVersion: '1' }, collections: [{ name: 'y' }] });
    expect(a).toBe(b); // version is stripped, as in the CLI
    expect(a).not.toBe(c); // anything else moves the hash
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it.skipIf(!existsSync(GENERATED))(
    'matches the schema compiled from tina/config.ts — the deploy cloud check, locally',
    () => {
      const lock = JSON.parse(readFileSync(LOCK, 'utf8'));
      const generated = JSON.parse(readFileSync(GENERATED, 'utf8'));

      const lockSha = tinaSchemaSha(lock.schema);
      const localSha = tinaSchemaSha(generated);

      expect(
        localSha,
        [
          'tina/tina-lock.json does not match the schema compiled from tina/config.ts.',
          'Tina Cloud indexes the schema FROM the lock, so the deploy cloud check will',
          "fail after merge with ERR_CLOUD_CHECK_FAILED. Fix: run",
          "  npx tinacms dev --no-server --noWatch",
          'and commit tina/tina-lock.json alongside your tina/ change. Do NOT bisect by',
          'deploying, and do not look for a dashboard setting — there is none.',
          `  lock:  ${lockSha}`,
          `  local: ${localSha}`,
        ].join('\n'),
      ).toBe(lockSha);
    },
  );
});
