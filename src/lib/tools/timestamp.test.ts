import { describe, expect, it } from 'vitest';
import { describeTimestamp, nowTimestamps, parseTimestamp } from './timestamp';

// 2025-01-01T00:00:00Z
const SECONDS = 1735689600;
const MILLISECONDS = 1735689600000;

describe('parseTimestamp', () => {
  it('reads a 10-digit value as seconds', () => {
    const result = parseTimestamp(String(SECONDS));

    expect(result.detectedUnit).toBe('seconds');
    expect(result.epochMilliseconds).toBe(MILLISECONDS);
    expect(result.date.toISOString()).toBe('2025-01-01T00:00:00.000Z');
  });

  it('reads a 13-digit value as milliseconds', () => {
    const result = parseTimestamp(String(MILLISECONDS));

    expect(result.detectedUnit).toBe('milliseconds');
    expect(result.epochSeconds).toBe(SECONDS);
  });

  it('reads a 16-digit value as microseconds', () => {
    const result = parseTimestamp(String(MILLISECONDS * 1000));

    expect(result.detectedUnit).toBe('microseconds');
    expect(result.epochMilliseconds).toBe(MILLISECONDS);
  });

  it('does not mistake milliseconds for seconds', () => {
    // Reading 1735689600000 as seconds would land in the year 56000 — the classic log-reading bug.
    expect(parseTimestamp(String(MILLISECONDS)).date.getUTCFullYear()).toBe(2025);
  });

  it('accepts an ISO string', () => {
    const result = parseTimestamp('2025-01-01T00:00:00Z');

    expect(result.detectedUnit).toBe('iso');
    expect(result.epochSeconds).toBe(SECONDS);
  });

  it('handles epoch zero and negative timestamps', () => {
    expect(parseTimestamp('0').date.toISOString()).toBe('1970-01-01T00:00:00.000Z');
    expect(parseTimestamp('-86400').date.toISOString()).toBe('1969-12-31T00:00:00.000Z');
  });

  it('ignores surrounding whitespace', () => {
    expect(parseTimestamp(`  ${SECONDS}  `).epochSeconds).toBe(SECONDS);
  });

  it('rejects an empty input', () => {
    expect(() => parseTimestamp('   ')).toThrow(/Enter a timestamp/);
  });

  it('rejects text that is not a date', () => {
    expect(() => parseTimestamp('not-a-date')).toThrow(/Could not read/);
  });

  it('accepts absurd but representable values rather than inventing a limit', () => {
    // 13 nines reads as milliseconds — the year 2286, which is a perfectly valid Date. An earlier
    // version of this test assumed it would be rejected; it is not, and should not be.
    expect(parseTimestamp('9'.repeat(13)).date.getUTCFullYear()).toBe(2286);
  });

  it('rejects a number beyond what a JavaScript date can hold', () => {
    // The Date range is ±8.64e15 ms. Nothing shorter than 19 digits can exceed it once the unit
    // rules have been applied, so this is the real boundary rather than a guessed one.
    expect(() => parseTimestamp('9'.repeat(19))).toThrow(/out of the range/);
  });
});

describe('describeTimestamp', () => {
  it('shows Bangkok seven hours ahead of UTC', () => {
    const views = describeTimestamp(parseTimestamp(String(SECONDS)));
    const utc = views.find((v) => v.label === 'UTC')?.value;
    const bangkok = views.find((v) => v.label === 'Bangkok (UTC+7)')?.value;

    expect(utc).toBe('2025-01-01 00:00:00 UTC');
    expect(bangkok).toBe('2025-01-01 07:00:00');
  });

  it('includes both epoch units so either can be copied', () => {
    const views = describeTimestamp(parseTimestamp(String(SECONDS)));

    expect(views.find((v) => v.label === 'Epoch seconds')?.value).toBe(String(SECONDS));
    expect(views.find((v) => v.label === 'Epoch milliseconds')?.value).toBe(String(MILLISECONDS));
  });

  it('renders an ISO 8601 form', () => {
    const views = describeTimestamp(parseTimestamp(String(SECONDS)));

    expect(views.find((v) => v.label === 'ISO 8601')?.value).toBe('2025-01-01T00:00:00.000Z');
  });
});

describe('nowTimestamps', () => {
  it('returns seconds exactly one thousandth of milliseconds', () => {
    const { seconds, milliseconds } = nowTimestamps();

    expect(seconds).toBe(Math.floor(milliseconds / 1000));
  });
});
