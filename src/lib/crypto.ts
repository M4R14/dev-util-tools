/**
 * Simple obfuscation helpers for API key storage.
 * NOT cryptographic security — just prevents plain-text storage in localStorage.
 */

export const encrypt = (text: string): string => {
  try {
    return btoa(text.split('').reverse().join(''));
  } catch {
    return text;
  }
};

export const decrypt = (encoded: string): string => {
  try {
    return atob(encoded).split('').reverse().join('');
  } catch {
    return encoded;
  }
};
