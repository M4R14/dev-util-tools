import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { buildShareableSearchParams } from '../lib/shareableUrlState';

const encodeTextToBase64 = (value: string) => {
  try {
    // Use encodeURIComponent to handle Unicode characters (like Thai)
    // btoa only supports ASCII
    const escaped = encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16)),
    );
    return {
      base64: btoa(escaped),
      error: null as string | null,
    };
  } catch {
    return {
      base64: '',
      error: value.trim() ? 'Invalid characters for Base64 encoding' : null,
    };
  }
};

const decodeBase64ToText = (value: string) => {
  try {
    const decoded = atob(value);
    const unescaped = decodeURIComponent(
      decoded
        .split('')
        .map((char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return {
      text: unescaped,
      error: null as string | null,
    };
  } catch {
    return {
      text: '',
      error: value.trim() ? 'Invalid Base64 string' : null,
    };
  }
};

export const useBase64 = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialState] = useState(() => {
    const initialTextParam = searchParams.get('text') ?? '';
    const initialBase64Param = searchParams.get('b64') ?? '';

    if (initialBase64Param.length > 0) {
      const decoded = decodeBase64ToText(initialBase64Param);
      return {
        text: decoded.text,
        base64: initialBase64Param,
        error: decoded.error,
      };
    }

    if (initialTextParam) {
      const encoded = encodeTextToBase64(initialTextParam);
      return {
        text: initialTextParam,
        base64: encoded.base64,
        error: encoded.error,
      };
    }

    return {
      text: '',
      base64: '',
      error: null,
    };
  });

  const [text, setText] = useState(initialState.text);
  const [base64, setBase64] = useState(initialState.base64);
  const [error, setError] = useState<string | null>(initialState.error);
  const currentQuery = searchParams.toString();

  const handleTextChange = (val: string) => {
    setText(val);
    const { base64: encoded, error: nextError } = encodeTextToBase64(val);
    setBase64(encoded);
    setError(nextError);
  };

  const handleBase64Change = (val: string) => {
    setBase64(val);
    if (!val) {
      setText('');
      setError(null);
      return;
    }

    const { text: decoded, error: nextError } = decodeBase64ToText(val);
    setText(decoded);
    setError(nextError);
  };

  useEffect(() => {
    const nextParams = buildShareableSearchParams(currentQuery, [
      { key: 'text', value: text },
      { key: 'b64', value: base64 },
    ]);

    const nextQuery = nextParams.toString();
    if (nextQuery !== currentQuery) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [text, base64, currentQuery, setSearchParams]);

  return {
    text,
    base64,
    error,
    handleTextChange,
    handleBase64Change,
  };
};
