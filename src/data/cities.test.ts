import { describe, it, expect } from 'vitest';
import { cities, cityLocales, cityBySlug, cityDisplayName, type CityCopy, type CitySlug } from './cities';
import { LOCALES } from '../i18n/ui';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

const COPY: CityCopy = { title: 't', summary: 's', body: ['b'], meta: 'm', sources: [{ label: 'l', url: 'https://example.com/' }] };

describe('cityLocales', () => {
  it('reports only the locales a city defines, never a fixed list', () => {
    // Synthetic cities on purpose. Every real city now carries all four
    // locales, so the old data-driven "the shapes must differ" check could no
    // longer fail — and a function returning a hardcoded four-locale list is
    // exactly what hard rule 1 forbids.
    expect(cityLocales({ slug: 'pasadena', t: { en: COPY } })).toEqual(['en']);
    expect(cityLocales({ slug: 'arcadia', t: { en: COPY, 'zh-hant': COPY } }).sort()).toEqual(['en', 'zh-hant']);
    expect(cityLocales({ slug: 'alhambra', t: { en: COPY, es: undefined } })).toEqual(['en']);
  });

  it('agrees with the data for every real city', () => {
    expect(cities.length).toBe(10);
    for (const city of cities) {
      expect(cityLocales(city).sort()).toEqual(
        (Object.keys(city.t) as (keyof typeof city.t)[]).filter((l) => city.t[l]).sort(),
      );
    }
  });
});

/** Figures a reader could check, with formatting that legitimately differs
 *  between languages removed: thousands separators, and a Chinese
 *  "2026 年 9 月", reduced to its year because English writes the month as a word. */
function figures(text: string): string[] {
  return (text.replace(/(\d{4})\s*年\s*\d{1,2}\s*月/g, '$1').match(/\d+(?:[.,]\d+)*/g) ?? [])
    .map((n) => n.replace(/,(?=\d{3}\b)/g, ''))
    .sort();
}

const prose = (c: CityCopy) => [c.summary, ...c.body].join(' ');

/**
 * The ONE name each city carries per Chinese script, across city pages, UI
 * strings and the blog. Pinned here, not derived: Traditional usage in the San
 * Gabriel Valley is not a character conversion of Simplified usage, and the
 * decision for each city, with its source, is in the "Chinese city names" table
 * of docs/superpowers/specs/2026-09-14-practice-city-pages-sources.md.
 *
 * Three Simplified names changed on 2026-09-15 so that the two scripts name the
 * same city: 阿尔塔迪纳 → 艾塔迪那, 格伦代尔 → 格兰岱, 圣马力诺 → 圣玛利诺. The
 * superseded spellings are in SUPERSEDED below, which is the tripwire that stops
 * one coming back.
 */
const ZH_NAME: Record<'zh-hans' | 'zh-hant', Record<CitySlug, string>> = {
  'zh-hans': {
    pasadena: '帕萨迪纳',
    altadena: '艾塔迪那',
    'south-pasadena': '南帕萨迪纳',
    glendale: '格兰岱',
    alhambra: '阿罕布拉',
    arcadia: '亚凯迪亚',
    monrovia: '蒙罗维亚',
    'san-marino': '圣玛利诺',
    'monterey-park': '蒙特利公园',
    'san-gabriel': '圣盖博',
  },
  'zh-hant': {
    pasadena: '帕薩迪納',
    altadena: '艾塔迪那',
    'south-pasadena': '南帕薩迪納',
    glendale: '格蘭岱',
    alhambra: '阿罕布拉',
    arcadia: '亞凱迪亞',
    monrovia: '蒙羅維亞',
    'san-marino': '聖瑪利諾',
    'monterey-park': '蒙特利公園',
    'san-gabriel': '聖蓋博',
  },
};

