import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DEFAULT_XML_INDENT, formatXml, minifyXml } from '../lib/tools/xmlUtils';
import { useShareableUrlState } from './useShareableUrlState';

export const useXmlFormatter = () => {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState(() => searchParams.get('input') ?? '');
  const [error, setError] = useState<string | null>(null);
  const [indentSize, setIndentSize] = useState(DEFAULT_XML_INDENT);

  useShareableUrlState([{ key: 'input', value: input }]);

  const applyTransform = (transform: (raw: string) => string): boolean => {
    if (!input.trim()) return false;

    try {
      setInput(transform(input));
      setError(null);
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid XML');
      return false;
    }
  };

  const format = (): boolean => applyTransform((raw) => formatXml(raw, indentSize));

  const minify = (): boolean => applyTransform(minifyXml);

  const clear = () => {
    setInput('');
    setError(null);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (error) setError(null);
  };

  return {
    input,
    setInput: handleInputChange,
    error,
    setError,
    indentSize,
    setIndentSize,
    format,
    minify,
    clear,
  };
};
