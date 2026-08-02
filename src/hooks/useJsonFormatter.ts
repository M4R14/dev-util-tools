import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DEFAULT_JSON_INDENT, formatJson, minifyJson } from '../lib/jsonUtils';
import { useShareableUrlState } from './useShareableUrlState';

const DEFAULT_INDENT = DEFAULT_JSON_INDENT;
const INDENT_OPTIONS = [2, 4, 8] as const;

const parseIndent = (value: string | null) => {
  if (!value) return DEFAULT_INDENT;
  const parsed = Number(value);
  return INDENT_OPTIONS.includes(parsed as (typeof INDENT_OPTIONS)[number])
    ? parsed
    : DEFAULT_INDENT;
};

export const useJsonFormatter = () => {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState(() => searchParams.get('input') ?? '');
  const [indent, setIndent] = useState(() => parseIndent(searchParams.get('indent')));
  const [error, setError] = useState<string | null>(null);

  useShareableUrlState([
    { key: 'input', value: input },
    { key: 'indent', value: String(indent), defaultValue: String(DEFAULT_INDENT) },
  ]);

  const applyTransform = (transform: (raw: string) => string) => {
    if (!input.trim()) return false;

    try {
      setInput(transform(input));
      setError(null);
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      return false;
    }
  };

  const formatJSON = (space: number = indent) => applyTransform((raw) => formatJson(raw, space));

  const minifyJSON = () => applyTransform(minifyJson);

  const clear = () => {
    setInput('');
    setError(null);
  };

  return {
    input,
    setInput,
    indent,
    setIndent: (value: number) => setIndent(parseIndent(String(value))),
    error,
    setError,
    formatJSON,
    minifyJSON,
    clear,
  };
};
