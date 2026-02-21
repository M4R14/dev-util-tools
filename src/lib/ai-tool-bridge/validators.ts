import { AI_BRIDGE_DEFAULT_INPUT, AI_BRIDGE_REQUEST_REQUIRED_FIELDS } from './contracts';
import { BridgeValidationError, getOperationSuggestion } from './errors';
import type { AIToolId, AIToolRequest, NormalizedAIToolRequest } from './types';
import { z } from 'zod';

const nonEmptyStringSchema = z.string().trim().min(1);
const plainObjectSchema = z.record(z.string(), z.unknown());

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
  const parsed = z.string().safeParse(input);
  if (!parsed.success) {
    throw new BridgeValidationError(`${fieldName} must be a string`, {
      code: 'INVALID_INPUT',
      hints: ['Ensure input value is a JSON string literal.'],
    });
  }

  return parsed.data;
};

export const asObject = (input: unknown, fieldName: string): Record<string, unknown> => {
  const parsed = plainObjectSchema.safeParse(input);
  if (!parsed.success) {
    throw new BridgeValidationError(`${fieldName} must be an object`, {
      code: 'INVALID_INPUT',
      hints: ['Ensure input value is a JSON object.'],
    });
  }

  return parsed.data;
};

export const assertRequiredFields = (
  value: string | undefined | null,
  fieldName: string,
  hints?: string[],
) => {
  const parsed = nonEmptyStringSchema.safeParse(value);
  if (!parsed.success) {
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
  if (value === undefined) {
    return;
  }

  const schemaMap = {
    string: z.string(),
    number: z.number(),
    boolean: z.boolean(),
    object: plainObjectSchema,
  } as const;
  const schema = schemaMap[expectedType];

  if (!schema.safeParse(value).success) {
    throw new BridgeValidationError(`options.${optionName} must be ${expectedType}`, {
      code: 'INVALID_OPTION',
      hints: [`Use options.${optionName} as ${expectedType}.`],
    });
  }
};

export const assertToolRequestShape = (request: AIToolRequest) => {
  const shapeSchema = z.object({
    tool: nonEmptyStringSchema,
    operation: nonEmptyStringSchema,
  });
  const parsed = shapeSchema.safeParse(request);
  if (!parsed.success) {
    parsed.error.issues.forEach((issue) => {
      const field = String(issue.path[0] ?? 'request');
      if (field === 'tool') {
        throw new BridgeValidationError('tool is required', {
          code: 'INVALID_REQUEST',
          hints: ['Provide a supported tool id.'],
        });
      }
      if (field === 'operation') {
        throw new BridgeValidationError('operation is required', {
          code: 'INVALID_REQUEST',
          hints: ['Provide operation for selected tool.'],
        });
      }
    });
    throw new BridgeValidationError('Invalid request payload', {
      code: 'INVALID_REQUEST',
      hints: ['Ensure required request fields are provided.'],
    });
  }

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
  operation: z.string().parse(request.operation).trim(),
  input: request.input ?? AI_BRIDGE_DEFAULT_INPUT,
  options: request.options,
});
