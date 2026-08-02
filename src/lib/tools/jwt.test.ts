import { describe, it, expect } from 'vitest';
import { decodeJwt } from './jwt';
import { encodeUnicodeToBase64 } from './base64Utils';

const toBase64Url = (value: string) =>
  encodeUnicodeToBase64(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const makeToken = (header: object, payload: object, signature = 'sig') =>
  `${toBase64Url(JSON.stringify(header))}.${toBase64Url(JSON.stringify(payload))}.${signature}`;

describe('decodeJwt', () => {
  it('decodes header and payload', () => {
    const token = makeToken({ alg: 'HS256', typ: 'JWT' }, { sub: '123', name: 'DevPulse' });
    const decoded = decodeJwt(token);

    expect(decoded.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(decoded.payload).toEqual({ sub: '123', name: 'DevPulse' });
    expect(decoded.algorithm).toBe('HS256');
    expect(decoded.signature).toBe('sig');
  });

  it('decodes the canonical jwt.io sample token', () => {
    const decoded = decodeJwt(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
        '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
        '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    );

    expect(decoded.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(decoded.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
    // This real signature contains '_', which only decodes correctly with base64url handling.
    expect(decoded.signature).toContain('_');
  });

  it('decodes a token with base64url characters in the payload', () => {
    // Payload chosen so the base64 contains both '-' and '_' after url-encoding.
    const payload = { data: '???>>>???', sub: 'a+b/c' };
    const decoded = decodeJwt(makeToken({ alg: 'HS256' }, payload));

    expect(decoded.payload).toEqual(payload);
  });

  it('decodes non-ASCII claims', () => {
    const decoded = decodeJwt(makeToken({ alg: 'HS256' }, { name: 'สมชาย', emoji: '🚗' }));

    expect(decoded.payload.name).toBe('สมชาย');
    expect(decoded.payload.emoji).toBe('🚗');
  });

  describe('time claims', () => {
    const token = makeToken(
      { alg: 'HS256' },
      { iat: 1700000000, nbf: 1700000100, exp: 1700003600 },
    );

    it('reads NumericDate claims as seconds', () => {
      const decoded = decodeJwt(token, new Date(1700000000 * 1000));

      expect(decoded.issuedAt?.toISOString()).toBe(new Date(1700000000000).toISOString());
      expect(decoded.notBefore?.toISOString()).toBe(new Date(1700000100000).toISOString());
      expect(decoded.expiresAt?.toISOString()).toBe(new Date(1700003600000).toISOString());
    });

    it('flags expiry against the supplied clock', () => {
      expect(decodeJwt(token, new Date(1700000000 * 1000)).isExpired).toBe(false);
      expect(decodeJwt(token, new Date(1700009999 * 1000)).isExpired).toBe(true);
    });

    it('reports null expiry when the token has no exp claim', () => {
      const decoded = decodeJwt(makeToken({ alg: 'HS256' }, { sub: '1' }));

      expect(decoded.expiresAt).toBeNull();
      expect(decoded.isExpired).toBeNull();
    });

    it('ignores non-numeric time claims', () => {
      const decoded = decodeJwt(makeToken({ alg: 'HS256' }, { exp: 'tomorrow' }));

      expect(decoded.expiresAt).toBeNull();
    });
  });

  it('decodes unsigned alg:none tokens — decoding is not verification', () => {
    const decoded = decodeJwt(`${toBase64Url('{"alg":"none"}')}.${toBase64Url('{"admin":true}')}.`);

    expect(decoded.algorithm).toBe('none');
    expect(decoded.payload.admin).toBe(true);
    expect(decoded.signature).toBe('');
  });

  it('tolerates surrounding whitespace', () => {
    const token = makeToken({ alg: 'HS256' }, { sub: '1' });

    expect(decodeJwt(`  ${token}\n`).payload).toEqual({ sub: '1' });
  });

  /**
   * These are the cases `jwt-decode` alone does NOT catch — it splits on "." and reads part #2
   * without checking the segment count or the shape of the result. Verified against the library
   * directly: it accepts `a.b`, hands back segment #2 of a 5-part JWE as if it were the payload,
   * and accepts arrays/null/numbers as claims. Keep these tests if the decoding library changes.
   */
  describe('rejects malformed input', () => {
    it('empty token', () => {
      expect(() => decodeJwt('   ')).toThrow('JWT is empty');
    });

    it('wrong segment count', () => {
      expect(() => decodeJwt('a.b')).toThrow('received 2');
      expect(() => decodeJwt('a.b.c.d')).toThrow('received 4');
    });

    it('names JWE specifically rather than saying "wrong segment count"', () => {
      expect(() => decodeJwt('a.b.c.d.e')).toThrow(/JWE/);
    });

    it('non-JSON payload', () => {
      expect(() =>
        decodeJwt(`${toBase64Url('{"alg":"HS256"}')}.${toBase64Url('nope')}.sig`),
      ).toThrow('payload is not valid JSON');
    });

    it('JSON array instead of an object', () => {
      expect(() =>
        decodeJwt(`${toBase64Url('{"alg":"HS256"}')}.${toBase64Url('[1,2]')}.sig`),
      ).toThrow('payload must be a JSON object');
    });

    it('undecodable header', () => {
      expect(() => decodeJwt('!!!.eyJhIjoxfQ.sig')).toThrow(/header is not valid/);
    });
  });
});
