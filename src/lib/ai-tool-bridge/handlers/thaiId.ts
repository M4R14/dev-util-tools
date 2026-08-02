import { analyzeThaiId, formatThaiId, generateThaiId } from '../../tools/thaiId';
import { assertSupportedOperation, asString } from '../validators';
import type { ToolRunner } from './types';

export const runThaiId: ToolRunner = (operation, input, context) => {
  assertSupportedOperation(context.tool, operation, context.supportedOperations);

  if (operation === 'generate') {
    const id = generateThaiId();
    return { id, formatted: formatThaiId(id) };
  }

  const raw = asString(input, 'input');

  if (operation === 'analyze') {
    return analyzeThaiId(raw);
  }
  if (operation === 'validate') {
    // analyzeThaiId throws on malformed input; a bad checksum is a valid-shaped answer.
    return { valid: analyzeThaiId(raw).isValid };
  }
  if (operation === 'format') {
    return formatThaiId(raw);
  }

  throw new Error(`Unsupported operation "${operation}" for thai-id`);
};
