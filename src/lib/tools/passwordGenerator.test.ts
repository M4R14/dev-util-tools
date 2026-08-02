import { describe, it, expect } from 'vitest';
import { PASSWORD_CHARSETS, generatePassword, getPasswordCharset } from './passwordGenerator';
import type { PasswordOptions } from './passwordStrength';

const options = (overrides: Partial<PasswordOptions> = {}): PasswordOptions => ({
  length: 16,
  includeUpper: true,
  includeLower: true,
  includeNumbers: true,
  includeSymbols: true,
  ...overrides,
});

describe('getPasswordCharset', () => {
  it('combines only the enabled sets', () => {
    expect(getPasswordCharset(options({ includeUpper: false, includeSymbols: false }))).toBe(
      PASSWORD_CHARSETS.lower + PASSWORD_CHARSETS.numbers,
    );
  });

  it('is empty when nothing is enabled', () => {
    expect(
      getPasswordCharset(
        options({
          includeUpper: false,
          includeLower: false,
          includeNumbers: false,
          includeSymbols: false,
        }),
      ),
    ).toBe('');
  });
});

describe('generatePassword', () => {
  it('honours the requested length', () => {
    expect(generatePassword(options({ length: 24 }))).toHaveLength(24);
    expect(generatePassword(options({ length: 4 }))).toHaveLength(4);
  });

  it('only uses characters from the enabled sets', () => {
    const password = generatePassword(
      options({ length: 200, includeUpper: false, includeSymbols: false }),
    );

    expect(password).toMatch(/^[a-z0-9]+$/);
  });

  it('returns an empty string when no character set is enabled', () => {
    expect(
      generatePassword(
        options({
          includeUpper: false,
          includeLower: false,
          includeNumbers: false,
          includeSymbols: false,
        }),
      ),
    ).toBe('');
  });

  it('does not repeat across calls', () => {
    const passwords = new Set(
      Array.from({ length: 50 }, () => generatePassword(options({ length: 16 }))),
    );

    expect(passwords.size).toBe(50);
  });

  it('draws from the whole pool rather than a biased slice', () => {
    // 2000 characters over a 26-character pool: every letter should turn up.
    const password = generatePassword(
      options({ length: 2000, includeUpper: false, includeNumbers: false, includeSymbols: false }),
    );

    expect(new Set(password).size).toBe(PASSWORD_CHARSETS.lower.length);
  });
});
