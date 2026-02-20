import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CommandPalette from './CommandPalette';
import ToolPageLayout from './ToolPageLayout';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useSearch } from '../context/SearchContext';
import { Toaster } from './ui/sonner';
import {
  BackgroundDecor,
  getMainLayoutDocumentTitle,
  MainContentWrapper,
  MainFooter,
  MobileCommandPaletteButton,
  resolveMainLayoutPageMeta,
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
  const { searchTerm, setSearchTerm } = useSearch();
  const { sidebar, commandPalette } = useMainLayoutState();
  const commandActions = useCommandPaletteActions();
  useCommandPaletteHotkey(commandPalette.toggle);

  const pageMeta = useMemo(() => resolveMainLayoutPageMeta(location.pathname), [location.pathname]);
  const activeTool = pageMeta.activeTool;
  const handleToggleFavorite = useCallback(() => {
    if (!activeTool) {
      return;
    }
    toggleFavorite(activeTool.id);
  }, [activeTool, toggleFavorite]);

  useEffect(() => {
    document.title = getMainLayoutDocumentTitle(pageMeta);
  }, [pageMeta]);

  useMainLayoutRouteEffects({
    pathname: pageMeta.normalizedPathname,
    mainContentRef,
    closeSidebar: sidebar.close,
  });

  return (
    <div className="relative flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      <BackgroundDecor />
      <SkipToMainContentLink targetId={MAIN_CONTENT_ID} />

      <CommandPalette
        isOpen={commandPalette.isOpen}
        onClose={commandPalette.close}
        actions={commandActions}
      />

      <Sidebar isOpen={sidebar.isOpen} onClose={sidebar.close} />

      <div className="flex-1 flex flex-col min-w-0 bg-background/80 backdrop-blur-sm transition-colors">
        <Header
          title={pageMeta.pageTitle}
          onToggleSidebar={sidebar.toggle}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          isFavorite={activeTool ? favorites.includes(activeTool.id) : false}
          onToggleFavorite={activeTool ? handleToggleFavorite : undefined}
          showSearch={!!activeTool}
        />

        <MainContentWrapper
          contentId={MAIN_CONTENT_ID}
          contentRef={mainContentRef}
          pageTitle={pageMeta.pageTitle}
          pageDescription={pageMeta.pageDescription}
        >
          {activeTool ? <ToolPageLayout tool={activeTool}>{children}</ToolPageLayout> : children}
        </MainContentWrapper>

        <Toaster />
        <MainFooter />
      </div>

      {!commandPalette.isOpen && <MobileCommandPaletteButton onOpen={commandPalette.open} />}
    </div>
  );
};

export default MainLayout;
