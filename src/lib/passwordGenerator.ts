import { randomString } from './randomUtils';
import type { PasswordOptions } from './passwordStrength';

/**
 * Password construction. Kept beside `passwordStrength.ts` so the character sets that produce a
 * password and the ones its strength score assumes cannot drift apart.
 */

export const PASSWORD_CHARSETS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
} as const;

/** The pool a given set of options draws from. Exposed so the UI can show a real pool size. */
export const getPasswordCharset = (options: PasswordOptions): string => {
  let charset = '';
  if (options.includeUpper) charset += PASSWORD_CHARSETS.upper;
  if (options.includeLower) charset += PASSWORD_CHARSETS.lower;
  if (options.includeNumbers) charset += PASSWORD_CHARSETS.numbers;
  if (options.includeSymbols) charset += PASSWORD_CHARSETS.symbols;

  return charset;
};

/**
 * Generate a password using secure randomness.
 * Returns `''` when no character set is enabled — there is nothing to draw from.
 */
export const generatePassword = (options: PasswordOptions): string => {
  const charset = getPasswordCharset(options);
  if (!charset) return '';

  return randomString(charset, options.length);
};
