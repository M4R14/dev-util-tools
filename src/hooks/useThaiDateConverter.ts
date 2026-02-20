import { useState, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import { formatThaiDate, parseThaiDate, THAI_MONTHS, THAI_SHORT_MONTHS } from '../lib/thaiDate';

export type ParserMonthFormat = 'short' | 'long';

export const useThaiDateConverter = () => {
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [parseInput, setParseInput] = useState('');
  const [parseResult, setParseResult] = useState<{ iso: string; formatted: string } | null>(null);

  // Picker-based parser fields
  const [pickerDay, setPickerDay] = useState('');
  const [pickerMonth, setPickerMonth] = useState('');
  const [pickerYear, setPickerYear] = useState('');
  const [pickerMonthFormat, setPickerMonthFormat] = useState<ParserMonthFormat>('short');

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
