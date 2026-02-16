import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToolID } from './types';
import { TOOLS } from './config/tools';
import MainLayout from './components/MainLayout';
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
      <MainLayout
        favorites={favorites}
        recents={recents}
        onToggleFavorite={toggleFavorite}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      >
        <Routes>
          <Route path={`/${ToolID.JSON_FORMATTER}`} element={<JSONFormatter />} />
          <Route path={`/${ToolID.BASE64_TOOL}`} element={<Base64Tool />} />
          <Route path={`/${ToolID.CASE_CONVERTER}`} element={<CaseConverter />} />
          <Route path={`/${ToolID.PASSWORD_GEN}`} element={<PasswordGenerator />} />
          <Route path={`/${ToolID.TIMEZONE_CONVERTER}`} element={<TimezoneConverter />} />
          <Route path={`/${ToolID.THAI_DATE_CONVERTER}`} element={<ThaiDateConverter />} />
          <Route path={`/${ToolID.CRONTAB}`} element={<CrontabTool />} />
          <Route path={`/${ToolID.AI_ASSISTANT}`} element={<AIAssistant />} />
          
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
      </MainLayout>
    </ThemeProvider>
  );
};

export default App;
