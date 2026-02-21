import { AI_BRIDGE_DEFAULT_INPUT, AI_BRIDGE_REQUEST_REQUIRED_FIELDS } from './contracts';
import { BridgeValidationError, getOperationSuggestion } from './errors';
import type { AIToolId, AIToolRequest, NormalizedAIToolRequest } from './types';

export const assertSupportedOperation = (
  tool: AIToolId,
  operation: string,
  supportedOperations: readonly string[],
) => {
  if (!supportedOperations.includes(operation)) {
    const suggestion = getOperationSuggestion(operation, supportedOperations);
    throw new BridgeValidationError(
      `Unsupported operation "${operation}" for "${tool}". Supported operations: ${supportedOperations.join(', ')}.`,
      {
        code: 'UNSUPPORTED_OPERATION',
        supportedOperations: [...supportedOperations],
        didYouMean: suggestion,
        hints: [
          `Use one of: ${supportedOperations.join(', ')}`,
          `Did you mean "${suggestion}"?`,
        ],
      },
    );
  }
};

export const asString = (input: unknown, fieldName: string): string => {
  if (typeof input !== 'string') {
    throw new BridgeValidationError(`${fieldName} must be a string`, {
      code: 'INVALID_INPUT',
      hints: ['Ensure input value is a JSON string literal.'],
    });
  }
  return input;
};

export const asObject = (input: unknown, fieldName: string): Record<string, unknown> => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new BridgeValidationError(`${fieldName} must be an object`, {
      code: 'INVALID_INPUT',
      hints: ['Ensure input value is a JSON object.'],
    });
  }
  return input as Record<string, unknown>;
};

export const assertRequiredFields = (
  value: string | undefined | null,
  fieldName: string,
  hints?: string[],
) => {
  if (!value || !value.trim()) {
    throw new BridgeValidationError(`${fieldName} is required`, {
      code: 'INVALID_REQUEST',
      hints: hints ?? [`Provide "${fieldName}" in request payload.`],
    });
  }
};

export const assertOptionType = (
  value: unknown,
  expectedType: 'string' | 'number' | 'boolean' | 'object',
  optionName: string,
) => {
  const isObject = expectedType === 'object';
  const isValid = isObject
    ? typeof value === 'object' && value !== null && !Array.isArray(value)
    : typeof value === expectedType;

  if (value !== undefined && !isValid) {
    throw new BridgeValidationError(`options.${optionName} must be ${expectedType}`, {
      code: 'INVALID_OPTION',
      hints: [`Use options.${optionName} as ${expectedType}.`],
    });
  }
};

export const assertToolRequestShape = (request: AIToolRequest) => {
  AI_BRIDGE_REQUEST_REQUIRED_FIELDS.forEach((field) => {
    const value = request[field];
    if (field === 'tool') {
      assertRequiredFields(value as string | undefined, field, ['Provide a supported tool id.']);
      return;
    }

    assertRequiredFields(value as string | undefined, field, [
      'Provide operation for selected tool.',
    ]);
  });

  if (request.options !== undefined) {
    assertOptionType(request.options, 'object', 'options');
  }
};

export const normalizeToolRequest = (request: AIToolRequest): NormalizedAIToolRequest => ({
  tool: request.tool,
  operation: request.operation.trim(),
  input: request.input ?? AI_BRIDGE_DEFAULT_INPUT,
  options: request.options,
});
