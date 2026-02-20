import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { analyzeThaiId, formatThaiId, generateThaiId, ThaiIdAnalysis } from '../lib/thaiId';
import { buildShareableSearchParams } from '../lib/shareableUrlState';

export const useThaiId = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState(() => formatThaiId(searchParams.get('input') ?? ''));
  const [analysis, setAnalysis] = useState<ThaiIdAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentQuery = searchParams.toString();

  useEffect(() => {
    const nextParams = buildShareableSearchParams(currentQuery, [{ key: 'input', value: input }]);

    const nextQuery = nextParams.toString();
    if (nextQuery !== currentQuery) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [input, currentQuery, setSearchParams]);

  const handleInputChange = useCallback((value: string) => {
    const normalized = formatThaiId(value);
    setInput(normalized);
    setAnalysis(null);

    if (error) {
      setError(null);
    }
  }, [error]);

  const runAnalysis = useCallback((): boolean => {
    try {
      const result = analyzeThaiId(input);
      setAnalysis(result);
      setError(null);
      return true;
    } catch (e: unknown) {
      setAnalysis(null);
      setError(e instanceof Error ? e.message : 'Unable to analyze Thai ID');
      return false;
    }
  }, [input]);

  const generate = useCallback((): string => {
    const generated = generateThaiId();
    setInput(formatThaiId(generated));
    setAnalysis(analyzeThaiId(generated));
    setError(null);
    return generated;
  }, []);

  const clear = useCallback(() => {
    setInput('');
    setAnalysis(null);
    setError(null);
  }, []);

  return {
    input,
    analysis,
    error,
    setInput: handleInputChange,
    runAnalysis,
    generate,
    clear,
  };
};
