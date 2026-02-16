import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToolID } from './types';
import MainLayout from './components/MainLayout';
import { ThemeProvider } from './context/ThemeContext';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
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
  return (
    <ThemeProvider>
      <UserPreferencesProvider>
        <MainLayout>
          <Routes>
            <Route path={`/${ToolID.JSON_FORMATTER}`} element={<JSONFormatter />} />
            <Route path={`/${ToolID.BASE64_TOOL}`} element={<Base64Tool />} />
            <Route path={`/${ToolID.CASE_CONVERTER}`} element={<CaseConverter />} />
            <Route path={`/${ToolID.PASSWORD_GEN}`} element={<PasswordGenerator />} />
            <Route path={`/${ToolID.TIMEZONE_CONVERTER}`} element={<TimezoneConverter />} />
            <Route path={`/${ToolID.THAI_DATE_CONVERTER}`} element={<ThaiDateConverter />} />
            <Route path={`/${ToolID.CRONTAB}`} element={<CrontabTool />} />
            <Route path={`/${ToolID.AI_ASSISTANT}`} element={<AIAssistant />} />
            
            <Route path="/" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </UserPreferencesProvider>
    </ThemeProvider>
  );
};

export default App;
