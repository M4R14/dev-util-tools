import { toCamelCase, toKebabCase, toPascalCase, toSnakeCase } from './caseUtils';

describe('caseUtils', () => {
  it('converts to snake case', () => {
    expect(toSnakeCase('helloWorld API')).toBe('hello_world_api');
  });

  it('converts to kebab case', () => {
    expect(toKebabCase('Hello world Example')).toBe('hello-world-example');
  });

  it('converts to camel case', () => {
    expect(toCamelCase('hello world example')).toBe('helloWorldExample');
  });

  it('converts to pascal case', () => {
    expect(toPascalCase('hello world example')).toBe('HelloWorldExample');
  });
});
