import React from 'react';
import { ToolID, ToolMetadata } from '../../types';
import ToolLinkItem from '../ToolLinkItem';

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

  return (
    <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto scrollbar-thin hover:scrollbar-thumb-muted-foreground/20 scrollbar-thumb-transparent transition-colors">
      {searchTerm ? (
        <>
          <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">
            Results
          </div>
          {filteredTools.length > 0 ? (
            filteredTools.map((tool, i) => renderToolLink(tool, 'search', i))
          ) : (
            <div className="px-3 py-8 text-center text-muted-foreground text-xs">
              No tools found
            </div>
          )}
        </>
      ) : (
        <>
          {favoriteTools.length > 0 && (
            <div className="mb-3">
              <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
                Favorites
              </div>
              <div className="space-y-0.5">
                {favoriteTools.map((tool, i) => renderToolLink(tool, 'fav', i))}
              </div>
            </div>
          )}

          {recentTools.length > 0 && (
            <div className="mb-3">
              <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
                Recent
              </div>
              <div className="space-y-0.5">
                {recentTools.map((tool, i) =>
                  renderToolLink(tool, 'rec', i + favoriteTools.length),
                )}
              </div>
            </div>
          )}

          <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">
            Apps
          </div>
          <div className="space-y-0.5">
            {internalTools.map((tool, i) =>
              renderToolLink(tool, 'all', i + favoriteTools.length + recentTools.length),
            )}
          </div>

          {externalTools.length > 0 && (
            <div className="mt-3">
              <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">
                External
              </div>
              <div className="space-y-0.5">
                {externalTools.map((tool, i) =>
                  renderToolLink(
                    tool,
                    'ext',
                    i + favoriteTools.length + recentTools.length + internalTools.length,
                  ),
                )}
              </div>
            </div>
          )}
        </>
      )}
    </nav>
  );
};

export default SidebarNavigation;
