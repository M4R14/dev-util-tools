import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  readBooleanParam,
  readNumberParam,
  serializeBooleanParam,
} from '../lib/shareableUrlState';
import { generatePassword as buildPassword } from '../lib/passwordGenerator';
import { useShareableUrlState } from './useShareableUrlState';

const DEFAULT_LENGTH = 16;
const LENGTH_BOUNDS = { min: 4, max: 64 };
const clampLength = (value: number) =>
  Math.min(LENGTH_BOUNDS.max, Math.max(LENGTH_BOUNDS.min, value));
const parseLength = (value: string | null) => readNumberParam(value, DEFAULT_LENGTH, LENGTH_BOUNDS);

export const usePasswordGenerator = () => {
  const [searchParams] = useSearchParams();
  const [length, setLength] = useState(() => parseLength(searchParams.get('len')));
  const [includeUpper, setIncludeUpper] = useState(() =>
    readBooleanParam(searchParams.get('u'), true),
  );
  const [includeLower, setIncludeLower] = useState(() =>
    readBooleanParam(searchParams.get('l'), true),
  );
  const [includeNumbers, setIncludeNumbers] = useState(() =>
    readBooleanParam(searchParams.get('n'), true),
  );
  const [includeSymbols, setIncludeSymbols] = useState(() =>
    readBooleanParam(searchParams.get('s'), true),
  );
  const [password, setPassword] = useState('');

  useShareableUrlState([
    { key: 'len', value: String(length), defaultValue: String(DEFAULT_LENGTH) },
    { key: 'u', value: serializeBooleanParam(includeUpper), defaultValue: '1' },
    { key: 'l', value: serializeBooleanParam(includeLower), defaultValue: '1' },
    { key: 'n', value: serializeBooleanParam(includeNumbers), defaultValue: '1' },
    { key: 's', value: serializeBooleanParam(includeSymbols), defaultValue: '1' },
  ]);

  const generatePassword = useCallback(() => {
    setPassword(
      buildPassword({ length, includeUpper, includeLower, includeNumbers, includeSymbols }),
    );
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

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
