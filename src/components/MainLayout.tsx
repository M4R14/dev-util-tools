import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
} from './main-layout';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MAIN_CONTENT_ID = 'main-content';

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const location = useLocation();
  const mainContentRef = useRef<HTMLElement>(null);
  const { favorites, toggleFavorite } = useUserPreferences();
  const { searchTerm, setSearchTerm } = useSearch();
  const commandActions = useCommandPaletteActions();
  const toggleCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen((previous) => !previous);
  }, []);
  useCommandPaletteHotkey(toggleCommandPalette);

  const pageMeta = useMemo(() => resolveMainLayoutPageMeta(location.pathname), [location.pathname]);
  const activeTool = pageMeta.activeTool;

  useEffect(() => {
    document.title = getMainLayoutDocumentTitle(pageMeta);
  }, [pageMeta]);

  useEffect(() => {
    setIsSidebarOpen(false);

    const mainElement = mainContentRef.current;
    if (!mainElement) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    mainElement.scrollTo({
      top: 0,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [pageMeta.normalizedPathname]);

  return (
    <div className="relative flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      <BackgroundDecor />
      <SkipToMainContentLink targetId={MAIN_CONTENT_ID} />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        actions={commandActions}
      />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 bg-background/80 backdrop-blur-sm transition-colors">
        <Header
          title={pageMeta.pageTitle}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          isFavorite={activeTool ? favorites.includes(activeTool.id) : false}
          onToggleFavorite={activeTool ? () => toggleFavorite(activeTool.id) : undefined}
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

      {!isCommandPaletteOpen && (
        <MobileCommandPaletteButton onOpen={() => setIsCommandPaletteOpen(true)} />
      )}
    </div>
  );
};

export default MainLayout;
