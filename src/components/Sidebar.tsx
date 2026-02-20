import React from 'react';
import { cn } from '../lib/utils';
import { useSidebarNavigation } from './sidebar/useSidebarNavigation';
import SidebarBrand from './sidebar/SidebarBrand';
import SidebarSearch from './sidebar/SidebarSearch';
import SidebarNavigation from './sidebar/SidebarNavigation';
import SidebarFooter from './sidebar/SidebarFooter';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    searchTerm,
    setSearchTerm,
    filteredTools,
    favoriteTools,
    recentTools,
    selectedIndex,
    favorites,
    internalTools,
    externalTools,
  } = useSidebarNavigation(onClose);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 w-64 bg-background border-r border-border z-50 transition-all duration-300 transform flex flex-col shadow-2xl md:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <SidebarBrand />
        <SidebarSearch searchTerm={searchTerm} onSearch={setSearchTerm} />
        <SidebarNavigation
          searchTerm={searchTerm}
          filteredTools={filteredTools}
          favoriteTools={favoriteTools}
          recentTools={recentTools}
          internalTools={internalTools}
          externalTools={externalTools}
          selectedIndex={selectedIndex}
          favorites={favorites}
          onClose={onClose}
        />
        <SidebarFooter />
      </aside>
    </>
  );
};

export default React.memo(Sidebar);
