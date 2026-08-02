/**
 * Reversible obfuscation for values kept in localStorage (currently the Gemini API key).
 *
 * This is `base64(reverse(text))` — encoding, NOT encryption. There is no key, so anyone with
 * the stored string can recover the original in two calls. It exists only so a casual glance at
 * devtools does not show a raw API key; it protects nothing from an attacker with access to the
 * browser profile. The functions are named `obfuscate`/`deobfuscate` for that reason: an earlier
 * `encrypt`/`decrypt` pair in a file called `crypto.ts` promised a guarantee this cannot give.
 */
import { z } from 'zod';

const stringSchema = z.string();

export const obfuscate = (text: string): string => {
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

export const deobfuscate = (encoded: string): string => {
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
