import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIST } from '../utils/built-pages';
import { aboutPaths } from '../i18n/routes';
import { about } from './about';

/** Same rule as city-pages.test.ts: only <link rel="alternate"> WITH hreflang
 *  counts — the language switcher's anchors and the RSS link would both
 *  otherwise be counted. */
function alternates(html: string): string[] {
  return [...html.matchAll(/<link\b[^>]*\brel="alternate"[^>]*>/g)]
    .map((m) => /\bhreflang="([^"]+)"/.exec(m[0])?.[1])
    .filter((lang): lang is string => Boolean(lang));
}

const fileFor = (path: string) => join(DIST, path.replace(/^\//, ''), 'index.html');

describe.skipIf(!existsSync(DIST))('built About pages', () => {
  it('exist in all four locales with their own heading', () => {
    for (const [locale, path] of Object.entries(aboutPaths())) {
      expect(existsSync(fileFor(path)), path).toBe(true);
      const html = readFileSync(fileFor(path), 'utf-8');
      expect(html, path).toContain(about[locale as keyof typeof about].heading);
    }
  });

  it('claim all four translations plus x-default, and nothing else', () => {
    for (const path of Object.values(aboutPaths())) {
      const alts = alternates(readFileSync(fileFor(path), 'utf-8'));
      expect(alts, path).toHaveLength(5);
      expect(alts, path).toContain('x-default');
    }
  });
});
