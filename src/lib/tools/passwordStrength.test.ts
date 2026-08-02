import { getPasswordStrength } from './passwordStrength';

describe('passwordStrength', () => {
  it('returns weak for short low-complexity options', () => {
    const result = getPasswordStrength({
      length: 6,
      includeUpper: false,
      includeLower: true,
      includeNumbers: false,
      includeSymbols: false,
    });

    expect(result.label).toBe('Weak');
    expect(result.percent).toBe(33);
  });

  it('returns medium for moderate complexity', () => {
    const result = getPasswordStrength({
      length: 12,
      includeUpper: true,
      includeLower: true,
      includeNumbers: false,
      includeSymbols: false,
    });

    expect(result.label).toBe('Medium');
    expect(result.percent).toBe(66);
  });

  it('returns strong for long high-complexity options', () => {
    const result = getPasswordStrength({
      length: 20,
      includeUpper: true,
      includeLower: true,
      includeNumbers: true,
      includeSymbols: true,
    });

    expect(result.label).toBe('Strong');
    expect(result.percent).toBe(100);
  });
});
