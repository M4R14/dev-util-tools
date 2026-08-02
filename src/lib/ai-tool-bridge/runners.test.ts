import { AI_TOOL_CATALOG } from './catalog';
import { describeAITool, runAITool, runAIToolBatch, TOOL_RUNNERS } from './runners';
import { assertToolRegistryConsistency, getToolRegistryDiagnostics } from './registry';
import type { AIToolRequest } from './types';

describe('catalog reliability', () => {
  it('labels every tool', () => {
    for (const item of AI_TOOL_CATALOG) {
      expect(['exact', 'llm-can-approximate']).toContain(item.reliability);
    }
  });

  it('marks the algorithmic tools as exact — these are the ones a model must not do unaided', () => {
    const exact = AI_TOOL_CATALOG.filter((item) => item.reliability === 'exact').map((i) => i.id);

    expect(exact).toEqual(
      expect.arrayContaining([
        'thai-id',
        'base64-tool',
        'diff-viewer',
        'jwt-decoder',
        'uuid-generator',
        'password-gen',
      ]),
    );
  });
});

describe('describeAITool', () => {
  it('returns a single catalog entry', () => {
    const entry = describeAITool('thai-id');

    expect(entry.id).toBe('thai-id');
    expect(entry.operations).toContain('validate');
    expect(entry.reliability).toBe('exact');
  });

  it('throws with the supported list and a suggestion for an unknown tool', () => {
    expect(() => describeAITool('thai-idd')).toThrow(/Supported tools/);
  });
});

describe('runAIToolBatch', () => {
  const OK: AIToolRequest = {
    tool: 'case-converter',
    operation: 'convert',
    input: 'a b',
    options: { target: 'snake' },
  };
  const BAD: AIToolRequest = { tool: 'case-converter', operation: 'nope', input: 'x' };

  it('tags every response with its request index', () => {
    const responses = runAIToolBatch([OK, OK, OK]);

    expect(responses.map((r) => r.index)).toEqual([0, 1, 2]);
    expect(responses.every((r) => r.ok)).toBe(true);
  });

  it('runs every request by default, even after a failure', () => {
    const responses = runAIToolBatch([OK, BAD, OK]);

    expect(responses).toHaveLength(3);
    expect(responses.map((r) => r.ok)).toEqual([true, false, true]);
  });

  it('stops at the first failure when asked, keeping indices meaningful', () => {
    const responses = runAIToolBatch([OK, BAD, OK], { stopOnError: true });

    expect(responses).toHaveLength(2);
    expect(responses[1].index).toBe(1);
    expect(responses[1].ok).toBe(false);
  });

  it('returns an empty array for no requests', () => {
    expect(runAIToolBatch([])).toEqual([]);
  });
});

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
