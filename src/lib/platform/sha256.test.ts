import { createHash, randomBytes } from 'node:crypto';
import { describe, it, expect } from 'vitest';
import { sha256Bytes, sha256Hex } from './sha256';

const nodeDigest = (value: string) => createHash('sha256').update(value, 'utf8').digest('hex');

describe('sha256Hex against the published NIST vectors', () => {
  it.each([
    ['', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
    ['abc', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
    [
      'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
    ],
    [
      'abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu',
      'cf5b16a778af8380036ce59e7b0492370b249b11e8f07a51afac45037afee9d1',
    ],
  ])('hashes %j', (input, expected) => {
    expect(sha256Hex(input)).toBe(expected);
  });
});

describe('sha256Hex against Node crypto', () => {
  it('agrees on inputs that straddle every padding boundary', () => {
    // 55/56/63/64 are where the length field stops fitting and a block is added.
    for (let length = 0; length <= 130; length += 1) {
      const input = 'a'.repeat(length);
      expect(sha256Hex(input)).toBe(nodeDigest(input));
    }
  });

  it('agrees on random binary-ish input', () => {
    for (let round = 0; round < 50; round += 1) {
      const input = randomBytes(64).toString('base64');
      expect(sha256Hex(input)).toBe(nodeDigest(input));
    }
  });

  it('agrees on multi-byte UTF-8, which is hashed as bytes not characters', () => {
    const input = 'คีย์ · 🔑 · app_prod';

    expect(sha256Hex(input)).toBe(nodeDigest(input));
  });

  it('agrees on input several blocks long', () => {
    const input = 'x'.repeat(10_000);

    expect(sha256Hex(input)).toBe(nodeDigest(input));
  });
});

describe('sha256Bytes', () => {
  it('returns the 32 raw digest bytes', () => {
    const digest = sha256Bytes(new TextEncoder().encode('abc'));

    expect(digest).toHaveLength(32);
    expect(digest[0]).toBe(0xba);
    expect(digest[31]).toBe(0xad);
  });
});
