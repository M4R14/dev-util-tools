import { useState } from 'react';

export const useBase64 = () => {
  const [text, setText] = useState('');
  const [base64, setBase64] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<'text' | 'base64' | null>(null);

  const handleTextChange = (val: string) => {
    setText(val);
    try {
      setBase64(btoa(val));
      setError(null);
    } catch (e) {
      setBase64('');
      if (val) setError('Invalid characters for Base64 encoding');
    }
  };

  const handleBase64Change = (val: string) => {
    setBase64(val);
    try {
      if (!val) {
        setText('');
        setError(null);
        return;
      }
      setText(atob(val));
      setError(null);
    } catch (e) {
      setText('');
      setError('Invalid Base64 string');
    }
  };

  const copy = (content: string, type: 'text' | 'base64') => {
    navigator.clipboard.writeText(content);
    setCopyState(type);
    setTimeout(() => setCopyState(null), 2000);
  };

  return {
    text,
    base64,
    error,
    copyState,
    handleTextChange,
    handleBase64Change,
    copy
  };
};
