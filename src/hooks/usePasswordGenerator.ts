import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { buildShareableSearchParams } from '../lib/shareableUrlState';

const MIN_LENGTH = 4;
const MAX_LENGTH = 64;
const clampLength = (value: number) => Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, value));
const parseBoolean = (value: string | null, fallback: boolean) =>
  value === null ? fallback : value === '1' || value === 'true';
const parseLength = (value: string | null) => {
  if (!value) return 16;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? clampLength(parsed) : 16;
};

export const usePasswordGenerator = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [length, setLength] = useState(() => parseLength(searchParams.get('len')));
  const [includeUpper, setIncludeUpper] = useState(() => parseBoolean(searchParams.get('u'), true));
  const [includeLower, setIncludeLower] = useState(() => parseBoolean(searchParams.get('l'), true));
  const [includeNumbers, setIncludeNumbers] = useState(() => parseBoolean(searchParams.get('n'), true));
  const [includeSymbols, setIncludeSymbols] = useState(() => parseBoolean(searchParams.get('s'), true));
  const [password, setPassword] = useState('');
  const currentQuery = searchParams.toString();

  const generatePassword = useCallback(() => {
    let charset = '';
    if (includeUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) {
      setPassword('');
      return;
    }

    let generated = '';
    const charsetLength = charset.length;
    for (let i = 0; i < length; i++) {
      generated += charset.charAt(Math.floor(Math.random() * charsetLength));
    }
    setPassword(generated);
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  useEffect(() => {
    const nextParams = buildShareableSearchParams(currentQuery, [
      { key: 'len', value: String(length), defaultValue: '16' },
      { key: 'u', value: includeUpper ? '1' : '0', defaultValue: '1' },
      { key: 'l', value: includeLower ? '1' : '0', defaultValue: '1' },
      { key: 'n', value: includeNumbers ? '1' : '0', defaultValue: '1' },
      { key: 's', value: includeSymbols ? '1' : '0', defaultValue: '1' },
    ]);

    const nextQuery = nextParams.toString();
    if (nextQuery !== currentQuery) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    length,
    includeUpper,
    includeLower,
    includeNumbers,
    includeSymbols,
    currentQuery,
    setSearchParams,
  ]);

  return {
    length,
    setLength: (value: number) => setLength(clampLength(value)),
    includeUpper,
    setIncludeUpper,
    includeLower,
    setIncludeLower,
    includeNumbers,
    setIncludeNumbers,
    includeSymbols,
    setIncludeSymbols,
    password,
    generatePassword,
  };
};
