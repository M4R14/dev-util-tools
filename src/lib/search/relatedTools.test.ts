import { describe, it, expect } from 'vitest';
import { Code2 } from 'lucide-react';
import { getRelatedTools } from './relatedTools';
import { TOOLS } from '../../data/tools';
import { ToolID, ToolMetadata } from '../../types';

const tool = (id: ToolID, tags: string[], related?: ToolID[]): ToolMetadata => ({
  id,
  name: id,
  description: id,
  icon: Code2,
  tags,
  related,
});

describe('getRelatedTools', () => {
  it('keeps curated related tools in their declared order', () => {
    const tools = [
      tool(ToolID.VIN_TOOL, ['vin'], [ToolID.UUID_GENERATOR, ToolID.THAI_ID]),
      tool(ToolID.THAI_ID, ['thai id']),
      tool(ToolID.UUID_GENERATOR, ['uuid']),
    ];

    expect(getRelatedTools(tools[0], tools).map((t) => t.id)).toEqual([
      ToolID.UUID_GENERATOR,
      ToolID.THAI_ID,
    ]);
  });

  it('falls back to a search over name + tags, ranking stronger matches first', () => {
    const tools = [
      tool(ToolID.JSON_FORMATTER, ['json', 'format', 'validate']),
      tool(ToolID.WHEEL_RANDOM, ['spin', 'picker']),
      tool(ToolID.XML_FORMATTER, ['json', 'format', 'validate']),
      tool(ToolID.XML_TO_JSON, ['json']),
    ];

    expect(getRelatedTools(tools[0], tools).map((t) => t.id)).toEqual([
      ToolID.XML_FORMATTER,
      ToolID.XML_TO_JSON,
    ]);
  });

  it('excludes the generic "external tool" tag from the query and the index', () => {
    const tools = [
      tool(ToolID.VIN_TOOL, ['vin', 'external tool']),
      tool(ToolID.DUMMY_IMAGE, ['placeholder', 'external tool']),
    ];

    expect(getRelatedTools(tools[0], tools)).toEqual([]);
  });

  it('never includes the tool itself or unknown curated ids', () => {
    const tools = [
      tool(ToolID.VIN_TOOL, ['vin'], [ToolID.VIN_TOOL, ToolID.AI_ASSISTANT, ToolID.THAI_ID]),
      tool(ToolID.THAI_ID, ['thai id']),
    ];

    expect(getRelatedTools(tools[0], tools).map((t) => t.id)).toEqual([ToolID.THAI_ID]);
  });

  it('respects the limit and de-duplicates curated + searched matches', () => {
    const tools = [
      tool(ToolID.JSON_FORMATTER, ['json'], [ToolID.XML_TO_JSON]),
      tool(ToolID.XML_TO_JSON, ['json']),
      tool(ToolID.XML_FORMATTER, ['json']),
    ];

    const result = getRelatedTools(tools[0], tools, 2).map((t) => t.id);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(ToolID.XML_TO_JSON);
    expect(result).toContain(ToolID.XML_FORMATTER);
  });

  it('gives every registered tool at least one suggestion', () => {
    for (const registered of TOOLS) {
      expect(getRelatedTools(registered, TOOLS).length).toBeGreaterThan(0);
    }
  });
});
