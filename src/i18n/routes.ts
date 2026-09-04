/**
 * ─────────────────────────────────────────────────────────────────────────
 *  TRANSLATED URL SEGMENTS + HREFLANG BUILDERS
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  `/services/websites/` → `/es/servicios/sitios-web/` → `/zh-hant/fuwu/wangzhan-jianzhi/`
 *
 *  Both the path segment ("services") and the slug ("websites") are
 *  translated — a Spanish speaker searches "sitios web," not "websites."
 *  Never mix an English segment with a translated slug.
 *
 *  The city-landing hub reuses the "websites" service slug as its own path
 *  segment, per the URL diagram in README.md:
 *
 *    /websites/            /es/sitios-web/            city hub
 *    /websites/pasadena/   /es/sitios-web/alhambra/    city detail
 */

import { site } from '../data/site';
import { services } from '../data/services';
import { DEFAULT_LOCALE, HTML_LANG, type Locale } from './ui';

/** Path segments per locale.
 *
 *  The type here is an ANNOTATION, not an `as` assertion, and that distinction
 *  is load-bearing. `{...} as Record<Locale, string>` compiles happily with a
 *  locale missing, because Record<Locale,string> is assignable to the narrower
 *  literal type — which is all `as` checks. The annotated form errors instead:
 *
 *    error TS2741: Property 'ko' is missing in type '{ en: ...; es: ... }'
 *
 *  That matters because a missing segment is not a crash. It types as `string`
 *  while being `undefined`, and localeUrl()'s `segments.filter(Boolean)` then
 *  silently DROPS it — shipping /zh-hant/wangzhan-jianzhi/ instead of
 *  /zh-hant/fuwu/wangzhan-jianzhi/, a hard-rule-3 violation that builds green
 *  with the hreflang alternates dutifully following it to the wrong URL. */
export const SEGMENTS: {
  services: Record<Locale, string>;
  cityHub: Record<Locale, string>;
  blog: Record<Locale, string>;
} = {
  services: {
    en: 'services',
    es: 'servicios',
    'zh-hans': 'fuwu',
    'zh-hant': 'fuwu',
  },

  /** The city-hub path segment. Deliberately the same word as the
   *  "websites" service slug — see the URL diagram above. */
  cityHub: services.find((s) => s.id === 'websites')!.slugs,

  /** The blog index path segment, per locale. "blog" stays as-is for
   *  Spanish (a naturalized loanword, not read as English) — zh-hans/
   *  zh-hant use "boke" (博客), pinyin-romanized to match the rest of the
   *  site's segments (e.g. "fuwu" for 服务/服務). */
  blog: {
    en: 'blog',
    es: 'blog',
    'zh-hans': 'boke',
    'zh-hant': 'boke',
  },
};

/** Build a path for a given locale, joining segments and adding the locale
 *  prefix (skipped for the default locale). Always leading+trailing slash. */
export function localeUrl(locale: Locale, ...segments: string[]): string {
  const parts = [
    ...(locale === DEFAULT_LOCALE ? [] : [locale]),
    ...segments.filter(Boolean),
  ];
  const path = parts.join('/');
  return path ? `/${path}/` : '/';
}

/** Absolute URL (with site origin) for a locale path. */
export function absoluteUrl(path: string): string {
  return new URL(path, site.url).toString();
}

export interface Alternate {
  hreflang: string;
  href: string;
}

/**
 * Build the hreflang alternate list for a page.
 *
 * `pathsByLocale` must contain ONLY the locales this exact page really
 * exists in — never assume all four. Returns an empty array if the page
 * exists in fewer than two locales (a single-language page claims no
 * alternates at all — hard rule #1 in CLAUDE.md).
 */
export function buildAlternates(pathsByLocale: Partial<Record<Locale, string>>): Alternate[] {
  // FILTER, don't cast. Partial<Record<...>> admits an explicit `undefined`
  // value, Object.entries COUNTS that key, so `{ en: '/a/', es: undefined }`
  // cleared the `< 2` guard and the cast promised the compiler a string that
  // was not there — emitting hreflang="es" href=".../undefined", which is hard
  // rule #1's exact failure from the one function written to prevent it.
  // `{ en: enPath, es: sibling?.path }` is how anyone would build a partial map.
  const entries = Object.entries(pathsByLocale).filter(
    (entry): entry is [Locale, string] => Boolean(entry[1])
  );
  if (entries.length < 2) return [];

  const alternates: Alternate[] = entries.map(([locale, path]) => ({
    hreflang: HTML_LANG[locale],
    href: absoluteUrl(path),
  }));

  const defaultPath = pathsByLocale[DEFAULT_LOCALE];
  alternates.push({
    hreflang: 'x-default',
    href: absoluteUrl(defaultPath ?? entries[0][1]),
  });

  return alternates;
}
