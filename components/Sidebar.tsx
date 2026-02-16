
import React from 'react';
import { ToolID, ToolMetadata } from '../types';
import { Sparkles, LayoutDashboard } from 'lucide-react';

interface SidebarProps {
  tools: ToolMetadata[];
  activeId: ToolID;
  onSelect: (id: ToolID) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ tools, activeId, onSelect, isOpen }) => {
  return (
    <aside 
      className={`fixed md:static inset-y-0 left-0 w-64 bg-slate-950 border-r border-slate-800 z-50 transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 flex flex-col`}
    >
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">DevPulse</span>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Essential Tools</div>
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onSelect(tool.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeId === tool.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <span className={`${activeId === tool.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
              {tool.icon}
            </span>
            <span className="font-medium">{tool.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-indigo-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Gemini Powered</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Try the AI Smart Assistant for complex coding questions.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
