import { generatePassword, getPasswordCharset } from '../../passwordGenerator';
import { getPasswordStrength } from '../../passwordStrength';
import { assertOptionType, assertSupportedOperation } from '../validators';
import { BridgeValidationError } from '../errors';
import type { ToolRunner } from './types';

const LENGTH_BOUNDS = { min: 4, max: 64 };

export const runPasswordGenerator: ToolRunner = (operation, _input, context, options) => {
  assertSupportedOperation(context.tool, operation, context.supportedOperations);
  assertOptionType(options?.length, 'number', 'length');
  assertOptionType(options?.includeUpper, 'boolean', 'includeUpper');
  assertOptionType(options?.includeLower, 'boolean', 'includeLower');
  assertOptionType(options?.includeNumbers, 'boolean', 'includeNumbers');
  assertOptionType(options?.includeSymbols, 'boolean', 'includeSymbols');

  if (operation !== 'generate') {
    throw new Error(`Unsupported operation "${operation}" for password-gen`);
  }

  const length = typeof options?.length === 'number' ? options.length : 16;

  if (!Number.isInteger(length) || length < LENGTH_BOUNDS.min || length > LENGTH_BOUNDS.max) {
    throw new BridgeValidationError(
      `options.length must be an integer between ${LENGTH_BOUNDS.min} and ${LENGTH_BOUNDS.max}, received ${length}.`,
      {
        code: 'INVALID_OPTION',
        hints: [`Use options.length between ${LENGTH_BOUNDS.min} and ${LENGTH_BOUNDS.max}`],
      },
    );
  }

  const passwordOptions = {
    length,
    includeUpper: options?.includeUpper !== false,
    includeLower: options?.includeLower !== false,
    includeNumbers: options?.includeNumbers !== false,
    includeSymbols: options?.includeSymbols !== false,
  };

  const charset = getPasswordCharset(passwordOptions);

  if (!charset) {
    throw new BridgeValidationError('At least one character set must be enabled.', {
      code: 'INVALID_OPTION',
      hints: ['Leave one of includeUpper/includeLower/includeNumbers/includeSymbols enabled'],
    });
  }

  return {
    password: generatePassword(passwordOptions),
    poolSize: charset.length,
    strength: getPasswordStrength(passwordOptions).label,
  };
};
