/**
 * Thai date constants and utility functions.
 * Extracted from useThaiDateConverter for reusability and testability.
 */

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
    .split('')
    .map((d) => {
      const parsed = parseInt(d);
      return isNaN(parsed) ? d : THAI_DIGITS[parsed];
    })
    .join('');

/** Convert Thai digits to Arabic numerals. */
export const fromThaiDigits = (str: string): string =>
  str.replace(/[๐-๙]/g, (d) => '0123456789'['๐๑๒๓๔๕๖๗๘๙'.indexOf(d)] || d);
