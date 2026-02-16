import { useState } from 'react';

export const useJsonFormatter = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const formatJSON = (space: number = 2) => {
    try {
      if (!input.trim()) return false;
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, space));
      setError(null);
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
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
      setError(e instanceof Error ? e.message : 'Invalid JSON');
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
    error,
    setError,
    formatJSON,
    minifyJSON,
    clear,
  };
};
