
import React, { useMemo, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { 
  Code2, 
  Binary, 
  Type, 
  Lock, 
  Sparkles, 
  CalendarDays,
  Globe,
  Menu, 
  X,
  Github,
  ChevronRight,
  Clock
} from 'lucide-react';
import { ToolID, ToolMetadata } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
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

  const tools: ToolMetadata[] = useMemo(() => [
    { 
      id: ToolID.JSON_FORMATTER, 
      name: 'JSON Formatter', 
      description: 'Prettify, minify, and validate JSON data.',
      icon: <Code2 className="w-5 h-5" /> 
    },
    { 
      id: ToolID.BASE64_TOOL, 
      name: 'Base64 Tool', 
      description: 'Encode and decode strings to Base64 format.',
      icon: <Binary className="w-5 h-5" /> 
    },
    { 
      id: ToolID.CASE_CONVERTER, 
      name: 'Case Converter', 
      description: 'Switch between camelCase, PascalCase, and more.',
      icon: <Type className="w-5 h-5" /> 
    },
    { 
      id: ToolID.PASSWORD_GEN, 
      name: 'Password Generator', 
      description: 'Create secure, random passwords instantly.',
      icon: <Lock className="w-5 h-5" /> 
    },
    { 
      id: ToolID.TIMEZONE_CONVERTER, 
      name: 'Timezone Converter', 
      description: 'Convert date and time across different timezones.',
      icon: <Globe className="w-5 h-5" /> 
    },
    { 
      id: ToolID.THAI_DATE_CONVERTER, 
      name: 'Thai Date Converter', 
      description: 'Convert dates to various Thai formats (BE 25xx).',
      icon: <CalendarDays className="w-5 h-5" /> 
    },
    { 
      id: ToolID.CRONTAB, 
      name: 'Crontab Guru', 
      description: 'The quick and simple editor for cron schedule expressions.',
      icon: <Clock className="w-5 h-5" /> 
    },
    { 
      id: ToolID.AI_ASSISTANT, 
      name: 'AI Smart Assistant', 
      description: 'Analyze code snippets and solve dev problems with Gemini.',
      icon: <Sparkles className="w-5 h-5" /> 
    },
  ], []);

  const activeToolId = location.pathname.substring(1) as ToolID;
  const activeTool = tools.find(t => t.id === activeToolId) || tools[0];

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('recents', JSON.stringify(recents));
  }, [recents]);

  useEffect(() => {
    if (activeTool && activeTool.id) {
       setRecents(prev => {
         const newRecents = [activeTool.id, ...prev.filter(id => id !== activeTool.id)].slice(0, 5);
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
    <div className="flex h-screen bg-slate-900 text-slate-200 overflow-hidden">
      
      <Sidebar 
        tools={tools} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        favorites={favorites}
        recents={recents}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title={activeTool?.name || 'DevPulse'} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          isFavorite={activeTool ? favorites.includes(activeTool.id) : false}
          onToggleFavorite={() => activeTool && toggleFavorite(activeTool.id)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-900">
          <div className="max-w-6xl mx-auto animate-fadeIn">
            {activeTool && (
                <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    {activeTool.icon}
                    {activeTool.name}
                </h1>
                <p className="text-slate-400">{activeTool.description}</p>
                </div>
            )}
            
            <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden backdrop-blur-sm">
              <Routes>
                <Route path="/" element={<Navigate to={`/${ToolID.JSON_FORMATTER}`} replace />} />
                <Route path={`/${ToolID.JSON_FORMATTER}`} element={<JSONFormatter />} />
                <Route path={`/${ToolID.BASE64_TOOL}`} element={<Base64Tool />} />
                <Route path={`/${ToolID.CASE_CONVERTER}`} element={<CaseConverter />} />
                <Route path={`/${ToolID.PASSWORD_GEN}`} element={<PasswordGenerator />} />
                <Route path={`/${ToolID.TIMEZONE_CONVERTER}`} element={<TimezoneConverter />} />
                <Route path={`/${ToolID.THAI_DATE_CONVERTER}`} element={<ThaiDateConverter />} />
                <Route path={`/${ToolID.CRONTAB}`} element={<CrontabTool />} />
                <Route path={`/${ToolID.AI_ASSISTANT}`} element={<AIAssistant />} />
                <Route path="*" element={<Navigate to={`/${ToolID.JSON_FORMATTER}`} replace />} />
              </Routes>
            </div>
          </div>
        </main>


        <footer className="p-4 text-center text-slate-500 text-xs border-t border-slate-800">
          DevPulse © {new Date().getFullYear()} • Privacy-first Client-side Processing
        </footer>
      </div>
    </div>
  );
};

export default App;