describe('city copy', () => {
  it('normalizes figures the same way in every language', () => {
    expect(figures('1,200 dentists and 23.0% in September 2026')).toEqual(figures('2026 年 9 月，1200 名牙醫，23.0%'));
    expect(figures('26 dentists')).not.toEqual(figures('62 dentists'));
  });

  it('gives every page three plain paragraphs and at least two https sources', () => {
    for (const city of cities) {
      for (const locale of cityLocales(city)) {
        const c = city.t[locale]!;
        const where = `${city.slug}/${locale}`;
        expect(c.body, where).toHaveLength(3);
        for (const p of [c.title, c.summary, c.meta, ...c.body]) expect(p, where).not.toMatch(/[<>]/);
        expect(c.sources.length, where).toBeGreaterThanOrEqual(2);
        for (const s of c.sources) {
          expect(new URL(s.url).protocol, `${where}: ${s.url}`).toBe('https:');
          expect(s.label.trim(), where).not.toBe('');
        }
      }
    }
  });

  it('titles every English page with the searched phrase', () => {
    for (const city of cities) {
      expect(city.t.en!.title, city.slug).toBe(`More patients for medical and dental practices in ${cityDisplayName(city.slug)}`);
    }
  });

  it('titles every Spanish page with the searched phrase', () => {
    // The owner's pattern, Altadena included. Reads every city rather than
    // skipping a missing locale, so an untranslated page fails here too.
    for (const city of cities) {
      expect(city.t.es?.title, city.slug).toBe(`Más pacientes para consultorios médicos y dentales en ${cityDisplayName(city.slug)}`);
    }
  });

  it('titles every Simplified Chinese page with the searched phrase', () => {
    // The owner's pattern: the Chinese name readers search for, then the
    // English name in full-width parentheses. The names come from ZH_NAME above.
    for (const city of cities) {
      expect(city.t['zh-hans']?.title, city.slug).toBe(
        `为${ZH_NAME['zh-hans'][city.slug]}（${cityDisplayName(city.slug)}）医疗与牙科诊所带来更多患者`,
      );
    }
  });

  it('titles every Traditional Chinese page with the searched phrase', () => {
    // Same owner pattern in Traditional script.
    for (const city of cities) {
      expect(city.t['zh-hant']?.title, city.slug).toBe(
        `為${ZH_NAME['zh-hant'][city.slug]}（${cityDisplayName(city.slug)}）醫療與牙科診所帶來更多病患`,
      );
    }
  });

  it('writes the pinned name in the summary, body and meta too, not only the title', () => {
    // The two title tests above pin only the title, so a body could spell a
    // city differently — or in the other script — and pass. Both halves matter:
    // the positive half catches a page that stops naming its own city, and the
    // leak half catches a Traditional name pasted into a Simplified page, which
    // is exactly how the two scripts drifted apart in the first place.
    const problems: string[] = [];
    let checked = 0;
    for (const city of cities) {
      for (const locale of ['zh-hans', 'zh-hant'] as const) {
        const c = city.t[locale];
        if (!c) continue;
        const name = ZH_NAME[locale][city.slug];
        for (const [field, text] of [
          ['summary', c.summary],
          ['body', c.body.join('')],
          ['meta', c.meta],
        ] as const) {
          checked++;
          if (!text.includes(name)) problems.push(`${city.slug}/${locale} ${field} never writes ${name}`);
        }
        // Where the two scripts write the same characters (阿罕布拉, 艾塔迪那)
        // there is nothing to leak, so those cities are skipped rather than
        // reported as a false positive.
        const other = locale === 'zh-hans' ? 'zh-hant' : 'zh-hans';
        const text = [c.summary, c.meta, ...c.body].join('');
        for (const slug of cities.map((x) => x.slug)) {
          const theirs = ZH_NAME[other][slug];
          if (ZH_NAME[locale][slug] === theirs) continue;
          if (text.includes(theirs)) problems.push(`${city.slug}/${locale} writes ${slug} as ${theirs}, the ${other} name`);
        }
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
    // Control: with no Chinese copy at all the loop above would pass vacuously.
    expect(checked).toBe(cities.length * 2 * 3);
  });

  it('keeps meta descriptions in the service pages’ bands', () => {
    const BAND = { en: [150, 158], es: [130, 160] } as const;
    for (const city of cities) {
      for (const locale of ['en', 'es'] as const) {
        const c = city.t[locale];
        if (!c) continue;
        const n = [...c.meta].length;
        expect(n, `${city.slug}/${locale} meta is ${n}`).toBeGreaterThanOrEqual(BAND[locale][0]);
        expect(n, `${city.slug}/${locale} meta is ${n}`).toBeLessThanOrEqual(BAND[locale][1]);
      }
    }
  });

  it('never reuses a paragraph with only the city name and figures swapped (hard rule 2)', () => {
    // The doorway pattern a data-backed page is most tempted by: one template,
    // new numbers. Longest names first, so "South Pasadena" masks before "Pasadena".
    const names = cities.map((c) => cityDisplayName(c.slug)).sort((a, b) => b.length - a.length);
    const mask = (p: string) =>
      names.reduce((s, n) => s.replaceAll(n, '<CITY>'), p).replace(/\d+(?:[.,]\d+)*/g, '<N>');
    const seen = new Map<string, string>();
    for (const city of cities) {
      for (const p of city.t.en!.body) {
        const key = mask(p);
        expect(seen.get(key), `${city.slug} repeats a paragraph from ${seen.get(key)}`).toBeUndefined();
        seen.set(key, city.slug);
      }
    }
    expect(seen.size).toBe(cities.length * 3);
  });

  it('carries exactly the English figures into every translation', () => {
    for (const city of cities) {
      for (const locale of cityLocales(city).filter((l) => l !== 'en')) {
        expect(figures(prose(city.t[locale]!)), `${city.slug}/${locale}`).toEqual(figures(prose(city.t.en!)));
      }
    }
  });

  it('cites the same source URLs, in the same order, in every language', () => {
    // Source links are written out per locale, so a link corrected in en.ts
    // would otherwise leave a translation pointing at the old one with nothing
    // failing (Task 3 review, 2026-09-15).
    let compared = 0;
    for (const city of cities) {
      const english = city.t.en!.sources.map((s) => s.url);
      for (const locale of cityLocales(city).filter((l) => l !== 'en')) {
        expect(city.t[locale]!.sources.map((s) => s.url), `${city.slug}/${locale}`).toEqual(english);
        compared++;
      }
    }
    // Control: with no translations at all this would pass vacuously.
    expect(compared).toBeGreaterThan(0);
  });
});

describe('city coverage', () => {
  it('gives every city all four languages', () => {
    // A test, not a type. `City.t` stays `Partial` so a future city CAN exist
    // in fewer languages without ever claiming a translation that 404s (hard
    // rule 1), and `cityLocales()` keeps reading the data rather than assuming
    // a fixed list. Today's decision (spec §1.3) is that every city is written
    // in all four, and this is the only thing holding the site to it — the
    // title tests above read `city.t.es?.title` and friends, so a whole locale
    // going missing would show up there as one failure per city rather than as
    // the coverage gap it is.
    const all = [...LOCALES].sort();
    for (const city of cities) expect(cityLocales(city).sort(), city.slug).toEqual(all);
    // Control: an empty `cities` array would pass the loop vacuously.
    expect(cities.length).toBe(10);
  });
});

describe('cityBySlug', () => {
  it('finds a city by its exact slug', () => {
    expect(cityBySlug('monterey-park')?.slug).toBe('monterey-park');
    expect(cityBySlug('san-gabriel')?.slug).toBe('san-gabriel');
  });

  it('returns undefined for a slug that does not exist', () => {
    expect(cityBySlug('nonexistent-city')).toBeUndefined();
  });
});

/**
 * `cityDisplayName` had TWO implementations, and they had diverged.
 *
 * THE BUG THIS EXISTS FOR. The helper lived in both `Footer.astro` and
 * `pages/websites/index.astro`. During todo 020 a `.filter(Boolean)` guard was
 * added to the Footer copy — and only to that one. The other kept the original
 * `.map((word) => word[0].toUpperCase() + ...)`, which throws on a slug with a
 * leading or doubled hyphen because `word[0]` on an empty segment is undefined.
 * `noUncheckedIndexedAccess` is off, so it types as `string` and the compiler
 * cannot see it; the failure is a build-time crash pointing at a `.map()`
 * rather than at the bad slug.
 *
 * Measured before fixing, by running both implementations:
 *
 *   slug              guarded          unguarded
 *   south-pasadena    "South Pasadena" "South Pasadena"
 *   -pasadena         "Pasadena"       THROWS
 *   south--pasadena   "South Pasadena" THROWS
 *
 * The unguarded copy even carried a comment claiming it "matches the same
 * derivation Footer.astro uses" — an assertion that had stopped being true and
 * was hiding the divergence. That comment is gone with it.
 */
const REPO = fileURLToPath(new URL('../..', import.meta.url));

describe('cityDisplayName', () => {
  it('title-cases a normal slug', () => {
    expect(cityDisplayName('south-pasadena')).toBe('South Pasadena');
    expect(cityDisplayName('monterey-park')).toBe('Monterey Park');
    expect(cityDisplayName('alhambra')).toBe('Alhambra');
  });

  it('survives a leading or doubled hyphen instead of throwing at build', () => {
    // The regression. Both of these crashed the unguarded copy.
    expect(cityDisplayName('-pasadena')).toBe('Pasadena');
    expect(cityDisplayName('south--pasadena')).toBe('South Pasadena');
    expect(cityDisplayName('pasadena-')).toBe('Pasadena');
  });

  it('renders every real city slug without throwing', () => {
    for (const city of cities) {
      expect(() => cityDisplayName(city.slug)).not.toThrow();
      expect(cityDisplayName(city.slug).length).toBeGreaterThan(0);
    }
  });

  it('is implemented once, not copied into a page or component', () => {
    // The guard that stops it diverging again. A second `const cityDisplayName`
    // anywhere is the exact shape of the bug above.
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        if (entry === 'node_modules' || entry === 'dist') continue;
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.(ts|astro)$/.test(entry) && !entry.includes('.test.')) {
          const source = readFileSync(full, 'utf8');
          if (/(const|function)\s+cityDisplayName/.test(source) &&
              relative(REPO, full) !== join('src', 'data', 'cities.ts')) {
            offenders.push(relative(REPO, full));
          }
        }
      }
    };
    walk(join(REPO, 'src'));
    expect(
      offenders,
      `these redefine cityDisplayName instead of importing it from src/data/cities.ts:\n  ${offenders.join('\n  ')}`,
    ).toEqual([]);
  });
});

