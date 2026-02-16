import { useState, useMemo, useEffect } from 'react';
import { formatThaiDate, parseThaiDate } from '../lib/thaiDate';

export const useThaiDateConverter = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [parseInput, setParseInput] = useState('');
  const [parseResult, setParseResult] = useState<{ iso: string; formatted: string } | null>(null);

  // Derived state for formatted dates (from `date`)
  const formats = useMemo(() => {
    const d = new Date(date);
    return formatThaiDate(d);
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
