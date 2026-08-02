import { describe, expect, it } from 'vitest';
import { formatCurlBody, parseCurl, tokenizeCurl } from './curlParser';

describe('tokenizeCurl', () => {
  it('keeps a quoted string with spaces as one token', () => {
    expect(tokenizeCurl(`curl -H 'Accept: application/json' https://x.test`)).toEqual([
      'curl',
      '-H',
      'Accept: application/json',
      'https://x.test',
    ]);
  });

  it('treats single quotes as literal, the way a shell does', () => {
    expect(tokenizeCurl(`curl -d '{"a":"b\\c"}'`)[2]).toBe('{"a":"b\\c"}');
  });

  it('unescapes only the specials inside double quotes', () => {
    expect(tokenizeCurl('curl -d "{\\"a\\":1}"')[2]).toBe('{"a":1}');
  });

  it('folds line continuations', () => {
    const command = 'curl \\\n  -X POST \\\n  https://x.test';
    expect(tokenizeCurl(command)).toEqual(['curl', '-X', 'POST', 'https://x.test']);
  });

  it('preserves an empty quoted argument', () => {
    expect(tokenizeCurl(`curl -d '' https://x.test`)).toEqual(['curl', '-d', '', 'https://x.test']);
  });
});

describe('parseCurl', () => {
  it('parses a devtools-style copy-as-cURL', () => {
    const command = `curl 'https://api.example.com/v1/users?page=2&limit=10' \\
  -H 'accept: application/json' \\
  -H 'authorization: Bearer abc.def.ghi' \\
  --data-raw '{"name":"สมชาย","active":true}' \\
  --compressed`;

    const result = parseCurl(command);

    expect(result.method).toBe('POST');
    expect(result.url).toBe('https://api.example.com/v1/users');
    expect(result.query).toEqual([
      { key: 'page', value: '2' },
      { key: 'limit', value: '10' },
    ]);
    expect(result.headers).toEqual([
      { key: 'accept', value: 'application/json' },
      { key: 'authorization', value: 'Bearer abc.def.ghi' },
    ]);
    expect(result.body).toBe('{"name":"สมชาย","active":true}');
    expect(result.flags).toContain('--compressed');
  });

  it('defaults to GET with no body', () => {
    expect(parseCurl('curl https://x.test').method).toBe('GET');
  });

  it('infers POST from a body, as curl does', () => {
    expect(parseCurl(`curl https://x.test -d 'a=1'`).method).toBe('POST');
  });

  it('lets an explicit -X override the inferred method', () => {
    expect(parseCurl(`curl -X PUT https://x.test -d 'a=1'`).method).toBe('PUT');
  });

  it('joins repeated data flags with &, as curl does', () => {
    expect(parseCurl(`curl https://x.test -d 'a=1' -d 'b=2'`).body).toBe('a=1&b=2');
  });

  it('accepts --url instead of a positional URL', () => {
    expect(parseCurl(`curl --url https://x.test`).url).toBe('https://x.test');
  });

  it('splits a header on the first colon only', () => {
    const result = parseCurl(`curl https://x.test -H 'referer: https://a.test/x'`);

    expect(result.headers[0]).toEqual({ key: 'referer', value: 'https://a.test/x' });
  });

  it('surfaces unknown flags instead of dropping them silently', () => {
    expect(parseCurl('curl https://x.test --frobnicate').unrecognized).toContain('--frobnicate');
  });

  it('reports a flag whose value is missing', () => {
    expect(parseCurl('curl https://x.test -H').unrecognized).toContain('-H (missing value)');
  });

  it('rejects input that is not a curl command', () => {
    expect(() => parseCurl('wget https://x.test')).toThrow(/must start with "curl"/);
    expect(() => parseCurl('   ')).toThrow(/Paste a curl command/);
    expect(() => parseCurl('curl -L')).toThrow(/No URL found/);
  });

  it('keeps a URL with no query string intact', () => {
    const result = parseCurl('curl https://x.test/path');

    expect(result.url).toBe('https://x.test/path');
    expect(result.query).toEqual([]);
  });
});

describe('formatCurlBody', () => {
  it('pretty-prints a JSON body', () => {
    const { text, isJson } = formatCurlBody('{"a":1,"b":[2,3]}');

    expect(isJson).toBe(true);
    expect(text).toBe('{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}');
  });

  it('leaves a form body exactly as sent', () => {
    const { text, isJson } = formatCurlBody('a=1&b=2');

    expect(isJson).toBe(false);
    expect(text).toBe('a=1&b=2');
  });

  it('returns empty for no body', () => {
    expect(formatCurlBody(null)).toEqual({ text: '', isJson: false });
  });
});
