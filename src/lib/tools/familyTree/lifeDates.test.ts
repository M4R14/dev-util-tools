import { describe, expect, it } from 'vitest';
import { byBirthYear, formatLifespan, isDeceased, parseLifeYear } from './lifeDates';

describe('parseLifeYear', () => {
  it('reads a plain Common Era year', () => {
    expect(parseLifeYear('1967')).toBe(1967);
  });

  it('converts a Buddhist year, which is how Thai records are written', () => {
    expect(parseLifeYear('2510')).toBe(1967);
    expect(parseLifeYear('2568')).toBe(2025);
  });

  it('takes the year out of a full date whatever the order', () => {
    expect(parseLifeYear('12 มี.ค. 2503')).toBe(1960);
    expect(parseLifeYear('2503-03-12')).toBe(1960);
    expect(parseLifeYear('March 1960')).toBe(1960);
  });

  it('reads a year out of an approximation', () => {
    expect(parseLifeYear('ราวๆ 2495')).toBe(1952);
    expect(parseLifeYear('circa 1901')).toBe(1901);
  });

  it('returns nothing when there is no year', () => {
    expect(parseLifeYear('')).toBeNull();
    expect(parseLifeYear('ไม่ทราบ')).toBeNull();
    expect(parseLifeYear('unknown')).toBeNull();
  });

  it('ignores a run of digits that cannot be a year', () => {
    // A phone number in the wrong field should not become a birth year.
    expect(parseLifeYear('0812345678')).toBeNull();
    expect(parseLifeYear('999')).toBeNull();
  });

  it('leaves the boundary year alone on the Common Era side', () => {
    // 2299 CE is absurd for a family tree but it is not a Buddhist year either.
    expect(parseLifeYear('2299')).toBe(2299);
    expect(parseLifeYear('2300')).toBe(1757);
  });
});

describe('formatLifespan', () => {
  it('shows both years when both are known', () => {
    expect(formatLifespan('2480', '2560')).toBe('1937–2017');
  });

  it('shows only what is known', () => {
    expect(formatLifespan('2510', '')).toBe('b. 1967');
    expect(formatLifespan('', '2560')).toBe('d. 2017');
  });

  it('says nothing when nothing is known', () => {
    expect(formatLifespan('', '')).toBe('');
    expect(formatLifespan('ไม่ทราบ', '')).toBe('');
  });

  it('still reports a death that carries no readable year', () => {
    // "They are gone" is the part that matters; the year is the detail.
    expect(formatLifespan('', 'ไม่ทราบปี')).toBe('deceased');
    expect(formatLifespan('2510', 'ไม่ทราบปี')).toBe('b. 1967');
  });
});

describe('isDeceased', () => {
  it('is true for anything entered at all', () => {
    expect(isDeceased('2560')).toBe(true);
    expect(isDeceased('ไม่ทราบ')).toBe(true);
  });

  it('is false for nothing, including whitespace', () => {
    expect(isDeceased('')).toBe(false);
    expect(isDeceased('   ')).toBe(false);
  });
});

describe('byBirthYear', () => {
  const at = (birth: string) => ({ birth });

  it('puts the older sibling first', () => {
    expect(byBirthYear(at('2500'), at('2505'))).toBeLessThan(0);
    expect(byBirthYear(at('2505'), at('2500'))).toBeGreaterThan(0);
  });

  it('compares across eras, since one may be typed either way', () => {
    expect(byBirthYear(at('1960'), at('2510'))).toBeLessThan(0);
  });

  it('puts an unknown birth last', () => {
    expect(byBirthYear(at(''), at('2500'))).toBeGreaterThan(0);
    expect(byBirthYear(at('2500'), at(''))).toBeLessThan(0);
  });

  it('leaves two unknowns in the order they were entered', () => {
    // Zero, so a stable sort keeps the owner's own ordering — the only signal left.
    expect(byBirthYear(at(''), at(''))).toBe(0);
  });

  it('sorts a sibling set, unknowns trailing in place', () => {
    const siblings = [at('2510'), at(''), at('2495'), at('ไม่ทราบ'), at('2502')];
    const sorted = [...siblings].sort(byBirthYear).map((entry) => entry.birth);

    expect(sorted).toEqual(['2495', '2502', '2510', '', 'ไม่ทราบ']);
  });
});
