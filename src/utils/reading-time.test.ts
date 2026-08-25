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
});
