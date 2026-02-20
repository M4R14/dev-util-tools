export type CharsetKey = 'upper' | 'lower' | 'numbers' | 'symbols';

export interface CharsetOption {
  key: CharsetKey;
  label: string;
  description: string;
  sample: string;
  checked: boolean;
}

export interface EnabledCharsetSets {
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
}
