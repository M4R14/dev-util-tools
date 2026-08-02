import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { ToolID } from '../../types';
import ToolLinkItem from '../ToolLinkItem';
import { cn } from '../../lib/utils';
import SidebarEmptyState from './SidebarEmptyState';
import { NOT_NAVIGABLE, type SidebarSectionKey, type SidebarToolSection } from './navigationLayout';
import { isCollapsible } from './useCollapsedSections';

interface SidebarNavigationProps {
  sections: SidebarToolSection[];
  searchTerm: string;
  selectedIndex: number;
  favorites: ToolID[];
  onToggleFavorite: (id: ToolID) => void;
  onToggleSection: (key: SidebarSectionKey) => void;
  onClose: () => void;
}

interface SidebarSectionProps {
  section: SidebarToolSection;
  onToggle: () => void;
  children: React.ReactNode;
}

/**
 * The header is the collapse control when the section can be folded. The count stays visible while
 * collapsed, so a folded group still says how much is hidden behind it.
 */
const SidebarSection: React.FC<SidebarSectionProps> = ({ section, onToggle, children }) => {
  const { title, icon: Icon, tools, isCollapsed, key } = section;
  const collapsible = isCollapsible(key);
  const listId = `sidebar-section-${key}`;

  const heading = (
    <>
      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
        {collapsible ? (
          <ChevronDown
            className={cn('w-3 h-3 transition-transform', isCollapsed && '-rotate-90')}
            aria-hidden="true"
          />
        ) : (
          <Icon className="w-3 h-3" aria-hidden="true" />
        )}
        <span>{title}</span>
      </span>
      <span className="inline-flex items-center rounded-full bg-muted/60 border border-border/70 px-1.5 py-0.5 text-[10px] font-semibold">
        {tools.length}
      </span>
    </>
  );

  return (
    <section className={cn('space-y-1.5', section.className)}>
      {collapsible ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!isCollapsed}
          aria-controls={listId}
          className="w-full px-2 py-1.5 flex items-center justify-between gap-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          {heading}
        </button>
      ) : (
        <div className="px-2 py-1.5 flex items-center justify-between gap-2 text-muted-foreground">
          {heading}
        </div>
      )}

      {!isCollapsed && (
        <div id={listId} className="space-y-0.5">
          {children}
        </div>
      )}
    </section>
  );
};

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  sections,
  searchTerm,
  selectedIndex,
  favorites,
  onToggleFavorite,
  onToggleSection,
  onClose,
}) => {
  const favoriteSet = React.useMemo(() => new Set(favorites), [favorites]);

  return (
    <nav className="flex-1 px-2 pb-2 space-y-3 overflow-y-auto scrollbar-thin hover:scrollbar-thumb-muted-foreground/20 scrollbar-thumb-transparent transition-colors">
      {sections.map((section) => (
        <SidebarSection
          key={section.key}
          section={section}
          onToggle={() => onToggleSection(section.key)}
        >
          {section.items.length > 0 ? (
            section.items.map(({ tool, indexOffset }) => (
              <ToolLinkItem
                key={`${section.contextPrefix}-${tool.id}`}
                tool={tool}
                indexOffset={indexOffset}
                // A repeat listing shows the tool without claiming to be where you are. The active
                // page used to light up twice — once under Recent and again under Apps.
                isCanonical={indexOffset !== NOT_NAVIGABLE}
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
