import { describe, it, expect, vi, afterEach } from 'vitest';
import { encodeJwt, verifyJwt } from './jwtSign';
import { decodeJwt } from './jwt';

const SECRET = 'a-string-at-least-32-bytes-long-for-hs256';

describe('encodeJwt', () => {
  it('produces an unsigned token when no secret is given', async () => {
    const token = await encodeJwt({ payload: { sub: '1' } });
    const decoded = decodeJwt(token);

    expect(decoded.algorithm).toBe('none');
    expect(decoded.payload.sub).toBe('1');
    expect(decoded.signature).toBe('');
  });

  it('signs with HS256 by default', async () => {
    const token = await encodeJwt({ payload: { sub: '1' }, secret: SECRET });
    const decoded = decodeJwt(token);

    expect(decoded.algorithm).toBe('HS256');
    expect(decoded.signature.length).toBeGreaterThan(0);
  });

  it.each(['HS256', 'HS384', 'HS512'] as const)('signs with %s', async (algorithm) => {
    const token = await encodeJwt({ payload: { sub: '1' }, secret: SECRET, algorithm });

    expect(decodeJwt(token).algorithm).toBe(algorithm);
  });

  it('round-trips claims through the decoder, including non-ASCII', async () => {
    const payload = { sub: '1', name: 'สมชาย', exp: 1900000000 };
    const decoded = decodeJwt(await encodeJwt({ payload, secret: SECRET }));

    expect(decoded.payload.name).toBe('สมชาย');
    expect(decoded.expiresAt?.getTime()).toBe(1900000000 * 1000);
  });

  it('treats an empty secret as "unsigned" rather than signing with an empty key', async () => {
    expect(decodeJwt(await encodeJwt({ payload: { a: 1 }, secret: '' })).algorithm).toBe('none');
  });
});

describe('verifyJwt', () => {
  it('accepts a token signed with the same secret', async () => {
    const token = await encodeJwt({ payload: { sub: '1' }, secret: SECRET });
    const result = await verifyJwt(token, SECRET);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.payload.sub).toBe('1');
      expect(result.protectedHeader.alg).toBe('HS256');
    }
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await encodeJwt({ payload: { sub: '1' }, secret: SECRET });
    const result = await verifyJwt(token, `${SECRET}-tampered`);

    expect(result).toEqual({ valid: false, reason: 'Signature does not match this secret' });
  });

  it('rejects a tampered payload', async () => {
    const token = await encodeJwt({ payload: { admin: false }, secret: SECRET });
    const [header, , signature] = token.split('.');
    const forgedPayload = btoa('{"admin":true}')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const result = await verifyJwt(`${header}.${forgedPayload}.${signature}`, SECRET);

    expect(result.valid).toBe(false);
  });

  it('rejects an unsigned token even when a secret is supplied', async () => {
    const token = await encodeJwt({ payload: { admin: true } });
    const result = await verifyJwt(token, SECRET);

    expect(result.valid).toBe(false);
  });

  it('reports expiry separately from a bad signature', async () => {
    const token = await encodeJwt({ payload: { sub: '1', exp: 1000 }, secret: SECRET });
    const result = await verifyJwt(token, SECRET);

    expect(result).toEqual({
      valid: false,
      reason: 'Signature is valid but the token has expired',
    });
  });

  it('rejects an algorithm outside the allowed list', async () => {
    const token = await encodeJwt({ payload: { sub: '1' }, secret: SECRET, algorithm: 'HS512' });
    const result = await verifyJwt(token, SECRET, ['HS256']);

    expect(result).toEqual({
      valid: false,
      reason: 'Token algorithm is not one of the allowed HMAC algorithms',
    });
  });

  it('answers without calling out for empty input', async () => {
    expect(await verifyJwt('', SECRET)).toEqual({ valid: false, reason: 'Token is empty' });
    expect(await verifyJwt('a.b.c', '')).toEqual({ valid: false, reason: 'Secret is empty' });
  });
});

describe('without Web Crypto', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws rather than silently producing an unsigned or unchecked result', async () => {
    vi.stubGlobal('crypto', {});

    await expect(encodeJwt({ payload: { a: 1 }, secret: SECRET })).rejects.toThrow(/Web Crypto/);
    await expect(verifyJwt('a.b.c', SECRET)).rejects.toThrow(/Web Crypto/);
  });

  it('still builds an unsigned token, which needs no crypto', async () => {
    vi.stubGlobal('crypto', {});

    await expect(encodeJwt({ payload: { a: 1 } })).resolves.toContain('.');
  });
});