/**
 * Superseded city spellings, and the name that replaced each one.
 *
 * Every entry is a spelling that was in real use — on this site, or in a source
 * the "Chinese city names" table weighed and overruled — and that must not come
 * back. The site had two names for three cities at once (the Simplified pages
 * wrote 阿尔塔迪纳/格伦代尔/圣马力诺 while the Traditional pages wrote
 * 艾塔迪那/格蘭岱/聖瑪利諾) and the blog wrote Arcadia three different ways, so
 * this is a drift that has already happened rather than one being imagined.
 *
 * Reasoning per city is in the sources file; the short version:
 *   - Arcadia — local press and the CCYP directory agree on 亞凱迪亞/亚凯迪亚;
 *     the 阿- and 阿卡- forms are national-outlet usage (VOA, RFA).
 *   - Altadena — World Journal writes 艾塔迪那 throughout its Eaton Fire and
 *     rebuilding coverage; 阿爾塔迪納 rested on VOA, a national outlet.
 *   - Glendale — World Journal and CCYP write 格蘭岱市 for California's
 *     Glendale and keep 格倫代爾 for Glendale, Arizona.
 *   - San Marino — 圣马力诺 is the standard Chinese name of the Republic of San
 *     Marino, so the page was competing with a country for its own keyword.
 *   - Pasadena / Monterey Park / San Gabriel — forms the table overruled
 *     because nobody local writes them.
 */
