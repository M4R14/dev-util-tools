import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToolID } from './types';
import MainLayout from './components/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { UserPreferencesProvider } from './context/UserPreferencesContext';

// Lazy-loaded tool pages — each becomes its own chunk
const Dashboard = lazy(() => import('./components/Dashboard'));
const JSONFormatter = lazy(() => import('./components/tools/JSONFormatter'));
const Base64Tool = lazy(() => import('./components/tools/Base64Tool'));
const CaseConverter = lazy(() => import('./components/tools/CaseConverter'));
const PasswordGenerator = lazy(() => import('./components/tools/PasswordGenerator'));
const AIAssistant = lazy(() => import('./components/tools/AIAssistant'));
const ThaiDateConverter = lazy(() => import('./components/tools/ThaiDateConverter'));
const TimezoneConverter = lazy(() => import('./components/tools/TimezoneConverter'));
const CrontabTool = lazy(() => import('./components/tools/CrontabTool'));
const UUIDGenerator = lazy(() => import('./components/tools/UUIDGenerator'));
const UrlParser = lazy(() => import('./components/tools/UrlParser'));

// Lightweight loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-muted-foreground">Loading…</span>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <UserPreferencesProvider>
        <MainLayout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route
                path={`/${ToolID.URL_PARSER}`}
                element={
                  <ErrorBoundary>
                    <UrlParser />
                  </ErrorBoundary>
                }
              />
              <Route
                path={`/${ToolID.UUID_GENERATOR}`}
                element={
                  <ErrorBoundary>
                    <UUIDGenerator />
                  </ErrorBoundary>
                }
              />
              <Route
                path={`/${ToolID.JSON_FORMATTER}`}
                element={
                  <ErrorBoundary>
                    <JSONFormatter />
                  </ErrorBoundary>
                }
              />
              <Route
                path={`/${ToolID.BASE64_TOOL}`}
                element={
                  <ErrorBoundary>
                    <Base64Tool />
                  </ErrorBoundary>
                }
              />
              <Route
                path={`/${ToolID.CASE_CONVERTER}`}
                element={
                  <ErrorBoundary>
                    <CaseConverter />
                  </ErrorBoundary>
                }
              />
              <Route
                path={`/${ToolID.PASSWORD_GEN}`}
                element={
                  <ErrorBoundary>
                    <PasswordGenerator />
                  </ErrorBoundary>
                }
              />
              <Route
                path={`/${ToolID.TIMEZONE_CONVERTER}`}
                element={
                  <ErrorBoundary>
                    <TimezoneConverter />
                  </ErrorBoundary>
                }
              />
              <Route
                path={`/${ToolID.THAI_DATE_CONVERTER}`}
                element={
                  <ErrorBoundary>
                    <ThaiDateConverter />
                  </ErrorBoundary>
                }
              />
              <Route
                path={`/${ToolID.CRONTAB}`}
                element={
                  <ErrorBoundary>
                    <CrontabTool />
                  </ErrorBoundary>
                }
              />
              <Route
                path={`/${ToolID.AI_ASSISTANT}`}
                element={
                  <ErrorBoundary>
                    <AIAssistant />
                  </ErrorBoundary>
                }
              />

              <Route path="/" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </MainLayout>
      </UserPreferencesProvider>
    </ThemeProvider>
  );
};

export default App;
