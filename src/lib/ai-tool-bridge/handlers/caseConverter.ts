import { toCamelCase, toKebabCase, toPascalCase, toSnakeCase } from '../../caseUtils';
import { SUPPORTED_CASE_TARGETS } from '../catalog';
import { BridgeValidationError, getClosestMatch } from '../errors';
import { assertOptionType, assertSupportedOperation, asString } from '../validators';
import type { ToolRunner } from './types';

export const runCaseConverter: ToolRunner = (operation, input, context, options) => {
  assertSupportedOperation(context.tool, operation, context.supportedOperations);
  assertOptionType(options?.target, 'string', 'target');
  if (operation !== 'convert') {
    throw new Error(`Unsupported operation "${operation}" for case-converter`);
  }

  const raw = asString(input, 'input');
  const target = options?.target;
  if (target === 'snake') return toSnakeCase(raw);
  if (target === 'kebab') return toKebabCase(raw);
  if (target === 'camel') return toCamelCase(raw);
  if (target === 'pascal') return toPascalCase(raw);

  throw new BridgeValidationError(
    `Invalid options.target "${String(
      target,
    )}" for case-converter. Supported targets: ${SUPPORTED_CASE_TARGETS.join(', ')}.`,
    {
      code: 'INVALID_OPTION',
      didYouMean:
        typeof target === 'string' ? getClosestMatch(target, SUPPORTED_CASE_TARGETS) : undefined,
      hints: [
        'Use options.target = "snake" | "kebab" | "camel" | "pascal"',
        `Received: ${String(target)}`,
      ],
    },
  );
};
