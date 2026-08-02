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
  /**
   * Whether another tool can do anything with this value. An epoch number or an ISO string can be
   * handed on; "2 years ago" and "2025-01-01 00:00:00 UTC" cannot, and offering to send them put
   * seven identical buttons on screen where two were meaningful.
   */
  pipeable?: boolean;
}

export const browserTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';
  } catch {
    return 'unknown';
  }
};

/**
 * True when the reader's own clock already shows Bangkok time — which, for this app's audience, is
 * most of the time. Listing "Bangkok" and "Local" as separate rows then says the same thing twice.
 */
export const localMatchesBangkok = (date: Date): boolean =>
  dayjs(date).format('YYYY-MM-DD HH:mm:ss') ===
  dayjs(date).tz(BANGKOK_TIMEZONE).format('YYYY-MM-DD HH:mm:ss');

export interface TimestampSummary {
  /** The answer someone reading a Thai server log is after. */
  bangkok: string;
  relative: string;
  localTimeZone: string;
  localMatchesBangkok: boolean;
}

export const summarizeTimestamp = (parsed: ParsedTimestamp): TimestampSummary => {
  const d = dayjs(parsed.date);

  return {
    bangkok: d.tz(BANGKOK_TIMEZONE).format('YYYY-MM-DD HH:mm:ss'),
    relative: d.fromNow(),
    localTimeZone: browserTimeZone(),
    localMatchesBangkok: localMatchesBangkok(parsed.date),
  };
};

/**
 * The supporting detail behind the summary. `Local` is dropped when it would repeat Bangkok; the
 * UI says which zone the browser is in instead, so the omission is stated rather than silent.
 */
export const describeTimestamp = (parsed: ParsedTimestamp): TimestampView[] => {
  const d = dayjs(parsed.date);

  const views: TimestampView[] = [
    { label: 'UTC', value: d.utc().format('YYYY-MM-DD HH:mm:ss') + ' UTC' },
  ];

  if (!localMatchesBangkok(parsed.date)) {
    views.push({ label: 'Local', value: d.format('YYYY-MM-DD HH:mm:ss Z') });
  }

  views.push(
    { label: 'ISO 8601', value: d.toISOString(), pipeable: true },
    { label: 'Epoch seconds', value: String(parsed.epochSeconds), pipeable: true },
    { label: 'Epoch milliseconds', value: String(parsed.epochMilliseconds), pipeable: true },
  );

  return views;
};

export const nowTimestamps = () => {
  const now = Date.now();
  return { seconds: Math.floor(now / 1000), milliseconds: now };
};
