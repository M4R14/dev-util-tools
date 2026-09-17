/**
 * SHA-256 (FIPS 180-4), implemented here rather than called through `crypto.subtle`.
 *
 * `subtle` exists only in secure contexts, so on a plain-HTTP LAN origin — the `Network:` URL Vite
 * prints, which is how this app gets opened on a phone or a colleague's machine — it is simply
 * undefined. A hash is not a secret operation and has no key material, so unlike signing (see
 * `src/lib/tools/jwtSign.ts`, which stays on `jose`) it can be computed anywhere, and a tool that
 * turns a credential into the hash a database stores is worth having on every origin.
 *
 * Being synchronous is the second reason: callers hash a value while rendering, with no promise to
 * unwind and no chance of two option changes settling out of order.
 *
 * Correctness is pinned by the published NIST vectors and by a differential test against Node's
 * own `createHash` in `sha256.test.ts`. If those pass, this file is right; if they ever fail, it is
 * this file that is wrong.
 */

// First 32 bits of the fractional parts of the cube roots of the first 64 primes.
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

// First 32 bits of the fractional parts of the square roots of the first 8 primes.
const INITIAL_HASH = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
]);

const BLOCK_BYTES = 64;

const rotr = (value: number, bits: number) => (value >>> bits) | (value << (32 - bits));

/** The message with the mandatory `0x80`, the zero padding, and the 64-bit big-endian bit length. */
const padMessage = (bytes: Uint8Array): Uint8Array => {
  // 1 byte for the terminator plus 8 for the length, rounded up to whole blocks.
  const blocks = Math.ceil((bytes.length + 9) / BLOCK_BYTES);
  const padded = new Uint8Array(blocks * BLOCK_BYTES);

  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const bitLength = bytes.length * 8;
  const view = new DataView(padded.buffer);
  // Split across two 32-bit writes: a bit length past 2^32 exceeds what setUint32 takes, and
  // BigInt would be the only alternative.
  view.setUint32(padded.length - 8, Math.floor(bitLength / 0x100000000));
  view.setUint32(padded.length - 4, bitLength >>> 0);

  return padded;
};

export const sha256Bytes = (input: Uint8Array): Uint8Array => {
  const padded = padMessage(input);
  const view = new DataView(padded.buffer);
  const hash = INITIAL_HASH.slice();
  const schedule = new Uint32Array(64);

  for (let offset = 0; offset < padded.length; offset += BLOCK_BYTES) {
    for (let index = 0; index < 16; index += 1) {
      schedule[index] = view.getUint32(offset + index * 4);
    }

    for (let index = 16; index < 64; index += 1) {
      const previous = schedule[index - 15];
      const recent = schedule[index - 2];
      const s0 = rotr(previous, 7) ^ rotr(previous, 18) ^ (previous >>> 3);
      const s1 = rotr(recent, 17) ^ rotr(recent, 19) ^ (recent >>> 10);

      schedule[index] = (schedule[index - 16] + s0 + schedule[index - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = hash;

    for (let index = 0; index < 64; index += 1) {
      const s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const choice = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + choice + K[index] + schedule[index]) >>> 0;
      const s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + majority) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    const round = [a, b, c, d, e, f, g, h];
    for (let index = 0; index < 8; index += 1) {
      hash[index] = (hash[index] + round[index]) >>> 0;
    }
  }

  const digest = new Uint8Array(32);
  const digestView = new DataView(digest.buffer);
  for (let index = 0; index < 8; index += 1) {
    digestView.setUint32(index * 4, hash[index]);
  }

  return digest;
};

/** sha256 of a UTF-8 string as lower-case hex — the form these schemas store. */
export const sha256Hex = (input: string): string =>
  Array.from(sha256Bytes(new TextEncoder().encode(input)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
