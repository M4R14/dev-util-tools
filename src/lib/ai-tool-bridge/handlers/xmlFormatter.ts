import xmlFormat from 'xml-formatter';
import { assertOptionType, assertSupportedOperation, asString } from '../validators';
import type { ToolRunner } from './types';

export const runXmlFormatter: ToolRunner = (operation, input, context, options) => {
  assertSupportedOperation(context.tool, operation, context.supportedOperations);
  assertOptionType(options?.indent, 'number', 'indent');
  const raw = asString(input, 'input');
  const indent = typeof options?.indent === 'number' ? options.indent : 2;

  if (operation === 'format') {
    return xmlFormat(raw, {
      indentation: ' '.repeat(indent),
      collapseContent: true,
      lineSeparator: '\n',
      throwOnFailure: true,
    });
  }
  if (operation === 'minify') {
    return xmlFormat.minify(raw, {
      collapseContent: true,
      throwOnFailure: true,
    });
  }
  if (operation === 'validate') {
    xmlFormat(raw, {
      indentation: ' '.repeat(indent),
      collapseContent: true,
      lineSeparator: '\n',
      throwOnFailure: true,
    });
    return { valid: true };
  }

  throw new Error(`Unsupported operation "${operation}" for xml-formatter`);
};
