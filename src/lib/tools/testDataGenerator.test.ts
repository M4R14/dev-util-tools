import { describe, expect, it } from 'vitest';
import {
  TEST_DATA_FIELDS,
  generateCreditCard,
  generateEmail,
  generateTestDataSet,
  generateThaiBankAccount,
  generateThaiMobile,
  generateThaiAddress,
  generateThaiAddressParts,
  generateThaiName,
  generateThaiNationalId,
  generateThaiTaxId,
  isLuhnValid,
} from './testDataGenerator';
import { analyzeThaiId } from './thaiId';
import { THAI_ADDRESSES } from '../../data/thaiAddresses';

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

describe('generateThaiAddress', () => {
  it('pairs every postcode with the province it belongs to', () => {
    // The point of switching to real data: the previous version drew province and postcode
    // independently, producing addresses that look Thai and fail every postcode check.
    //
    // Parsed by position rather than by searching for a province name anywhere in the string —
    // ถ.เพชรบุรี is a real Bangkok road and also a province, so a substring match reads the street
    // as the province and reports a false failure.
    const known = new Set(THAI_ADDRESSES.map((row) => `${row.province}|${row.zipcode}`));

    for (const address of samples(generateThaiAddress)) {
      const match = address.match(/(?:จ\.(\S+)|(กรุงเทพมหานคร)) (\d{5})$/);

      expect(match, address).toBeTruthy();
      const province = match![1] ?? match![2];
      expect(known.has(`${province}|${match![3]}`), address).toBe(true);
    }
  });

  it('uses แขวง/เขต for Bangkok and ต./อ. elsewhere', () => {
    const bangkok = THAI_ADDRESSES.filter((r) => r.province === 'กรุงเทพมหานคร');
    expect(bangkok.length, 'dataset should contain Bangkok rows').toBeGreaterThan(0);

    for (const address of samples(generateThaiAddress, 200)) {
      if (address.includes('กรุงเทพมหานคร')) {
        expect(address, address).toMatch(/แขวง/);
        expect(address, address).toMatch(/เขต/);
      } else {
        expect(address, address).toMatch(/ต\./);
        expect(address, address).toMatch(/จ\./);
      }
    }
  });

  it('includes a house number and a street', () => {
    expect(generateThaiAddress()).toMatch(/^\d+\/\d+ ถ\./);
  });
});

describe('generateThaiAddressParts', () => {
  it('returns a row that exists in the dataset', () => {
    for (let i = 0; i < 30; i += 1) {
      const parts = generateThaiAddressParts();
      const match = THAI_ADDRESSES.find(
        (r) =>
          r.district === parts.district &&
          r.amphoe === parts.amphoe &&
          r.province === parts.province &&
          r.zipcode === parts.zipcode,
      );
      expect(match, JSON.stringify(parts)).toBeTruthy();
    }
  });
});

describe('THAI_ADDRESSES dataset', () => {
  it('covers every province', () => {
    expect(new Set(THAI_ADDRESSES.map((r) => r.province)).size).toBe(77);
  });

  it('has a five-digit postcode on every row', () => {
    for (const row of THAI_ADDRESSES) {
      expect(row.zipcode, JSON.stringify(row)).toMatch(/^\d{5}$/);
    }
  });

  it('has no blank fields', () => {
    for (const row of THAI_ADDRESSES) {
      expect(row.district && row.amphoe && row.province, JSON.stringify(row)).toBeTruthy();
    }
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
