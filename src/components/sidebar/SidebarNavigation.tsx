import React from 'react';
import type { ToolID, ToolMetadata } from '../../types';
import ToolLinkItem from '../ToolLinkItem';
import { cn } from '../../lib/utils';
import SidebarEmptyState from './SidebarEmptyState';
import { useSidebarSections } from './useSidebarSections';

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
  onToggleFavorite,
  onClose,
}) => {
  const favoriteSet = React.useMemo(() => new Set(favorites), [favorites]);

  const hasSearchTerm = searchTerm.trim().length > 0;
  const sections = useSidebarSections({
    hasSearchTerm,
    filteredTools,
    favoriteTools,
    recentTools,
    internalTools,
    externalTools,
  });

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
          {section.items.length > 0 ? (
            section.items.map(({ tool, indexOffset }) => (
              <ToolLinkItem
                key={`${section.contextPrefix}-${tool.id}`}
                tool={tool}
                indexOffset={indexOffset}
                selectedIndex={selectedIndex}
                onClose={onClose}
                searchTerm={searchTerm}
                isFavorite={favoriteSet.has(tool.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))
          ) : section.key === 'search' ? (
            <SidebarEmptyState />
          ) : null}
        </SidebarSection>
      ))}
    </nav>
  );
};

export default SidebarNavigation;
