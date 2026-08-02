import { convertXmlToJson } from '../../xmlToJson';
import { assertOptionType, assertSupportedOperation, asString } from '../validators';
import type { ToolRunner } from './types';

export const runXmlToJson: ToolRunner = (operation, input, context, options) => {
  assertSupportedOperation(context.tool, operation, context.supportedOperations);
  assertOptionType(options?.includeAttributes, 'boolean', 'includeAttributes');
  assertOptionType(options?.trimText, 'boolean', 'trimText');

  if (operation !== 'convert') {
    throw new Error(`Unsupported operation "${operation}" for xml-to-json`);
  }

  const raw = asString(input, 'input');

  return convertXmlToJson(raw, {
    includeAttributes: options?.includeAttributes !== false,
    trimText: options?.trimText !== false,
  });
};
