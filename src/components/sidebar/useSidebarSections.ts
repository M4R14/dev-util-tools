import { useMemo } from 'react';
import { Clock3, ExternalLink, LayoutDashboard, SearchX, Star } from 'lucide-react';
import type { ToolMetadata } from '../../types';
import { NOT_NAVIGABLE, type SidebarSectionKey, type SidebarToolSection } from './navigationLayout';

export interface UseSidebarSectionsOptions {
  hasSearchTerm: boolean;
  filteredTools: ToolMetadata[];
  favoriteTools: ToolMetadata[];
  recentTools: ToolMetadata[];
  internalTools: ToolMetadata[];
  externalTools: ToolMetadata[];
  /** Sections the reader folded away. Their items render hidden and leave the keyboard order. */
  collapsedSections?: Set<SidebarSectionKey>;
}

type StaticSidebarSectionKey = Exclude<SidebarSectionKey, 'search'>;

const PRIMARY_SECTION_CLASS = 'pt-1';
const DIVIDER_SECTION_CLASS = 'pt-2 border-t border-border/60';

/** The static half of a section. `isCollapsed` is runtime state, not metadata. */
type SidebarSectionMeta = Omit<SidebarToolSection, 'key' | 'tools' | 'items' | 'isCollapsed'>;

const SIDEBAR_SECTION_META: Record<SidebarSectionKey, SidebarSectionMeta> = {
  search: {
    title: 'Results',
    icon: SearchX,
    contextPrefix: 'search',
    className: PRIMARY_SECTION_CLASS,
  },
  favorites: {
    title: 'Favorites',
    icon: Star,
    contextPrefix: 'fav',
    className: PRIMARY_SECTION_CLASS,
  },
  recent: {
    title: 'Recent',
    icon: Clock3,
    contextPrefix: 'rec',
  },
  apps: {
    title: 'Apps',
    icon: LayoutDashboard,
    contextPrefix: 'all',
    className: DIVIDER_SECTION_CLASS,
  },
  external: {
    title: 'External',
    icon: ExternalLink,
    contextPrefix: 'ext',
    className: DIVIDER_SECTION_CLASS,
  },
};

export const buildSidebarSections = ({
  hasSearchTerm,
  filteredTools,
  favoriteTools,
  recentTools,
  internalTools,
  externalTools,
  collapsedSections,
}: UseSidebarSectionsOptions): SidebarToolSection[] => {
  let runningOffset = 0;
  const indexed = new Set<ToolMetadata['id']>();

  /**
   * The single source of the keyboard order. `visibleTools` is derived from these indices rather
   * than rebuilt alongside them — when the two were computed separately, any rule that changed one
   * (skipping repeats, hiding a collapsed section) had to be mirrored exactly in the other or
   * ArrowDown would highlight a different row than the one Enter opened.
   *
   * A tool listed twice, or sitting inside a collapsed section, is rendered but not reachable.
   */
  const toSectionItems = (tools: ToolMetadata[], navigable: boolean) =>
    tools.map((tool) => {
      if (!navigable || indexed.has(tool.id)) {
        return { tool, indexOffset: NOT_NAVIGABLE };
      }

      indexed.add(tool.id);
      return { tool, indexOffset: runningOffset++ };
    });

  if (hasSearchTerm) {
    return [
      {
        key: 'search',
        ...SIDEBAR_SECTION_META.search,
        tools: filteredTools,
        items: toSectionItems(filteredTools, true),
        isCollapsed: false,
      },
    ];
  }

  const staticSectionConfigs: Array<{
    key: StaticSidebarSectionKey;
    tools: ToolMetadata[];
    when: boolean;
  }> = [
    { key: 'favorites', tools: favoriteTools, when: favoriteTools.length > 0 },
    { key: 'recent', tools: recentTools, when: recentTools.length > 0 },
    { key: 'apps', tools: internalTools, when: true },
    { key: 'external', tools: externalTools, when: externalTools.length > 0 },
  ];

  return staticSectionConfigs
    .filter((config) => config.when)
    .map((config) => {
      const isCollapsed = collapsedSections?.has(config.key) ?? false;

      return {
        key: config.key,
        ...SIDEBAR_SECTION_META[config.key],
        tools: config.tools,
        items: toSectionItems(config.tools, !isCollapsed),
        isCollapsed,
      };
    });
};

/** The keyboard traversal order, in the order the sections render. */
export const toVisibleTools = (sections: SidebarToolSection[]): ToolMetadata[] =>
  sections
    .flatMap((section) => section.items)
    .filter((item) => item.indexOffset !== NOT_NAVIGABLE)
    .map((item) => item.tool);

export const useSidebarSections = ({
  hasSearchTerm,
  filteredTools,
  favoriteTools,
  recentTools,
  internalTools,
  externalTools,
  collapsedSections,
}: UseSidebarSectionsOptions) =>
  useMemo<SidebarToolSection[]>(
    () =>
      buildSidebarSections({
        hasSearchTerm,
        filteredTools,
        favoriteTools,
        recentTools,
        internalTools,
        externalTools,
        collapsedSections,
      }),
    [
      collapsedSections,
      externalTools,
      favoriteTools,
      filteredTools,
      hasSearchTerm,
      internalTools,
      recentTools,
    ],
  );