const SUPERSEDED: [variant: string, decided: string][] = [
  ['阿凯迪亚', '亚凯迪亚'], ['阿卡迪亚', '亚凯迪亚'],
  ['阿凱迪亞', '亞凱迪亞'], ['阿卡迪亞', '亞凱迪亞'],
  ['门罗维亚', '蒙罗维亚'], ['門羅維亞', '蒙羅維亞'],
  ['阿尔塔迪纳', '艾塔迪那'], ['阿爾塔迪納', '艾塔迪那'],
  ['阿塔迪纳', '艾塔迪那'], ['阿塔迪納', '艾塔迪那'],
  ['格伦代尔', '格兰岱'], ['格倫代爾', '格蘭岱'],
  ['圣马力诺', '圣玛利诺'], ['聖馬力諾', '聖瑪利諾'],
  ['圣马利诺', '圣玛利诺'], ['聖馬利諾', '聖瑪利諾'],
  ['巴沙迪那', '帕萨迪纳 / 帕薩迪納'],
  ['帕沙第纳', '帕萨迪纳'], ['帕沙第納', '帕薩迪納'],
  ['蒙特雷帕克', '蒙特利公园 / 蒙特利公園'],
  ['圣加布里埃尔', '圣盖博'], ['聖加布里埃爾', '聖蓋博'],
];

describe('one name per city', () => {
  it('lists no superseded spelling that is also a decided name', () => {
    // A typo here would make the tripwire below unsatisfiable: it would demand
    // that a name be removed and replaced with itself.
    const decided = new Set(Object.values(ZH_NAME).flatMap((m) => Object.values(m)));
    for (const [variant] of SUPERSEDED) expect(decided.has(variant), variant).toBe(false);
    expect(SUPERSEDED.length).toBeGreaterThan(10);
  });

  it('never writes a superseded spelling in src/, in either script', () => {
    // Walks the real files rather than the imported copy, so it covers the
    // Chinese blog posts (most of which are date-gated and absent from dist/)
    // as well as city copy, UI strings and page templates.
    //
    // Deliberately NOT walked: this file, which has to name the superseded
    // spellings to forbid them, and
    // docs/superpowers/specs/2026-09-14-practice-city-pages-sources.md, which
    // records what each source actually prints — including the overruled forms.
    const offenders: string[] = [];
    let filesScanned = 0;
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        if (entry === 'node_modules' || entry === 'dist') continue;
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          walk(full);
          continue;
        }
        if (!/\.(ts|mjs|astro|md)$/.test(entry) || entry.includes('.test.')) continue;
        filesScanned++;
        const source = readFileSync(full, 'utf8');
        for (const [variant, decided] of SUPERSEDED) {
          if (source.includes(variant)) {
            offenders.push(`${relative(REPO, full)} writes ${variant} — the name is ${decided}`);
          }
        }
      }
    };
    walk(join(REPO, 'src'));
    expect(offenders, `superseded city spellings:\n  ${offenders.join('\n  ')}`).toEqual([]);
    // Control: a walk that found nothing would pass vacuously. src/ holds 272
    // Chinese blog posts alone, so this floor cannot be met by accident.
    expect(filesScanned).toBeGreaterThan(100);
  });
});
