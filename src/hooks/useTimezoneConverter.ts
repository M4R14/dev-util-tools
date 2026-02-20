import { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useSearchParams } from 'react-router-dom';
import { buildShareableSearchParams } from '../lib/shareableUrlState';

dayjs.extend(utc);
dayjs.extend(timezone);

const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Universal Time Coordinated)', abbr: 'UTC' },
  { value: 'Asia/Bangkok', label: 'Bangkok (Indochina Time)', abbr: 'ICT' },
  { value: 'Asia/Tokyo', label: 'Tokyo (Japan Standard Time)', abbr: 'JST' },
  { value: 'Asia/Seoul', label: 'Seoul (Korea Standard Time)', abbr: 'KST' },
  { value: 'Asia/Singapore', label: 'Singapore (Singapore Time)', abbr: 'SGT' },
  { value: 'Asia/Shanghai', label: 'Shanghai (China Standard Time)', abbr: 'CST' },
  { value: 'Asia/Kolkata', label: 'Kolkata (India Standard Time)', abbr: 'IST' },
  { value: 'Australia/Sydney', label: 'Sydney (Eastern Australia)', abbr: 'AEDT' },
  { value: 'Europe/London', label: 'London (Greenwich Mean Time)', abbr: 'GMT/BST' },
  { value: 'Europe/Paris', label: 'Paris (Central European Time)', abbr: 'CET' },
  { value: 'Europe/Berlin', label: 'Berlin (Central European Time)', abbr: 'CET' },
  { value: 'Europe/Moscow', label: 'Moscow (Moscow Standard Time)', abbr: 'MSK' },
  { value: 'America/New_York', label: 'New York (Eastern Time)', abbr: 'ET' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (Pacific Time)', abbr: 'PT' },
  { value: 'America/Chicago', label: 'Chicago (Central Time)', abbr: 'CT' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (Brasilia Time)', abbr: 'BRT' },
  { value: 'Pacific/Auckland', label: 'Auckland (New Zealand Time)', abbr: 'NZDT' },
];
const DEFAULT_TARGET_TZ = 'UTC';

export const useTimezoneConverter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultDate = useMemo(() => dayjs().format('YYYY-MM-DDTHH:mm'), []);
  const defaultSourceTz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    [],
  );
  const [date, setDate] = useState<string>(() => searchParams.get('date') ?? defaultDate);

  const [sourceTz, setSourceTz] = useState<string>(() => searchParams.get('from') ?? defaultSourceTz);
  const [targetTz, setTargetTz] = useState<string>(
    () => searchParams.get('to') ?? DEFAULT_TARGET_TZ,
  );
  const [result, setResult] = useState<string>('');
  const [resultDatePart, setResultDatePart] = useState<string>('');
  const [resultTimePart, setResultTimePart] = useState<string>('');
  const [resultTzAbbr, setResultTzAbbr] = useState<string>('');
  const currentQuery = searchParams.toString();

  const convertTime = useCallback(() => {
    try {
      if (!date) return;

      // Parse the input as wall-clock time in the source timezone
      const sourceDate = dayjs.tz(date, sourceTz);
      // Convert to the target timezone
      const converted = sourceDate.tz(targetTz);

      // Get timezone abbreviation via Intl (dayjs doesn't expose this directly)
      const tzAbbr = new Intl.DateTimeFormat('en-US', {
        timeZone: targetTz,
        timeZoneName: 'short',
      })
        .formatToParts(converted.toDate())
        .find((p) => p.type === 'timeZoneName')?.value || targetTz;

      const isoString = converted.format('YYYY-MM-DDTHH:mm');
      setResult(`${isoString} ${tzAbbr}`);
      setResultDatePart(converted.format('YYYY-MM-DD'));
      setResultTimePart(converted.format('HH:mm'));
      setResultTzAbbr(tzAbbr);
    } catch (error) {
      console.error(error);
      setResult('Invalid Date');
    }
  }, [date, sourceTz, targetTz]);

  useEffect(() => {
    convertTime();
  }, [convertTime]);

  useEffect(() => {
    const nextParams = buildShareableSearchParams(currentQuery, [
      { key: 'date', value: date, defaultValue: defaultDate },
      { key: 'from', value: sourceTz, defaultValue: defaultSourceTz },
      { key: 'to', value: targetTz, defaultValue: DEFAULT_TARGET_TZ },
    ]);

    const nextQuery = nextParams.toString();
    if (nextQuery !== currentQuery) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    date,
    sourceTz,
    targetTz,
    defaultDate,
    defaultSourceTz,
    currentQuery,
    setSearchParams,
  ]);

  const swapTimezones = () => {
    const temp = sourceTz;
    setSourceTz(targetTz);
    setTargetTz(temp);
  };

  const setNow = () => {
    setDate(dayjs().format('YYYY-MM-DDTHH:mm'));
  };

  return {
    date,
    setDate,
    sourceTz,
    setSourceTz,
    targetTz,
    setTargetTz,
    result,
    resultDatePart,
    resultTimePart,
    resultTzAbbr,
    swapTimezones,
    setNow,
    commonTimezones: COMMON_TIMEZONES,
  };
};
