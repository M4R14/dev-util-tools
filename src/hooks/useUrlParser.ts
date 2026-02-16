import { useState, useCallback, useEffect } from 'react';

export interface UrlParam {
  key: string;
  value: string;
}

export const useUrlParser = () => {
  const [input, setInput] = useState('');
  const [parsedUrl, setParsedUrl] = useState<URL | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<UrlParam[]>([]);

  useEffect(() => {
    if (!input) {
      // Changed to check truthy to avoid running on empty string
      setParsedUrl(null);
      setError(null);
      setParams([]);
      return;
    }

    try {
      let urlToCheck = input;

      // Basic check for protocol, assume https if missing for parsing purposes
      if (!input.match(/^[a-zA-Z][a-zA-Z\d+\-.]*:/)) {
        urlToCheck = 'https://' + input;
      }

      const url = new URL(urlToCheck);
      setParsedUrl(url);
      setError(null);

      const newParams: UrlParam[] = [];
      url.searchParams.forEach((value, key) => {
        newParams.push({ key, value });
      });
      setParams(newParams);
    } catch (err) {
      setParsedUrl(null);
      setError('Invalid URL format');
      setParams([]);
    }
  }, [input]);

  const encode = useCallback(() => {
    try {
      const encoded = encodeURIComponent(input);
      navigator.clipboard.writeText(encoded);
      return true;
    } catch {
      return false;
    }
  }, [input]);

  const decode = useCallback(() => {
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
      if (!parsedUrl) return;

      // Create new params array
      const nextParams = [...params];
      nextParams[index] = { key: newKey, value: newValue };

      // Update URL search string
      const newSearchParams = new URLSearchParams();
      nextParams.forEach((p) => {
        if (p.key) newSearchParams.append(p.key, p.value);
      });

      const newUrl = new URL(parsedUrl.toString());
      newUrl.search = newSearchParams.toString();

      // Update input which will trigger effect to re-parse
      setInput(newUrl.toString());
    },
    [parsedUrl, params],
  );

  return {
    input,
    setInput,
    parsedUrl,
    error,
    setError,
    params,
    encode,
    decode,
    updateParam,
  };
};
