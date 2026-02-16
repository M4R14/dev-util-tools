import { useState } from 'react';
import xmlFormat from 'xml-formatter';

export const useXmlFormatter = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [indentSize, setIndentSize] = useState(2);

  const format = (): boolean => {
    if (!input.trim()) return false;

    try {
      const formatted = xmlFormat(input, {
        indentation: ' '.repeat(indentSize),
        collapseContent: true,
        lineSeparator: '\n',
        throwOnFailure: true,
      });
      setInput(formatted);
      setError(null);
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid XML');
      return false;
    }
  };

  const minify = (): boolean => {
    if (!input.trim()) return false;

    try {
      const minified = xmlFormat.minify(input, {
        collapseContent: true,
        throwOnFailure: true,
      });
      setInput(minified);
      setError(null);
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid XML');
      return false;
    }
  };

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
