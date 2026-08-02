import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CommandPalette from './CommandPalette';
import ToolPageLayout from './ToolPageLayout';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useSearch } from '../context/SearchContext';
import { Toaster } from './ui/sonner';
import { resolvePageMeta } from '../lib/platform/pageMeta';
import { useScrollLock } from '../hooks/ui/useScrollLock';
import { useScrolledPast } from '../hooks/ui/useScrolledPast';
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed';
import { SendToToolProvider } from '../context/SendToToolContext';
import {
  BackgroundDecor,
  MainContentWrapper,
  MainFooter,
  MobileCommandPaletteButton,
  SkipToMainContentLink,
  useCommandPaletteActions,
  useCommandPaletteHotkey,
  useMainLayoutRouteEffects,
  useMainLayoutState,
} from './main-layout';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MAIN_CONTENT_ID = 'main-content';

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const mainContentRef = useRef<HTMLElement>(null);
  const { favorites, toggleFavorite } = useUserPreferences();
  // Only the setter is needed now: the header's duplicate search input is gone, and the sidebar
  // owns the input that reads this value. The layout still clears it on navigation.
  const { setSearchTerm } = useSearch();
  const { sidebar, commandPalette } = useMainLayoutState();
  const sidebarCollapsed = useSidebarCollapsed();
  const commandActions = useCommandPaletteActions();
  useCommandPaletteHotkey(commandPalette.toggle);

  // The lock lives here rather than inside CommandPalette because this is the component that owns
  // the scroll container. `<main>` scrolls, not the body, so the usual body-overflow trick is a
  // no-op in this shell.
  useScrollLock(mainContentRef, commandPalette.isOpen);

  // Roughly the height of a tool page's heading block; past it the heading is off screen.
  const isScrolled = useScrolledPast(mainContentRef, 80);

  const pageMeta = useMemo(() => resolvePageMeta(location.pathname), [location.pathname]);
  const activeTool = pageMeta.activeTool;
  const handleToggleFavorite = useCallback(() => {
    if (!activeTool) {
      return;
    }
    toggleFavorite(activeTool.id);
  }, [activeTool, toggleFavorite]);

  useEffect(() => {
    document.title = pageMeta.documentTitle;
  }, [pageMeta.documentTitle]);

  const clearSearch = useCallback(() => setSearchTerm(''), [setSearchTerm]);

  useMainLayoutRouteEffects({
    pathname: pageMeta.normalizedPathname,
    mainContentRef,
    closeSidebar: sidebar.close,
    clearSearch,
  });

  return (
    <div className="relative flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      <BackgroundDecor />
      <SkipToMainContentLink targetId={MAIN_CONTENT_ID} />

      {/*
        The provider wraps everything below so any tool output can offer "send to…", and it opens
        the command palette rather than a bespoke picker — the palette is already a searchable,
        keyboard-driven tool list.
      */}
      <SendToToolProvider onRequestPicker={commandPalette.open}>
        <CommandPalette
          isOpen={commandPalette.isOpen}
          onClose={commandPalette.close}
          actions={commandActions}
        />

        <Sidebar
          isOpen={sidebar.isOpen}
          onClose={sidebar.close}
          isCollapsed={sidebarCollapsed.isCollapsed}
        />

        <div className="flex-1 flex flex-col min-w-0 bg-background/80 backdrop-blur-sm transition-colors">
          <Header
            title={pageMeta.pageTitle}
            onToggleSidebar={sidebar.toggle}
            onToggleSidebarCollapsed={sidebarCollapsed.toggle}
            sidebarCollapsed={sidebarCollapsed.isCollapsed}
            isFavorite={activeTool ? favorites.includes(activeTool.id) : false}
            onToggleFavorite={activeTool ? handleToggleFavorite : undefined}
            // Tool pages render their own large heading, so the header only echoes it once that
            // heading has scrolled away. Other pages have no such heading and always need it.
            showTitle={!activeTool || isScrolled}
          />

          <MainContentWrapper
            contentId={MAIN_CONTENT_ID}
            contentRef={mainContentRef}
            pageTitle={pageMeta.pageTitle}
            pageDescription={pageMeta.pageDescription}
            footer={<MainFooter />}
          >
            {activeTool ? <ToolPageLayout tool={activeTool}>{children}</ToolPageLayout> : children}
          </MainContentWrapper>

          <Toaster />
        </div>

        {!commandPalette.isOpen && <MobileCommandPaletteButton onOpen={commandPalette.open} />}
      </SendToToolProvider>
    </div>
  );
};

export default MainLayout;
