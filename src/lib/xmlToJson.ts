import { convertXML } from 'simple-xml-to-json';
import { z } from 'zod';

export type XmlToJsonValue = string | number | boolean | null | XmlToJsonRecord | XmlToJsonValue[];

export interface XmlToJsonRecord {
  [key: string]: XmlToJsonValue;
}

export interface XmlToJsonOptions {
  includeAttributes?: boolean;
  trimText?: boolean;
  attributesKey?: string;
  textKey?: string;
}

const DEFAULT_OPTIONS: Required<XmlToJsonOptions> = {
  includeAttributes: true,
  trimText: true,
  attributesKey: '@attributes',
  textKey: '#text',
};

const xmlInputSchema = z.string();
const xmlToJsonOptionsSchema = z
  .object({
    includeAttributes: z.boolean().optional(),
    trimText: z.boolean().optional(),
    attributesKey: z.string().min(1).optional(),
    textKey: z.string().min(1).optional(),
  })
  .strict();
const plainRecordSchema = z.object({}).catchall(z.unknown());

const normalizeText = (value: string, trimText: boolean): string => {
  return trimText ? value.trim() : value;
};

const addChildValue = (target: XmlToJsonRecord, key: string, value: XmlToJsonValue) => {
  const existing = target[key];

  if (existing === undefined) {
    target[key] = value;
    return;
  }

  if (Array.isArray(existing)) {
    existing.push(value);
    return;
  }

  target[key] = [existing, value];
};

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (Array.isArray(value)) {
    return null;
  }

  const parsed = plainRecordSchema.safeParse(value);
  if (!parsed.success) {
    return null;
  }

  return parsed.data;
};

const normalizeSimpleXmlNode = (
  nodeValue: unknown,
  options: Required<XmlToJsonOptions>,
): XmlToJsonValue => {
  const nodeRecord = toRecord(nodeValue);
  if (!nodeRecord) {
    if (typeof nodeValue === 'string') {
      return normalizeText(nodeValue, options.trimText);
    }
    return '';
  }

  const result: XmlToJsonRecord = {};
  const attributeEntries = Object.entries(nodeRecord).filter(
    ([key]) => key !== 'children' && key !== 'content',
  );

  if (options.includeAttributes && attributeEntries.length > 0) {
    const attributes: XmlToJsonRecord = {};
    attributeEntries.forEach(([key, value]) => {
      attributes[key] = typeof value === 'string' ? value : JSON.stringify(value);
    });
    result[options.attributesKey] = attributes;
  }

  const children = Array.isArray(nodeRecord.children) ? nodeRecord.children : [];
  children.forEach((child) => {
    const childRecord = toRecord(child);
    if (!childRecord) return;

    Object.entries(childRecord).forEach(([name, value]) => {
      addChildValue(result, name, normalizeSimpleXmlNode(value, options));
    });
  });

  const content =
    typeof nodeRecord.content === 'string'
      ? normalizeText(nodeRecord.content, options.trimText)
      : '';

  if (content !== '') {
    if (Object.keys(result).length === 0) {
      return content;
    }
    result[options.textKey] = content;
  }

  return result;
};

const validateXml = (xml: string) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(xml, 'application/xml');
  const parserError = document.querySelector('parsererror');

  if (parserError) {
    const message = parserError.textContent?.trim();
    throw new Error(message || 'Invalid XML format');
  }
};

export const convertXmlToJson = (xml: string, options: XmlToJsonOptions = {}): XmlToJsonRecord => {
  const parsedXml = xmlInputSchema.safeParse(xml);
  if (!parsedXml.success) {
    throw new Error('XML input must be a string');
  }

  const parsedOptions = xmlToJsonOptionsSchema.safeParse(options);
  if (!parsedOptions.success) {
    throw new Error('Invalid XML to JSON options');
  }

  const mergedOptions = { ...DEFAULT_OPTIONS, ...parsedOptions.data };
  validateXml(xml);

  const rawJson = convertXML(xml) as Record<string, unknown>;
  const entries = Object.entries(rawJson);

  if (entries.length === 0) {
    throw new Error('XML document has no root element');
  }

  const normalized: XmlToJsonRecord = {};
  entries.forEach(([rootName, rootValue]) => {
    normalized[rootName] = normalizeSimpleXmlNode(rootValue, mergedOptions);
  });

  return normalized;
};
