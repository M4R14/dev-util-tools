import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

/**
 * Epoch ↔ date, for reading timestamps out of logs.
 *
 * The Timezone Converter answers a different question — it moves a known moment between zones.
 * This one starts from the raw number a log line actually contains and has to work out what that
 * number even is.
 */

export const BANGKOK_TIMEZONE = 'Asia/Bangkok';

export type TimestampUnit = 'seconds' | 'milliseconds' | 'microseconds' | 'iso' | 'unknown';

export interface ParsedTimestamp {
  date: Date;
  /** How the input was read. Shown to the user, because the guess is the interesting part. */
  detectedUnit: TimestampUnit;
  epochSeconds: number;
  epochMilliseconds: number;
}

/**
 * Digit count decides the unit. Ten digits is seconds until the year 2286, thirteen is
 * milliseconds, sixteen is microseconds — the three widths logs actually emit. Guessing by
 * magnitude instead would read a millisecond value as a date in the year 56000.
 */
const unitForDigits = (digits: number): TimestampUnit => {
  if (digits <= 11) return 'seconds';
  if (digits <= 14) return 'milliseconds';
  return 'microseconds';
};

export const parseTimestamp = (input: string): ParsedTimestamp => {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Enter a timestamp');
  }

  const numeric = /^-?\d+$/.test(trimmed);

  if (numeric) {
    const digits = trimmed.replace('-', '').length;
    const detectedUnit = unitForDigits(digits);
    const value = Number(trimmed);

    const epochMilliseconds =
      detectedUnit === 'seconds'
        ? value * 1000
        : detectedUnit === 'milliseconds'
          ? value
          : Math.round(value / 1000);

    const date = new Date(epochMilliseconds);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`${trimmed} is out of the range JavaScript dates can represent`);
    }

    return {
      date,
      detectedUnit,
      epochSeconds: Math.floor(epochMilliseconds / 1000),
      epochMilliseconds,
    };
  }

  const parsed = dayjs(trimmed);
  if (!parsed.isValid()) {
    throw new Error(`Could not read "${trimmed}" as a timestamp or a date`);
  }

  return {
    date: parsed.toDate(),
    detectedUnit: 'iso',
    epochSeconds: parsed.unix(),
    epochMilliseconds: parsed.valueOf(),
  };
};

export interface TimestampView {
  label: string;
  value: string;
}

/**
 * The three answers someone reading a log needs at once: the moment in UTC (what the server
 * logged), in Bangkok (what the user experienced), and relative (how long ago).
 */
export const describeTimestamp = (parsed: ParsedTimestamp): TimestampView[] => {
  const d = dayjs(parsed.date);

  return [
    { label: 'UTC', value: d.utc().format('YYYY-MM-DD HH:mm:ss') + ' UTC' },
    { label: 'Bangkok (UTC+7)', value: d.tz(BANGKOK_TIMEZONE).format('YYYY-MM-DD HH:mm:ss') },
    { label: 'Local', value: d.format('YYYY-MM-DD HH:mm:ss Z') },
    { label: 'ISO 8601', value: d.toISOString() },
    { label: 'Relative', value: d.fromNow() },
    { label: 'Epoch seconds', value: String(parsed.epochSeconds) },
    { label: 'Epoch milliseconds', value: String(parsed.epochMilliseconds) },
  ];
};

export const nowTimestamps = () => {
  const now = Date.now();
  return { seconds: Math.floor(now / 1000), milliseconds: now };
};
