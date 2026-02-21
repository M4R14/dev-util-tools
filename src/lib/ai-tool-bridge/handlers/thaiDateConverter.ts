import { formatThaiDate, parseThaiDate } from '../../thaiDate';
import { assertSupportedOperation, asString } from '../validators';
import type { ToolRunner } from './types';

export const runThaiDateConverter: ToolRunner = (operation, input, context, _options) => {
  assertSupportedOperation(context.tool, operation, context.supportedOperations);
  const raw = asString(input, 'input');

  if (operation === 'format') {
    return formatThaiDate(raw);
  }
  if (operation === 'parse') {
    const parsed = parseThaiDate(raw);
    if (!parsed) throw new Error('Unable to parse Thai date string');
    return parsed;
  }

  throw new Error(`Unsupported operation "${operation}" for thai-date-converter`);
};
