import { useState } from 'react';

export const useJsonFormatter = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formatJSON = (space: number = 2) => {
    try {
      if (!input.trim()) return false;
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, space));
      setError(null);
      return true;
    } catch (e: any) {
      setError(e.message);
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
    } catch (e: any) {
      setError(e.message);
      return false;
    }
  };

  const copyToClipboard = () => {
    if (!input) return;
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    copied,
    formatJSON,
    minifyJSON,
    copyToClipboard,
    clear
  };
};
