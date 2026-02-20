import xmlFormat from 'xml-formatter';
import { toCamelCase, toKebabCase, toPascalCase, toSnakeCase } from './caseUtils';
import { computeDiff, getDiffStats } from './diffUtils';
import { formatThaiDate, parseThaiDate } from './thaiDate';
import { parseUrl } from './urlUtils';

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
  errorDetails?: {
    code: string;
    message: string;
    supportedOperations?: string[];
    supportedTools?: AIToolId[];
    suggestion?: string;
  };
}

export interface AIToolCatalogItem {
  id: AIToolId;
  operations: string[];
  examples: Array<{
    operation: string;
    input: unknown;
    options?: Record<string, unknown>;
  }>;
  usage_tips: string[];
}

export const AI_TOOL_CATALOG: AIToolCatalogItem[] = [
  {
    id: 'json-formatter',
    operations: ['format', 'minify', 'validate'],
    examples: [
      { operation: 'format', input: '{"a":1,"b":{"c":2}}', options: { indent: 2 } },
      { operation: 'validate', input: '{"name":"devpulse"}' },
    ],
    usage_tips: [
      'Pass JSON text as a string in input.',
      'Use options.indent (number) for format.',
    ],
  },
  {
    id: 'xml-formatter',
    operations: ['format', 'minify', 'validate'],
    examples: [
      { operation: 'format', input: '<root><item>1</item></root>', options: { indent: 2 } },
      { operation: 'validate', input: '<root><item>ok</item></root>' },
    ],
    usage_tips: [
      'Pass raw XML text as input.',
      'Use options.indent (number) for format when needed.',
    ],
  },
  {
    id: 'base64-tool',
    operations: ['encode', 'decode'],
    examples: [
      { operation: 'encode', input: 'hello world' },
      { operation: 'decode', input: 'aGVsbG8gd29ybGQ=' },
    ],
    usage_tips: [
      'Use encode for plain text input.',
      'Use decode only with valid Base64 strings.',
    ],
  },
  {
    id: 'case-converter',
    operations: ['convert'],
    examples: [{ operation: 'convert', input: 'hello world', options: { target: 'snake' } }],
    usage_tips: [
      'Set options.target to snake|kebab|camel|pascal.',
      'Input can be phrase, snake_case, kebab-case, or PascalCase.',
    ],
  },
  {
    id: 'url-parser',
    operations: ['parse'],
    examples: [{ operation: 'parse', input: 'https://example.com/path?a=1&b=2#hash' }],
    usage_tips: [
      'Include protocol for strict parsing.',
      'Result contains URL components and parsed query params.',
    ],
  },
  {
    id: 'diff-viewer',
    operations: ['compare'],
    examples: [
      {
        operation: 'compare',
        input: { original: 'line A\nline B', modified: 'line A\nline C' },
        options: { includeLines: true },
      },
    ],
    usage_tips: [
      'Provide input as object with original and modified strings.',
      'Set options.includeLines=false for lightweight stats-only response.',
    ],
  },
  {
    id: 'thai-date-converter',
    operations: ['format', 'parse'],
    examples: [
      { operation: 'format', input: '2026-02-21' },
      { operation: 'parse', input: '21 ก.พ. 2569' },
    ],
    usage_tips: [
      'Use format with ISO-like date strings.',
      'Use parse with Thai date strings including Buddhist year format.',
    ],
  },
];

const SUPPORTED_CASE_TARGETS = ['snake', 'kebab', 'camel', 'pascal'] as const;

export const AI_TOOL_OPERATIONS: Record<AIToolId, readonly string[]> = AI_TOOL_CATALOG.reduce(
  (acc, item) => {
    acc[item.id] = item.operations;
    return acc;
  },
  {} as Record<AIToolId, readonly string[]>,
);

export const AI_BRIDGE_SCHEMA = {
  request: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'AIToolRequest',
    type: 'object',
    required: ['tool', 'operation'],
    properties: {
      tool: { type: 'string', enum: AI_TOOL_CATALOG.map((item) => item.id) },
      operation: { type: 'string' },
      input: {},
      options: { type: 'object', additionalProperties: true },
    },
    additionalProperties: false,
  },
  response: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'AIToolResponse',
    type: 'object',
    required: ['ok', 'tool', 'operation'],
    properties: {
      ok: { type: 'boolean' },
      tool: { type: 'string', enum: AI_TOOL_CATALOG.map((item) => item.id) },
      operation: { type: 'string' },
      result: {},
      error: { type: 'string' },
      errorDetails: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          message: { type: 'string' },
          supportedOperations: { type: 'array', items: { type: 'string' } },
          supportedTools: {
            type: 'array',
            items: { type: 'string', enum: AI_TOOL_CATALOG.map((item) => item.id) },
          },
          suggestion: { type: 'string' },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  },
} as const;

