import { AI_TOOL_OPERATIONS } from './catalog';
import {
  runBase64Tool,
  runCaseConverter,
  runDiffViewer,
  runJsonFormatter,
  runThaiDateConverter,
  runUrlParser,
  runXmlFormatter,
  type ToolRunner,
} from './handlers';
import type { AIToolId, ToolExecutionContext } from './types';

export const TOOL_RUNNERS = {
  'json-formatter': runJsonFormatter,
  'xml-formatter': runXmlFormatter,
  'base64-tool': runBase64Tool,
  'case-converter': runCaseConverter,
  'url-parser': runUrlParser,
  'diff-viewer': runDiffViewer,
  'thai-date-converter': runThaiDateConverter,
} satisfies Record<AIToolId, ToolRunner>;

export const resolveToolRunner = (tool: AIToolId): ToolRunner => TOOL_RUNNERS[tool];

export const buildToolExecutionContext = (
  tool: AIToolId,
  operation: string,
): ToolExecutionContext => ({
  tool,
  operation,
  supportedOperations: AI_TOOL_OPERATIONS[tool],
});

export type ToolRegistryDiagnostics = {
  isConsistent: boolean;
  missingRunnerTools: AIToolId[];
  extraRunnerTools: string[];
};

export const getToolRegistryDiagnostics = (): ToolRegistryDiagnostics => {
  const catalogToolIds = Object.keys(AI_TOOL_OPERATIONS).sort() as AIToolId[];
  const runnerToolIds = Object.keys(TOOL_RUNNERS).sort();

  const missingRunnerTools = catalogToolIds.filter((toolId) => !runnerToolIds.includes(toolId));
  const extraRunnerTools = runnerToolIds.filter((toolId) => !catalogToolIds.includes(toolId as AIToolId));

  return {
    isConsistent: missingRunnerTools.length === 0 && extraRunnerTools.length === 0,
    missingRunnerTools,
    extraRunnerTools,
  };
};

export const assertToolRegistryConsistency = (): void => {
  const diagnostics = getToolRegistryDiagnostics();

  if (diagnostics.isConsistent) {
    return;
  }

  const details: string[] = [];
  if (diagnostics.missingRunnerTools.length > 0) {
    details.push(`missing runners for: ${diagnostics.missingRunnerTools.join(', ')}`);
  }
  if (diagnostics.extraRunnerTools.length > 0) {
    details.push(`extra runners for: ${diagnostics.extraRunnerTools.join(', ')}`);
  }

  throw new Error(`AI tool registry mismatch (${details.join(' | ')})`);
};
