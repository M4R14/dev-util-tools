/**
 * Thai date constants and utility functions.
 * Extracted from useThaiDateConverter for reusability and testability.
 */

import dayjs, { Dayjs } from 'dayjs';

export const BUDDHIST_YEAR_OFFSET = 543

export const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
] as const;

export const THAI_SHORT_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
] as const;

export const THAI_DAYS = [
  'อาทิตย์',
  'จันทร์',
  'อังคาร',
  'พุธ',
  'พฤหัสบดี',
  'ศุกร์',
  'เสาร์',
] as const;

const THAI_DIGITS = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'] as const;


/** Convert Arabic numerals to Thai digits. */
export const toThaiDigits = (num: number | string): string =>
  num
    .toString()
    .replace(/\d/g, (d) => THAI_DIGITS[parseInt(d)]);

/** Convert Thai digits to Arabic numerals. */
export const fromThaiDigits = (str: string): string =>
  str.replace(/[๐-๙]/g, (d) =>
    THAI_DIGITS.indexOf(d as (typeof THAI_DIGITS)[number]).toString(),
  );

export const formatThaiDate = (input: Date | Dayjs | string) => {
  const d = dayjs(input);
  if (!d.isValid()) return [];

  const day = d.date();
  const monthIndex = d.month();
  const yearBE = d.year() + 543;
  const dayOfWeek = d.day();

  return [
    {
      label: 'Full Date (Official)',
      value: `วัน${THAI_DAYS[dayOfWeek]}ที่ ${day} ${THAI_MONTHS[monthIndex]} พ.ศ. ${yearBE}`,
    },
    { label: 'Long Date', value: `${day} ${THAI_MONTHS[monthIndex]} ${yearBE}` },
    { 
      label: 'Short Date', 
      value: `${day} ${THAI_SHORT_MONTHS[monthIndex]} ${yearBE}`,
    },
    {
      label: 'Short Date (2-digit year)',
      value: `${day} ${THAI_SHORT_MONTHS[monthIndex]} ${yearBE.toString().slice(-2)}`,
    },
    {
      label: 'Numerical (Slash)',
      value: d.format(`DD/MM/${yearBE}`),
    },
    {
      label: 'ISO-like (Buddhist)',
      value: `${yearBE}-${d.format('MM-DD')}`,
    },
    {
      label: 'Thai Digits',
      value: toThaiDigits(
        `วัน${THAI_DAYS[dayOfWeek]}ที่ ${day} ${THAI_MONTHS[monthIndex]} พ.ศ. ${yearBE}`,
      ),
    },
    // AD formats for reference
    {
      label: 'ISO Date (AD)',
      value: d.format('YYYY-MM-DD'),
    },
  ];
};

interface ThaiDateFormat {
  isValid: (input: string) => boolean;
  convert: (input: string) => Dayjs;
}

/** Check that all parts are defined and non-empty. */
const hasParts = (parts: (string | undefined)[]): parts is string[] =>
  parts.every((p) => p !== undefined && p.length > 0);

/** Check if a string is a valid integer. */
const isInt = (value: string): boolean => !isNaN(parseInt(value));

/** Parse a space-separated Thai date (day month year) and convert to Dayjs. */
const parseSpaceSeparated = (
  input: string,
  monthList: readonly string[],
  yearValidator: (year: string) => boolean,
  yearParser: (year: string) => number,
): Dayjs | null => {
  const [day, month, year] = input.split(' ');
  if (!hasParts([day, month, year])) return null;
  if (!monthList.includes(month) || !yearValidator(year)) return null;

  const monthIndex = monthList.indexOf(month);
  const adYear = yearParser(year) - 543;
  return dayjs(`${adYear}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.padStart(2, '0')}`);
};

const is2DigitYear = (year: string) => isInt(year) && year.length === 2;
const isFullYear = (year: string) => isInt(year) && year.length > 2;
const parse2DigitYear = (year: string) => parseInt(`25${year}`);
const parseFullYear = (year: string) => parseInt(year);

const THAI_DATE_FORMATS: ThaiDateFormat[] = [
  // Short Date (2-digit year) — e.g. "1 ม.ค. 68"
  {
    isValid: (input) => parseSpaceSeparated(input, THAI_SHORT_MONTHS, is2DigitYear, parse2DigitYear)?.isValid() ?? false,
    convert: (input) => parseSpaceSeparated(input, THAI_SHORT_MONTHS, is2DigitYear, parse2DigitYear)!,
  },
  // Long Date (2-digit year) — e.g. "1 มกราคม 68"
  {
    isValid: (input) => parseSpaceSeparated(input, THAI_MONTHS, is2DigitYear, parse2DigitYear)?.isValid() ?? false,
    convert: (input) => parseSpaceSeparated(input, THAI_MONTHS, is2DigitYear, parse2DigitYear)!,
  },
  // Long Date — e.g. "1 มกราคม 2568"
  {
    isValid: (input) => parseSpaceSeparated(input, THAI_MONTHS, isFullYear, parseFullYear)?.isValid() ?? false,
    convert: (input) => parseSpaceSeparated(input, THAI_MONTHS, isFullYear, parseFullYear)!,
  },
  // Short Date — e.g. "1 ม.ค. 2568"
  {
    isValid: (input) => parseSpaceSeparated(input, THAI_SHORT_MONTHS, isFullYear, parseFullYear)?.isValid() ?? false,
    convert: (input) => parseSpaceSeparated(input, THAI_SHORT_MONTHS, isFullYear, parseFullYear)!,
  },
  // Numerical (Slash) — e.g. "01/01/2568"
  {
    isValid: (input) => {
      const [day, month, year] = input.split('/');
      if (!hasParts([day, month, year])) return false;
      const d = parseInt(day), m = parseInt(month);
      return isInt(day) && isInt(month) && isInt(year) && d > 0 && d <= 31 && m > 0 && m <= 12;
    },
    convert: (input) => {
      const [day, month, year] = input.split('/');
      const adYear = parseInt(year) - 543;
      return dayjs(new Date(adYear, parseInt(month) - 1, parseInt(day)));
    },
  },
];

export const parseThaiDate = (input: string): { iso: string; formatted: string } | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  for (const format of THAI_DATE_FORMATS) {
    if (format.isValid(trimmed)) {
      const d = format.convert(trimmed);
      if (d.isValid()) {
        return {
          iso: d.format('YYYY-MM-DD'),
          formatted: d.format('YYYY-MM-DD'),
        };
      }
    }
  }

  return null;
};

