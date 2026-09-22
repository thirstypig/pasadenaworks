import { describe, it, expect } from 'vitest';
import { t } from './utils';

/** How each locale names the language the call happens in. English needs no
 *  mention — the page and the call already match. */
const ENGLISH = { es: 'inglés', 'zh-hans': '英语', 'zh-hant': '英語' } as const;

describe('the booking label', () => {
  it('tells a non-English reader the call is in English', () => {
    // The owner consults in English only. A Spanish or Chinese reader who books
    // from their own-language page would otherwise reach a language they did
    // not expect, which costs both of them the call.
    for (const [locale, word] of Object.entries(ENGLISH)) {
      expect(t(locale as keyof typeof ENGLISH).nav.bookCall, locale).toContain(word);
    }
  });

  it('says the call is free in every locale', () => {
    const FREE = { en: 'free', es: 'gratuita', 'zh-hans': '免费', 'zh-hant': '免費' } as const;
    for (const [locale, word] of Object.entries(FREE)) {
      expect(t(locale as keyof typeof FREE).nav.bookCall, locale).toContain(word);
    }
  });
});
