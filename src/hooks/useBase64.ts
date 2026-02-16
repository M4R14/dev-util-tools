import { useState } from 'react';

export const useBase64 = () => {
  const [text, setText] = useState('');
  const [base64, setBase64] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTextChange = (val: string) => {
    setText(val);
    try {
      // Use encodeURIComponent to handle Unicode characters (like Thai)
      // btoa only supports ASCII
      const escaped = encodeURIComponent(val).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16)),
      );
      setBase64(btoa(escaped));
      setError(null);
    } catch (e) {
      setBase64('');
      if (val.trim()) setError('Invalid characters for Base64 encoding');
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
      const decoded = atob(val);
      const unescaped = decodeURIComponent(
        decoded
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      setText(unescaped);
      setError(null);
    } catch (e) {
      setText('');
      if (val.trim()) setError('Invalid Base64 string');
    }
  };

  return {
    text,
    base64,
    error,
    handleTextChange,
    handleBase64Change,
  };
};
