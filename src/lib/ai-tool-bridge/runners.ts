import { AI_TOOL_CATALOG, getSupportedTools } from './catalog';
import { toExecutionErrorResponse, toValidationErrorResponse } from './errorResponse';
import { BridgeValidationError, getClosestMatch } from './errors';
import { buildToolExecutionContext, resolveToolRunner } from './registry';
import type { AIToolId, AIToolRequest, AIToolResponse } from './types';
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
        hints: [
          `Use one of: ${supportedTools.join(', ')}`,
          `Did you mean "${didYouMean}"?`,
        ],
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

export const runAIToolBatch = (requests: AIToolRequest[]): AIToolResponse[] =>
  requests.map((request) => runAITool(request));
