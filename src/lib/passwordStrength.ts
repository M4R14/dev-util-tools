/**
 * Password strength evaluation.
 * Extracted from PasswordGenerator for reusability and testability.
 */

export interface PasswordStrength {
  label: 'Weak' | 'Medium' | 'Strong';
  color: string;
  textColor: string;
  percent: number;
  message: string;
}

export interface PasswordOptions {
  length: number;
  includeUpper: boolean;
  includeLower: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

export const getPasswordStrength = (options: PasswordOptions): PasswordStrength => {
  const { length, includeUpper, includeLower, includeNumbers, includeSymbols } = options;

  const activeOptions = [includeUpper, includeLower, includeNumbers, includeSymbols].filter(
    Boolean,
  ).length;
  let score = activeOptions;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;
  if (length < 8) score = Math.min(score, 1);

  if (score < 3)
    return {
      label: 'Weak',
      color: 'bg-red-500',
      textColor: 'text-red-500',
      percent: 33,
      message: 'Too guessable',
    };
  if (score < 5)
    return {
      label: 'Medium',
      color: 'bg-amber-500',
      textColor: 'text-amber-500',
      percent: 66,
      message: 'Reasonable for most sites',
    };
  return {
    label: 'Strong',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-500',
    percent: 100,
    message: 'Excellent entropy',
  };
};
