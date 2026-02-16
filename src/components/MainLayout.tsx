import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CommandPalette from './CommandPalette';
import ToolPageLayout from './ToolPageLayout';
import { ToolID } from '../types';
import { TOOLS } from '../data/tools';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { Toaster } from './ui/sonner';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const location = useLocation();
  const { 
    favorites, 
    recents, 
    toggleFavorite, 
    searchTerm, 
    setSearchTerm 
  } = useUserPreferences();

  const activeToolId = location.pathname.substring(1) as ToolID;
  const activeTool = TOOLS.find(t => t.id === activeToolId);

  useEffect(() => {
    if (activeTool) {
      document.title = `${activeTool.name} - DevPulse`;
    } else {
      document.title = 'DevPulse - Developer Utilities';
    }
  }, [activeTool]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsCommandPaletteOpen(prev => !prev);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 overflow-hidden transition-colors duration-200">
      
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 transition-colors">
        <Header 
          title={activeTool?.name || 'Dashboard'} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          isFavorite={activeTool ? favorites.includes(activeTool.id) : false}
          onToggleFavorite={activeTool ? () => toggleFavorite(activeTool.id) : undefined}
          showSearch={!!activeTool} // Hide search in header on dashboard since it has its own
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-900/50 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          <div className="max-w-7xl mx-auto animate-fadeIn min-h-full">
            {activeTool ? (
                <ToolPageLayout tool={activeTool}>
                  {children}
                </ToolPageLayout>
            ) : (
                children
            )}
          </div>
        </main>

        <Toaster />
        <footer className="p-4 text-center text-slate-500 dark:text-slate-600 text-xs border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          DevPulse © {new Date().getFullYear()} • Privacy-first Client-side Processing
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
