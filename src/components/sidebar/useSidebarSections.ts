import { useMemo } from 'react';
import { Clock3, ExternalLink, LayoutDashboard, SearchX, Star } from 'lucide-react';
import type { ToolMetadata } from '../../types';
import type { SidebarSectionKey, SidebarToolSection } from './navigationLayout';

export interface UseSidebarSectionsOptions {
  hasSearchTerm: boolean;
  filteredTools: ToolMetadata[];
  favoriteTools: ToolMetadata[];
  recentTools: ToolMetadata[];
  internalTools: ToolMetadata[];
  externalTools: ToolMetadata[];
}

type StaticSidebarSectionKey = Exclude<SidebarSectionKey, 'search'>;

const PRIMARY_SECTION_CLASS = 'pt-1';
const DIVIDER_SECTION_CLASS = 'pt-2 border-t border-border/60';

type SidebarSectionMeta = Omit<SidebarToolSection, 'key' | 'tools'>;

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
}: UseSidebarSectionsOptions): SidebarToolSection[] => {
  if (hasSearchTerm) {
    return [
      {
        key: 'search',
        ...SIDEBAR_SECTION_META.search,
        tools: filteredTools,
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
    .map((config) => ({
      key: config.key,
      ...SIDEBAR_SECTION_META[config.key],
      tools: config.tools,
    }));
};

export const useSidebarSections = ({
  hasSearchTerm,
  filteredTools,
  favoriteTools,
  recentTools,
  internalTools,
  externalTools,
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
      }),
    [externalTools, favoriteTools, filteredTools, hasSearchTerm, internalTools, recentTools],
  );
