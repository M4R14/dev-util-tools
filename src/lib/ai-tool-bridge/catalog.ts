import { AI_BRIDGE_TOOL_METADATA } from '../../data/aiBridge';
import type { AIToolCatalogItem, AIToolId } from './types';

export const SUPPORTED_CASE_TARGETS = ['snake', 'kebab', 'camel', 'pascal'] as const;

const BASE_AI_TOOL_CATALOG: Array<{
  id: AIToolId;
  operations: string[];
  examples: Array<{
    operation: string;
    input: unknown;
    options?: Record<string, unknown>;
  }>;
}> = [
  {
    id: 'json-formatter',
    operations: ['format', 'minify', 'validate'],
    examples: [
      { operation: 'format', input: '{"a":1,"b":{"c":2}}', options: { indent: 2 } },
      { operation: 'validate', input: '{"name":"devpulse"}' },
    ],
  },
  {
    id: 'xml-formatter',
    operations: ['format', 'minify', 'validate'],
    examples: [
      { operation: 'format', input: '<root><item>1</item></root>', options: { indent: 2 } },
      { operation: 'validate', input: '<root><item>ok</item></root>' },
    ],
  },
  {
    id: 'base64-tool',
    operations: ['encode', 'decode'],
    examples: [
      { operation: 'encode', input: 'hello world' },
      { operation: 'decode', input: 'aGVsbG8gd29ybGQ=' },
    ],
  },
  {
    id: 'case-converter',
    operations: ['convert'],
    examples: [{ operation: 'convert', input: 'hello world', options: { target: 'snake' } }],
  },
  {
    id: 'url-parser',
    operations: ['parse'],
    examples: [{ operation: 'parse', input: 'https://example.com/path?a=1&b=2#hash' }],
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
  },
  {
    id: 'thai-date-converter',
    operations: ['format', 'parse'],
    examples: [
      { operation: 'format', input: '2026-02-21' },
      { operation: 'parse', input: '21 ก.พ. 2569' },
    ],
  },
];

export const AI_TOOL_CATALOG: AIToolCatalogItem[] = BASE_AI_TOOL_CATALOG.map((item) => {
  const metadata = AI_BRIDGE_TOOL_METADATA[item.id];
  return {
    ...item,
    description: metadata?.description ?? item.id,
    usageTips: metadata?.usageTips ? [...metadata.usageTips] : [],
  };
});

export const AI_TOOL_OPERATIONS: Record<AIToolId, readonly string[]> = AI_TOOL_CATALOG.reduce(
  (acc, item) => {
    acc[item.id] = item.operations;
    return acc;
  },
  {} as Record<AIToolId, readonly string[]>,
);

export const getSupportedTools = (): AIToolId[] => AI_TOOL_CATALOG.map((item) => item.id);
