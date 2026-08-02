import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toSnakeCase, toKebabCase, toCamelCase, toPascalCase } from '../../lib/tools/caseUtils';
import { useShareableUrlState } from '../useShareableUrlState';

export const useCaseConverter = () => {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState(() => searchParams.get('input') ?? '');

  useShareableUrlState([{ key: 'input', value: input }]);

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
