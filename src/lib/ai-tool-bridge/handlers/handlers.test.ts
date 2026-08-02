import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { runAITool } from '../runners';
import type { AIToolRequest } from '../types';

/**
 * Covers the tools added to the bridge after the original seven. Requests go through
 * `runAITool` rather than the handlers directly, so validation, error mapping and the registry
 * lookup are exercised the same way an agent would hit them.
 */
class StubDOMParser {
  parseFromString() {
    return { querySelector: () => null };
  }
}

beforeAll(() => {
  // xml-to-json validates via DOMParser; jsdom cannot boot in this project.
  vi.stubGlobal('DOMParser', StubDOMParser);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

const run = (request: AIToolRequest) => runAITool(request);

describe('jwt-decoder', () => {
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
    '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
    '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  it('decodes header, payload and algorithm', () => {
    const response = run({ tool: 'jwt-decoder', operation: 'decode', input: token });
    const result = response.result as Record<string, unknown>;

    expect(response.ok).toBe(true);
    expect(result.algorithm).toBe('HS256');
    expect(result.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
  });

  it('always reports that the signature was not verified', () => {
    const result = run({ tool: 'jwt-decoder', operation: 'decode', input: token }).result as Record<
      string,
      unknown
    >;

    expect(result.signatureVerified).toBe(false);
  });

  it('returns only the payload for the claims operation', () => {
    const response = run({ tool: 'jwt-decoder', operation: 'claims', input: token });

    expect(response.result).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
  });

  it('fails cleanly on a malformed token', () => {
    const response = run({ tool: 'jwt-decoder', operation: 'decode', input: 'not-a-jwt' });

    expect(response.ok).toBe(false);
  });
});

describe('thai-id', () => {
  it('validates a checksum-valid id', () => {
    const generated = run({ tool: 'thai-id', operation: 'generate' }).result as {
      id: string;
      formatted: string;
    };

    expect(generated.id).toMatch(/^\d{13}$/);
    expect(run({ tool: 'thai-id', operation: 'validate', input: generated.id }).result).toEqual({
      valid: true,
    });
  });

  it('reports an invalid checksum without throwing', () => {
    const response = run({ tool: 'thai-id', operation: 'validate', input: '1234567890123' });

    expect(response.ok).toBe(true);
    expect(response.result).toEqual({ valid: false });
  });

  it('rejects an id that is not 13 digits', () => {
    expect(run({ tool: 'thai-id', operation: 'validate', input: '123' }).ok).toBe(false);
  });

  it('analyzes the structure', () => {
    const generated = run({ tool: 'thai-id', operation: 'generate' }).result as { id: string };
    const analysis = run({ tool: 'thai-id', operation: 'analyze', input: generated.id })
      .result as Record<string, unknown>;

    expect(analysis.sanitized).toBe(generated.id);
    expect(analysis.isValid).toBe(true);
  });
});

describe('uuid-generator', () => {
  it('generates one UUID by default', () => {
    const result = run({ tool: 'uuid-generator', operation: 'generate' }).result as string[];

    expect(result).toHaveLength(1);
    expect(result[0]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('honours quantity, hyphens and uppercase options', () => {
    const result = run({
      tool: 'uuid-generator',
      operation: 'generate',
      options: { quantity: 5, hyphens: false, uppercase: true },
    }).result as string[];

    expect(result).toHaveLength(5);
    expect(new Set(result).size).toBe(5);
    expect(result[0]).toMatch(/^[0-9A-F]{32}$/);
  });

  it('rejects an out-of-range quantity', () => {
    expect(
      run({ tool: 'uuid-generator', operation: 'generate', options: { quantity: 0 } }).ok,
    ).toBe(false);
    expect(
      run({ tool: 'uuid-generator', operation: 'generate', options: { quantity: 101 } }).ok,
    ).toBe(false);
  });
});

describe('password-gen', () => {
  it('generates a password of the requested length with pool size and strength', () => {
    const result = run({
      tool: 'password-gen',
      operation: 'generate',
      options: { length: 24 },
    }).result as { password: string; poolSize: number; strength: string };

    expect(result.password).toHaveLength(24);
    expect(result.poolSize).toBe(88);
    expect(result.strength).toBe('Strong');
  });

  it('restricts the character pool to the enabled sets', () => {
    const result = run({
      tool: 'password-gen',
      operation: 'generate',
      options: { length: 40, includeUpper: false, includeSymbols: false },
    }).result as { password: string };

    expect(result.password).toMatch(/^[a-z0-9]+$/);
  });

  it('rejects a request with every character set disabled', () => {
    const response = run({
      tool: 'password-gen',
      operation: 'generate',
      options: {
        includeUpper: false,
        includeLower: false,
        includeNumbers: false,
        includeSymbols: false,
      },
    });

    expect(response.ok).toBe(false);
  });

  it('rejects an out-of-range length', () => {
    expect(run({ tool: 'password-gen', operation: 'generate', options: { length: 1 } }).ok).toBe(
      false,
    );
  });
});

describe('xml-to-json', () => {
  it('converts a document with attributes', () => {
    const response = run({
      tool: 'xml-to-json',
      operation: 'convert',
      input: '<root id="1"><item>a</item><item>b</item></root>',
    });

    expect(response.result).toEqual({
      root: { '@attributes': { id: '1' }, item: ['a', 'b'] },
    });
  });

  it('drops attributes when asked', () => {
    const response = run({
      tool: 'xml-to-json',
      operation: 'convert',
      input: '<root id="1"><item>a</item></root>',
      options: { includeAttributes: false },
    });

    expect(response.result).toEqual({ root: { item: 'a' } });
  });

  it('fails cleanly on blank input', () => {
    expect(run({ tool: 'xml-to-json', operation: 'convert', input: '  ' }).ok).toBe(false);
  });
});

describe('shared request handling', () => {
  it('rejects an unsupported operation with the supported list', () => {
    const response = run({ tool: 'jwt-decoder', operation: 'verify', input: 'x' });

    expect(response.ok).toBe(false);
    expect(JSON.stringify(response)).toContain('decode');
  });
});
