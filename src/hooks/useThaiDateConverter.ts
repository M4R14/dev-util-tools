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

  // Sync picker fields → parseInput
  useEffect(() => {
    if (pickerDay && pickerMonth !== '' && pickerYear) {
      setParseInput(`${pickerDay} ${pickerMonth} ${pickerYear}`);
    }
  }, [pickerDay, pickerMonth, pickerYear]);

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
