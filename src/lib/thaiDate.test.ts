import { formatThaiDate, fromThaiDigits, parseThaiDate, toThaiDigits } from './thaiDate';

describe('thaiDate utils', () => {
  it('parses thai date string into iso date', () => {
    const parsed = parseThaiDate('1 ม.ค. 2568');
    expect(parsed).toEqual({
      iso: '2025-01-01',
      formatted: '2025-01-01',
    });
  });

  it('formats valid date input', () => {
    const formatted = formatThaiDate('2025-01-01');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('converts thai digits back and forth', () => {
    const thai = toThaiDigits(1234567890);
    expect(thai).toBe('๑๒๓๔๕๖๗๘๙๐');
    expect(fromThaiDigits(thai)).toBe('1234567890');
  });
});
