/**
 * ─────────────────────────────────────────────────────────────────────────
 *  READABILITY — measures the reading level of every post, per locale.
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  Run with `npm run readability` (add `--json` for machine output).
 *
 *  WHY THIS EXISTS: on 2026-09-03 the owner set a house target of
 *  college-level English. Before that call there was no number attached to
 *  the copy at all, and the level had drifted badly without anyone seeing
 *  it — the four posts written FOR Spanish- and Chinese-speaking readers
 *  had landed at grade 12.0–12.2 while "How to fire a customer" sat at 6.7.
 *  A five-grade spread nobody chose. This makes the level visible so it is
 *  chosen rather than accumulated.
 *
 *  ── ONE FORMULA PER LANGUAGE, NEVER ONE FORMULA FOR ALL ──
 *
 *  Flesch-Kincaid is defined over ENGLISH syllables and English word
 *  length. Running it on Spanish inflates every score (Spanish words carry
 *  more syllables for the same idea), and running it on Chinese is not
 *  merely inaccurate but meaningless — the syllable term divides by a
 *  vowel count that does not exist in Han script, and the word count
 *  depends on segmentation this repo has no tokenizer for. A single
 *  `grade` column across four locales would be a fabricated number in two
 *  of them, which is worse than no number: see
 *  `project-verification-greps-go-stale` for how a check that cannot fail
 *  becomes decorative.
 *
 *  So:
 *    en           → Flesch-Kincaid grade + Flesch Reading Ease (validated)
 *    es           → Fernández Huerta (the Spanish adaptation of Flesch,
 *                   with a Spanish syllable counter that handles diphthongs)
 *    zh-hans/hant → NO grade level is reported. Sentence length PLUS a
 *                   register index, because in Chinese the two come apart:
 *                   see below.
 *
 *  ── WHY CHINESE NEEDS A REGISTER INDEX, NOT A LENGTH TARGET ──
 *
 *  The first version of this file targeted characters-per-sentence alone
 *  and reported 19/20 Chinese posts already "in band" — which would have
 *  meant the Chinese rewrite was finished before it started. That was the
 *  metric being wrong, not the posts being right.
 *
 *  English raises register mostly by subordinating clauses, so length and
 *  difficulty move together and one number tracks both. Chinese raises
 *  register mostly by LEXICAL CHOICE — 書面語 over 口語 — and barely moves
 *  sentence length at all. 所以 becomes 因此, 但是 becomes 然而, 不是
 *  becomes 並非; sentence-final particles (吧 呢 啊 嘛) drop away. A post can
 *  be rewritten from conversational to academic Chinese and land on exactly
 *  the same characters-per-sentence.
 *
 *  So `registerIndex` is the real target for zh, and characters-per-
 *  sentence is kept only as a guard against runaway sentences.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BLOG = join(ROOT, 'src/content/blog');

export const LOCALES = ['en', 'es', 'zh-hans', 'zh-hant'];

/**
 * House targets, set 2026-09-03.
 *
 * English is a BAND, not a ceiling. A single "13+" floor would be passed
 * by a 40-word unreadable sentence just as happily as by good academic
 * prose, so the upper bound is load-bearing — it is what stops "college
 * level" from becoming "impenetrable".
 *
 * Spanish reads on the Fernández Huerta scale, where HIGHER means EASIER
 * (60–70 is normal prose, 30–50 is university level). "College level" is
 * therefore a push DOWN, and the posts currently sit at a mean of 70.7.
 */
export const TARGETS = {
  en: { metric: 'fkGrade', min: 13, max: 15, label: 'FK grade 13–15' },
  es: { metric: 'fernandezHuerta', min: 40, max: 55, label: 'F-H 40–55 (lower = harder)' },
  'zh-hans': { metric: 'registerIndex', min: 0.55, max: 0.85, label: 'register 0.55–0.85' },
  'zh-hant': { metric: 'registerIndex', min: 0.55, max: 0.85, label: 'register 0.55–0.85' },
};

