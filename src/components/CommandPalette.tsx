import React, { useEffect, useState, useRef } from 'react';
import { Search, Command, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToolSearch } from '../hooks/useToolSearch';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();

  const filteredTools = useToolSearch(searchTerm);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
      // Focus input on open
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

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
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-popover border border-border rounded-xl shadow-2xl shadow-black/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-lg text-foreground placeholder-muted-foreground outline-none border-none focus:ring-0"
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden md:inline-flex h-6 px-2 items-center bg-muted border border-border rounded text-xs text-muted-foreground font-mono">
              ESC
            </kbd>
            <button onClick={onClose} className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors">
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
                        ? 'bg-primary/20 text-primary border border-primary/30' 
                        : 'text-muted-foreground hover:bg-muted/50 border border-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate flex items-center justify-between">
                         {tool.name}
                         {index === selectedIndex && <ArrowRight className="w-4 h-4 opacity-50" />}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{tool.description}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 px-4 text-center text-muted-foreground">
              <Command className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No commands found matching "<span className="text-foreground">{searchTerm}</span>"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-muted/50 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                    <kbd className="bg-muted border border-border rounded px-1.5 py-0.5 font-mono text-[10px]">↑</kbd>
                    <kbd className="bg-muted border border-border rounded px-1.5 py-0.5 font-mono text-[10px]">↓</kbd>
                    to navigate
                </span>
                <span className="flex items-center gap-1.5">
                    <kbd className="bg-muted border border-border rounded px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
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
