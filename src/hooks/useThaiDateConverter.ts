import { useState, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import { formatThaiDate, parseThaiDate } from '../lib/thaiDate';

export const useThaiDateConverter = () => {
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [parseInput, setParseInput] = useState('');
  const [parseResult, setParseResult] = useState<{ iso: string; formatted: string } | null>(null);

  // Derived state for formatted dates (from `date`)
  const formats = useMemo(() => {
    return formatThaiDate(date);
  }, [date]);

  // Parsing effect
  useEffect(() => {
    const result = parseThaiDate(parseInput);
    setParseResult(result);
  }, [parseInput]);

  return {
    date,
    setDate,
    parseInput,
    setParseInput,
    formats,
    parseResult,
  };
};