/**
 * The runaway-sentence ceiling, in characters per sentence, for zh only.
 *
 * The header above says characters-per-sentence "is kept only as a guard
 * against runaway sentences." Until 2026-09-04 there was NO SUCH GUARD — the
 * value was computed and never compared to anything. A stated safety property
 * with no implementation is worse than an absent one, because it stops the next
 * reader looking for it.
 *
 * Why zh needs its own: `registerIndex` measures word choice, not length, and
 * the two come apart in Chinese (that is the whole argument in the header). So
 * a post can sit perfectly in the 0.55–0.85 register band while running 80
 * characters to a sentence. English and Spanish do not need this — their
 * primary metrics ARE length-sensitive, and their bands already carry upper
 * bounds that catch the same failure (CLAUDE.md records a draft that passed a
 * 13+ floor at grade 15.9 with 29.8-word sentences; the FK max caught it).
 *
 * 60 is a TRIPWIRE, not a target. Measured across the 40 Chinese posts on
 * 2026-09-04: min 30.7, median 41.0, p90 46.1, max 47.1. The ceiling sits ~27%
 * above the observed maximum, so nothing in the corpus is near it and no one is
 * ever tempted to edit prose to satisfy it — which is exactly the inversion
 * CLAUDE.md warns about in
 * docs/solutions/process-errors/a-writing-metric-corrupts-the-prose-it-governs.md.
 * It fires only on prose that has genuinely run away.
 */
export const MAX_CHARS_PER_SENTENCE = 60;

/**
 * Separate from `verdict()` on purpose. `verdict` answers one question — is the
 * primary metric inside its band — and its result feeds the "N/M in band"
 * counts. Folding a length failure into it would make "above" ambiguous and
 * silently change what those counts mean.
 *
 * Returns 'runaway' or null.
 */
export function sentenceGuard(result) {
  if (!result?.locale?.startsWith('zh')) return null;
  const value = result.charsPerSentence;
  if (value == null) return null;
  return value > MAX_CHARS_PER_SENTENCE ? 'runaway' : null;
}

/**
 * 書面語 (written/formal) markers and their 口語 (spoken/colloquial)
 * counterparts, in both Simplified and Traditional forms.
 *
 * Only multi-character markers are listed. Single formal characters (亦,
 * 即, 若, 之, 其) are far more discriminating in principle but appear inside
 * unrelated compounds constantly — 其 alone occurs in 其他, 其中, 尤其 — so
 * counting them would measure vocabulary that has nothing to do with
 * register.
 */
export const FORMAL_MARKERS = [
  '因此', '然而', '並非', '并非', '此外', '由於', '由于', '對於', '对于',
  '關於', '关于', '至於', '至于', '儘管', '尽管', '倘若', '進而', '进而',
  '從而', '从而', '藉由', '借由', '而言', '不僅', '不仅', '並且', '并且',
  '亦即', '換言之', '换言之', '如此', '繼而', '继而', '隨後', '随后',
  '較為', '较为', '頗為', '颇为', '尤為', '尤为', '得以', '足以', '意即',
];

export const COLLOQUIAL_MARKERS = [
  '所以', '但是', '可是', '不是', '還有', '还有', '然後', '然后', '這樣',
  '这样', '那樣', '那样', '因為', '因为', '其實', '其实', '反正', '一下',
  '有點', '有点', '什麼的', '什么的', '之類的', '之类的', '而且',
];

/** Sentence-final particles — pure spoken-register signal, no formal use. */
export const PARTICLES = ['吧', '呢', '嘛', '啊', '喔', '啦', '耶', '唷'];

/* ── text extraction ───────────────────────────────────────────────────── */

