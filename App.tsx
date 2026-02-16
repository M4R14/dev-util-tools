
import React, { useState, useMemo } from 'react';
import { 
  Code2, 
  Binary, 
  Type, 
  Lock, 
  Sparkles, 
  CalendarDays,
  Menu, 
  X,
  Github,
  ChevronRight
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

const App: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<ToolID>(ToolID.JSON_FORMATTER);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      id: ToolID.THAI_DATE_CONVERTER, 
      name: 'Thai Date Converter', 
      description: 'Convert dates to various Thai formats (BE 25xx).',
      icon: <CalendarDays className="w-5 h-5" /> 
    },
    { 
      id: ToolID.AI_ASSISTANT, 
      name: 'AI Smart Assistant', 
      description: 'Analyze code snippets and solve dev problems with Gemini.',
      icon: <Sparkles className="w-5 h-5" /> 
    },
  ], []);

  const activeTool = tools.find(t => t.id === activeToolId);

  const renderActiveTool = () => {
    switch (activeToolId) {
      case ToolID.JSON_FORMATTER: return <JSONFormatter />;
      case ToolID.BASE64_TOOL: return <Base64Tool />;
      case ToolID.CASE_CONVERTER: return <CaseConverter />;
      case ToolID.PASSWORD_GEN: return <PasswordGenerator />;
      case ToolID.THAI_DATE_CONVERTER: return <ThaiDateConverter />;
      case ToolID.AI_ASSISTANT: return <AIAssistant />;
      default: return <JSONFormatter />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        tools={tools} 
        activeId={activeToolId} 
        onSelect={(id) => {
          setActiveToolId(id);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title={activeTool?.name || 'DevPulse'} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto animate-fadeIn">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                {activeTool?.icon}
                {activeTool?.name}
              </h1>
              <p className="text-slate-400">{activeTool?.description}</p>
            </div>
            
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 shadow-xl overflow-hidden backdrop-blur-sm">
              {renderActiveTool()}
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
