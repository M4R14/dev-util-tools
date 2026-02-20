import { describe, expect, it } from 'vitest';
import type { LucideIcon } from 'lucide-react';
import { ToolID, type ToolMetadata } from '../../types';
import { buildSidebarSections } from './useSidebarSections';

const iconStub = (() => null) as unknown as LucideIcon;

const makeTool = (id: ToolID, name: string): ToolMetadata => ({
  id,
  name,
  description: `${name} description`,
  icon: iconStub,
});

describe('buildSidebarSections', () => {
  it('builds static sections with deterministic running offsets', () => {
    const favoriteTools = [makeTool(ToolID.JSON_FORMATTER, 'JSON')];
    const recentTools = [makeTool(ToolID.XML_FORMATTER, 'XML')];
    const internalTools = [
      makeTool(ToolID.JSON_FORMATTER, 'JSON'),
      makeTool(ToolID.XML_FORMATTER, 'XML'),
    ];
    const externalTools = [makeTool(ToolID.REGEX_TESTER, 'Regex')];

    const sections = buildSidebarSections({
      hasSearchTerm: false,
      filteredTools: [],
      favoriteTools,
      recentTools,
      internalTools,
      externalTools,
    });

    expect(sections.map((section) => section.key)).toEqual([
      'favorites',
      'recent',
      'apps',
      'external',
    ]);

    expect(sections.flatMap((section) => section.items.map((item) => item.indexOffset))).toEqual([
      0, 1, 2, 3, 4,
    ]);
  });

  it('builds search-only section and uses search-local offsets', () => {
    const filteredTools = [
      makeTool(ToolID.JSON_FORMATTER, 'JSON'),
      makeTool(ToolID.XML_FORMATTER, 'XML'),
    ];

    const sections = buildSidebarSections({
      hasSearchTerm: true,
      filteredTools,
      favoriteTools: [],
      recentTools: [],
      internalTools: [],
      externalTools: [],
    });

    expect(sections).toHaveLength(1);
    expect(sections[0]?.key).toBe('search');
    expect(sections[0]?.items.map((item) => item.indexOffset)).toEqual([0, 1]);
  });
});
