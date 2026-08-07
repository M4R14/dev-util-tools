import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { convertXmlToJson } from '../../lib/tools/xmlToJson';
import { readBooleanParam, serializeBooleanParam } from '../../lib/platform/shareableUrlState';
import { useShareableUrlState } from '../useShareableUrlState';

export const useXmlToJson = () => {
  const [searchParams] = useSearchParams();
  const [xmlInput, setXmlInput] = useState(() => searchParams.get('input') ?? '');
  const [jsonOutput, setJsonOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [includeAttributes, setIncludeAttributes] = useState(() =>
    readBooleanParam(searchParams.get('attrs'), true),
  );

  useShareableUrlState([
    { key: 'input', value: xmlInput },
    { key: 'attrs', value: serializeBooleanParam(includeAttributes), defaultValue: '1' },
  ]);

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

  const handleXmlChange = useCallback(
    (value: string) => {
      setXmlInput(value);
      if (error) {
        setError(null);
      }
    },
    [error],
  );

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
