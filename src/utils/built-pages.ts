import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The build output. Tests that read it skip when it is absent, which is why
 *  ci.yml re-runs the whole suite after building. */
export const DIST = join(dirname(fileURLToPath(import.meta.url)), '../../dist');

/** Every built index.html, as a path relative to dist/, skipping Astro's asset
 *  folder and the Tina admin bundle. */
export function builtPages(dir = ''): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(DIST, dir), { withFileTypes: true })) {
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (entry.name === '_astro' || entry.name === 'admin') continue;
      out.push(...builtPages(rel));
    } else if (entry.name === 'index.html') {
      out.push(rel);
    }
  }
  return out;
}
