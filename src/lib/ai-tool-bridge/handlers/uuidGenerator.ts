import { randomUUID } from '../../randomUtils';
import { assertOptionType, assertSupportedOperation } from '../validators';
import { BridgeValidationError } from '../errors';
import type { ToolRunner } from './types';

const MAX_QUANTITY = 100;

export const runUuidGenerator: ToolRunner = (operation, _input, context, options) => {
  assertSupportedOperation(context.tool, operation, context.supportedOperations);
  assertOptionType(options?.quantity, 'number', 'quantity');
  assertOptionType(options?.hyphens, 'boolean', 'hyphens');
  assertOptionType(options?.uppercase, 'boolean', 'uppercase');

  if (operation !== 'generate') {
    throw new Error(`Unsupported operation "${operation}" for uuid-generator`);
  }

  const quantity = typeof options?.quantity === 'number' ? options.quantity : 1;

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw new BridgeValidationError(
      `options.quantity must be an integer between 1 and ${MAX_QUANTITY}, received ${quantity}.`,
      {
        code: 'INVALID_OPTION',
        hints: [`Use options.quantity between 1 and ${MAX_QUANTITY}`],
      },
    );
  }

  const hyphens = options?.hyphens !== false;
  const uppercase = options?.uppercase === true;

  return Array.from({ length: quantity }, () => {
    let uuid = randomUUID();
    if (!hyphens) uuid = uuid.replace(/-/g, '');
    if (uppercase) uuid = uuid.toUpperCase();
    return uuid;
  });
};
