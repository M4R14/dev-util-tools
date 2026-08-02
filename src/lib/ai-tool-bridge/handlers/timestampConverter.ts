import { describeTimestamp, parseTimestamp } from '../../tools/timestamp';
import { assertSupportedOperation, asString } from '../validators';
import type { ToolRunner } from './types';

export const runTimestampConverter: ToolRunner = (operation, input, context) => {
  assertSupportedOperation(context.tool, operation, context.supportedOperations);

  if (operation !== 'parse') {
    throw new Error(`Unsupported operation "${operation}" for timestamp-converter`);
  }

  const parsed = parseTimestamp(asString(input, 'input'));

  return {
    detectedUnit: parsed.detectedUnit,
    epochSeconds: parsed.epochSeconds,
    epochMilliseconds: parsed.epochMilliseconds,
    iso: parsed.date.toISOString(),
    views: describeTimestamp(parsed),
  };
};
