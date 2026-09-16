import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/**
 * The English and localized homepages must look like one site.
 *
 * WHY THEY ARE TWO FILES AT ALL. `src/pages/index.astro` holds the English copy
 * inline — the one deliberate exception to "copy lives in src/data" — while
 * `src/pages/[locale]/index.astro` reads `home.ts`. So the same design is
 * expressed twice, and nothing made the two agree.
 *
 * THE DRIFT THIS EXISTS FOR, found 2026-09-04 and fixed 2026-09-06. Three
 * differences had accumulated, and only one of them was ever chosen:
 *
 *   - The English hero carried the logo lockup; the localized heroes had no
 *     image at all, so the site looked like a different brand in three of its
 *     four languages.
 *   - English service cards used `label-frame` (the double-rule border);
 *     localized ones were plain.
 *   - The English city hub set city names in the display face; the localized
 *     hub left them in the body serif.
 *
 * WHAT IS DELIBERATELY NOT CHECKED HERE. The localized homepages carry two
 * sections the English one does not — a service-area block and a closing block
 * — because `home.ts` defines `serviceAreaHeading`, `serviceAreaIntro`,
 * `closingHeading`, `closingBody` and `closingCta` for them. That is authored
 * content, not drift, and pinning it would freeze an editorial choice. The
 * rule this file encodes is narrower: **the shared components must be styled
 * the same way in every language.**
 */

/**
 * NOTE ON LOCATION. This file lives in src/i18n/, not next to the pages it
 * reads. Anything under `src/pages/` is a ROUTE — Astro tried to build this
 * test as `/homepages.test`, which failed the build outright and left a
 * half-written `dist/`. Colocating tests works everywhere else in this repo
 * (`src/components/`, `src/data/`, `src/utils/`) because those are not the
 * routing directory. `src/i18n/` is the natural home anyway: this is a
 * cross-locale invariant, like `rendered-links.test.ts` beside it.
 */
const PAGES = fileURLToPath(new URL('../pages', import.meta.url));
const english = readFileSync(join(PAGES, 'index.astro'), 'utf8');
const localized = readFileSync(join(PAGES, '[locale]', 'index.astro'), 'utf8');
const englishCityHub = readFileSync(join(PAGES, 'websites', 'index.astro'), 'utf8');
const localizedCityHub = readFileSync(join(PAGES, '[locale]', '[section]', 'index.astro'), 'utf8');
const globalCss = readFileSync(fileURLToPath(new URL('../styles/global.css', import.meta.url)), 'utf8');

describe('the four homepages are one design', () => {
  it('shows the logo lockup in every language', () => {
    for (const [label, source] of [['english', english], ['localized', localized]] as const) {
      expect(source, `${label} homepage is missing the hero lockup`).toContain('/logo-lockup.png');
      expect(source, `${label} hero lockup is missing its frame`).toContain('hero__logo-frame');
    }
  });

  it('frames the service cards the same way in every language', () => {
    for (const [label, source] of [['english', english], ['localized', localized]] as const) {
      expect(
        source,
        `${label} service cards are missing label-frame — the two homepages would look like different sites`,
      ).toContain('service-card label-frame');
    }
  });

  it('gives the hero the same two-column shape in every language', () => {
    // The lockup only reads as intentional next to the text rather than
    // stacked under it, and that comes from these rules.
    for (const rule of ['.hero__inner', '.hero__text', '.hero__logo-frame']) {
      for (const [label, source] of [['english', english], ['localized', localized]] as const) {
        expect(source, `${label} homepage is missing ${rule}`).toContain(rule);
      }
    }
  });

  it('keeps Chinese city-hub items out of the display face', () => {
    // NOT a parity exception for its own sake. `--font-display` is
    // `'Anton', …, var(--font-cjk-display)`: Anton holds no Han glyphs, so the
    // stack hands Chinese to PingFang/Noto while Latin gets Anton. Fine for a
    // heading, which is one script throughout. Wrong for a zh city-hub item,
    // which embeds a Latin city name inside CJK prose —
    // 為亞凱迪亞（Arcadia）醫療與牙科診所帶來更多病患 — so "Arcadia" renders ultra-bold
    // condensed against regular-weight Chinese, inside one line. English and
    // Spanish items are pure Latin and never show it.
    //
    // Verified on the rendered page: the zh hub computes to the Source Serif
    // stack, the es hub to Anton.
    expect(
      localizedCityHub,
      'the zh override is what stops Anton splitting a single line into two faces',
    ).toMatch(/:global\(html\[lang\^='zh'\]\) \.city-list/);
  });

  it('sets city names in the display face on both city hubs', () => {
    for (const [label, source] of [
      ['english', englishCityHub],
      ['localized', localizedCityHub],
    ] as const) {
      const rule = source.slice(source.indexOf('.city-list {'));
      const body = rule.slice(0, rule.indexOf('}'));
      expect(
        body,
        `${label} city hub does not set the display face on .city-list`,
      ).toContain('var(--font-display)');
    }
  });

  it('gives both city hubs the same card treatment, from one rule', () => {
    // THE DRIFT THIS EXISTS FOR, found 2026-09-15. `.city-list a` — the
    // bordered-card rule — was scoped inside the localized hub, and the English
    // hub had no `a` rule at all, so /websites/ rendered bare underlined links
    // while /es/sitios-web/ and both Chinese hubs rendered cards. Four pages of
    // one type with two designs. todos/020 looked straight at this in September,
    // called it "backwards and stale", and fixed only the typography.
    //
    // The fix is one shared rule in global.css, so the guard is the ABSENCE of a
    // local copy rather than the presence of matching ones: two copies that
    // agree today are exactly what drifted last time.
    expect(globalCss, 'the shared card rule left global.css').toMatch(/\.city-list a\s*\{/);
    for (const [label, source] of [
      ['english', englishCityHub],
      ['localized', localizedCityHub],
    ] as const) {
      expect(
        source,
        `${label} city hub re-declares .city-list a — it belongs in global.css, shared by both`,
        // Matches a rule opening (`.city-list a {`, `.city-list a:hover {`),
        // not a mention: both files' comments have to name the selector to
        // explain where it went.
      ).not.toMatch(/\.city-list a[^{}\n]*\{/);
    }
  });

  it('keeps the localized homepage reading its copy from home.ts', () => {
    // Guards the other direction: parity must not be achieved by hardcoding
    // English strings into the localized page. The needle is the English H1,
    // read from the English page itself so a headline edit cannot break this
    // test, and checked to be real text so the absence check below cannot pass
    // vacuously.
    const needle = english.match(/<h1[^>]*>\s*([^<{]+?)\s*<\/h1>/)?.[1] ?? '';
    expect(needle.length, 'positive control: the English H1 is literal text').toBeGreaterThan(20);
    expect(localized).toContain('copy.heroHeading');
    expect(localized).toContain('copy.servicesHeading');
    expect(localized).not.toContain(needle);
  });
});
