import { formatCurlBody, parseCurl } from '../../tools/curlParser';
import { assertSupportedOperation, asString } from '../validators';
import type { ToolRunner } from './types';

export const runCurlParser: ToolRunner = (operation, input, context) => {
  assertSupportedOperation(context.tool, operation, context.supportedOperations);

  if (operation !== 'parse') {
    throw new Error(`Unsupported operation "${operation}" for curl-parser`);
  }

  const parsed = parseCurl(asString(input, 'input'));
  const body = formatCurlBody(parsed.body);

  return { ...parsed, formattedBody: body.text, bodyIsJson: body.isJson };
};
