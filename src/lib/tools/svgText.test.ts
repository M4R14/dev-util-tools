import { describe, expect, it } from 'vitest';
import { truncateToWidth, type MeasureText } from './svgText';

/** Ten units per grapheme cluster, so the assertions read as counts rather than pixels. */
const perCluster: MeasureText = (text) =>
  Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)).length * 10;

describe('truncateToWidth', () => {
  it('leaves a string that already fits alone', () => {
    expect(truncateToWidth('abcd', 100, perCluster)).toBe('abcd');
  });

  it('returns an empty string untouched', () => {
    expect(truncateToWidth('', 100, perCluster)).toBe('');
  });

  it('fits exactly at the limit without truncating', () => {
    expect(truncateToWidth('abcde', 50, perCluster)).toBe('abcde');
  });

  it('truncates with an ellipsis that is itself counted', () => {
    // 5 clusters at 10 each is 50; the ellipsis costs one cluster, so 3 letters plus it fit in 40.
    expect(truncateToWidth('abcde', 40, perCluster)).toBe('abc…');
  });

  it('keeps shortening until the result actually fits', () => {
    expect(truncateToWidth('abcdefghij', 30, perCluster)).toBe('ab…');
  });

  it('returns the ellipsis alone rather than nothing when nothing fits', () => {
    // A blank label would read as "this person has no name", which is a different claim.
    expect(truncateToWidth('abcde', 5, perCluster)).toBe('…');
  });

  it('never splits a Thai vowel or tone mark from its consonant', () => {
    const name = 'เกิดที่เชียงใหม่';
    const result = truncateToWidth(name, 60, perCluster);

    expect(result.endsWith('…')).toBe(true);
    // A code-point slice would leave a combining mark stranded, which renders as a dotted circle.
    expect(result).not.toMatch(/^[ัิ-ฺ็-๎]/);
    expect(name.startsWith(result.slice(0, -1))).toBe(true);
  });

  it('counts a Thai cluster as one unit, not one per code point', () => {
    // 'กิ' is two code points but one cluster, so four of them fit where four letters would.
    expect(truncateToWidth('กิกิกิกิ', 40, perCluster)).toBe('กิกิกิกิ');
  });

  it('keeps a multi-code-point emoji whole and counts it once', () => {
    // The family emoji is four people joined by zero-width joiners but one cluster, so a 30-unit
    // budget buys it, one letter and the ellipsis — not a fragment of it.
    expect(truncateToWidth('👨‍👩‍👧‍👦abcdef', 30, perCluster)).toBe('👨‍👩‍👧‍👦a…');
  });

  it('handles a measurer that reports zero by leaving the text alone', () => {
    // This is the no-canvas fallback: overflowing beats blanking every label.
    expect(truncateToWidth('a very long name indeed', 10, () => 0)).toBe('a very long name indeed');
  });
});
