import { useMemo } from 'react';
import type { ComponentType } from 'react';
import { Clock3, ExternalLink, LayoutDashboard, SearchX, Star } from 'lucide-react';
import type { ToolMetadata } from '../../types';
import type { SidebarSectionKey } from './navigationLayout';

export interface SidebarToolSection {
  key: SidebarSectionKey;
  title: string;
  icon: ComponentType<{ className?: string }>;
  tools: ToolMetadata[];
  contextPrefix: string;
  className?: string;
}

interface UseSidebarSectionsOptions {
  hasSearchTerm: boolean;
  filteredTools: ToolMetadata[];
  favoriteTools: ToolMetadata[];
  recentTools: ToolMetadata[];
  internalTools: ToolMetadata[];
  externalTools: ToolMetadata[];
}

export const useSidebarSections = ({
  hasSearchTerm,
  filteredTools,
  favoriteTools,
  recentTools,
  internalTools,
  externalTools,
}: UseSidebarSectionsOptions) =>
  useMemo<SidebarToolSection[]>(() => {
    if (hasSearchTerm) {
      return [
        {
          key: 'search',
          title: 'Results',
          icon: SearchX,
          tools: filteredTools,
          contextPrefix: 'search',
          className: 'pt-1',
        },
      ];
    }

    const staticSections: SidebarToolSection[] = [];

    if (favoriteTools.length > 0) {
      staticSections.push({
        key: 'favorites',
        title: 'Favorites',
        icon: Star,
        tools: favoriteTools,
        contextPrefix: 'fav',
        className: 'pt-1',
      });
    }

    if (recentTools.length > 0) {
      staticSections.push({
        key: 'recent',
        title: 'Recent',
        icon: Clock3,
        tools: recentTools,
        contextPrefix: 'rec',
      });
    }

    staticSections.push({
      key: 'apps',
      title: 'Apps',
      icon: LayoutDashboard,
      tools: internalTools,
      contextPrefix: 'all',
      className: 'pt-2 border-t border-border/60',
    });

    if (externalTools.length > 0) {
      staticSections.push({
        key: 'external',
        title: 'External',
        icon: ExternalLink,
        tools: externalTools,
        contextPrefix: 'ext',
        className: 'pt-2 border-t border-border/60',
      });
    }

    return staticSections;
  }, [externalTools, favoriteTools, filteredTools, hasSearchTerm, internalTools, recentTools]);
