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
  onClose: () => void;
}

interface SidebarSectionProps {
  title: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
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

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  searchTerm,
  filteredTools,
  favoriteTools,
  recentTools,
  internalTools,
  externalTools,
  selectedIndex,
  favorites,
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
      favorites={favorites}
    />
  );

  const hasSearchTerm = searchTerm.trim().length > 0;

  return (
    <nav className="flex-1 px-2 pb-2 space-y-3 overflow-y-auto scrollbar-thin hover:scrollbar-thumb-muted-foreground/20 scrollbar-thumb-transparent transition-colors">
      {hasSearchTerm ? (
        <SidebarSection title="Results" count={filteredTools.length} icon={SearchX} className="pt-1">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool, i) => renderToolLink(tool, 'search', i))
          ) : (
            <div className="px-3 py-8 text-center border border-dashed border-border/70 rounded-md bg-muted/20">
              <p className="text-xs font-medium text-foreground">No tools found</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Try a different keyword</p>
            </div>
          )}
        </SidebarSection>
      ) : (
        <>
          {favoriteTools.length > 0 && (
            <SidebarSection title="Favorites" count={favoriteTools.length} icon={Star} className="pt-1">
              {favoriteTools.map((tool, i) => renderToolLink(tool, 'fav', i))}
            </SidebarSection>
          )}

          {recentTools.length > 0 && (
            <SidebarSection title="Recent" count={recentTools.length} icon={Clock3}>
              {recentTools.map((tool, i) => renderToolLink(tool, 'rec', i + favoriteTools.length))}
            </SidebarSection>
          )}

          <SidebarSection
            title="Apps"
            count={internalTools.length}
            icon={LayoutDashboard}
            className="pt-2 border-t border-border/60"
          >
            {internalTools.map((tool, i) =>
              renderToolLink(tool, 'all', i + favoriteTools.length + recentTools.length),
            )}
          </SidebarSection>

          {externalTools.length > 0 && (
            <SidebarSection
              title="External"
              count={externalTools.length}
              icon={ExternalLink}
              className="pt-2 border-t border-border/60"
            >
              {externalTools.map((tool, i) =>
                renderToolLink(
                  tool,
                  'ext',
                  i + favoriteTools.length + recentTools.length + internalTools.length,
                ),
              )}
            </SidebarSection>
          )}
        </>
      )}
    </nav>
  );
};

export default SidebarNavigation;
