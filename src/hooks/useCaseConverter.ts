import { useState } from 'react';

export const useCaseConverter = () => {
  const [input, setInput] = useState('');

  const toSnakeCase = (str: string) => {
    return (
      str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        ?.map((x) => x.toLowerCase())
        .join('_') || ''
    );
  };

  const toKebabCase = (str: string) => {
    return (
      str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        ?.map((x) => x.toLowerCase())
        .join('-') || ''
    );
  };

  const toCamelCase = (str: string) => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => (i === 0 ? w.toLowerCase() : w.toUpperCase()))
      .replace(/\s+/g, '');
  };

  const toPascalCase = (str: string) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (w) => w.toUpperCase()).replace(/\s+/g, '');
  };

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
