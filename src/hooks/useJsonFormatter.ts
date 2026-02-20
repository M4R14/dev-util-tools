import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { buildShareableSearchParams } from '../lib/shareableUrlState';

const DEFAULT_INDENT = 2;
const INDENT_OPTIONS = [2, 4, 8] as const;

const parseIndent = (value: string | null) => {
  if (!value) return DEFAULT_INDENT;
  const parsed = Number(value);
  return INDENT_OPTIONS.includes(parsed as (typeof INDENT_OPTIONS)[number])
    ? parsed
    : DEFAULT_INDENT;
};

export const useJsonFormatter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState(() => searchParams.get('input') ?? '');
  const [indent, setIndent] = useState(() => parseIndent(searchParams.get('indent')));
  const [error, setError] = useState<string | null>(null);
  const currentQuery = searchParams.toString();

  useEffect(() => {
    const nextParams = buildShareableSearchParams(currentQuery, [
      { key: 'input', value: input },
      { key: 'indent', value: String(indent), defaultValue: String(DEFAULT_INDENT) },
    ]);

    const nextQuery = nextParams.toString();
    if (nextQuery !== currentQuery) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [input, indent, currentQuery, setSearchParams]);

  const formatJSON = (space: number = indent) => {
    try {
      if (!input.trim()) return false;
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, space));
      setError(null);
      return true;
    } catch (e: unknown) {
      if (input.trim()) setError(e instanceof Error ? e.message : 'Invalid JSON');
      return false;
    }
  };

  const minifyJSON = () => {
    try {
      if (!input.trim()) return false;
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
      setError(null);
      return true;
    } catch (e: unknown) {
      if (input.trim()) setError(e instanceof Error ? e.message : 'Invalid JSON');
      return false;
    }
  };

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
