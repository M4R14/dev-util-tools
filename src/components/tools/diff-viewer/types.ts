import type { DiffLine } from '../../../lib/tools/diffUtils';

export interface SplitRow {
  oldLine?: DiffLine;
  newLine?: DiffLine;
}

export interface TextMetrics {
  lines: number;
  chars: number;
}
