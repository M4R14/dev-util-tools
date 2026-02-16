import { useState, useCallback, useEffect } from 'react';
import { UrlParam, parseUrl, updateUrlParam } from '../lib/urlUtils';

export { type UrlParam };

export const useUrlParser = () => {
  const [input, setInput] = useState('');
  const [parsedUrl, setParsedUrl] = useState<URL | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<UrlParam[]>([]);

  useEffect(() => {
    const result = parseUrl(input);
    setParsedUrl(result.parsed);
    setError(result.error);
    setParams(result.params);
  }, [input]);

  const getEncoded = useCallback(() => {
    try {
      return encodeURIComponent(input);
    } catch {
      return null;
    }
  }, [input]);

  const decodeUrl = useCallback(() => {
    try {
      const decoded = decodeURIComponent(input);
      setInput(decoded);
      return true;
    } catch {
      return false;
    }
  }, [input]);

  const updateParam = useCallback(
    (index: number, newKey: string, newValue: string) => {
      const newUrl = updateUrlParam(parsedUrl, params, index, newKey, newValue);
      if (newUrl) {
        setInput(newUrl);
      }
    },
    [parsedUrl, params],
  );

  return {
    input,
    setInput,
    parsedUrl,
    error,
    params,
    getEncoded,
    decodeUrl,
    updateParam,
  };
};
