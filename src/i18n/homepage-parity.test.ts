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
    // 亞凱迪亞（Arcadia）商家網站設計與在地推廣 — so "Arcadia" renders ultra-bold
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

  it('keeps the localized homepage reading its copy from home.ts', () => {
    // Guards the other direction: parity must not be achieved by hardcoding
    // English strings into the localized page.
    expect(localized).toContain('copy.heroHeading');
    expect(localized).toContain('copy.servicesHeading');
    expect(localized).not.toContain('Digital work for small businesses');
  });
});
