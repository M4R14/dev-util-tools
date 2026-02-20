import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { convertXmlToJson } from '../lib/xmlToJson';
import { buildShareableSearchParams } from '../lib/shareableUrlState';

const parseBoolean = (value: string | null, fallback: boolean) =>
  value === null ? fallback : value === '1' || value === 'true';

export const useXmlToJson = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [xmlInput, setXmlInput] = useState(() => searchParams.get('input') ?? '');
  const [jsonOutput, setJsonOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [includeAttributes, setIncludeAttributes] = useState(() =>
    parseBoolean(searchParams.get('attrs'), true),
  );
  const currentQuery = searchParams.toString();

  useEffect(() => {
    const nextParams = buildShareableSearchParams(currentQuery, [
      { key: 'input', value: xmlInput },
      { key: 'attrs', value: includeAttributes ? '1' : '0', defaultValue: '1' },
    ]);

    const nextQuery = nextParams.toString();
    if (nextQuery !== currentQuery) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [xmlInput, includeAttributes, currentQuery, setSearchParams]);

  const convert = useCallback((): boolean => {
    if (!xmlInput.trim()) {
      setError('Please enter XML input');
      setJsonOutput('');
      return false;
    }

    try {
      const converted = convertXmlToJson(xmlInput, {
        includeAttributes,
        trimText: true,
      });
      setJsonOutput(JSON.stringify(converted, null, 2));
      setError(null);
      return true;
    } catch (e: unknown) {
      setJsonOutput('');
      setError(e instanceof Error ? e.message : 'Failed to convert XML to JSON');
      return false;
    }
  }, [includeAttributes, xmlInput]);

  const clear = useCallback(() => {
    setXmlInput('');
    setJsonOutput('');
    setError(null);
    setIncludeAttributes(true);
  }, []);

  const handleXmlChange = useCallback((value: string) => {
    setXmlInput(value);
    if (error) {
      setError(null);
    }
  }, [error]);

  return {
    xmlInput,
    setXmlInput: handleXmlChange,
    jsonOutput,
    error,
    includeAttributes,
    setIncludeAttributes,
    convert,
    clear,
  };
};
