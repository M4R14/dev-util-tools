import { useState, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { formatThaiDate, parseThaiDate, THAI_MONTHS, THAI_SHORT_MONTHS } from '../lib/thaiDate';
import { buildShareableSearchParams } from '../lib/shareableUrlState';

export type ParserMonthFormat = 'short' | 'long';
const parseMonthFormat = (value: string | null): ParserMonthFormat =>
  value === 'long' ? 'long' : 'short';

export const useThaiDateConverter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultDate = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const [date, setDate] = useState(() => searchParams.get('date') ?? defaultDate);
  const [parseInput, setParseInput] = useState(() => searchParams.get('parse') ?? '');
  const [parseResult, setParseResult] = useState<{ iso: string; formatted: string } | null>(null);

  // Picker-based parser fields
  const [pickerDay, setPickerDay] = useState(() => searchParams.get('pd') ?? '');
  const [pickerMonth, setPickerMonth] = useState(() => searchParams.get('pm') ?? '');
  const [pickerYear, setPickerYear] = useState(() => searchParams.get('py') ?? '');
  const [pickerMonthFormat, setPickerMonthFormat] = useState<ParserMonthFormat>(() =>
    parseMonthFormat(searchParams.get('pmf')),
  );
  const currentQuery = searchParams.toString();

  const monthOptions = useMemo(() => {
    const list = pickerMonthFormat === 'short' ? THAI_SHORT_MONTHS : THAI_MONTHS;
    return list.map((label, index) => ({ label, value: index }));
  }, [pickerMonthFormat]);

  const hasAnyPickerValue = Boolean(pickerDay || pickerMonth !== '' || pickerYear);
  const hasCompletePickerValue = Boolean(pickerDay && pickerMonth !== '' && pickerYear);

  const pickerInput = useMemo(() => {
    if (!hasCompletePickerValue) {
      return '';
    }

    const monthIndex = Number(pickerMonth);
    const monthLabelFromIndex = monthOptions.find((month) => month.value === monthIndex)?.label;
    const monthLabelFromValue = monthOptions.find((month) => month.label === pickerMonth)?.label;
    const resolvedMonthLabel = monthLabelFromIndex ?? monthLabelFromValue ?? pickerMonth;

    return `${pickerDay} ${resolvedMonthLabel} ${pickerYear}`;
  }, [hasCompletePickerValue, monthOptions, pickerDay, pickerMonth, pickerYear]);

  // Sync picker fields → parseInput
  useEffect(() => {
    if (!hasAnyPickerValue) {
      return;
    }

    setParseInput(pickerInput);
  }, [hasAnyPickerValue, pickerInput]);

  // Derived state for formatted dates (from `date`)
  const formats = useMemo(() => {
    return formatThaiDate(date);
  }, [date]);

  // Parsing effect
  useEffect(() => {
    const result = parseThaiDate(parseInput);
    setParseResult(result);
  }, [parseInput]);

  useEffect(() => {
    const nextParams = buildShareableSearchParams(currentQuery, [
      { key: 'date', value: date, defaultValue: defaultDate },
      { key: 'parse', value: parseInput },
      { key: 'pd', value: pickerDay },
      { key: 'pm', value: pickerMonth },
      { key: 'py', value: pickerYear },
      { key: 'pmf', value: pickerMonthFormat, defaultValue: 'short' },
    ]);

    const nextQuery = nextParams.toString();
    if (nextQuery !== currentQuery) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    date,
    parseInput,
    pickerDay,
    pickerMonth,
    pickerYear,
    pickerMonthFormat,
    defaultDate,
    currentQuery,
    setSearchParams,
  ]);

  // Formatted outputs from the parsed result
  const parsedFormats = useMemo(() => {
    if (!parseResult) return [];
    return formatThaiDate(parseResult.iso);
  }, [parseResult]);

  return {
    date,
    setDate,
    parseInput,
    setParseInput,
    formats,
    parseResult,
    // Picker fields
    pickerDay,
    setPickerDay,
    pickerMonth,
    setPickerMonth,
    pickerYear,
    setPickerYear,
    pickerMonthFormat,
    setPickerMonthFormat,
    monthOptions,
    parsedFormats,
  };
};