class BridgeValidationError extends Error {
  code: string;
  supportedOperations?: string[];
  supportedTools?: AIToolId[];
  suggestion?: string;

  constructor(
    message: string,
    details: {
      code: string;
      supportedOperations?: string[];
      supportedTools?: AIToolId[];
      suggestion?: string;
    },
  ) {
    super(message);
    this.name = 'BridgeValidationError';
    this.code = details.code;
    this.supportedOperations = details.supportedOperations;
    this.supportedTools = details.supportedTools;
    this.suggestion = details.suggestion;
  }
}

const getOperationSuggestion = (operation: string, supportedOperations: readonly string[]) => {
  const lower = operation.toLowerCase();
  return (
    supportedOperations.find((op) => op.startsWith(lower)) ||
    supportedOperations.find((op) => op.includes(lower)) ||
    supportedOperations[0]
  );
};

const assertSupportedOperation = (tool: AIToolId, operation: string) => {
  const supported = AI_TOOL_OPERATIONS[tool];
  if (!supported.includes(operation)) {
    const suggestion = getOperationSuggestion(operation, supported);
    throw new BridgeValidationError(
      `Unsupported operation "${operation}" for "${tool}". Supported operations: ${supported.join(
        ', ',
      )}.`,
      {
        code: 'UNSUPPORTED_OPERATION',
        supportedOperations: [...supported],
        suggestion,
      },
    );
  }
};

const getSupportedTools = (): AIToolId[] => AI_TOOL_CATALOG.map((item) => item.id);

const encodeUnicodeToBase64 = (value: string): string => {
  const escaped = encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, p1: string) =>
    String.fromCharCode(parseInt(p1, 16)),
  );
  return btoa(escaped);
};

const decodeUnicodeFromBase64 = (value: string): string => {
  const decoded = atob(value);
  const escaped = decoded
    .split('')
    .map((char) => `%${('00' + char.charCodeAt(0).toString(16)).slice(-2)}`)
    .join('');
  return decodeURIComponent(escaped);
};

const asString = (input: unknown, fieldName: string): string => {
  if (typeof input !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
  return input;
};

const asObject = (input: unknown, fieldName: string): Record<string, unknown> => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error(`${fieldName} must be an object`);
  }
  return input as Record<string, unknown>;
};

const runJsonFormatter = (operation: string, input: unknown, options?: Record<string, unknown>) => {
  assertSupportedOperation('json-formatter', operation);
  const raw = asString(input, 'input');
  const parsed = JSON.parse(raw);

  if (operation === 'format') {
    const indent = typeof options?.indent === 'number' ? options.indent : 2;
    return JSON.stringify(parsed, null, indent);
  }
  if (operation === 'minify') {
    return JSON.stringify(parsed);
  }
  if (operation === 'validate') {
    return { valid: true };
  }
  throw new Error(`Unsupported operation "${operation}" for json-formatter`);
};

const runXmlFormatter = (operation: string, input: unknown, options?: Record<string, unknown>) => {
  assertSupportedOperation('xml-formatter', operation);
  const raw = asString(input, 'input');
  const indent = typeof options?.indent === 'number' ? options.indent : 2;

  if (operation === 'format') {
    return xmlFormat(raw, {
      indentation: ' '.repeat(indent),
      collapseContent: true,
      lineSeparator: '\n',
      throwOnFailure: true,
    });
  }
  if (operation === 'minify') {
    return xmlFormat.minify(raw, {
      collapseContent: true,
      throwOnFailure: true,
    });
  }
  if (operation === 'validate') {
    xmlFormat(raw, {
      indentation: ' '.repeat(indent),
      collapseContent: true,
      lineSeparator: '\n',
      throwOnFailure: true,
    });
    return { valid: true };
  }
  throw new Error(`Unsupported operation "${operation}" for xml-formatter`);
};

const runBase64Tool = (operation: string, input: unknown) => {
  assertSupportedOperation('base64-tool', operation);
  const raw = asString(input, 'input');
  if (operation === 'encode') return encodeUnicodeToBase64(raw);
  if (operation === 'decode') return decodeUnicodeFromBase64(raw);
  throw new Error(`Unsupported operation "${operation}" for base64-tool`);
};

