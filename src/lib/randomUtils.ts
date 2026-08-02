/**
 * Cryptographically secure randomness for anything a user might treat as a credential.
 *
 * `Math.random()` must never be used here: V8 implements it with xorshift128+, whose internal
 * state is recoverable from a handful of outputs, so consecutive "random" passwords are
 * predictable. Everything below draws from `crypto.getRandomValues`.
 *
 * `getRandomValues` is available in insecure contexts too (unlike `crypto.randomUUID` and
 * `crypto.subtle`), so a plain-HTTP LAN origin still gets real entropy. If the platform has no
 * Web Crypto at all these functions throw rather than silently degrading — failing loudly beats
 * handing back a weak password that the UI then labels "Strong".
 */

const UINT32_RANGE = 0x100000000; // 2^32

const getCrypto = (): Crypto => {
  const webCrypto = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;

  if (!webCrypto || typeof webCrypto.getRandomValues !== 'function') {
    throw new Error(
      'Secure random generation is unavailable: this platform has no crypto.getRandomValues.',
    );
  }

  return webCrypto;
};

/**
 * Uniform random integer in `[0, maxExclusive)`.
 *
 * Uses rejection sampling: values landing in the final, incomplete bucket are discarded and
 * redrawn. A bare `value % maxExclusive` would bias toward low values whenever 2^32 is not a
 * multiple of `maxExclusive` — for a 70-character password charset that is a measurable skew.
 */
export const randomInt = (maxExclusive: number): number => {
  if (!Number.isInteger(maxExclusive) || maxExclusive < 1) {
    throw new RangeError(`randomInt needs a positive integer bound, received ${maxExclusive}`);
  }
  if (maxExclusive === 1) return 0;

  const webCrypto = getCrypto();
  const limit = UINT32_RANGE - (UINT32_RANGE % maxExclusive);
  const buffer = new Uint32Array(1);

  let value: number;
  do {
    webCrypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);

  return value % maxExclusive;
};

/**
 * Random string of `length` characters drawn uniformly from `charset`.
 * The charset is split by code point, so multi-unit characters stay intact.
 */
export const randomString = (charset: string, length: number): string => {
  const characters = Array.from(charset);

  if (characters.length === 0) {
    throw new RangeError('randomString needs a non-empty charset');
  }
  if (!Number.isInteger(length) || length < 0) {
    throw new RangeError(`randomString needs a non-negative integer length, received ${length}`);
  }

  let result = '';
  for (let index = 0; index < length; index += 1) {
    result += characters[randomInt(characters.length)];
  }

  return result;
};

/**
 * RFC 4122 version 4 UUID.
 *
 * Prefers the native `crypto.randomUUID`, which only exists in secure contexts; otherwise
 * builds one from 16 secure random bytes with the version and variant bits set.
 */
export const randomUUID = (): string => {
  const webCrypto = getCrypto();

  if (typeof webCrypto.randomUUID === 'function') {
    return webCrypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  webCrypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
