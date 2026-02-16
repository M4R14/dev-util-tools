
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ToolID, ToolMetadata } from '../types';
import { Sparkles, LayoutDashboard, Search } from 'lucide-react';

interface SidebarProps {
  tools: ToolMetadata[];
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearch: (term: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ tools, isOpen, onClose, searchTerm, onSearch }) => {
  const location = useLocation();

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside 
        className={`fixed md:static inset-y-0 left-0 w-72 bg-slate-950 border-r border-slate-800/50 z-50 transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 flex flex-col shadow-2xl md:shadow-none`}
      >
        {/* Brand */}
        <div className="p-6 border-b border-slate-800/50 flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">DevPulse</h1>
            <p className="text-xs text-slate-500 font-medium">Developer Utility Suite</p>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 hover:scrollbar-thumb-slate-700">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {searchTerm ? 'Search Results' : 'All Tools'}
          </div>
          
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => (
              <NavLink
                key={tool.id}
                to={`/${tool.id}`}
                onClick={() => {
                   if (window.innerWidth < 768) onClose();
                }}
                className={({ isActive }) => `
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200 border border-transparent'
                  }
                `}
              >
                <span className={`p-1.5 rounded-md transition-colors ${
                  location.pathname === `/${tool.id}` 
                    ? 'bg-indigo-500/20 text-indigo-400' 
                    : 'bg-slate-800/50 text-slate-500 group-hover:text-slate-300 group-hover:bg-slate-800'
                }`}>
                  {tool.icon}
                </span>
                <div className="text-left flex-1 min-w-0">
                   <div className="font-medium truncate">{tool.name}</div>
                   {searchTerm && <div className="text-xs text-slate-500 truncate">{tool.description}</div>}
                </div>
                {location.pathname === `/${tool.id}` && (
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-auto"></div>
                )}
              </NavLink>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-slate-500 text-sm">
              No tools found matching "{searchTerm}"
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-xl">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 border border-slate-700/50 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl -mr-8 -mt-8 transition-all group-hover:bg-indigo-500/20"></div>
            <div className="flex items-center gap-2 mb-1.5 text-indigo-400 relative z-10">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">Gemini Powered</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed relative z-10">
              AI assistant ready to help with your code.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
