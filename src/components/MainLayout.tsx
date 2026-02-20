import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Command } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import CommandPalette from './CommandPalette';
import ToolPageLayout from './ToolPageLayout';
import { Button } from './ui/Button';
import { ToolID } from '../types';
import { TOOLS } from '../data/tools';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useSearch } from '../context/SearchContext';
import { Toaster } from './ui/sonner';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const location = useLocation();
  const mainContentRef = useRef<HTMLElement>(null);
  const { favorites, toggleFavorite } = useUserPreferences();
  const { searchTerm, setSearchTerm } = useSearch();

  const normalizedPathname = location.pathname.replace(/\/+$/, '') || '/';
  const activeToolId = normalizedPathname.split('/')[1] as ToolID;
  const activeTool = TOOLS.find((t) => t.id === activeToolId);
  const isBlogPage = normalizedPathname === '/blog';
  const isAIBridgePage = normalizedPathname.startsWith('/ai-bridge');
  const pageTitle = activeTool?.name || (isBlogPage ? 'Blog' : isAIBridgePage ? 'AI Bridge' : 'Dashboard');
  const pageDescription =
    activeTool?.description ||
    (isBlogPage
      ? 'Product updates, release notes, and workflow tips.'
      : isAIBridgePage
        ? 'Machine-friendly tool execution and schema reference.'
        : 'Explore tools, favorites, and recently used workflows.');

  useEffect(() => {
    if (activeTool) {
      document.title = `${activeTool.name} - DevPulse`;
    } else if (isBlogPage) {
      document.title = 'Blog - DevPulse';
    } else if (isAIBridgePage) {
      document.title = 'AI Bridge - DevPulse';
    } else {
      document.title = 'DevPulse - Developer Utilities';
    }
  }, [activeTool, isBlogPage, isAIBridgePage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);

    const mainElement = mainContentRef.current;
    if (!mainElement) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    mainElement.scrollTo({
      top: 0,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [normalizedPathname]);

  return (
    <div className="relative flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/3 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--primary)/0.07),transparent_38%),radial-gradient(circle_at_78%_84%,hsl(var(--foreground)/0.04),transparent_34%)]" />
      </div>

      {/* Skip to content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:ring-2 focus:ring-primary/40"
      >
        Skip to main content
      </a>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/80 backdrop-blur-sm transition-colors">
        <Header
          title={pageTitle}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          isFavorite={activeTool ? favorites.includes(activeTool.id) : false}
          onToggleFavorite={activeTool ? () => toggleFavorite(activeTool.id) : undefined}
          showSearch={!!activeTool} // Hide search in header on dashboard since it has its own
        />

        <main
          id="main-content"
          ref={mainContentRef}
          tabIndex={-1}
          className="flex-1 overflow-y-auto px-4 py-5 pb-20 md:px-8 md:py-8 lg:px-10 bg-gradient-to-b from-muted/35 via-background to-background scrollbar-thin scrollbar-thumb-border/70 dark:scrollbar-thumb-border/50 focus-visible:outline-none"
          aria-label={pageTitle}
          aria-description={pageDescription}
        >
          <div className="max-w-7xl mx-auto min-h-full animate-in fade-in duration-300">
            {activeTool ? <ToolPageLayout tool={activeTool}>{children}</ToolPageLayout> : children}
          </div>
        </main>

        <Toaster />
        <footer className="px-4 py-3 text-center text-muted-foreground text-xs border-t border-border/60 bg-background/80 backdrop-blur-sm">
          <span className="font-medium text-foreground/80">DevPulse</span> © {new Date().getFullYear()} • Privacy-first client-side processing
        </footer>
      </div>

      {!isCommandPaletteOpen && (
        <div className="fixed bottom-4 right-4 z-40 md:hidden">
          <Button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="h-10 rounded-full border border-primary/25 bg-background/90 px-4 shadow-lg backdrop-blur-md"
            aria-label="Open command palette"
          >
            <Command className="w-4 h-4 mr-2" aria-hidden="true" />
            <span className="text-xs font-semibold">Quick Search</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
