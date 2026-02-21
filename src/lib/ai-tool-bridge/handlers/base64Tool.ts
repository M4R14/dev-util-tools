import { decodeUnicodeFromBase64, encodeUnicodeToBase64 } from '../transforms/base64';
import { assertSupportedOperation, asString } from '../validators';
import type { ToolRunner } from './types';

export const runBase64Tool: ToolRunner = (operation, input, context, _options) => {
  assertSupportedOperation(context.tool, operation, context.supportedOperations);
  const raw = asString(input, 'input');

  if (operation === 'encode') return encodeUnicodeToBase64(raw);
  if (operation === 'decode') return decodeUnicodeFromBase64(raw);

  throw new Error(`Unsupported operation "${operation}" for base64-tool`);
};
