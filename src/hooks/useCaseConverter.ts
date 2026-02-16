import { useState } from 'react';
import { toSnakeCase, toKebabCase, toCamelCase, toPascalCase } from '../lib/caseUtils';

export const useCaseConverter = () => {
  const [input, setInput] = useState('');

  const conversions = [
    { label: 'UPPERCASE', value: input.toUpperCase() },
    { label: 'lowercase', value: input.toLowerCase() },
    { label: 'camelCase', value: toCamelCase(input) },
    { label: 'PascalCase', value: toPascalCase(input) },
    { label: 'snake_case', value: toSnakeCase(input) },
    { label: 'kebab-case', value: toKebabCase(input) },
  ];

  return {
    input,
    setInput,
    results: conversions,
  };
};
