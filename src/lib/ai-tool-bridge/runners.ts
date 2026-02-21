import xmlFormat from 'xml-formatter';
import { toCamelCase, toKebabCase, toPascalCase, toSnakeCase } from '../caseUtils';
import { computeDiff, getDiffStats } from '../diffUtils';
import { formatThaiDate, parseThaiDate } from '../thaiDate';
import { parseUrl } from '../urlUtils';
import { AI_TOOL_CATALOG, AI_TOOL_OPERATIONS, getSupportedTools, SUPPORTED_CASE_TARGETS } from './catalog';
import { BridgeValidationError, getClosestMatch, getOperationSuggestion } from './errors';
import type { AIToolId, AIToolRequest, AIToolResponse } from './types';

const assertSupportedOperation = (tool: AIToolId, operation: string) => {
  const supported = AI_TOOL_OPERATIONS[tool];
  if (!supported.includes(operation)) {
    const suggestion = getOperationSuggestion(operation, supported);
    throw new BridgeValidationError(
      `Unsupported operation "${operation}" for "${tool}". Supported operations: ${supported.join(', ')}.`,
      {
        code: 'UNSUPPORTED_OPERATION',
        supportedOperations: [...supported],
        didYouMean: suggestion,
        hints: [`Use one of: ${supported.join(', ')}`, `Did you mean "${suggestion}"?`],
      },
    );
  }
};

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
      didYouMean:
        typeof target === 'string' ? getClosestMatch(target, SUPPORTED_CASE_TARGETS) : undefined,
      hints: [
        'Use options.target = "snake" | "kebab" | "camel" | "pascal"',
        `Received: ${String(target)}`,
      ],
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
      default: {
        const supportedTools = getSupportedTools();
        const didYouMean = getClosestMatch(tool, supportedTools);
        throw new BridgeValidationError(
          `Unsupported tool "${tool}". Supported tools: ${supportedTools.join(', ')}.`,
          {
            code: 'UNSUPPORTED_TOOL',
            supportedTools,
            didYouMean,
            hints: [`Did you mean "${didYouMean}"?`],
          },
        );
      }
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
          didYouMean: error.didYouMean,
          hints: error.hints,
        },
        problem: {
          type: `https://devpulse.ai/problems/${error.code.toLowerCase()}`,
          title: 'Invalid AI Bridge Request',
          status: error.status,
          detail: error.message,
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
        hints: ['Verify input shape, operation name, and option types before retrying.'],
      },
      problem: {
        type: 'https://devpulse.ai/problems/execution_error',
        title: 'AI Bridge Execution Error',
        status: 500,
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
};

export const runAIToolBatch = (requests: AIToolRequest[]): AIToolResponse[] =>
  requests.map((request) => runAITool(request));
