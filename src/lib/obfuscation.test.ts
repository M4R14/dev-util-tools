import { deobfuscate, obfuscate } from './obfuscation';

describe('obfuscation helpers', () => {
  it('round-trips a value', () => {
    const raw = 'my-secret-key';
    const encoded = obfuscate(raw);

    expect(encoded).not.toBe(raw);
    expect(deobfuscate(encoded)).toBe(raw);
  });

  it('returns the original input for non-base64 payloads', () => {
    expect(deobfuscate('not-a-valid-base64')).toBe('not-a-valid-base64');
  });

  it('is reversible by anyone — it is encoding, not encryption', () => {
    const raw = 'sk-1234567890';

    // No key is involved: the transform is base64(reverse(text)), so a third party can undo it
    // with two builtin calls. This test exists to stop the module being mistaken for crypto.
    expect(atob(obfuscate(raw)).split('').reverse().join('')).toBe(raw);
  });
});
