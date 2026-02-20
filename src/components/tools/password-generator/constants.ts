import type { CharsetKey } from './types';

export const CHARSET_SIZES: Record<CharsetKey, number> = {
  upper: 26,
  lower: 26,
  numbers: 10,
  symbols: 26,
};

export const LENGTH_PRESETS = [12, 16, 24, 32] as const;

export const PASSWORD_GUIDANCE_LINES = [
  'Use 16+ characters for most accounts and 24+ for critical services.',
  'Keep all character sets enabled for the highest entropy.',
  'Store generated credentials in a password manager.',
] as const;
