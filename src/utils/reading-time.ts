/**
 * Reading time from a post's raw markdown body, rounded up, minimum 1 minute.
 * Astro's glob loader exposes the raw markdown source as `post.body`
 * (frontmatter already stripped).
 *
 * Latin text is counted in words at 200wpm. CJK is counted in *characters* at
 * 400cpm, because Chinese doesn't put spaces between words — splitting on
 * whitespace counts a whole paragraph as a single word and reports every
 * Chinese post as "1 分鐘". A mixed body adds both budgets.
 */
const WORDS_PER_MINUTE = 200;
const CJK_CHARS_PER_MINUTE = 400;

/** Han ideographs (incl. Ext A and compatibility) plus kana. */
const CJK = /[㐀-䶿一-鿿豈-﫿぀-ヿ]/gu;

/** CJK/fullwidth punctuation — reading time ignores it entirely rather than
 *  letting `，。` tokens inflate the Latin word count. */
const CJK_PUNCTUATION = /[　-〿！-／：-＠［-｀｛-･]/gu;

export function readingTime(body: string | undefined): number {
  if (!body) return 1;

  const cjkChars = (body.match(CJK) ?? []).length;
  const latin = body.replace(CJK, ' ').replace(CJK_PUNCTUATION, ' ');
  const words = latin.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(
    1,
    Math.ceil(cjkChars / CJK_CHARS_PER_MINUTE + words / WORDS_PER_MINUTE)
  );
}
