import { compareJsonValues, summarizeJsonDifferences } from '../../tools/jsonCompare';
import { assertSupportedOperation, asObject } from '../validators';
import type { ToolRunner } from './types';

/**
 * Takes already-parsed values rather than JSON text: the caller has structured input by the time
 * it reaches the bridge, and re-serialising it only to parse it again would let a formatting
 * choice change the answer — the opposite of what a structural comparison is for.
 */
export const runJsonCompare: ToolRunner = (operation, input, context) => {
  assertSupportedOperation(context.tool, operation, context.supportedOperations);

  if (operation !== 'compare') {
    throw new Error(`Unsupported operation "${operation}" for json-compare`);
  }

  const payload = asObject(input, 'input');

  if (!('left' in payload) || !('right' in payload)) {
    throw new Error('input must be an object with "left" and "right" values');
  }

  const result = compareJsonValues(payload.left, payload.right);

  return {
    identical: result.identical,
    summary: summarizeJsonDifferences(result.differences),
    differences: result.differences,
  };
};
