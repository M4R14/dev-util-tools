import { DEFAULT_XML_INDENT, assertValidXml, formatXml, minifyXml } from '../../tools/xmlUtils';
import { assertOptionType, assertSupportedOperation, asString } from '../validators';
import type { ToolRunner } from './types';

export const runXmlFormatter: ToolRunner = (operation, input, context, options) => {
  assertSupportedOperation(context.tool, operation, context.supportedOperations);
  assertOptionType(options?.indent, 'number', 'indent');
  const raw = asString(input, 'input');
  const indent = typeof options?.indent === 'number' ? options.indent : DEFAULT_XML_INDENT;

  if (operation === 'format') {
    return formatXml(raw, indent);
  }
  if (operation === 'minify') {
    return minifyXml(raw);
  }
  if (operation === 'validate') {
    assertValidXml(raw, indent);
    return { valid: true };
  }

  throw new Error(`Unsupported operation "${operation}" for xml-formatter`);
};
