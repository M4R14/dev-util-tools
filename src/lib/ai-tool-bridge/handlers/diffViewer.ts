import { computeDiff, getDiffStats } from '../../diffUtils';
import { assertOptionType, assertSupportedOperation, asObject, asString } from '../validators';
import type { ToolRunner } from './types';

export const runDiffViewer: ToolRunner = (operation, input, context, options) => {
  assertSupportedOperation(context.tool, operation, context.supportedOperations);
  assertOptionType(options?.includeLines, 'boolean', 'includeLines');
  if (operation !== 'compare') {
    throw new Error(`Unsupported operation "${operation}" for diff-viewer`);
  }

  const payload = asObject(input, 'input');
  const original = asString(payload.original, 'input.original');
  const modified = asString(payload.modified, 'input.modified');
  const lines = computeDiff(original, modified);
  const stats = getDiffStats(lines);
  const includeLines = options?.includeLines !== false;

  return includeLines ? { stats, lines } : { stats };
};
