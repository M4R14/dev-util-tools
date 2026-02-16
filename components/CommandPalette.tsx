import React, { useEffect, useState, useRef } from 'react';
import { Search, Command, X, ArrowRight } from 'lucide-react';
import { ToolMetadata } from '../types';
import { useNavigate } from 'react-router-dom';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tools: ToolMetadata[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, tools }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
      // Focus input on open
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredTools.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredTools.length) % filteredTools.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTools[selectedIndex]) {
        handleSelect(filteredTools[selectedIndex].id);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (toolId: string) => {
    navigate(`/${toolId}`);
    onClose();
  };

  // Ensure selected item is scrolled into view
  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      (listRef.current.children[selectedIndex] as HTMLElement).scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700/50">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-lg text-slate-200 placeholder-slate-500 outline-none border-none focus:ring-0"
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden md:inline-flex h-6 px-2 items-center bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 font-mono">
              ESC
            </kbd>
            <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredTools.length > 0 ? (
            <ul ref={listRef} className="p-2 space-y-1">
              {filteredTools.map((tool, index) => (
                <li key={tool.id}>
                  <button
                    onClick={() => handleSelect(tool.id)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-all ${
                        index === selectedIndex 
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                        : 'text-slate-400 hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-200 truncate flex items-center justify-between">
                         {tool.name}
                         {index === selectedIndex && <ArrowRight className="w-4 h-4 opacity-50" />}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{tool.description}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 px-4 text-center text-slate-500">
              <Command className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No commands found matching "<span className="text-slate-300">{searchTerm}</span>"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-950/50 border-t border-slate-800/50 text-xs text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                    <kbd className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 font-mono text-[10px]">↑</kbd>
                    <kbd className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 font-mono text-[10px]">↓</kbd>
                    to navigate
                </span>
                <span className="flex items-center gap-1.5">
                    <kbd className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
                    to select
                </span>
            </div>
            <span>DevPulse Command Palette</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
