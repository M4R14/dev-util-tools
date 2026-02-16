import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X,
  Github,
  ChevronRight
} from 'lucide-react';
import { ToolID, ToolMetadata } from './types';
import { TOOLS } from './config/tools';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CommandPalette from './components/CommandPalette';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './components/Dashboard';
import JSONFormatter from './components/tools/JSONFormatter';
import Base64Tool from './components/tools/Base64Tool';
import CaseConverter from './components/tools/CaseConverter';
import PasswordGenerator from './components/tools/PasswordGenerator';
import AIAssistant from './components/tools/AIAssistant';
import ThaiDateConverter from './components/tools/ThaiDateConverter';
import TimezoneConverter from './components/tools/TimezoneConverter';
import CrontabTool from './components/tools/CrontabTool';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [favorites, setFavorites] = useState<ToolID[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [recents, setRecents] = useState<ToolID[]>(() => {
    const saved = localStorage.getItem('recents');
    return saved ? JSON.parse(saved) : [];
  });

  const location = useLocation();

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

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('recents', JSON.stringify(recents));
  }, [recents]);

  useEffect(() => {
    if (activeTool && activeTool.id) {
       setRecents(prev => {
         // Avoid adding if already at top
         if (prev[0] === activeTool.id) return prev;
         
         const newRecents = [activeTool.id, ...prev.filter(id => id !== activeTool.id)].slice(0, 8);
         return JSON.stringify(newRecents) !== JSON.stringify(prev) ? newRecents : prev;
       });
    }
  }, [activeTool?.id]);

  const toggleFavorite = (id: ToolID) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fid => fid !== id)
        : [...prev, id]
    );
  };

  return (
    <ThemeProvider>
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 overflow-hidden transition-colors duration-200">
      
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tools={TOOLS}
      />

      <Sidebar 
        tools={TOOLS} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        favorites={favorites}
        recents={recents}
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
                <>
                <div className="mb-6 md:mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                      <span className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                        {activeTool.icon}
                      </span>
                      {activeTool.name}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-lg ml-14">{activeTool.description}</p>
                </div>
                
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl dark:shadow-2xl overflow-hidden backdrop-blur-sm transition-colors">
                  <Routes>
                    <Route path={`/${ToolID.JSON_FORMATTER}`} element={<JSONFormatter />} />
                    <Route path={`/${ToolID.BASE64_TOOL}`} element={<Base64Tool />} />
                    <Route path={`/${ToolID.CASE_CONVERTER}`} element={<CaseConverter />} />
                    <Route path={`/${ToolID.PASSWORD_GEN}`} element={<PasswordGenerator />} />
                    <Route path={`/${ToolID.TIMEZONE_CONVERTER}`} element={<TimezoneConverter />} />
                    <Route path={`/${ToolID.THAI_DATE_CONVERTER}`} element={<ThaiDateConverter />} />
                    <Route path={`/${ToolID.CRONTAB}`} element={<CrontabTool />} />
                    <Route path={`/${ToolID.AI_ASSISTANT}`} element={<AIAssistant />} />
                  </Routes>
                </div>
                </>
            ) : (
                <Routes>
                    <Route path="/" element={
                        <Dashboard 
                            tools={TOOLS}
                            favorites={favorites}
                            recents={recents}
                            searchTerm={searchTerm}
                            onSearch={setSearchTerm}
                            onToggleFavorite={toggleFavorite}
                        />
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            )}
          </div>
        </main>

        <footer className="p-4 text-center text-slate-500 dark:text-slate-600 text-xs border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          DevPulse © {new Date().getFullYear()} • Privacy-first Client-side Processing
        </footer>
      </div>
    </div>
    </ThemeProvider>
  );
};

export default App;
