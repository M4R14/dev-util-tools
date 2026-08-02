import { DEFAULT_JSON_INDENT, assertValidJson, formatJson, minifyJson } from '../../jsonUtils';
import { assertOptionType, assertSupportedOperation, asString } from '../validators';
import type { ToolRunner } from './types';

export const runJsonFormatter: ToolRunner = (operation, input, context, options) => {
  assertSupportedOperation(context.tool, operation, context.supportedOperations);
  assertOptionType(options?.indent, 'number', 'indent');
  const raw = asString(input, 'input');

  if (operation === 'format') {
    const indent = typeof options?.indent === 'number' ? options.indent : DEFAULT_JSON_INDENT;
    return formatJson(raw, indent);
  }
  if (operation === 'minify') {
    return minifyJson(raw);
  }
  if (operation === 'validate') {
    assertValidJson(raw);
    return { valid: true };
  }

  throw new Error(`Unsupported operation "${operation}" for json-formatter`);
};
