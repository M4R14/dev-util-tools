import { addUrlParam, parseUrl, removeUrlParam, updateUrlParam } from './urlUtils';

describe('urlUtils', () => {
  it('parses url without protocol by assuming https', () => {
    const result = parseUrl('example.com/path?a=1&b=2');

    expect(result.error).toBeNull();
    expect(result.parsed?.hostname).toBe('example.com');
    expect(result.params).toEqual([
      { key: 'a', value: '1' },
      { key: 'b', value: '2' },
    ]);
  });

  it('returns error for invalid input', () => {
    const result = parseUrl('://bad url');
    expect(result.parsed).toBeNull();
    expect(result.error).toBe('Invalid URL format');
  });

  it('updates, adds, and removes query params', () => {
    const { parsed, params } = parseUrl('https://example.com?foo=1');
    expect(parsed).not.toBeNull();

    const updated = updateUrlParam(parsed, params, 0, 'foo', '2');
    const added = addUrlParam(parsed, params, 'bar', 'x');
    const removed = removeUrlParam(parsed, params, 0);

    expect(new URL(updated || '').searchParams.get('foo')).toBe('2');
    expect(new URL(added || '').searchParams.get('bar')).toBe('x');
    expect(new URL(removed || '').search).toBe('');
  });

  it('returns null on invalid remove index', () => {
    const { parsed, params } = parseUrl('https://example.com?foo=1');
    expect(removeUrlParam(parsed, params, 99)).toBeNull();
  });
});
