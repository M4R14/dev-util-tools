import { CHARSET_SIZES } from './constants';
import type { CharsetOption, EnabledCharsetSets } from './types';

export const getActiveCharsetSetCount = (enabledSets: EnabledCharsetSets) =>
  Object.values(enabledSets).filter(Boolean).length;

export const getCharacterPoolSize = (enabledSets: EnabledCharsetSets) =>
  Object.entries(enabledSets).reduce((sum, [key, enabled]) => {
    if (!enabled) return sum;
    return sum + CHARSET_SIZES[key as keyof EnabledCharsetSets];
  }, 0);

export const getEntropyBits = (length: number, characterPool: number) =>
  characterPool > 0 ? Math.round(length * Math.log2(characterPool)) : 0;

export const buildCharsetOptions = (enabledSets: EnabledCharsetSets): CharsetOption[] => [
  {
    key: 'upper',
    label: 'Uppercase',
    description: 'A-Z letters',
    sample: 'ABC',
    checked: enabledSets.upper,
  },
  {
    key: 'lower',
    label: 'Lowercase',
    description: 'a-z letters',
    sample: 'abc',
    checked: enabledSets.lower,
  },
  {
    key: 'numbers',
    label: 'Numbers',
    description: '0-9 digits',
    sample: '123',
    checked: enabledSets.numbers,
  },
  {
    key: 'symbols',
    label: 'Symbols',
    description: 'Special characters',
    sample: '!@#',
    checked: enabledSets.symbols,
  },
];