const runCaseConverter = (operation: string, input: unknown, options?: Record<string, unknown>) => {
  assertSupportedOperation('case-converter', operation);
  if (operation !== 'convert') {
    throw new Error(`Unsupported operation "${operation}" for case-converter`);
  }

  const raw = asString(input, 'input');
  const target = options?.target;
  if (target === 'snake') return toSnakeCase(raw);
  if (target === 'kebab') return toKebabCase(raw);
  if (target === 'camel') return toCamelCase(raw);
  if (target === 'pascal') return toPascalCase(raw);
  throw new BridgeValidationError(
    `Invalid options.target "${String(
      target,
    )}" for case-converter. Supported targets: ${SUPPORTED_CASE_TARGETS.join(', ')}.`,
    {
      code: 'INVALID_OPTION',
      suggestion: 'Use options.target = "snake" | "kebab" | "camel" | "pascal"',
    },
  );
};

const runUrlParser = (operation: string, input: unknown) => {
  assertSupportedOperation('url-parser', operation);
  if (operation !== 'parse') {
    throw new Error(`Unsupported operation "${operation}" for url-parser`);
  }

  const raw = asString(input, 'input');
  const { parsed, error, params } = parseUrl(raw);
  if (!parsed || error) {
    throw new Error(error || 'Invalid URL format');
  }

  return {
    href: parsed.href,
    protocol: parsed.protocol,
    username: parsed.username,
    password: parsed.password,
    host: parsed.host,
    hostname: parsed.hostname,
    port: parsed.port,
    pathname: parsed.pathname,
    search: parsed.search,
    hash: parsed.hash,
    params,
  };
};

const runDiffViewer = (operation: string, input: unknown, options?: Record<string, unknown>) => {
  assertSupportedOperation('diff-viewer', operation);
  if (operation !== 'compare') {
    throw new Error(`Unsupported operation "${operation}" for diff-viewer`);
  }

  const payload = asObject(input, 'input');
  const original = asString(payload.original, 'input.original');
  const modified = asString(payload.modified, 'input.modified');
  const lines = computeDiff(original, modified);
  const stats = getDiffStats(lines);
  const includeLines = options?.includeLines !== false;

  return includeLines ? { stats, lines } : { stats };
};

const runThaiDateConverter = (operation: string, input: unknown) => {
  assertSupportedOperation('thai-date-converter', operation);
  const raw = asString(input, 'input');
  if (operation === 'format') {
    return formatThaiDate(raw);
  }
  if (operation === 'parse') {
    const parsed = parseThaiDate(raw);
    if (!parsed) throw new Error('Unable to parse Thai date string');
    return parsed;
  }
  throw new Error(`Unsupported operation "${operation}" for thai-date-converter`);
};

export const runAITool = (request: AIToolRequest): AIToolResponse => {
  const { tool, operation, input = '', options } = request;
  try {
    if (!AI_TOOL_CATALOG.some((item) => item.id === tool)) {
      const supportedTools = getSupportedTools();
      throw new BridgeValidationError(
        `Unsupported tool "${tool}". Supported tools: ${supportedTools.join(', ')}.`,
        {
        code: 'UNSUPPORTED_TOOL',
        supportedTools,
      },
      );
    }

    let result: unknown;
    switch (tool) {
      case 'json-formatter':
        result = runJsonFormatter(operation, input, options);
        break;
      case 'xml-formatter':
        result = runXmlFormatter(operation, input, options);
        break;
      case 'base64-tool':
        result = runBase64Tool(operation, input);
        break;
      case 'case-converter':
        result = runCaseConverter(operation, input, options);
        break;
      case 'url-parser':
        result = runUrlParser(operation, input);
        break;
      case 'diff-viewer':
        result = runDiffViewer(operation, input, options);
        break;
      case 'thai-date-converter':
        result = runThaiDateConverter(operation, input);
        break;
      default:
        throw new BridgeValidationError(`Unsupported tool "${tool}". Supported tools: ${getSupportedTools().join(', ')}.`, {
          code: 'UNSUPPORTED_TOOL',
          supportedTools: getSupportedTools(),
        });
    }

    return { ok: true, tool, operation, result };
  } catch (error) {
    if (error instanceof BridgeValidationError) {
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
          suggestion: error.suggestion,
        },
      };
    }

    return {
      ok: false,
      tool,
      operation,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorDetails: {
        code: 'EXECUTION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
};
