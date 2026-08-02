import { analyzeThaiId, formatThaiId, generateThaiId, sanitizeThaiIdInput } from './thaiId';

describe('thaiId utils', () => {
  it('sanitizes and formats thai id input', () => {
    const sanitized = sanitizeThaiIdInput('1-1017-00203-45-1');
    expect(sanitized).toBe('1101700203451');
    expect(formatThaiId(sanitized)).toBe('1-1017-00203-45-1');
  });

  it('generates valid thai id and analysis result', () => {
    const generated = generateThaiId({ personTypeDigit: '1' });
    const analysis = analyzeThaiId(generated);

    expect(generated).toHaveLength(13);
    expect(generated[0]).toBe('1');
    expect(analysis.isValid).toBe(true);
    expect(analysis.formatted).toContain('-');
  });

  it('throws for invalid length', () => {
    expect(() => analyzeThaiId('123')).toThrow('Thai ID must contain exactly 13 digits');
  });
});
