import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UrlParam, addUrlParam, parseUrl, removeUrlParam, updateUrlParam } from '../lib/urlUtils';
import { buildShareableSearchParams } from '../lib/shareableUrlState';

export { type UrlParam };

export const useUrlParser = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState(() => searchParams.get('input') ?? '');
  const [parsedUrl, setParsedUrl] = useState<URL | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<UrlParam[]>([]);
  const currentQuery = searchParams.toString();

  useEffect(() => {
    const result = parseUrl(input);
    setParsedUrl(result.parsed);
    setError(result.error);
    setParams(result.params);
  }, [input]);

  useEffect(() => {
    const nextParams = buildShareableSearchParams(currentQuery, [{ key: 'input', value: input }]);

    const nextQuery = nextParams.toString();
    if (nextQuery !== currentQuery) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [input, currentQuery, setSearchParams]);

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

  const addParam = useCallback(() => {
    const existingKeys = new Set(params.map((param) => param.key));
    let keyIndex = params.length + 1;
    let nextKey = `param${keyIndex}`;

    while (existingKeys.has(nextKey)) {
      keyIndex += 1;
      nextKey = `param${keyIndex}`;
    }

    const newUrl = addUrlParam(parsedUrl, params, nextKey, '');
    if (newUrl) {
      setInput(newUrl);
    }
  }, [parsedUrl, params]);

  const removeParam = useCallback(
    (index: number) => {
      const newUrl = removeUrlParam(parsedUrl, params, index);
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
    addParam,
    removeParam,
  };
};
