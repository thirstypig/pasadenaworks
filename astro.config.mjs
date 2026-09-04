import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://pasadenaworks.com',
  integrations: [
    // NO `i18n` OPTION HERE, deliberately.
    //
    // @astrojs/sitemap's i18n option builds its xhtml:link alternates by
    // stripping the locale prefix and grouping on the remaining path. This
    // site TRANSLATES that path (hard rule 3: /blog/ -> /zh-hant/boke/), so
    // the grouping structurally cannot see our real translation sets. It
    // succeeded only where two locales happened to share a slug by accident.
    //
    // Measured before removal: 14 of 66 URLs carried alternates and every one
    // except the four homepages contradicted the hreflang in that same page's
    // own HTML — /blog/ was advertised as an {en, es} cluster in the sitemap
    // while the page itself correctly claimed all four plus x-default. The
    // format as configured could not emit x-default at all. Conflicting and
    // incomplete annotations are a documented reason Google discards an
    // hreflang cluster outright, so the weaker second producer was throwing
    // away the correctness the page-level tags earn.
    //
    // Base.astro emits hreflang for every page, derived from real data via
    // buildAlternates() and unit-tested in src/i18n/routes.test.ts. One
    // producer, not two.
    sitemap(),
  ],
});
