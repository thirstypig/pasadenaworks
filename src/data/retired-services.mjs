/**
 * Service pages retired on 2026-09-14, when the site moved from general small
 * businesses to independent health practices. Both folded into "Get more
 * patients" (id `websites`), in every locale.
 *
 * Plain ESM, not TypeScript, because astro.config.mjs imports it. Keys carry no
 * trailing slash — Astro's static build writes each one to `<key>/index.html`.
 * `retired-services.test.ts` derives the expected map from `services.ts` and
 * `SEGMENTS`, so a slug typo here fails a test instead of shipping a 404.
 */
export const RETIRED_SERVICE_REDIRECTS = {
  '/services/get-found-on-google': '/services/websites/',
  '/services/paid-advertising': '/services/websites/',
  '/es/servicios/aparecer-en-google': '/es/servicios/sitios-web/',
  '/es/servicios/publicidad-pagada': '/es/servicios/sitios-web/',
  '/zh-hans/fuwu/guge-tuiguang': '/zh-hans/fuwu/wangzhan-jianshe/',
  '/zh-hans/fuwu/fufei-guanggao': '/zh-hans/fuwu/wangzhan-jianshe/',
  '/zh-hant/fuwu/google-tuiguang': '/zh-hant/fuwu/wangzhan-jianzhi/',
  '/zh-hant/fuwu/fufei-guanggao': '/zh-hant/fuwu/wangzhan-jianzhi/',
};
