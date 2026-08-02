import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { convertXmlToJson } from './xmlToJson';

/**
 * `convertXmlToJson` calls `new DOMParser()` for a well-formedness check. jsdom cannot boot in
 * this project (its css-color dependency is CJS requiring ESM), so the parser is stubbed and
 * these tests cover the conversion logic, not the DOM-based validation. The stub is driven by an
 * explicit flag so the "parser reported an error" contract can still be exercised.
 */
let parserError: string | null = null;

class StubDOMParser {
  parseFromString() {
    return {
      querySelector: () => (parserError === null ? null : { textContent: parserError }),
    };
  }
}

beforeAll(() => {
  vi.stubGlobal('DOMParser', StubDOMParser);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('convertXmlToJson', () => {
  it('converts a nested document', () => {
    expect(convertXmlToJson('<a><b><c>deep</c></b></a>')).toEqual({ a: { b: { c: 'deep' } } });
  });

  it('collapses an element with only text into that text', () => {
    expect(convertXmlToJson('<root><item>1</item></root>')).toEqual({ root: { item: '1' } });
  });

  it('groups repeated sibling elements into an array', () => {
    expect(convertXmlToJson('<root><item>a</item><item>b</item><item>c</item></root>')).toEqual({
      root: { item: ['a', 'b', 'c'] },
    });
  });

  it('renders a self-closing element as an empty object', () => {
    expect(convertXmlToJson('<root><empty/></root>')).toEqual({ root: { empty: {} } });
  });

  describe('attributes', () => {
    const xml = '<root id="1" kind="a"><item x="9">text</item></root>';

    it('are included under @attributes by default, alongside #text', () => {
      expect(convertXmlToJson(xml)).toEqual({
        root: {
          '@attributes': { id: '1', kind: 'a' },
          item: { '@attributes': { x: '9' }, '#text': 'text' },
        },
      });
    });

    it('are dropped when includeAttributes is false', () => {
      expect(convertXmlToJson(xml, { includeAttributes: false })).toEqual({
        root: { item: 'text' },
      });
    });

    it('honour custom attributesKey and textKey', () => {
      expect(
        convertXmlToJson('<root id="1">text</root>', {
          attributesKey: 'attrs',
          textKey: 'value',
        }),
      ).toEqual({ root: { attrs: { id: '1' }, value: 'text' } });
    });
  });

  describe('options validation', () => {
    it('rejects unknown option keys', () => {
      expect(() =>
        convertXmlToJson('<root/>', { nope: true } as unknown as Record<string, never>),
      ).toThrow('Invalid XML to JSON options');
    });
  });

  describe('parser errors', () => {
    it('surfaces the message the parser reported', () => {
      parserError = 'mismatched tag at line 1';
      expect(() => convertXmlToJson('<a></b>')).toThrow('mismatched tag at line 1');
      parserError = null;
    });

    it('falls back to a generic message when the parser gives none', () => {
      parserError = '';
      expect(() => convertXmlToJson('<a></b>')).toThrow('Invalid XML format');
      parserError = null;
    });
  });

  /**
   * Behaviour inherited from `simple-xml-to-json` that the option surface does not actually
   * control. Pinned so a library upgrade that changes it is visible rather than silent.
   */
  describe('known quirks', () => {
    it('leaves mixed content under a literal "content" key, ignoring textKey', () => {
      expect(convertXmlToJson('<root>hello<child>x</child></root>', { textKey: '#text' })).toEqual({
        root: { content: 'hello', child: 'x' },
      });
    });

    it('trims leading whitespace even when trimText is false', () => {
      expect(convertXmlToJson('<root><item>  padded  </item></root>', { trimText: false })).toEqual(
        { root: { item: 'padded  ' } },
      );
    });

    it('trims both sides when trimText is true', () => {
      expect(convertXmlToJson('<root><item>  padded  </item></root>')).toEqual({
        root: { item: 'padded' },
      });
    });
  });

  describe('empty input', () => {
    it('reports a missing root element rather than an internal type error', () => {
      expect(() => convertXmlToJson('')).toThrow('XML document has no root element');
      expect(() => convertXmlToJson('   ')).toThrow('XML document has no root element');
    });
  });
});
