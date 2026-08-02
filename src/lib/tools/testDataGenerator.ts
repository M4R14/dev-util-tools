import { randomInt } from '../platform/randomUtils';
import { calculateThaiIdChecksum } from './thaiId';
import { THAI_ADDRESSES, type ThaiAddressRow } from '../../data/thaiAddresses';

/**
 * Fake Thai data that passes the validation it will be typed into.
 *
 * QA fills the same forms every day and needs values a Thai system will accept: a national ID with
 * a correct check digit, a mobile number on a real prefix, a card number that satisfies Luhn.
 * Generic fake-data libraries produce Thai-*looking* strings that these checks reject, which turns
 * a five-second task into a hunt for a valid sample.
 *
 * Everything is drawn from `randomInt`, which uses `crypto.getRandomValues` — not because test
 * data needs to be unguessable, but so there is exactly one random source in the codebase.
 *
 * These are deliberately fictitious. Names come from a small fixed pool and the numeric formats are
 * valid by construction, so a value may collide with a real one by chance; never treat output as
 * safe to send anywhere real.
 */

const pick = <T>(values: readonly T[]): T => values[randomInt(values.length)];

const digits = (length: number): string =>
  Array.from({ length }, () => String(randomInt(10))).join('');

/** Thai national ID: 12 random digits behind a valid person-type digit, then the real check digit. */
export const generateThaiNationalId = (): string => {
  const body = `${pick(['1', '2', '3', '4', '5', '6', '7', '8'])}${digits(11)}`;
  return `${body}${calculateThaiIdChecksum(body)}`;
};

/** Mobile prefixes actually issued in Thailand — 06, 08 and 09. */
export const generateThaiMobile = (): string => {
  const prefix = pick(['06', '08', '09']);
  return `${prefix}${digits(8)}`;
};

/**
 * Thai corporate tax ID / juristic person number. Thirteen digits with the same weighted checksum
 * as the national ID, so systems that validate it will accept these.
 */
export const generateThaiTaxId = (): string => {
  const body = `0${digits(11)}`;
  return `${body}${calculateThaiIdChecksum(body)}`;
};

export const generateThaiBankAccount = (): string =>
  `${digits(3)}-${digits(1)}-${digits(5)}-${digits(1)}`;

const FIRST_NAMES = [
  'สมชาย',
  'สมหญิง',
  'วิชัย',
  'ปรีชา',
  'สุนิสา',
  'อารีย์',
  'ณัฐพล',
  'ธนกร',
  'ชลธิชา',
  'พิมพ์ชนก',
  'กิตติศักดิ์',
  'วรรณภา',
  'อนุชา',
  'ศิริพร',
] as const;

const LAST_NAMES = [
  'ใจดี',
  'รักเรียน',
  'ศรีสุข',
  'ทองแท้',
  'บุญมี',
  'พงษ์เจริญ',
  'วัฒนกุล',
  'สุขสมบูรณ์',
  'แสงทอง',
  'ธนาวัฒน์',
  'ประเสริฐ',
  'อินทรีย์',
] as const;

