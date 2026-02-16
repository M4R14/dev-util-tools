import { useState, useMemo, useEffect } from 'react';
import {
  THAI_MONTHS,
  THAI_SHORT_MONTHS,
  THAI_DAYS,
  toThaiDigits,
  fromThaiDigits,
} from '../lib/thaiDate';

export const useThaiDateConverter = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [parseInput, setParseInput] = useState('');
  const [parseResult, setParseResult] = useState<{ iso: string; formatted: string } | null>(null);

  // Derived state for formatted dates (from `date`)
  const formats = useMemo(() => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return [];

    const day = d.getDate();
    const monthIndex = d.getMonth();
    const yearBE = d.getFullYear() + 543;
    const dayOfWeek = d.getDay();
    const yearAD = d.getFullYear();

    return [
      {
        label: 'Full Date (Official)',
        value: `วัน${THAI_DAYS[dayOfWeek]}ที่ ${day} ${THAI_MONTHS[monthIndex]} พ.ศ. ${yearBE}`,
      },
      { label: 'Long Date', value: `${day} ${THAI_MONTHS[monthIndex]} ${yearBE}` },
      { label: 'Short Date', value: `${day} ${THAI_SHORT_MONTHS[monthIndex]} ${yearBE}` },
      {
        label: 'Short Date (2-digit year)',
        value: `${day} ${THAI_SHORT_MONTHS[monthIndex]} ${yearBE.toString().slice(-2)}`,
      },
      {
        label: 'Numerical (Slash)',
        value: `${day.toString().padStart(2, '0')}/${(monthIndex + 1).toString().padStart(2, '0')}/${yearBE}`,
      },
      {
        label: 'ISO-like (Buddhist)',
        value: `${yearBE}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
      },
      {
        label: 'Thai Digits',
        value: toThaiDigits(
          `วัน${THAI_DAYS[dayOfWeek]}ที่ ${day} ${THAI_MONTHS[monthIndex]} พ.ศ. ${yearBE}`,
        ),
      },
      // AD formats for reference
      {
        label: 'ISO Date (AD)',
        value: `${yearAD}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
      },
    ];
  }, [date]);

  // Parsing effect
  useEffect(() => {
    if (!parseInput.trim()) {
      setParseResult(null);
      return;
    }

    const input = parseInput.trim();
    const parts = input.split(/[\s/.-]+/);

    // Reset check
    let day: number | null = null;
    let month: number | null = null;
    let year: number | null = null;

    for (const part of parts) {
      const fullMonthIdx = THAI_MONTHS.findIndex((m) => m === part);
      if (fullMonthIdx !== -1) {
        month = fullMonthIdx;
        continue;
      }

      const shortMonthIdx = THAI_SHORT_MONTHS.findIndex((m) => m === part || m === part + '.');
      if (shortMonthIdx !== -1) {
        month = shortMonthIdx;
        continue;
      }

      const arabicPart = fromThaiDigits(part);
      const num = parseInt(arabicPart);

      if (!isNaN(num)) {
        if (num > 2500 || (num > 100 && num < 2500)) {
          // Buddhist year range heuristic
          year = num;
        } else if (num > 0 && num <= 31 && day === null) {
          day = num;
        } else if (num > 0 && num <= 12 && month === null) {
          month = num - 1;
        } else if (year === null) {
          year = num; // Fallback
        }
      }
    }

    if (day !== null && month !== null && year !== null) {
      const adYear = year > 2400 ? year - 543 : year;
      const d = new Date(adYear, month, day);

      if (!isNaN(d.getTime())) {
        setParseResult({
          iso: d.toISOString().split('T')[0],
          formatted: d.toLocaleDateString('en-CA'),
        });
      } else {
        setParseResult(null);
      }
    } else {
      setParseResult(null);
    }
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
