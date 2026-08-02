import { describe, expect, it } from 'vitest';
import type { LucideIcon } from 'lucide-react';
import { ToolID, type ToolMetadata } from '../../types';
import { buildSidebarSections, toVisibleTools } from './useSidebarSections';
import { NOT_NAVIGABLE, type SidebarSectionKey } from './navigationLayout';

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

    // JSON and XML are listed twice — under Favorites/Recent and again in the Apps catalogue.
    // The repeats are rendered but skipped by the keyboard order, so arrowing down stops on each
    // tool once. This previously read [0, 1, 2, 3, 4], which pinned the double-stop behaviour.
    expect(sections.flatMap((section) => section.items.map((item) => item.indexOffset))).toEqual([
      0,
      1,
      NOT_NAVIGABLE,
      NOT_NAVIGABLE,
      2,
    ]);
  });

  it('gives every distinct tool exactly one keyboard index', () => {
    const sections = buildSidebarSections({
      hasSearchTerm: false,
      filteredTools: [],
      favoriteTools: [makeTool(ToolID.JSON_FORMATTER, 'JSON')],
      recentTools: [makeTool(ToolID.XML_FORMATTER, 'XML')],
      internalTools: [
        makeTool(ToolID.JSON_FORMATTER, 'JSON'),
        makeTool(ToolID.XML_FORMATTER, 'XML'),
        makeTool(ToolID.BASE64_TOOL, 'Base64'),
      ],
      externalTools: [],
    });

    const navigable = sections
      .flatMap((section) => section.items)
      .filter((item) => item.indexOffset !== NOT_NAVIGABLE);

    expect(navigable.map((item) => item.tool.id)).toEqual([
      ToolID.JSON_FORMATTER,
      ToolID.XML_FORMATTER,
      ToolID.BASE64_TOOL,
    ]);
    // Contiguous from zero, so the index maps straight into the visibleTools array.
    expect(navigable.map((item) => item.indexOffset)).toEqual([0, 1, 2]);
  });

  it('renders a collapsed section as collapsed and drops it from the keyboard order', () => {
    const sections = buildSidebarSections({
      hasSearchTerm: false,
      filteredTools: [],
      favoriteTools: [makeTool(ToolID.JSON_FORMATTER, 'JSON')],
      recentTools: [],
      internalTools: [makeTool(ToolID.XML_FORMATTER, 'XML')],
      externalTools: [makeTool(ToolID.REGEX_TESTER, 'Regex')],
      collapsedSections: new Set<SidebarSectionKey>(['favorites']),
    });

    const favorites = sections.find((section) => section.key === 'favorites');

    expect(favorites?.isCollapsed).toBe(true);
    // The count still reports what is hidden.
    expect(favorites?.tools).toHaveLength(1);
    expect(favorites?.items.every((item) => item.indexOffset === NOT_NAVIGABLE)).toBe(true);
    expect(toVisibleTools(sections).map((tool) => tool.id)).toEqual([
      ToolID.XML_FORMATTER,
      ToolID.REGEX_TESTER,
    ]);
  });

  it('keeps indices contiguous when a middle section is collapsed', () => {
    const sections = buildSidebarSections({
      hasSearchTerm: false,
      filteredTools: [],
      favoriteTools: [makeTool(ToolID.JSON_FORMATTER, 'JSON')],
      recentTools: [makeTool(ToolID.XML_FORMATTER, 'XML')],
      internalTools: [makeTool(ToolID.BASE64_TOOL, 'Base64')],
      externalTools: [],
      collapsedSections: new Set<SidebarSectionKey>(['recent']),
    });

    const navigable = sections
      .flatMap((section) => section.items)
      .filter((item) => item.indexOffset !== NOT_NAVIGABLE);

    // Contiguous from zero, so selectedIndex still maps straight into visibleTools.
    expect(navigable.map((item) => item.indexOffset)).toEqual([0, 1]);
    expect(toVisibleTools(sections)).toHaveLength(navigable.length);
  });

  it('collapsing a section frees the repeat below it to take the keyboard slot', () => {
    // JSON is listed under Favorites and again under Apps. With Favorites collapsed, the Apps row
    // is the only reachable one — a collapsed section must not swallow the tool entirely.
    const sections = buildSidebarSections({
      hasSearchTerm: false,
      filteredTools: [],
      favoriteTools: [makeTool(ToolID.JSON_FORMATTER, 'JSON')],
      recentTools: [],
      internalTools: [makeTool(ToolID.JSON_FORMATTER, 'JSON')],
      externalTools: [],
      collapsedSections: new Set<SidebarSectionKey>(['favorites']),
    });

    expect(toVisibleTools(sections).map((tool) => tool.id)).toEqual([ToolID.JSON_FORMATTER]);
  });

  it('never collapses the search results section', () => {
    const sections = buildSidebarSections({
      hasSearchTerm: true,
      filteredTools: [makeTool(ToolID.JSON_FORMATTER, 'JSON')],
      favoriteTools: [],
      recentTools: [],
      internalTools: [],
      externalTools: [],
      collapsedSections: new Set<SidebarSectionKey>(['favorites', 'apps']),
    });

    expect(sections[0]?.isCollapsed).toBe(false);
    expect(toVisibleTools(sections)).toHaveLength(1);
  });

  it('still renders the repeats so the Apps catalogue stays complete', () => {
    const sections = buildSidebarSections({
      hasSearchTerm: false,
      filteredTools: [],
      favoriteTools: [makeTool(ToolID.JSON_FORMATTER, 'JSON')],
      recentTools: [],
      internalTools: [
        makeTool(ToolID.JSON_FORMATTER, 'JSON'),
        makeTool(ToolID.XML_FORMATTER, 'XML'),
      ],
      externalTools: [],
    });

    const apps = sections.find((section) => section.key === 'apps');

    expect(apps?.items.map((item) => item.tool.id)).toEqual([
      ToolID.JSON_FORMATTER,
      ToolID.XML_FORMATTER,
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
