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
    .replace(/\d/g, (d) => THAI_DIGITS[parseInt(d)]);

/** Convert Thai digits to Arabic numerals. */
export const fromThaiDigits = (str: string): string =>
  str.replace(/[๐-๙]/g, (d) =>
    THAI_DIGITS.indexOf(d as (typeof THAI_DIGITS)[number]).toString(),
  );

export const formatThaiDate = (dateOb: Date) => {
  if (isNaN(dateOb.getTime())) return [];

  const day = dateOb.getDate();
  const monthIndex = dateOb.getMonth();
  const yearBE = dateOb.getFullYear() + 543;
  const dayOfWeek = dateOb.getDay();
  const yearAD = dateOb.getFullYear();

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
      value: `${day.toString().padStart(2, '0')}/${(monthIndex + 1).toString().padStart(2, '0')}/${yearBE}`,
    },
    {
      label: 'ISO-like (Buddhist)',
      value: `${yearBE}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
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
      value: `${yearAD}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
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
    const d = new Date(adYear, month, day);

    if (!isNaN(d.getTime())) {
      return {
        iso: d.toISOString().split('T')[0],
        formatted: d.toLocaleDateString('en-CA'),
      };
    }
  }
  return null;
};

