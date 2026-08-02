/**
 * Text diffing utility functions.
 * Powered by the `diff` library (https://github.com/kpdecker/jsdiff).
 */

import * as Diff from 'diff';

export type DiffLineType = 'added' | 'removed' | 'unchanged';

export interface DiffLine {
  type: DiffLineType;
  value: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffStats {
  additions: number;
  deletions: number;
  unchanged: number;
}

/**
 * Compute a line-based diff between two strings using the `diff` library.
 * Returns an array of DiffLine objects representing the differences.
 */
export const computeDiff = (original: string, modified: string): DiffLine[] => {
  if (original === modified) {
    if (!original) return [];
    return original.split('\n').map((line, i) => ({
      type: 'unchanged' as const,
      value: line,
      oldLineNumber: i + 1,
      newLineNumber: i + 1,
    }));
  }

  const changes = Diff.diffLines(original, modified);
  const result: DiffLine[] = [];
  let oldLineNum = 1;
  let newLineNum = 1;

  for (const change of changes) {
    // diffLines includes trailing newlines in value; split and remove the trailing empty entry
    const lines = change.value.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();

    for (const line of lines) {
      if (change.added) {
        result.push({ type: 'added', value: line, newLineNumber: newLineNum++ });
      } else if (change.removed) {
        result.push({ type: 'removed', value: line, oldLineNumber: oldLineNum++ });
      } else {
        result.push({
          type: 'unchanged',
          value: line,
          oldLineNumber: oldLineNum++,
          newLineNumber: newLineNum++,
        });
      }
    }
  }

  return result;
};

/**
 * Calculate diff statistics from a diff result.
 */
export const getDiffStats = (diff: DiffLine[]): DiffStats => {
  return diff.reduce(
    (stats, line) => {
      switch (line.type) {
        case 'added':
          stats.additions++;
          break;
        case 'removed':
          stats.deletions++;
          break;
        case 'unchanged':
          stats.unchanged++;
          break;
      }
      return stats;
    },
    { additions: 0, deletions: 0, unchanged: 0 } as DiffStats,
  );
};

/**
 * Generate a unified diff string output (similar to `diff -u`).
 * Uses `Diff.createPatch` from the `diff` library for proper hunks.
 */
export const toUnifiedDiff = (
  original: string,
  modified: string,
  originalLabel = 'Original',
  modifiedLabel = 'Modified',
): string => {
  if (original === modified) return '';
  return Diff.createPatch('file', original, modified, originalLabel, modifiedLabel);
};
