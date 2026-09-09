import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { pathToFileURL } from 'node:url';
import { isMain } from './is-main.mjs';

/**
 * The regression this guards: a naive `import.meta.url === \`file://${path}\``
 * comparison is false whenever the checkout path contains a space or
 * non-ASCII character, because `import.meta.url` percent-encodes those and the
 * naive string doesn't. `content-status.mjs` shipped with exactly that form
 * until 2026-09-09 (found in a full-repo review, todos/022) — it would have
 * silently done nothing on such a path, with no error.
 */

const ORIGINAL_ARGV1 = process.argv[1];

beforeEach(() => {
  process.argv[1] = ORIGINAL_ARGV1;
});

afterEach(() => {
  process.argv[1] = ORIGINAL_ARGV1;
});

describe('isMain', () => {
  it('is true when the URL matches the invoked script path', () => {
    process.argv[1] = '/Users/someone/pasadenaworks/scripts/content-status.mjs';
    expect(isMain(pathToFileURL(process.argv[1]).href)).toBe(true);
  });

  it('is false when the URL is a different module (e.g. imported by a test)', () => {
    process.argv[1] = '/Users/someone/pasadenaworks/node_modules/.bin/vitest';
    expect(isMain(pathToFileURL('/Users/someone/pasadenaworks/scripts/content-status.mjs').href)).toBe(
      false
    );
  });

  it('is true on a checkout path containing a space — the exact case the naive form gets wrong', () => {
    process.argv[1] = '/Users/some one/pasadena works/scripts/content-status.mjs';
    expect(isMain(pathToFileURL(process.argv[1]).href)).toBe(true);

    // Prove the regression this replaces would have failed here: the naive
    // form compares against a plain string, which never percent-encodes.
    const naive = `file://${process.argv[1]}`;
    expect(pathToFileURL(process.argv[1]).href).not.toBe(naive);
  });

  it('is true on a checkout path containing non-ASCII characters', () => {
    process.argv[1] = '/Users/张三/pasadenaworks/scripts/content-status.mjs';
    expect(isMain(pathToFileURL(process.argv[1]).href)).toBe(true);
  });
});
