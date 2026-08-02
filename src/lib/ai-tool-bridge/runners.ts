import { AI_TOOL_CATALOG, getSupportedTools } from './catalog';
import { toExecutionErrorResponse, toValidationErrorResponse } from './errorResponse';
import { BridgeValidationError, getClosestMatch } from './errors';
import { buildToolExecutionContext, resolveToolRunner } from './registry';
import type {
  AIToolBatchOptions,
  AIToolBatchResponse,
  AIToolCatalogItem,
  AIToolId,
  AIToolRequest,
  AIToolResponse,
} from './types';
import { assertToolRequestShape, normalizeToolRequest } from './validators';

export { TOOL_RUNNERS } from './registry';

const ensureSupportedTool = (tool: AIToolId) => {
  if (!AI_TOOL_CATALOG.some((item) => item.id === tool)) {
    const supportedTools = getSupportedTools();
    const didYouMean = getClosestMatch(tool, supportedTools);
    throw new BridgeValidationError(
      `Unsupported tool "${tool}". Supported tools: ${supportedTools.join(', ')}.`,
      {
        code: 'UNSUPPORTED_TOOL',
        supportedTools,
        didYouMean,
        hints: [`Use one of: ${supportedTools.join(', ')}`, `Did you mean "${didYouMean}"?`],
      },
    );
  }
};

export const runAITool = (request: AIToolRequest): AIToolResponse => {
  const { tool, operation, input, options } = normalizeToolRequest(request);

  try {
    assertToolRequestShape(request);
    ensureSupportedTool(tool);
    const runner = resolveToolRunner(tool);
    const context = buildToolExecutionContext(tool, operation);
    const result = runner(operation, input, context, options);
    return { ok: true, tool, operation, result };
  } catch (error) {
    if (error instanceof BridgeValidationError) {
      return toValidationErrorResponse(tool, operation, error);
    }

    return toExecutionErrorResponse(tool, operation, error);
  }
};

/**
 * Every response carries the `index` of the request that produced it, so a caller reading a
 * partial array still knows which result belongs to which request — which matters most with
 * `stopOnError`, where the array is shorter than the input.
 */
export const runAIToolBatch = (
  requests: AIToolRequest[],
  options: AIToolBatchOptions = {},
): AIToolBatchResponse[] => {
  const responses: AIToolBatchResponse[] = [];

  for (const [index, request] of requests.entries()) {
    const response: AIToolBatchResponse = { ...runAITool(request), index };
    responses.push(response);

    if (options.stopOnError && !response.ok) break;
  }

  return responses;
};

/**
 * One catalog entry instead of all of them. Agents pay for every token they read, so fetching
 * twelve tool descriptions to look at one is a real cost.
 */
export const describeAITool = (tool: string): AIToolCatalogItem => {
  const entry = AI_TOOL_CATALOG.find((item) => item.id === tool);

  if (!entry) {
    const supportedTools = getSupportedTools();
    throw new BridgeValidationError(
      `Unsupported tool "${tool}". Supported tools: ${supportedTools.join(', ')}.`,
      {
        code: 'UNSUPPORTED_TOOL',
        supportedTools,
        didYouMean: getClosestMatch(tool, supportedTools),
      },
    );
  }

  return entry;
};
