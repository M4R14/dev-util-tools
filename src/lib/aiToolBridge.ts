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
}

export interface AIToolCatalogItem {
  id: AIToolId;
  operations: string[];
}

export const AI_TOOL_CATALOG: AIToolCatalogItem[] = [
  { id: 'json-formatter', operations: ['format', 'minify', 'validate'] },
  { id: 'xml-formatter', operations: ['format', 'minify', 'validate'] },
  { id: 'base64-tool', operations: ['encode', 'decode'] },
  { id: 'case-converter', operations: ['convert'] },
  { id: 'url-parser', operations: ['parse'] },
  { id: 'diff-viewer', operations: ['compare'] },
  { id: 'thai-date-converter', operations: ['format', 'parse'] },
];

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
  const raw = asString(input, 'input');
  if (operation === 'encode') return encodeUnicodeToBase64(raw);
  if (operation === 'decode') return decodeUnicodeFromBase64(raw);
  throw new Error(`Unsupported operation "${operation}" for base64-tool`);
};

const runCaseConverter = (operation: string, input: unknown, options?: Record<string, unknown>) => {
  if (operation !== 'convert') {
    throw new Error(`Unsupported operation "${operation}" for case-converter`);
  }

  const raw = asString(input, 'input');
  const target = options?.target;
  if (target === 'snake') return toSnakeCase(raw);
  if (target === 'kebab') return toKebabCase(raw);
  if (target === 'camel') return toCamelCase(raw);
  if (target === 'pascal') return toPascalCase(raw);
  throw new Error('options.target must be one of: snake, kebab, camel, pascal');
};

const runUrlParser = (operation: string, input: unknown) => {
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
        throw new Error(`Unsupported tool "${tool}"`);
    }

    return { ok: true, tool, operation, result };
  } catch (error) {
    return {
      ok: false,
      tool,
      operation,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
