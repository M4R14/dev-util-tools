import React from 'react';
import { Clock3, ExternalLink, LayoutDashboard, SearchX, Star } from 'lucide-react';
import { ToolID, ToolMetadata } from '../../types';
import ToolLinkItem from '../ToolLinkItem';
import { cn } from '../../lib/utils';

interface SidebarNavigationProps {
  searchTerm: string;
  filteredTools: ToolMetadata[];
  favoriteTools: ToolMetadata[];
  recentTools: ToolMetadata[];
  internalTools: ToolMetadata[];
  externalTools: ToolMetadata[];
  selectedIndex: number;
  favorites: ToolID[];
  onToggleFavorite: (id: ToolID) => void;
  onClose: () => void;
}

interface SidebarSectionProps {
  title: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}

type SidebarSectionKey = 'search' | 'favorites' | 'recent' | 'apps' | 'external';

interface ToolSectionConfig {
  key: SidebarSectionKey;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tools: ToolMetadata[];
  contextPrefix: string;
  className?: string;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  count,
  icon: Icon,
  children,
  className,
}) => (
  <section className={cn('space-y-1.5', className)}>
    <div className="px-2 py-1.5 flex items-center justify-between gap-2">
      <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        <Icon className="w-3 h-3" />
        <span>{title}</span>
      </div>
      <span className="inline-flex items-center rounded-full bg-muted/60 border border-border/70 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
        {count}
      </span>
    </div>
    <div className="space-y-0.5">{children}</div>
  </section>
);

const getSectionBaseOffsets = ({
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

const getToolIndexOffset = (
  baseOffsets: ReturnType<typeof getSectionBaseOffsets>,
  sectionKey: SidebarSectionKey,
  itemIndex: number,
) => baseOffsets[sectionKey] + itemIndex;

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  searchTerm,
  filteredTools,
  favoriteTools,
  recentTools,
  internalTools,
  externalTools,
  selectedIndex,
  favorites,
  onToggleFavorite,
  onClose,
}) => {
  const renderToolLink = (tool: ToolMetadata, contextPrefix: string, indexOffset: number) => (
    <ToolLinkItem
      key={`${contextPrefix}-${tool.id}`}
      tool={tool}
      indexOffset={indexOffset}
      selectedIndex={selectedIndex}
      onClose={onClose}
      searchTerm={searchTerm}
      isFavorite={favorites.includes(tool.id)}
      onToggleFavorite={onToggleFavorite}
    />
  );

  const hasSearchTerm = searchTerm.trim().length > 0;
  const baseOffsets = React.useMemo(
    () =>
      getSectionBaseOffsets({
        favoriteCount: favoriteTools.length,
        recentCount: recentTools.length,
        internalCount: internalTools.length,
      }),
    [favoriteTools.length, internalTools.length, recentTools.length],
  );

  const sections = React.useMemo<ToolSectionConfig[]>(() => {
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

    const staticSections: ToolSectionConfig[] = [];

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

  return (
    <nav className="flex-1 px-2 pb-2 space-y-3 overflow-y-auto scrollbar-thin hover:scrollbar-thumb-muted-foreground/20 scrollbar-thumb-transparent transition-colors">
      {sections.map((section) => (
        <SidebarSection
          key={section.key}
          title={section.title}
          count={section.tools.length}
          icon={section.icon}
          className={section.className}
        >
          {section.tools.length > 0 ? (
            section.tools.map((tool, i) =>
              renderToolLink(
                tool,
                section.contextPrefix,
                getToolIndexOffset(baseOffsets, section.key, i),
              ),
            )
          ) : section.key === 'search' ? (
            <div className="px-3 py-8 text-center border border-dashed border-border/70 rounded-md bg-muted/20">
              <p className="text-xs font-medium text-foreground">No tools found</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Try a different keyword</p>
            </div>
          ) : null}
        </SidebarSection>
      ))}
    </nav>
  );
};

export default SidebarNavigation;
