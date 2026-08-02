import {
  buildShareableSearchParams,
  readBooleanParam,
  readNumberParam,
  serializeBooleanParam,
} from './shareableUrlState';

describe('shareableUrlState', () => {
  it('sets non-empty values into query string', () => {
    const next = buildShareableSearchParams('', [
      { key: 'input', value: 'hello' },
      { key: 'mode', value: 'split' },
    ]);

    expect(next.toString()).toBe('input=hello&mode=split');
  });

  it('removes empty values from query string', () => {
    const next = buildShareableSearchParams('input=hello&mode=split', [
      { key: 'input', value: '' },
      { key: 'mode', value: undefined },
    ]);

    expect(next.toString()).toBe('');
  });

  it('removes values that match default values', () => {
    const next = buildShareableSearchParams('view=split&q=1&hy=0', [
      { key: 'view', value: 'split', defaultValue: 'split' },
      { key: 'q', value: '1', defaultValue: '1' },
      { key: 'hy', value: '0', defaultValue: '1' },
    ]);

    expect(next.toString()).toBe('hy=0');
  });
});

describe('readBooleanParam', () => {
  it('falls back only when the param is absent', () => {
    expect(readBooleanParam(null, true)).toBe(true);
    expect(readBooleanParam(null, false)).toBe(false);
  });

  it('accepts both "1" and "true" as true', () => {
    expect(readBooleanParam('1', false)).toBe(true);
    expect(readBooleanParam('true', false)).toBe(true);
  });

  it('treats any other present value as false, including the empty string', () => {
    expect(readBooleanParam('0', true)).toBe(false);
    expect(readBooleanParam('', true)).toBe(false);
    expect(readBooleanParam('yes', true)).toBe(false);
  });

  it('round-trips through serializeBooleanParam', () => {
    expect(readBooleanParam(serializeBooleanParam(true), false)).toBe(true);
    expect(readBooleanParam(serializeBooleanParam(false), true)).toBe(false);
  });
});

describe('readNumberParam', () => {
  it('falls back on absent, empty, and non-numeric input', () => {
    expect(readNumberParam(null, 16)).toBe(16);
    expect(readNumberParam('', 16)).toBe(16);
    expect(readNumberParam('abc', 16)).toBe(16);
  });

  it('parses numeric input', () => {
    expect(readNumberParam('32', 16)).toBe(32);
  });

  it('clamps to bounds when given', () => {
    const bounds = { min: 4, max: 64 };
    expect(readNumberParam('999', 16, bounds)).toBe(64);
    expect(readNumberParam('1', 16, bounds)).toBe(4);
    expect(readNumberParam('32', 16, bounds)).toBe(32);
  });

  it('leaves out-of-range values alone when no bounds are given', () => {
    expect(readNumberParam('999', 16)).toBe(999);
  });
});
