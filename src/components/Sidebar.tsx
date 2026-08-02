import React, { useEffect, useRef } from 'react';
import { Command, PanelLeftClose } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  SidebarBrand,
  SidebarFooter,
  SidebarNavigation,
  SidebarSearch,
  SidebarSelectionAnnouncer,
  useSidebarNavigation,
} from './sidebar/index';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useIsDesktopViewport } from '../hooks/useMediaQuery';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Desktop-only. `isOpen` is the mobile drawer; this hides the permanent column so a tool — or a
   * split pair of them — gets the full width. Every tool stays reachable via the command palette.
   */
  isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed = false }) => {
  const {
    searchTerm,
    setSearchTerm,
    searchActive,
    sections,
    selectedIndex,
    favorites,
    toggleFavorite,
    toggleSection,
    visibleTools,
  } = useSidebarNavigation(onClose);

  const asideRef = useRef<HTMLElement>(null);
  // Below md the sidebar is an overlay over the content, so it behaves as a modal. At md and up it
  // sits permanently beside the content and must not capture focus.
  const isDesktop = useIsDesktopViewport();
  useFocusTrap(asideRef, { active: isOpen && !isDesktop });

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/65 z-40 md:hidden backdrop-blur-sm transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        ref={asideRef}
        className={cn(
          'fixed md:static inset-y-0 left-0 w-[17.5rem] bg-background/95 border-r border-border z-50 transition-all duration-300 transform flex flex-col shadow-2xl md:shadow-none backdrop-blur supports-[backdrop-filter]:bg-background/90',
          isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 md:opacity-100',
          'md:translate-x-0',
          // Collapsed applies at md and up only; the mobile drawer keeps its own open/closed state.
          isCollapsed && 'md:hidden',
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="relative">
          <SidebarBrand />
          <button
            type="button"
            className="md:hidden absolute right-3 top-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        <SidebarSearch searchTerm={searchTerm} onSearch={setSearchTerm} />

        {/*
          A four-chip summary strip used to sit here showing Favorites/Recent/Apps/External counts.
          It repeated, in 10px type with no visible labels, exactly the counts the section headers
          below carry with their names attached.
        */}
        {!searchActive && (
          <p className="px-4 pb-2 text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
            <Command className="w-3 h-3" aria-hidden="true" />
            Press Cmd/Ctrl + K for command palette
          </p>
        )}

        <SidebarNavigation
          sections={sections}
          searchTerm={searchTerm}
          selectedIndex={selectedIndex}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onToggleSection={toggleSection}
          onClose={onClose}
        />
        <SidebarSelectionAnnouncer tools={visibleTools} selectedIndex={selectedIndex} />
        <SidebarFooter />
      </aside>
    </>
  );
};

export default React.memo(Sidebar);
