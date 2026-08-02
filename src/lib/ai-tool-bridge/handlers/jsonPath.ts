import { queryJsonPath } from '../../tools/jsonPath';
import { assertSupportedOperation, asObject, asString } from '../validators';
import type { ToolRunner } from './types';

export const runJsonPath: ToolRunner = (operation, input, context) => {
  assertSupportedOperation(context.tool, operation, context.supportedOperations);

  if (operation !== 'query') {
    throw new Error(`Unsupported operation "${operation}" for json-path`);
  }

  const payload = asObject(input, 'input');
  const path = asString(payload.path, 'input.path');

  if (!('value' in payload)) {
    throw new Error('input must be an object with "value" and "path"');
  }

  const matches = queryJsonPath(payload.value, path);

  return { count: matches.length, matches };
};