/**
 * Strips a markdown post down to the prose a reader actually reads.
 *
 * Headings are removed rather than counted. They are deliberate fragments
 * ("## What actually works") and folding them into the sentence average
 * drags it toward zero, which would let a post pass the band by adding
 * subheadings instead of by rewriting anything.
 *
 * ── QUOTED SAMPLE TEXT IS EXCLUDED, AND THE FIRST BLOCKQUOTE IS NOT ──
 *
 * Every post opens with a summary in a blockquote (TL;DR / En corto / 重點).
 * That IS the article's own prose, it carries the most weight of anything on
 * the page, and it is measured.
 *
 * LATER blockquotes are a different kind of thing. The reviews post quotes
 * three sample messages a reader will send verbatim to a customer — a text
 * message, an email, a reply to a bad review. Those must stay plain: a text
 * to a plumbing customer written at college level would be worse advice, not
 * better. Measured as article prose they pulled that post from 13.4 to 11.9,
 * which would have created pressure to degrade the templates in order to
 * move a number describing something else entirely.
 *
 * This mirrors the rule in the `writing-american-english-copy` skill —
 * quoted material is not yours to correct — and the risk it carries is that
 * a future writer could park ordinary prose in a blockquote to dodge the
 * band. `readability.test.mjs` documents that hole deliberately rather than
 * pretending it is closed; the guard is that quoting prose you wrote
 * yourself is visibly odd in review.
 */
