import { describe, it, expect, vi, afterEach } from 'vitest';
import { randomInt, randomString, randomUUID } from './randomUtils';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('randomInt', () => {
  it('stays inside [0, maxExclusive)', () => {
    for (let i = 0; i < 500; i += 1) {
      const value = randomInt(10);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(10);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('returns 0 for a bound of 1', () => {
    expect(randomInt(1)).toBe(0);
  });

  it('eventually produces every value in range', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i += 1) seen.add(randomInt(8));
    expect(seen.size).toBe(8);
  });

  it('is roughly uniform (no gross modulo bias)', () => {
    const buckets = new Array(5).fill(0);
    const draws = 20_000;
    for (let i = 0; i < draws; i += 1) buckets[randomInt(5)] += 1;

    // Expected 4000 per bucket; ±20% is far tighter than a biased implementation would manage
    // yet loose enough not to flake.
    for (const count of buckets) {
      expect(count).toBeGreaterThan(draws / 5 - draws / 25);
      expect(count).toBeLessThan(draws / 5 + draws / 25);
    }
  });

  it('rejects non-positive and non-integer bounds', () => {
    expect(() => randomInt(0)).toThrow(RangeError);
    expect(() => randomInt(-3)).toThrow(RangeError);
    expect(() => randomInt(2.5)).toThrow(RangeError);
  });
});

describe('randomString', () => {
  it('returns the requested length using only charset characters', () => {
    const charset = 'abc123';
    const value = randomString(charset, 64);

    expect(value).toHaveLength(64);
    expect([...value].every((char) => charset.includes(char))).toBe(true);
  });

  it('handles a zero length and a single-character charset', () => {
    expect(randomString('abc', 0)).toBe('');
    expect(randomString('x', 5)).toBe('xxxxx');
  });

  it('does not split multi-unit characters', () => {
    const value = randomString('🚗🛻', 20);
    expect([...value]).toHaveLength(20);
  });

  it('does not repeat itself across calls', () => {
    const first = randomString('abcdefghijklmnopqrstuvwxyz0123456789', 32);
    const second = randomString('abcdefghijklmnopqrstuvwxyz0123456789', 32);
    expect(first).not.toBe(second);
  });

  it('rejects an empty charset and a negative length', () => {
    expect(() => randomString('', 8)).toThrow(RangeError);
    expect(() => randomString('abc', -1)).toThrow(RangeError);
  });
});

describe('randomUUID', () => {
  it('produces a well-formed v4 UUID', () => {
    expect(randomUUID()).toMatch(UUID_V4);
  });

  it('does not collide over many draws', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 5000; i += 1) seen.add(randomUUID());
    expect(seen.size).toBe(5000);
  });
});

describe('randomUUID without native crypto.randomUUID', () => {
  // `crypto.randomUUID` only exists in secure contexts, so plain-HTTP origins take the manual
  // path. That path used to fall back to Math.random — pin it to getRandomValues here.
  const withoutNativeRandomUUID = () => {
    const real = globalThis.crypto;
    vi.stubGlobal('crypto', {
      getRandomValues: (array: Uint8Array) => real.getRandomValues(array),
    });
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('still produces a well-formed v4 UUID', () => {
    withoutNativeRandomUUID();
    expect(randomUUID()).toMatch(UUID_V4);
  });

  it('sets the version and variant bits correctly', () => {
    withoutNativeRandomUUID();
    for (let i = 0; i < 200; i += 1) {
      const uuid = randomUUID();
      expect(uuid[14]).toBe('4');
      expect('89ab').toContain(uuid[19]);
    }
  });

  it('does not collide', () => {
    withoutNativeRandomUUID();
    const seen = new Set<string>();
    for (let i = 0; i < 2000; i += 1) seen.add(randomUUID());
    expect(seen.size).toBe(2000);
  });
});

describe('secure randomness is required', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws instead of degrading when Web Crypto is missing', () => {
    vi.stubGlobal('crypto', undefined);

    expect(() => randomInt(10)).toThrow(/crypto.getRandomValues/);
    expect(() => randomUUID()).toThrow(/crypto.getRandomValues/);
  });
});
