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

export interface AIToolResponse {
  ok: boolean;
  tool: AIToolId;
  operation: string;
  result?: unknown;
  error?: string;
  problem?: {
    type: string;
    title: string;
    status: number;
    detail: string;
  };
  errorDetails?: {
    code: string;
    message: string;
    supportedOperations?: string[];
    supportedTools?: AIToolId[];
    didYouMean?: string;
    hints?: string[];
  };
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
