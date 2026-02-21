import { BridgeValidationError } from './errors';
import { ERROR_TAXONOMY } from './errorTaxonomy';
import type { AIToolId, AIToolResponse } from './types';

export const toValidationErrorResponse = (
  tool: AIToolId,
  operation: string,
  error: BridgeValidationError,
): AIToolResponse => {
  const mapped = ERROR_TAXONOMY[error.code];
  return {
    ok: false,
    tool,
    operation,
    error: error.message,
    errorDetails: {
      code: error.code,
      message: error.message,
      supportedOperations: error.supportedOperations,
      supportedTools: error.supportedTools,
      didYouMean: error.didYouMean,
      hints: error.hints,
    },
    problem: {
      type: mapped.type,
      title: mapped.title,
      status: error.status ?? mapped.status,
      detail: error.message,
    },
  };
};

export const toExecutionErrorResponse = (
  tool: AIToolId,
  operation: string,
  error: unknown,
): AIToolResponse => {
  const mapped = ERROR_TAXONOMY.EXECUTION_ERROR;
  return {
    ok: false,
    tool,
    operation,
    error: error instanceof Error ? error.message : 'Unknown error',
    errorDetails: {
      code: 'EXECUTION_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
      hints: ['Verify input shape, operation name, and option types before retrying.'],
    },
    problem: {
      type: mapped.type,
      title: mapped.title,
      status: mapped.status,
      detail: error instanceof Error ? error.message : 'Unknown error',
    },
  };
};
