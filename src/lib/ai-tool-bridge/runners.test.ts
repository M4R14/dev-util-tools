import { AI_TOOL_CATALOG } from './catalog';
import { runAITool, TOOL_RUNNERS } from './runners';
import { assertToolRegistryConsistency, getToolRegistryDiagnostics } from './registry';
import type { AIToolRequest } from './types';

describe('ai-tool-bridge runners registry', () => {
  it('has a runner for every tool id in catalog', () => {
    const catalogIds = AI_TOOL_CATALOG.map((item) => item.id).sort();
    const runnerIds = Object.keys(TOOL_RUNNERS).sort();

    expect(runnerIds).toEqual(catalogIds);
  });

  it('reports consistent registry diagnostics', () => {
    const diagnostics = getToolRegistryDiagnostics();

    expect(diagnostics.isConsistent).toBe(true);
    expect(diagnostics.missingRunnerTools).toEqual([]);
    expect(diagnostics.extraRunnerTools).toEqual([]);
  });

  it('passes consistency assertion', () => {
    expect(() => assertToolRegistryConsistency()).not.toThrow();
  });
});

describe('runAITool (table-driven)', () => {
  const successCases: Array<{ name: string; request: AIToolRequest }> = [
    {
      name: 'json formatter format',
      request: {
        tool: 'json-formatter',
        operation: 'format',
        input: '{"a":1}',
        options: { indent: 2 },
      },
    },
    {
      name: 'xml formatter minify',
      request: {
        tool: 'xml-formatter',
        operation: 'minify',
        input: '<root>\n  <a>1</a>\n</root>',
      },
    },
    {
      name: 'base64 encode',
      request: {
        tool: 'base64-tool',
        operation: 'encode',
        input: 'hello',
      },
    },
    {
      name: 'case converter snake',
      request: {
        tool: 'case-converter',
        operation: 'convert',
        input: 'Hello World',
        options: { target: 'snake' },
      },
    },
    {
      name: 'url parser parse',
      request: {
        tool: 'url-parser',
        operation: 'parse',
        input: 'https://example.com/path?a=1',
      },
    },
    {
      name: 'diff viewer compare',
      request: {
        tool: 'diff-viewer',
        operation: 'compare',
        input: { original: 'a', modified: 'b' },
      },
    },
    {
      name: 'thai date converter format',
      request: {
        tool: 'thai-date-converter',
        operation: 'format',
        input: '2026-02-21',
      },
    },
  ];

  it.each(successCases)('returns ok for %s', ({ request }) => {
    const response = runAITool(request);

    expect(response.ok).toBe(true);
    expect(response.error).toBeUndefined();
    expect(response.result).toBeDefined();
  });

  it('returns didYouMean and hints for invalid operation', () => {
    const response = runAITool({
      tool: 'json-formatter',
      operation: 'formt',
      input: '{"a":1}',
    });

    expect(response.ok).toBe(false);
    expect(response.errorDetails?.code).toBe('UNSUPPORTED_OPERATION');
    expect(response.errorDetails?.didYouMean).toBe('format');
    expect(response.errorDetails?.hints?.length).toBeGreaterThan(0);
    expect(response.problem?.status).toBe(400);
  });

  it('returns didYouMean and hints for invalid option', () => {
    const response = runAITool({
      tool: 'case-converter',
      operation: 'convert',
      input: 'hello world',
      options: { target: 'snke' },
    });

    expect(response.ok).toBe(false);
    expect(response.errorDetails?.code).toBe('INVALID_OPTION');
    expect(response.errorDetails?.didYouMean).toBe('snake');
    expect(response.errorDetails?.hints?.length).toBeGreaterThan(0);
    expect(response.problem?.status).toBe(400);
  });
});
