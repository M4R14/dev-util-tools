import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toSnakeCase, toKebabCase, toCamelCase, toPascalCase } from '../lib/caseUtils';
import { buildShareableSearchParams } from '../lib/shareableUrlState';

export const useCaseConverter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState(() => searchParams.get('input') ?? '');
  const currentQuery = searchParams.toString();

  useEffect(() => {
    const nextParams = buildShareableSearchParams(currentQuery, [{ key: 'input', value: input }]);

    const nextQuery = nextParams.toString();
    if (nextQuery !== currentQuery) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [input, currentQuery, setSearchParams]);

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
