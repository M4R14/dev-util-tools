import { computeDiff, getDiffStats, toUnifiedDiff } from './diffUtils';

describe('diffUtils', () => {
  it('returns unchanged lines when content is equal', () => {
    const diff = computeDiff('a\nb', 'a\nb');

    expect(diff).toEqual([
      { type: 'unchanged', value: 'a', oldLineNumber: 1, newLineNumber: 1 },
      { type: 'unchanged', value: 'b', oldLineNumber: 2, newLineNumber: 2 },
    ]);
  });

  it('computes diff stats for added and removed lines', () => {
    const diff = computeDiff('a\nb', 'a\nc');
    const stats = getDiffStats(diff);

    expect(stats).toEqual({ additions: 1, deletions: 1, unchanged: 1 });
  });

  it('creates unified diff output for different content', () => {
    const patch = toUnifiedDiff('one\ntwo', 'one\nthree', 'Old', 'New');

    expect(patch).toMatch(/--- file\s+Old/);
    expect(patch).toMatch(/\+\+\+ file\s+New/);
    expect(toUnifiedDiff('same', 'same')).toBe('');
  });
});
