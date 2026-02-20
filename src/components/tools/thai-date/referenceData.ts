import { THAI_DAYS, THAI_MONTHS, THAI_SHORT_DAYS, THAI_SHORT_MONTHS } from '../../../lib/thaiDate';

export interface ReferenceRow {
  id: string;
  number: string;
  enLong: string;
  enShort: string;
  thLong: string;
  thShort: string;
}

const EN_LONG_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const EN_SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export const MONTH_REFERENCE_ROWS: ReferenceRow[] = EN_LONG_MONTHS.map((enLong, index) => {
  const number = String(index + 1).padStart(2, '0');

  return {
    id: number,
    number,
    enLong,
    enShort: EN_SHORT_MONTHS[index],
    thLong: THAI_MONTHS[index],
    thShort: THAI_SHORT_MONTHS[index],
  };
});

const EN_LONG_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const EN_SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const DAY_REFERENCE_ROWS: ReferenceRow[] = EN_LONG_DAYS.map((enLong, index) => {
  const number = String(index);

  return {
    id: number,
    number,
    enLong,
    enShort: EN_SHORT_DAYS[index],
    thLong: THAI_DAYS[index],
    thShort: THAI_SHORT_DAYS[index],
  };
});
