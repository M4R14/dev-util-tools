/**
 * Thai date constants and utility functions.
 * Extracted from useThaiDateConverter for reusability and testability.
 */

import dayjs, { Dayjs } from 'dayjs';

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
    { label: 'Short Date', value: `${day} ${THAI_SHORT_MONTHS[monthIndex]} ${yearBE}` },
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

export const parseThaiDate = (input: string): { iso: string; formatted: string } | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/[\s/.-]+/);

  // Reset check
  let day: number | null = null;
  let month: number | null = null;
  let year: number | null = null;

  for (const part of parts) {
    const fullMonthIdx = THAI_MONTHS.findIndex((m) => m === part);
    if (fullMonthIdx !== -1) {
      month = fullMonthIdx;
      continue;
    }

    const shortMonthIdx = THAI_SHORT_MONTHS.findIndex((m) => m === part || m === part + '.');
    if (shortMonthIdx !== -1) {
      month = shortMonthIdx;
      continue;
    }

    const arabicPart = fromThaiDigits(part);
    const num = parseInt(arabicPart);

    if (!isNaN(num)) {
      if (num > 2500 || (num > 100 && num < 2500)) {
        // Buddhist year range heuristic
        year = num;
      } else if (num > 0 && num <= 31 && day === null) {
        day = num;
      } else if (num > 0 && num <= 12 && month === null) {
        month = num - 1;
      } else if (year === null) {
        year = num; // Fallback
      }
    }
  }

  if (day !== null && month !== null && year !== null) {
    const adYear = year > 2400 ? year - 543 : year;
    const d = dayjs(new Date(adYear, month, day));

    if (d.isValid()) {
      return {
        iso: d.format('YYYY-MM-DD'),
        formatted: d.format('YYYY-MM-DD'),
      };
    }
  }
  return null;
};

