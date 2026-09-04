import { ui, type Locale, type UIStrings } from './ui';

/** Translation helper. Usage: `t(locale).nav.home`. */
export function t(locale: Locale): UIStrings {
  return ui[locale];
}

/* `localePath` lived here and was a byte-for-byte duplicate of `localeUrl` in
 * ./routes, except that it hardcoded 'en' where localeUrl reads DEFAULT_LOCALE.
 * That was the drift: changing DEFAULT_LOCALE would have moved 42 localeUrl
 * call sites correctly while the nav silently kept prefixing against 'en'.
 * Only Header and Footer used it — which is also where the hardcoded English
 * blog link survived, because a developer writing a nav link was in this file,
 * where no blog helper exists. One function now: import localeUrl from
 * ./routes. */
