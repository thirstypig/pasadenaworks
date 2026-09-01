import { describe, it, expect } from 'vitest';
import { jsonLd } from './json-ld';

describe('jsonLd', () => {
  it('escapes `<` so a value cannot close the script block', () => {
    // The break-out this exists to prevent. Without the escape this string
    // ends the <script> and the rest renders as live page HTML.
    const out = jsonLd({ sameAs: ['https://x/a</script><script>alert(1)</script>'] });
    expect(out).not.toContain('</script>');
    expect(out).toContain('\\u003c/script');
  });

  it('still parses back to the same object', () => {
    // \u003c is valid JSON, so the data a search engine reads is unchanged.
    const schema = { '@type': 'LocalBusiness', name: 'Pasadena Works', sameAs: ['https://x/<a>'] };
    expect(JSON.parse(jsonLd(schema))).toEqual(schema);
  });

  it('leaves ordinary schemas byte-identical to JSON.stringify', () => {
    const schema = { '@type': 'Article', headline: 'How much should a website cost?' };
    expect(jsonLd(schema)).toBe(JSON.stringify(schema));
  });

  it('escapes every occurrence, not just the first', () => {
    expect(jsonLd({ a: '<', b: '<' })).toBe('{"a":"\\u003c","b":"\\u003c"}');
  });
});
