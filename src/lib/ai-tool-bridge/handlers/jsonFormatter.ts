import { assertOptionType, assertSupportedOperation, asString } from '../validators';
import type { ToolRunner } from './types';

export const runJsonFormatter: ToolRunner = (operation, input, context, options) => {
  assertSupportedOperation(context.tool, operation, context.supportedOperations);
  assertOptionType(options?.indent, 'number', 'indent');
  const raw = asString(input, 'input');
  const parsed = JSON.parse(raw);

  if (operation === 'format') {
    const indent = typeof options?.indent === 'number' ? options.indent : 2;
    return JSON.stringify(parsed, null, indent);
  }
  if (operation === 'minify') {
    return JSON.stringify(parsed);
  }
  if (operation === 'validate') {
    return { valid: true };
  }

  throw new Error(`Unsupported operation "${operation}" for json-formatter`);
};
