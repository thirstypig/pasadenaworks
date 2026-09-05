import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, statSync } from 'node:fs';
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
 * credentials.
 *
 * It needs tina/__generated__/_schema.json — gitignored, written by
 * `npx tinacms dev --no-server --noWatch` (~4s) — and it must be NEWER than
 * config.ts/utils.ts, or the comparison is between two stale files that agree
 * with each other. It skips otherwise. ci.yml regenerates before running the
 * suite, so it always executes there.
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
const SOURCES = [join(TINA, 'config.ts'), join(TINA, 'utils.ts')];

/**
 * `_schema.json` is only meaningful if it was compiled from the CURRENT config.
 *
 * Without this, the comparison below passes whenever BOTH sides are stale — the
 * generated file left over from an earlier run agrees with the lock it was
 * generated alongside, and a config change made since is invisible. That is a
 * false pass, and it happened on the first run of this very test: it reported
 * green immediately after `required: true` was re-added, because `_schema.json`
 * predated the edit.
 *
 * Same shape as the stale-`dist/` trap CLAUDE.md documents. Skipping loudly on
 * a stale artifact is correct; passing over one is not.
 */
function generatedIsCurrent(): boolean {
  if (!existsSync(GENERATED)) return false;
  const built = statSync(GENERATED).mtimeMs;
  return SOURCES.every((src) => !existsSync(src) || statSync(src).mtimeMs <= built);
}

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

  it.skipIf(!generatedIsCurrent())(
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
