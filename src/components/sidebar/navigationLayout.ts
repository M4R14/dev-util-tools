import type { ComponentType } from 'react';
import type { ToolMetadata } from '../../types';

export type SidebarSectionKey = 'search' | 'favorites' | 'recent' | 'apps' | 'external';

export interface SidebarToolSection {
  key: SidebarSectionKey;
  title: string;
  icon: ComponentType<{ className?: string }>;
  tools: ToolMetadata[];
  contextPrefix: string;
  className?: string;
}

export const getSectionBaseOffsets = ({
  favoriteCount,
  recentCount,
  internalCount,
}: {
  favoriteCount: number;
  recentCount: number;
  internalCount: number;
}) => ({
  search: 0,
  favorites: 0,
  recent: favoriteCount,
  apps: favoriteCount + recentCount,
  external: favoriteCount + recentCount + internalCount,
});

export const getToolIndexOffset = (
  baseOffsets: ReturnType<typeof getSectionBaseOffsets>,
  sectionKey: SidebarSectionKey,
  itemIndex: number,
) => baseOffsets[sectionKey] + itemIndex;
