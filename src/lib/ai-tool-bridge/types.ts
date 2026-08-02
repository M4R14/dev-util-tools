export type AIToolId =
  | 'json-formatter'
  | 'xml-formatter'
  | 'base64-tool'
  | 'case-converter'
  | 'url-parser'
  | 'diff-viewer'
  | 'thai-date-converter'
  | 'thai-id'
  | 'jwt-decoder'
  | 'xml-to-json'
  | 'uuid-generator'
  | 'password-gen';

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

/**
 * How much an agent should trust doing this job in its own head instead of calling the tool.
 *
 * - `exact` — the answer depends on an algorithm a language model reproduces unreliably
 *   (checksums, unicode-safe base64, diffing, base64url). Call the tool.
 * - `llm-can-approximate` — a capable model usually gets this right unaided; the tool is a
 *   convenience and a consistency guarantee, not a correctness requirement.
 */
export type AIToolReliability = 'exact' | 'llm-can-approximate';

export interface AIToolCatalogItem {
  id: AIToolId;
  description: string;
  reliability: AIToolReliability;
  operations: string[];
  examples: Array<{
    operation: string;
    input: unknown;
    options?: Record<string, unknown>;
  }>;
  usageTips: string[];
}

/** A batch response carries the index of the request that produced it. */
export type AIToolBatchResponse = AIToolResponse & { index: number };

export interface AIToolBatchOptions {
  /** Stop at the first failure instead of running every request. */
  stopOnError?: boolean;
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
