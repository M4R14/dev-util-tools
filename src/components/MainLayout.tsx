import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CommandPalette from './CommandPalette';
import ToolPageLayout from './ToolPageLayout';
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
  const { favorites, toggleFavorite } = useUserPreferences();
  const { searchTerm, setSearchTerm } = useSearch();

  const activeToolId = location.pathname.substring(1) as ToolID;
  const activeTool = TOOLS.find((t) => t.id === activeToolId);
  const isBlogPage = location.pathname === '/blog';
  const isAIBridgePage = location.pathname.startsWith('/ai-bridge');
  const pageTitle = activeTool?.name || (isBlogPage ? 'Blog' : isAIBridgePage ? 'AI Bridge' : 'Dashboard');

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

  return (
    <div className="relative flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/3 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/10" />
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
          className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-8 lg:px-10 bg-gradient-to-b from-muted/35 via-background to-background scrollbar-thin scrollbar-thumb-border/70 dark:scrollbar-thumb-border/50"
          aria-label={pageTitle}
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
    </div>
  );
};

export default MainLayout;
