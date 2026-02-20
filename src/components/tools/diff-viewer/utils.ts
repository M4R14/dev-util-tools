import type { DiffLine } from '../../../lib/diffUtils';
import type { SplitRow, TextMetrics } from './types';

export const buildSplitRows = (diff: DiffLine[]): SplitRow[] => {
  const rows: SplitRow[] = [];

  let i = 0;
  while (i < diff.length) {
    const line = diff[i];

    if (line.type === 'unchanged') {
      rows.push({ oldLine: line, newLine: line });
      i += 1;
      continue;
    }

    if (line.type === 'removed') {
      const nextLine = diff[i + 1];
      if (nextLine && nextLine.type === 'added') {
        rows.push({ oldLine: line, newLine: nextLine });
        i += 2;
      } else {
        rows.push({ oldLine: line });
        i += 1;
      }
      continue;
    }

    rows.push({ newLine: line });
    i += 1;
  }

  return rows;
};

export const getTextMetrics = (text: string): TextMetrics => ({
  lines: text ? text.split('\n').length : 0,
  chars: text.length,
});