export function prose(markdown) {
  // `\r?\n`, and no required newline AFTER the closing fence. The previous
  // pattern was /^---[\s\S]*?\n---\n/, which FAILS OPEN: on a CRLF file, or a
  // file ending at the fence, it strips nothing and every frontmatter line
  // (title:, pillar:, targetKeyword:, the URLs) is then scored as prose. That
  // moves the grade with no error, no warning and a green exit code — the
  // worst shape for a number that governs the writing. scripts/
  // content-status.mjs already used the \r?\n form; this copy had drifted.
  let body = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*(\r?\n|$)/, '');
  body = body.replace(/```[\s\S]*?```/g, ' ');
  body = body.replace(/`[^`]*`/g, ' ');
  body = body.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');
  body = body.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  body = body.replace(/^\s{0,3}#{1,6}\s+.*$/gm, ' ');
  body = body.replace(/^\s*\|.*\|\s*$/gm, ' ');
  body = dropQuotedSamples(body);
  body = body.replace(/^\s*[-*+>]\s+/gm, '');
  body = body.replace(/[*_]{1,3}/g, '');
  return body;
}

/** Keeps the first blockquote block (the summary), drops every later one. */
export function dropQuotedSamples(body) {
  const lines = body.split('\n');
  const out = [];
  let seenFirstQuote = false;
  let inQuote = false;
  for (const line of lines) {
    const isQuote = /^\s*>/.test(line);
    if (isQuote && !inQuote) {
      inQuote = true;
      if (!seenFirstQuote) seenFirstQuote = 'keeping';
      else seenFirstQuote = 'dropping';
    } else if (!isQuote && inQuote) {
      inQuote = false;
      if (seenFirstQuote === 'keeping') seenFirstQuote = 'done';
    }
    if (isQuote && seenFirstQuote === 'dropping') continue;
    out.push(line);
  }
  return out.join('\n');
}

/* ── English ───────────────────────────────────────────────────────────── */

export function englishSyllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const trimmed = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  return groups ? groups.length : 1;
}

/* ── Spanish ───────────────────────────────────────────────────────────── */

const STRONG = 'aeoáéó';
const WEAK = 'iuü';
const ACCENTED_WEAK = 'íú';

/**
 * Spanish syllable count.
 *
 * Spanish orthography is near-phonetic, so this is far more reliable than
 * the English heuristic above. The rule that matters is the diphthong: a
 * weak vowel beside a strong one forms ONE syllable (cui-da-do), unless the
 * weak vowel carries an accent, which breaks it into two (dí-a). Counting
 * every vowel separately would overstate by roughly 15% on ordinary prose
 * and push every Spanish post out of band for a reason that is not real.
 */
export function spanishSyllables(word) {
  const w = word.toLowerCase().replace(/[^a-záéíóúüñ]/g, '');
  if (!w) return 0;
  const groups = w.match(/[aeiouáéíóúü]+/g);
  if (!groups) return 1;
  let count = 0;
  for (const group of groups) {
    if (group.length === 1) { count += 1; continue; }
    let syllables = 1;
    for (let i = 1; i < group.length; i += 1) {
      const prev = group[i - 1];
      const cur = group[i];
      const bothStrong = STRONG.includes(prev) && STRONG.includes(cur);
      const accentBreaks = ACCENTED_WEAK.includes(prev) || ACCENTED_WEAK.includes(cur);
      if (bothStrong || accentBreaks) syllables += 1;
    }
    count += syllables;
  }
  return Math.max(count, 1);
}

/* ── analysis ──────────────────────────────────────────────────────────── */

const CJK_SENTENCE_END = /[。！？!?]+/;
const CJK_CLAUSE_END = /[。！？，、；：!?,;:]+/;

export function analyze(markdown, locale) {
  const body = prose(markdown);

  if (locale === 'zh-hans' || locale === 'zh-hant') {
    const han = (body.match(/[一-鿿]/g) || []).length;
    const sentences = body.split(CJK_SENTENCE_END)
      .map((s) => (s.match(/[一-鿿]/g) || []).length)
      .filter((n) => n > 0);
    const clauses = body.split(CJK_CLAUSE_END)
      .map((s) => (s.match(/[一-鿿]/g) || []).length)
      .filter((n) => n > 0);
    const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
    const tally = (markers) =>
      markers.reduce((sum, m) => sum + (body.split(m).length - 1), 0);

    const formal = tally(FORMAL_MARKERS);
    const colloquial = tally(COLLOQUIAL_MARKERS);
    const particles = tally(PARTICLES);
    // Particles count as colloquial evidence: they have no formal register
    // use at all, so a post can score "formal" on connectives while still
    // reading as speech if it ends its sentences with 吧 and 呢.
    const spoken = colloquial + particles;
    return {
      locale,
      units: han,
      sentences: sentences.length,
      charsPerSentence: +mean(sentences).toFixed(1),
      charsPerClause: +mean(clauses).toFixed(1),
      longest: sentences.length ? Math.max(...sentences) : 0,
      formal,
      colloquial,
      particles,
      registerIndex: formal + spoken === 0 ? null : +(formal / (formal + spoken)).toFixed(2),
      fkGrade: null,
      readingEase: null,
      fernandezHuerta: null,
    };
  }

  const sentences = body
    .split(/[.!?]+(?=\s|$)/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).filter(Boolean).length > 1);
  const words = body.match(/\b[\w'’À-ɏ-]+\b/g) || [];
  const W = words.length;
  const S = sentences.length;
  if (!W || !S) {
    // Every metric key is present and null, never absent. `JSON.stringify`
    // drops undefined but keeps null, so a missing key would silently
    // disappear from `--json` output for Spanish while English still showed
    // its own. A consumer cannot tell "no value" from "field not emitted".
    return {
      locale,
      units: W,
      sentences: S,
      wordsPerSentence: null,
      longest: 0,
      polysyllabicPct: null,
      fkGrade: null,
      readingEase: null,
      fernandezHuerta: null,
    };
  }

  const counter = locale === 'es' ? spanishSyllables : englishSyllables;
  const syl = words.reduce((a, w) => a + counter(w), 0);
  const wordsPerSentence = W / S;
  const syllablesPerWord = syl / W;

  return {
    locale,
    units: W,
    sentences: S,
    wordsPerSentence: +wordsPerSentence.toFixed(1),
    longest: Math.max(...sentences.map((s) => s.split(/\s+/).filter(Boolean).length)),
    polysyllabicPct: +((words.filter((w) => counter(w) >= 3).length / W) * 100).toFixed(1),
    fkGrade: locale === 'en'
      ? +(0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59).toFixed(1)
      : null,
    readingEase: locale === 'en'
      ? +(206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord).toFixed(0)
      : null,
    // Fernández Huerta (1959), the standard Spanish adaptation of Flesch.
    // Higher is easier, same direction as Reading Ease; ~60 is plain prose.
    fernandezHuerta: locale === 'es'
      ? +(206.84 - 60 * syllablesPerWord - 1.02 * wordsPerSentence).toFixed(0)
      : null,
  };
}

/** In band, above it, or below it — `null` when the locale has no target. */
export function verdict(result) {
  const target = TARGETS[result.locale];
  if (!target) return null;
  const value = result[target.metric];
  if (value == null) return null;
  if (value < target.min) return 'below';
  if (value > target.max) return 'above';
  return 'ok';
}

export function report() {
  const rows = [];
  for (const locale of LOCALES) {
    const dir = join(BLOG, locale);
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
      const result = analyze(readFileSync(join(dir, file), 'utf8'), locale);
      rows.push({ file, ...result, verdict: verdict(result) });
    }
  }
  return rows;
}


/* ── rendered pages ───────────────────────────────────────────────────── */

/**
 * Scores BUILT pages rather than source files.
 *
 * WHY BOTH: the blog is markdown and can be measured at source, but the
 * service pages, city pages and homepage are assembled from `src/data/*.ts`
 * through Astro components, and there is no honest way to score a
 * TypeScript module — you would be regex-ing string literals out of an
 * object and guessing which ones a reader ever sees.
 *
 * The rendered page settles it: whatever is inside <main> is what somebody
 * actually reads, wherever the copy came from. Header, nav, language
 * switcher and footer sit outside <main> and are excluded, which matters
 * because that chrome repeats on all 67 pages and would drag every score
 * toward the same number.
 *
 * Blog posts are measured BOTH ways on purpose. Their two scores should
 * land close together, and that agreement is the only evidence that this
 * extraction is faithful — see the cross-check in readability.test.mjs.
 */
