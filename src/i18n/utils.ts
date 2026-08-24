import { ui, type Locale, type UIStrings } from './ui';

/** Translation helper. Usage: `t(locale).nav.home`. */
export function t(locale: Locale): UIStrings {
  return ui[locale];
}

/** Build a locale-prefixed path from segments. English (default) gets no
 *  prefix. Always returns a leading- and trailing-slash path. */
export function localePath(locale: Locale, ...segments: string[]): string {
  const parts = [...(locale === 'en' ? [] : [locale]), ...segments.filter(Boolean)];
  const path = parts.join('/');
  return path ? `/${path}/` : '/';
}
