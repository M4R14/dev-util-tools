import React, { Suspense, lazy, ComponentType } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToolID } from './types';
import MainLayout from './components/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import { SearchProvider } from './context/SearchContext';

// Lazy-loaded tool pages — each becomes its own chunk
const Dashboard = lazy(() => import('./components/Dashboard'));
const AIAgentBridge = lazy(() => import('./components/AIAgentBridge'));
const Blog = lazy(() => import('./components/Blog'));
const Settings = lazy(() => import('./components/Settings'));

/** Map each ToolID to its lazy-loaded component. */
const TOOL_COMPONENTS: Record<ToolID, React.LazyExoticComponent<ComponentType>> = {
  [ToolID.JSON_FORMATTER]: lazy(() => import('./components/tools/JSONFormatter')),
  [ToolID.BASE64_TOOL]: lazy(() => import('./components/tools/Base64Tool')),
  [ToolID.CASE_CONVERTER]: lazy(() => import('./components/tools/CaseConverter')),
  [ToolID.PASSWORD_GEN]: lazy(() => import('./components/tools/PasswordGenerator')),
  [ToolID.AI_ASSISTANT]: lazy(() => import('./components/tools/AIAssistant')),
  [ToolID.THAI_DATE_CONVERTER]: lazy(() => import('./components/tools/thai-date')),
  [ToolID.THAI_ID]: lazy(() => import('./components/tools/ThaiIdTool')),
  [ToolID.TIMEZONE_CONVERTER]: lazy(() => import('./components/tools/TimezoneConverter')),
  [ToolID.CRONTAB]: lazy(() => import('./components/tools/CrontabTool')),
  [ToolID.WORD_COUNTER]: lazy(() => import('./components/tools/WordCounterTool')),
  [ToolID.WHEEL_RANDOM]: lazy(() => import('./components/tools/WheelRandomTool')),
  [ToolID.DUMMY_IMAGE]: lazy(() => import('./components/tools/DummyImageTool')),
  [ToolID.UUID_GENERATOR]: lazy(() => import('./components/tools/UUIDGenerator')),
  [ToolID.URL_PARSER]: lazy(() => import('./components/tools/UrlParser')),
  [ToolID.DIFF_VIEWER]: lazy(() => import('./components/tools/DiffViewer')),
  [ToolID.REGEX_TESTER]: lazy(() => import('./components/tools/RegexTester')),
  [ToolID.XML_FORMATTER]: lazy(() => import('./components/tools/XMLFormatter')),
  [ToolID.XML_TO_JSON]: lazy(() => import('./components/tools/XMLToJson')),
};

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
        <SearchProvider>
          <MainLayout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {Object.entries(TOOL_COMPONENTS).map(([toolId, LazyComponent]) => (
                  <Route
                    key={toolId}
                    path={`/${toolId}`}
                    element={
                      <ErrorBoundary>
                        <LazyComponent />
                      </ErrorBoundary>
                    }
                  />
                ))}

                <Route path="/" element={<Dashboard />} />
                <Route
                  path="/blog"
                  element={
                    <ErrorBoundary>
                      <Blog />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ErrorBoundary>
                      <Settings />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/ai-bridge"
                  element={
                    <ErrorBoundary>
                      <AIAgentBridge />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/ai-bridge/catalog"
                  element={
                    <ErrorBoundary>
                      <AIAgentBridge />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/ai-bridge/spec"
                  element={
                    <ErrorBoundary>
                      <AIAgentBridge />
                    </ErrorBoundary>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </MainLayout>
        </SearchProvider>
      </UserPreferencesProvider>
    </ThemeProvider>
  );
};

export default App;