export function localeFromPath(p) {
  const m = p.match(/dist\/(es|zh-hans|zh-hant)\//);
  return m ? m[1] : 'en';
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ', mdash: '—', ndash: '–' };

/**
 * Pulls the readable prose out of one built page.
 *
 * Everything removed below is chrome that happens to sit inside <main>, and
 * each exclusion was found by diffing this extraction against the markdown
 * one rather than guessed at. On a post the two paths disagreed by about a
 * grade, and the whole difference was 44 words of furniture: a "Back to
 * blog" link, an image credit, and a closing call-to-action with a button.
 * All fragments, all repeated on every post, all dragging
 * words-per-sentence down.
 *
 * Buttons and calls to action are excluded for a second reason that matters
 * more than the arithmetic. UI text is deliberately NOT being raised to
 * college register — "Contact us" must not become "Initiate correspondence"
 * — so scoring it would create pressure to do exactly the thing the house
 * style forbids.
 */
export function mainProse(html) {
  const m = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/);
  if (!m) return '';
  let t = m[1];
  t = t.replace(/<script[\s\S]*?<\/script>/g, ' ');
  t = t.replace(/<style[\s\S]*?<\/style>/g, ' ');
  // Headings: fragments, same reasoning as the markdown path.
  t = t.replace(/<h[1-6]\b[\s\S]*?<\/h[1-6]>/g, ' ');
  // Page furniture and interface text.
  t = t.replace(/<a class="post__back"[\s\S]*?<\/a>/g, ' ');
  t = t.replace(/<p class="post__(author|meta)"[\s\S]*?<\/p>/g, ' ');
  t = t.replace(/<figcaption[\s\S]*?<\/figcaption>/g, ' ');
  t = t.replace(/<div class="end-cta[\s\S]*?<\/div>\s*<\/div>/g, ' ');
  // Attribute order is not guaranteed — the homepage CTA is written
  // <a href={...} ... class="btn">, so anchoring on `class` being first
  // silently missed it. Match the class attribute anywhere in the tag.
  t = t.replace(/<a\b[^>]*\bclass="[^"]*\bbtn\b[^"]*"[^>]*>[\s\S]*?<\/a>/g, ' ');
  t = t.replace(/<nav\b[\s\S]*?<\/nav>/g, ' ');
  // Forms are interface, not prose. Field labels ("Company", "Email",
  // "Message") and the submit button are exactly the UI text the house
  // style keeps plain, and on the homepage they were pulling the score
  // down by three grades on their own.
  t = t.replace(/<form\b[\s\S]*?<\/form>/g, ' ');
  // Quoted samples: keep the opening summary, drop later blockquotes,
  // matching dropQuotedSamples() on the markdown side.
  {
    let first = true;
    t = t.replace(/<blockquote[\s\S]*?<\/blockquote>/g, (bq) => {
      if (first) { first = false; return bq; }
      return ' ';
    });
  }
  t = t.replace(/<[^>]+>/g, ' ');
  t = t.replace(/&([a-z#0-9]+);/gi, (_, e) => ENTITIES[e.toLowerCase()] ?? ' ');
  return t.replace(/\s+/g, ' ').trim();
}

export function reportDist(distDir) {
  const out = [];
  // `page` is computed relative to distDir rather than by stripping a
  // literal "dist" prefix. The earlier version did the latter, so the
  // returned path depended on whether the caller passed "dist" or an
  // absolute path — which broke the cross-check test and would have broken
  // the CLI, since it passes an absolute path.
  const root = resolve(distDir);
  // A missing dist/ is an ordinary state, not an exception: the unit suite
  // runs before the build in both workflows. Return nothing and let the
  // caller decide — the CLI prints an instruction, the cross-check skips.
  if (!existsSync(root)) return [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'index.html') {
        const rel = '/' + relative(root, full).replace(/\\/g, '/');
        const locale = localeFromPath('dist' + rel);
        const text = mainProse(readFileSync(full, 'utf8'));
        if (!text) continue;
        const r = analyze(text, locale);
        // Very short pages (index/listing pages that are mostly links) carry
        // too few sentences for a grade to mean anything. Reported, not scored.
        const tooShort = (r.units ?? 0) < 120;
        out.push({ page: rel, ...r, tooShort, verdict: tooShort ? null : verdict(r) });
      }
    }
  };
  walk(root);
  return out;
}

/* ── CLI ───────────────────────────────────────────────────────────────── */

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--dist')) {
    const all = reportDist(join(ROOT, 'dist'));
    if (!all.length) {
      console.error('No built pages found in dist/. Run `npm run build` first.');
      process.exit(1);
    }
    const rows = all.filter((r) => !r.tooShort);
    for (const locale of LOCALES) {
      const group = rows.filter((r) => r.locale === locale);
      if (!group.length) continue;
      const t = TARGETS[locale];
      const off = group.filter((r) => r.verdict !== 'ok');
      console.log(`\n${locale}  —  target ${t.label}  —  ${group.length - off.length}/${group.length} in band`);
      for (const r of off.sort((a, b) => (a[t.metric] ?? 0) - (b[t.metric] ?? 0))) {
        console.log(`  ${r.verdict === 'above' ? '⬆️ ' : '⬇️ '} ${String(r[t.metric]).padStart(6)}  ${r.page}`);
      }
    }
    process.exit(0);
  }
  const rows = report();
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(rows, null, 2));
  } else {
    const MARK = { ok: '✅', above: '⬆️ ', below: '⬇️ ' };
    for (const locale of LOCALES) {
      const group = rows.filter((r) => r.locale === locale);
      const target = TARGETS[locale];
      const metric = target.metric;
      console.log(`\n${locale}  —  target ${target.label}`);
      for (const r of group.sort((a, b) => (a[metric] ?? 0) - (b[metric] ?? 0))) {
        console.log(
          `  ${MARK[r.verdict] ?? '  '} ${String(r[metric]).padStart(6)}  ${r.file.replace(/\.md$/, '').slice(0, 58)}`,
        );
      }
      const inBand = group.filter((r) => r.verdict === 'ok').length;
      const values = group.map((r) => r[metric]).filter((v) => v != null);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      console.log(`  ── ${inBand}/${group.length} in band · mean ${mean.toFixed(1)}`);

      const runaway = group.filter((r) => sentenceGuard(r) === 'runaway');
      for (const r of runaway) {
        console.log(
          `  ⚠️  ${String(r.charsPerSentence).padStart(6)} chars/sentence (max ${MAX_CHARS_PER_SENTENCE})  ${r.file}`,
        );
      }
    }
  }
}