export const generateThaiName = (): string => `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;

const STREETS = [
  'สุขุมวิท',
  'พหลโยธิน',
  'รัชดาภิเษก',
  'ลาดพร้าว',
  'เพชรบุรี',
  'สีลม',
  'พระราม 4',
] as const;

/**
 * A real tambon/amphoe/province/postcode row, with a fictitious house number and street in front.
 *
 * The earlier version drew a province and a five-digit number independently, which produced
 * addresses that look Thai and fail every postcode check — the exact failure this tool exists to
 * avoid. Bangkok uses แขวง/เขต rather than ตำบล/อำเภอ, so the labels switch with the province.
 */
export const generateThaiAddress = (): string => {
  const row = pick(THAI_ADDRESSES);
  const isBangkok = row.province === 'กรุงเทพมหานคร';
  const districtLabel = isBangkok ? 'แขวง' : 'ต.';
  const amphoeLabel = isBangkok ? 'เขต' : 'อ.';
  const provinceLabel = isBangkok ? '' : 'จ.';

  return `${randomInt(999) + 1}/${randomInt(99) + 1} ถ.${pick(STREETS)} ${districtLabel}${row.district} ${amphoeLabel}${row.amphoe} ${provinceLabel}${row.province} ${row.zipcode}`;
};

/** The parts behind `generateThaiAddress`, for callers that want fields rather than one line. */
export const generateThaiAddressParts = (): ThaiAddressRow & {
  houseNumber: string;
  street: string;
} => {
  const row = pick(THAI_ADDRESSES);
  return {
    ...row,
    houseNumber: `${randomInt(999) + 1}/${randomInt(99) + 1}`,
    street: pick(STREETS),
  };
};

const EMAIL_DOMAINS = ['example.com', 'example.co.th', 'test.local', 'mail.example.org'] as const;

/** Uses reserved example domains so a stray send cannot reach a real inbox. */
export const generateEmail = (): string => `qa.${digits(6)}@${pick(EMAIL_DOMAINS)}`;

const luhnCheckDigit = (partial: string): number => {
  let sum = 0;
  // Doubling starts from the rightmost digit of the partial number, since the check digit is next.
  let shouldDouble = true;

  for (let i = partial.length - 1; i >= 0; i -= 1) {
    let digit = Number(partial[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return (10 - (sum % 10)) % 10;
};

/**
 * Luhn-valid card numbers on the standard test prefixes. Valid by construction, but these are
 * random numbers on real BINs — never use them anywhere except a form that only checks the format.
 */
export const generateCreditCard = (): string => {
  const { prefix, length } = pick([
    { prefix: '4', length: 16 }, // Visa
    { prefix: '51', length: 16 }, // Mastercard
    { prefix: '34', length: 15 }, // Amex
  ] as const);

  const body = `${prefix}${digits(length - prefix.length - 1)}`;
  return `${body}${luhnCheckDigit(body)}`;
};

/** Exported so the test suite can check generated cards rather than trusting the generator. */
export const isLuhnValid = (value: string): boolean => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length < 2) return false;

  return luhnCheckDigit(cleaned.slice(0, -1)) === Number(cleaned.slice(-1));
};

export const TEST_DATA_FIELDS = [
  {
    id: 'thaiNationalId',
    label: 'เลขบัตรประชาชน',
    hint: 'Valid check digit',
    generate: generateThaiNationalId,
  },
  {
    id: 'thaiMobile',
    label: 'เบอร์มือถือ',
    hint: 'Real 06/08/09 prefixes',
    generate: generateThaiMobile,
  },
  {
    id: 'thaiTaxId',
    label: 'เลขผู้เสียภาษี',
    hint: '13 digits, valid checksum',
    generate: generateThaiTaxId,
  },
  {
    id: 'thaiBankAccount',
    label: 'เลขบัญชีธนาคาร',
    hint: 'xxx-x-xxxxx-x',
    generate: generateThaiBankAccount,
  },
  { id: 'thaiName', label: 'ชื่อ-นามสกุล', hint: 'Fictitious', generate: generateThaiName },
  { id: 'thaiAddress', label: 'ที่อยู่', hint: 'Fictitious', generate: generateThaiAddress },
  { id: 'email', label: 'Email', hint: 'Reserved example domains', generate: generateEmail },
  {
    id: 'creditCard',
    label: 'Credit card',
    hint: 'Luhn-valid, not real',
    generate: generateCreditCard,
  },
] as const;

export type TestDataFieldId = (typeof TEST_DATA_FIELDS)[number]['id'];

/** One row of every field, for filling a whole form at once. */
export const generateTestDataSet = (): Record<TestDataFieldId, string> =>
  Object.fromEntries(TEST_DATA_FIELDS.map((f) => [f.id, f.generate()])) as Record<
    TestDataFieldId,
    string
  >;
