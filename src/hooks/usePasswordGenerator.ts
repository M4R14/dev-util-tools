import { useState, useEffect, useCallback } from 'react';

export const usePasswordGenerator = () => {
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');

  const generatePassword = useCallback(() => {
    let charset = '';
    if (includeUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) {
      setPassword('');
      return;
    }

    let generated = '';
    const charsetLength = charset.length;
    for (let i = 0; i < length; i++) {
      generated += charset.charAt(Math.floor(Math.random() * charsetLength));
    }
    setPassword(generated);
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  return {
    length,
    setLength,
    includeUpper,
    setIncludeUpper,
    includeLower,
    setIncludeLower,
    includeNumbers,
    setIncludeNumbers,
    includeSymbols,
    setIncludeSymbols,
    password,
    generatePassword,
  };
};
