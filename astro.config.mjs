import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://pasadenaworks.com',

  // FAIL on a busy port instead of quietly taking the next one.
  //
  // `--port 3180` is a preference, not a reservation: Astro increments when the
  // port is busy and still reports success. On 2026-09-06 a second `preview`
  // carrying `--port 3180` on its own command line ended up serving on 3181,
  // which is the ops-panel's reserved slot — so a request to the ops panel
  // answered 200 with GA tags instead of its 401. The mismatch between the
  // `--port` argument and the listening port was the whole diagnosis, and
  // nothing surfaced it, because both halves of the system were reporting
  // success.
  //
  // strictPort turns that into `exit 1` and "Preview server process exited
  // before becoming ready." Ports here come from a cross-project registry
  // (~/Projects/MASTER-PORTS.md), so a busy reserved port is never something to
  // route around — it means a stale server is already holding it, and the right
  // answer is `astro preview stop`, not a silent move one slot to the right.
  //
  // Note `astro preview` is a DETACHED DAEMON in Astro 7: `npm run preview`
  // returns to the prompt and leaves the server running past the terminal.
  // That is how four of these accumulated across two repos. `npm run
  // preview:status` / `preview:stop` are the way out.
  vite: {
    server: { strictPort: true },
    preview: { strictPort: true },
  },

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
