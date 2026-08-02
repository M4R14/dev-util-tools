import { describe, it, expect } from 'vitest';
import { decodeUnicodeFromBase64, encodeUnicodeToBase64 } from './base64Utils';

describe('base64Utils', () => {
  it('round-trips ASCII', () => {
    expect(encodeUnicodeToBase64('hello world')).toBe('aGVsbG8gd29ybGQ=');
    expect(decodeUnicodeFromBase64('aGVsbG8gd29ybGQ=')).toBe('hello world');
  });

  it('round-trips non-ASCII text that plain btoa cannot handle', () => {
    const thai = 'สวัสดีชาวโลก';
    expect(() => btoa(thai)).toThrow();
    expect(decodeUnicodeFromBase64(encodeUnicodeToBase64(thai))).toBe(thai);
  });

  it('round-trips emoji (surrogate pairs)', () => {
    const emoji = '🚗💨';
    expect(decodeUnicodeFromBase64(encodeUnicodeToBase64(emoji))).toBe(emoji);
  });

  it('handles the empty string', () => {
    expect(encodeUnicodeToBase64('')).toBe('');
    expect(decodeUnicodeFromBase64('')).toBe('');
  });

  it('throws on malformed Base64', () => {
    expect(() => decodeUnicodeFromBase64('not valid base64!!')).toThrow();
  });
});
