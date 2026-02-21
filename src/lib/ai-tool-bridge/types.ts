export type AIToolId =
  | 'json-formatter'
  | 'xml-formatter'
  | 'base64-tool'
  | 'case-converter'
  | 'url-parser'
  | 'diff-viewer'
  | 'thai-date-converter';

export interface AIToolRequest {
  tool: AIToolId;
  operation: string;
  input?: unknown;
  options?: Record<string, unknown>;
}

export interface NormalizedAIToolRequest {
  tool: AIToolId;
  operation: string;
  input: unknown;
  options?: Record<string, unknown>;
}

export type ToolErrorCode =
  | 'UNSUPPORTED_TOOL'
  | 'UNSUPPORTED_OPERATION'
  | 'INVALID_OPTION'
  | 'INVALID_INPUT'
  | 'INVALID_REQUEST'
  | 'EXECUTION_ERROR';

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
}

export interface ToolErrorDetails {
  code: ToolErrorCode;
  message: string;
  supportedOperations?: string[];
  supportedTools?: AIToolId[];
  didYouMean?: string;
  hints?: string[];
}

export interface AIToolResponse {
  ok: boolean;
  tool: AIToolId;
  operation: string;
  result?: unknown;
  error?: string;
  problem?: ProblemDetail;
  errorDetails?: ToolErrorDetails;
}

export interface AIToolCatalogItem {
  id: AIToolId;
  description: string;
  operations: string[];
  examples: Array<{
    operation: string;
    input: unknown;
    options?: Record<string, unknown>;
  }>;
  usageTips: string[];
}

export interface AIToolSnapshot {
  capturedAt: string;
  storageNamespace: string;
  state: Record<string, Record<string, unknown>>;
}

export interface ToolExecutionContext {
  tool: AIToolId;
  operation: string;
  supportedOperations: readonly string[];
}

export type ToolHandlerResult = unknown;

export type ToolRunner = (
  operation: string,
  input: unknown,
  context: ToolExecutionContext,
  options?: Record<string, unknown>,
) => ToolHandlerResult;
