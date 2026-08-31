import { describe, it, expect } from 'vitest';
import { readingTime } from './reading-time';

describe('readingTime', () => {
  it('returns 1 minute for undefined body', () => {
    expect(readingTime(undefined)).toBe(1);
  });

  it('returns 1 minute for an empty or whitespace-only body', () => {
    expect(readingTime('')).toBe(1);
    expect(readingTime('   \n\t  ')).toBe(1);
  });

  it('returns 1 minute for a body under 200 words', () => {
    const body = Array(50).fill('word').join(' ');
    expect(readingTime(body)).toBe(1);
  });

  it('rounds up rather than down (201 words is 2 minutes, not 1)', () => {
    const body = Array(201).fill('word').join(' ');
    expect(readingTime(body)).toBe(2);
  });

  it('computes multiple minutes correctly at 200wpm', () => {
    const body = Array(650).fill('word').join(' ');
    expect(readingTime(body)).toBe(4); // ceil(650/200) = 4
  });

  it('collapses multiple whitespace/newlines between words instead of over-counting', () => {
    const body = 'one\n\n  two   three\tfour';
    expect(readingTime(body)).toBe(1);
  });

  // CJK has no spaces between words, so splitting on whitespace counts a whole
  // paragraph as one "word". The same article read 3 min in English and
  // 1 分鐘 in Chinese on the live site until this was fixed.
  it('counts CJK by character, not by whitespace-delimited word', () => {
    const body = '中'.repeat(800); // one whitespace-"word", 800 characters
    expect(readingTime(body)).toBe(2); // ceil(800/400)
  });

  it('does not report 1 minute for a substantial CJK body', () => {
    const body = '小型企業網站需要做對五件事。'.repeat(60); // ~840 chars
    expect(readingTime(body)).toBeGreaterThan(1);
  });

  it('handles a mixed CJK + Latin body by adding both budgets', () => {
    // 400 CJK chars (1 min) + 200 Latin words (1 min) = 2 min
    const body = '中'.repeat(400) + ' ' + Array(200).fill('word').join(' ');
    expect(readingTime(body)).toBe(2);
  });

  it('still ignores CJK punctuation when counting characters', () => {
    // 400 ideographs plus punctuation should stay at 1 minute, not tip to 2
    const body = ('中'.repeat(10) + '，。').repeat(40);
    expect(readingTime(body)).toBe(1);
  });
});
