import { describe, expect, it } from 'vitest';
import {
  TEST_DATA_FIELDS,
  generateCreditCard,
  generateEmail,
  generateTestDataSet,
  generateThaiBankAccount,
  generateThaiMobile,
  generateThaiName,
  generateThaiNationalId,
  generateThaiTaxId,
  isLuhnValid,
} from './testDataGenerator';
import { analyzeThaiId } from './thaiId';

/** Generators are random; a single sample proves nothing about the ones a user will get. */
const samples = (fn: () => string, count = 60) => Array.from({ length: count }, fn);

describe('generateThaiNationalId', () => {
  it('always produces an ID the app’s own validator accepts', () => {
    // The whole point: a QA can paste this into a Thai form and it will not be rejected.
    for (const id of samples(generateThaiNationalId)) {
      expect(analyzeThaiId(id).isValid, id).toBe(true);
    }
  });

  it('is 13 digits', () => {
    expect(generateThaiNationalId()).toMatch(/^\d{13}$/);
  });

  it('varies between calls', () => {
    expect(new Set(samples(generateThaiNationalId)).size).toBeGreaterThan(1);
  });
});

describe('generateThaiMobile', () => {
  it('uses only prefixes actually issued in Thailand', () => {
    for (const number of samples(generateThaiMobile)) {
      expect(number, number).toMatch(/^0[689]\d{8}$/);
    }
  });
});

describe('generateThaiTaxId', () => {
  it('is 13 digits with the same weighted checksum as a national ID', () => {
    for (const id of samples(generateThaiTaxId)) {
      expect(id, id).toMatch(/^\d{13}$/);
      expect(analyzeThaiId(id).isValid, id).toBe(true);
    }
  });
});

describe('generateCreditCard', () => {
  it('always satisfies Luhn', () => {
    for (const card of samples(generateCreditCard)) {
      expect(isLuhnValid(card), card).toBe(true);
    }
  });

  it('uses a recognised prefix and the matching length', () => {
    for (const card of samples(generateCreditCard)) {
      const ok =
        (card.startsWith('4') && card.length === 16) ||
        (card.startsWith('51') && card.length === 16) ||
        (card.startsWith('34') && card.length === 15);
      expect(ok, card).toBe(true);
    }
  });
});

describe('isLuhnValid', () => {
  it('accepts a known-good test number', () => {
    expect(isLuhnValid('4242424242424242')).toBe(true);
  });

  it('rejects the same number with one digit changed', () => {
    expect(isLuhnValid('4242424242424243')).toBe(false);
  });

  it('ignores separators', () => {
    expect(isLuhnValid('4242 4242 4242 4242')).toBe(true);
  });

  it('rejects input too short to carry a check digit', () => {
    expect(isLuhnValid('4')).toBe(false);
  });
});

describe('generateEmail', () => {
  it('only uses reserved example domains, so a stray send cannot reach anyone', () => {
    for (const email of samples(generateEmail)) {
      expect(email, email).toMatch(
        /@(example\.com|example\.co\.th|test\.local|mail\.example\.org)$/,
      );
    }
  });
});

describe('generateThaiBankAccount', () => {
  it('matches the xxx-x-xxxxx-x layout', () => {
    expect(generateThaiBankAccount()).toMatch(/^\d{3}-\d-\d{5}-\d$/);
  });
});

describe('generateThaiName', () => {
  it('returns two Thai words', () => {
    const [first, last] = generateThaiName().split(' ');
    expect(first).toMatch(/^[฀-๿]+$/);
    expect(last).toMatch(/^[฀-๿]+$/);
  });
});

describe('generateTestDataSet', () => {
  it('fills every declared field', () => {
    const set = generateTestDataSet();

    for (const field of TEST_DATA_FIELDS) {
      expect(set[field.id], field.id).toBeTruthy();
    }
    expect(Object.keys(set)).toHaveLength(TEST_DATA_FIELDS.length);
  });
});
