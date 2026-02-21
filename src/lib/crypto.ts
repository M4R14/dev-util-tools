/**
 * Simple obfuscation helpers for API key storage.
 * NOT cryptographic security — just prevents plain-text storage in localStorage.
 */
import { z } from 'zod';

const stringSchema = z.string();

export const encrypt = (text: string): string => {
  const parsed = stringSchema.safeParse(text);
  if (!parsed.success) {
    return '';
  }

  try {
    return btoa(parsed.data.split('').reverse().join(''));
  } catch {
    return parsed.data;
  }
};

export const decrypt = (encoded: string): string => {
  const parsed = stringSchema.safeParse(encoded);
  if (!parsed.success) {
    return '';
  }

  try {
    return atob(parsed.data).split('').reverse().join('');
  } catch {
    return parsed.data;
  }
};
