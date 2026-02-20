import { useCallback, useState } from 'react';
import { convertXmlToJson } from '../lib/xmlToJson';

export const useXmlToJson = () => {
  const [xmlInput, setXmlInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [includeAttributes, setIncludeAttributes] = useState(true);

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
