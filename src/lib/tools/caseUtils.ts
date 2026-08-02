/**
 * Pure case-conversion utility functions.
 * Extracted from useCaseConverter hook for reusability and testability.
 */

/** Split a string into word tokens. */
const tokenize = (str: string): string[] =>
  str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) ?? [];

export const toSnakeCase = (str: string): string =>
  tokenize(str)
    .map((x) => x.toLowerCase())
    .join('_');

export const toKebabCase = (str: string): string =>
  tokenize(str)
    .map((x) => x.toLowerCase())
    .join('-');

export const toCamelCase = (str: string): string =>
  str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => (i === 0 ? w.toLowerCase() : w.toUpperCase()))
    .replace(/\s+/g, '');

export const toPascalCase = (str: string): string =>
  str.replace(/(?:^\w|[A-Z]|\b\w)/g, (w) => w.toUpperCase()).replace(/\s+/g, '');
