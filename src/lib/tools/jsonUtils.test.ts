import { describe, it, expect } from 'vitest';
import { DEFAULT_JSON_INDENT, assertValidJson, formatJson, minifyJson } from './jsonUtils';

describe('jsonUtils', () => {
  it('formats with the default indent', () => {
    expect(formatJson('{"a":1}')).toBe('{\n  "a": 1\n}');
    expect(DEFAULT_JSON_INDENT).toBe(2);
  });

  it('formats with an explicit indent', () => {
    expect(formatJson('{"a":1}', 4)).toBe('{\n    "a": 1\n}');
  });

  it('minifies away all whitespace', () => {
    expect(minifyJson('{\n  "a": [1, 2]\n}')).toBe('{"a":[1,2]}');
  });

  it('throws the underlying SyntaxError on malformed input', () => {
    expect(() => formatJson('{oops}')).toThrow(SyntaxError);
    expect(() => minifyJson('{oops}')).toThrow(SyntaxError);
    expect(() => assertValidJson('{oops}')).toThrow(SyntaxError);
  });

  it('accepts valid input in assertValidJson', () => {
    expect(() => assertValidJson('{"ok":true}')).not.toThrow();
  });
});
