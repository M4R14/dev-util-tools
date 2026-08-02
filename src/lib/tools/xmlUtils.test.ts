import { describe, it, expect } from 'vitest';
import { DEFAULT_XML_INDENT, assertValidXml, formatXml, minifyXml } from './xmlUtils';

describe('xmlUtils', () => {
  it('formats with the default indent', () => {
    expect(formatXml('<root><item>1</item></root>')).toBe('<root>\n  <item>1</item>\n</root>');
    expect(DEFAULT_XML_INDENT).toBe(2);
  });

  it('formats with an explicit indent', () => {
    expect(formatXml('<root><item>1</item></root>', 4)).toBe('<root>\n    <item>1</item>\n</root>');
  });

  it('minifies away formatting whitespace', () => {
    expect(minifyXml('<root>\n  <item>1</item>\n</root>')).toBe('<root><item>1</item></root>');
  });

  it('throws when the input is not XML at all', () => {
    expect(() => formatXml('not xml at all')).toThrow();
    expect(() => minifyXml('not xml at all')).toThrow();
    expect(() => assertValidXml('not xml at all')).toThrow();
    expect(() => assertValidXml('')).toThrow();
  });

  it('accepts well-formed input in assertValidXml', () => {
    expect(() => assertValidXml('<root><item>ok</item></root>')).not.toThrow();
  });

  // Documents a known limitation of `xml-formatter`, not desired behaviour: it repairs
  // structural errors instead of reporting them, so `assertValidXml` is a parse check
  // rather than a well-formedness check. See xmlUtils.ts.
  it('silently repairs unclosed and mismatched tags rather than rejecting them', () => {
    expect(formatXml('<root><unclosed>')).toBe('<root>\n  <unclosed></unclosed>\n</root>');
    expect(formatXml('<a></b>')).toBe('<a></a>');
    expect(() => assertValidXml('<a></b>')).not.toThrow();
  });
});
