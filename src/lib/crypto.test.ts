import { decrypt, encrypt } from './crypto';

describe('crypto helpers', () => {
  it('encrypts and decrypts round-trip', () => {
    const raw = 'my-secret-key';
    const encrypted = encrypt(raw);
    expect(encrypted).not.toBe(raw);
    expect(decrypt(encrypted)).toBe(raw);
  });

  it('returns original input for non-base64 decrypt payloads', () => {
    expect(decrypt('not-a-valid-base64')).toBe('not-a-valid-base64');
  });
});
