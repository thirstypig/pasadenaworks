/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CONTENT STATUS — generates CONTENT-STATUS.md from real post frontmatter.
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  Run with `npm run content:status`.
 *
 *  Why this exists: Tina's collection list view shows only the title field
 *  and is not configurable — `ui` accepts filename / allowedActions /
 *  global / router / beforeSubmit and nothing else (verified against
 *  tinacms 3.12.1's own types). So there is no way to see publish dates or
 *  translation coverage without opening each post. This writes a table
 *  instead, at the repo root, where Tina's "Project Docs" collection picks
 *  it up via its `*.md` glob.
 *
 *  The table is DERIVED, never hand-maintained — the hand-typed one in
 *  CONTENT-PLAN.md drifted out of sync twice.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BLOG = join(ROOT, 'src/content/blog');
const OUT = join(ROOT, 'CONTENT-STATUS.md');

/** The three languages every English post is supposed to reach. */
const TRANSLATIONS = ['es', 'zh-hans', 'zh-hant'];
const HEADS = { es: 'ES', 'zh-hans': '简', 'zh-hant': '繁' };

/**
 * Reads the YAML frontmatter block into a flat object.
 *
 * Deliberately not a full YAML parser — every field this reads is a flat
 * scalar. It splits on the FIRST colon only, because real values contain
 * colons (`heroImage: 'https://...'`, `title: Rose Parade season: what...`).
 */
export function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const out = {};
  for (const line of match[1].split(/\r?\n/)) {
    // Skip list items and continuation lines (e.g. the `tags:` array).
    if (/^\s/.test(line) || line.startsWith('-')) continue;

    const at = line.indexOf(':');
    if (at === -1) continue;

    const key = line.slice(0, at).trim();
    let value = line.slice(at + 1).trim();
    if (!key || !value) continue;

    // Strip one matching pair of surrounding quotes. Inside a YAML
    // single-quoted scalar a literal apostrophe is written doubled
    // (`what''s broken`), so undo that too.
    const quoted = value.match(/^(["'])([\s\S]*)\1$/);
    if (quoted) {
      value = quoted[2];
      if (quoted[1] === "'") value = value.replace(/''/g, "'");
    }

    if (value === 'true' || value === 'false') out[key] = value === 'true';
    else out[key] = value;
  }
  return out;
}

/** Whole days from `today` until `date`, rounded up. */
function daysUntil(date, today) {
  return Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
}

/**
 * Builds the markdown table. Pure — takes every post in every language plus
 * the date to measure against, and returns the table as a string.
 *
 * One row per English post; the other languages become the ES/简/繁 columns.
 */
export function renderTable(posts, today) {
  const byKey = new Map();
  for (const p of posts) {
    if (!byKey.has(p.translationKey)) byKey.set(p.translationKey, new Set());
    byKey.get(p.translationKey).add(p.locale);
  }

  const rows = posts
    .filter((p) => p.locale === 'en')
    .sort((a, b) => a.pubDate - b.pubDate)
    .map((p) => {
      const have = byKey.get(p.translationKey) ?? new Set();
      const marks = TRANSLATIONS.map((l) => (have.has(l) ? '✅' : '—'));
      const complete = TRANSLATIONS.every((l) => have.has(l));

      let status;
      if (p.draft) status = '✏️ draft';
      else if (p.pubDate > today) {
        const n = daysUntil(p.pubDate, today);
        status = `⏳ ${n} ${n === 1 ? 'day' : 'days'}`;
      }
      else if (complete) status = '✅ live';
      else status = '🚩 English-only';

      const date = p.pubDate.toISOString().slice(0, 10);
      return `| ${date} | ${p.title} | ${p.pillar} | ${marks.join(' | ')} | ${status} |`;
    });

  const head = `| Date | Post | Pillar | ${TRANSLATIONS.map((l) => HEADS[l]).join(' | ')} | Status |`;
  const rule = `|${'---|'.repeat(4 + TRANSLATIONS.length)}`;
  return [head, rule, ...rows].join('\n');
}

/** Reads every post off disk. */
export function readPosts(blogDir = BLOG) {
  const posts = [];
  for (const locale of readdirSync(blogDir)) {
    for (const file of readdirSync(join(blogDir, locale))) {
      if (!file.endsWith('.md')) continue;
      const fm = parseFrontmatter(readFileSync(join(blogDir, locale, file), 'utf8'));
      posts.push({
        title: fm.title,
        pubDate: new Date(fm.pubDate),
        pillar: fm.pillar,
        draft: fm.draft === true,
        locale: fm.locale ?? locale,
        translationKey: fm.translationKey,
      });
    }
  }
  return posts;
}

function main() {
  const today = new Date();
  const posts = readPosts();
  const stamp = today.toISOString().slice(0, 10);

  const page = `# Content status

> **Generated ${stamp} by \`npm run content:status\` — do not edit by hand.**
> Editing this file (here or in Tina) will be overwritten the next time it
> runs. Change the posts themselves; then regenerate.

Every English post, when it publishes, and whether its translations exist.
Read together with \`CONTENT-PLAN.md\`, which holds the strategy and the
target keywords.

**Status column:** ✅ live · ⏳ publishes in N days · 🚩 already published
English-only (its translations missed the date) · ✏️ draft, will not publish.

${renderTable(posts, today)}

## What needs doing

A post needs its Spanish, Simplified, and Traditional Chinese versions
**before** its own publish date, or it goes out English-only — the site is
date-gated, so nobody gets a second chance at it. Work the ⏳ rows from the
top down.
`;

  writeFileSync(OUT, page);
  console.log(`Wrote CONTENT-STATUS.md — ${posts.filter((p) => p.locale === 'en').length} posts, generated ${stamp}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
