import { normalizeQueryInput, parsePayloadParam, parseQueryRequest } from './aiBridgeQuery';

describe('aiBridgeQuery', () => {
  it('returns payload request when payload is valid', () => {
    const payload = JSON.stringify({
      tool: 'json-formatter',
      operation: 'format',
      input: '{"a":1}',
      options: { indent: 2 },
    });

    const request = parsePayloadParam(payload);
    expect(request).toEqual({
      tool: 'json-formatter',
      operation: 'format',
      input: '{"a":1}',
      options: { indent: 2 },
    });
  });

  it('returns null when payload shape is invalid', () => {
    const payload = JSON.stringify({
      tool: '',
      operation: 'format',
    });

    expect(parsePayloadParam(payload)).toBeNull();
  });

  it('parses query request and ignores invalid options shape', () => {
    const params = new URLSearchParams(
      'tool=json-formatter&op=format&input=%7B%22a%22%3A1%7D&options=%5B1%2C2%5D',
    );

    expect(parseQueryRequest(params)).toEqual({
      tool: 'json-formatter',
      operation: 'format',
      input: '{"a":1}',
      options: undefined,
    });
  });

  it('normalizes shorthand catalog path', () => {
    expect(normalizeQueryInput('catalog', '/ai-bridge')).toEqual({
      target: '/ai-bridge/catalog',
    });
  });
});
