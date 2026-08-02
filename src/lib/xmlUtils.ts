import xmlFormat from 'xml-formatter';

export const DEFAULT_XML_INDENT = 2;

/**
 * XML document transforms shared by the tool UI (`useXmlFormatter`) and the AI bridge
 * (`handlers/xmlFormatter`). All functions throw when the input is not well-formed XML
 * (`throwOnFailure`) — callers decide how to present the failure.
 */

const formatOptions = (indent: number) => ({
  indentation: ' '.repeat(indent),
  collapseContent: true,
  lineSeparator: '\n',
  throwOnFailure: true as const,
});

export const formatXml = (raw: string, indent: number = DEFAULT_XML_INDENT): string =>
  xmlFormat(raw, formatOptions(indent));

export const minifyXml = (raw: string): string =>
  xmlFormat.minify(raw, {
    collapseContent: true,
    throwOnFailure: true,
  });

/**
 * Throws when `raw` cannot be parsed as XML at all, otherwise returns nothing.
 *
 * NOTE: this is weaker than a well-formedness check. `xml-formatter` repairs structural
 * errors instead of reporting them — `<a></b>` is accepted and rewritten to `<a></a>`,
 * and unclosed tags are closed for you. Only input with no parseable markup throws.
 * See `xmlUtils.test.ts` for the pinned behaviour.
 */
export const assertValidXml = (raw: string, indent: number = DEFAULT_XML_INDENT): void => {
  xmlFormat(raw, formatOptions(indent));
};
