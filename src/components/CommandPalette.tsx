import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Command, X, ArrowRight, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToolSearch } from '../hooks/useToolSearch';
import type { ToolMetadata } from '../types';

export interface CommandPaletteAction {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  keywords?: string[];
  onSelect: () => void | Promise<void>;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions?: CommandPaletteAction[];
}

type CommandPaletteItem =
  | { type: 'action'; id: string; action: CommandPaletteAction }
  | { type: 'tool'; id: string; tool: ToolMetadata };

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, actions = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();

  const filteredTools = useToolSearch(searchTerm);
  const filteredActions = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return actions;

    return actions.filter((action) => {
      const haystack = [action.name, action.description, ...(action.keywords ?? [])]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [actions, searchTerm]);
  const items = useMemo<CommandPaletteItem[]>(
    () => [
      ...filteredActions.map((action) => ({
        type: 'action' as const,
        id: `action-${action.id}`,
        action,
      })),
      ...filteredTools.map((tool) => ({
        type: 'tool' as const,
        id: `tool-${tool.id}`,
        tool,
      })),
    ],
    [filteredActions, filteredTools],
  );

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
    if (items.length === 0) {
      if (e.key === 'Escape') {
        onClose();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        void handleSelect(items[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = async (item: CommandPaletteItem) => {
    if (item.type === 'tool') {
      navigate(`/${item.tool.id}`);
      onClose();
      return;
    }

    onClose();
    try {
      await item.action.onSelect();
    } catch {
      // no-op: action handlers are expected to surface user-facing errors
    }
  };

  // Ensure selected item is scrolled into view
  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      (listRef.current.children[selectedIndex] as HTMLElement).scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex, items.length]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
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
            aria-label="Search commands"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            aria-activedescendant={items[selectedIndex] ? `command-item-${items[selectedIndex].id}` : undefined}
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden md:inline-flex h-6 px-2 items-center bg-muted border border-border rounded text-xs text-muted-foreground font-mono">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close command palette"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {items.length > 0 ? (
            <ul
              ref={listRef}
              className="p-2 space-y-1"
              role="listbox"
              id="command-palette-list"
              aria-label="Available commands"
            >
              {items.map((item, index) => {
                const isAction = item.type === 'action';
                const itemId = item.id;
                const title = isAction ? item.action.name : item.tool.name;
                const description = isAction ? item.action.description : item.tool.description;
                const Icon = isAction ? item.action.icon : item.tool.icon;

                return (
                  <li
                    key={itemId}
                    role="option"
                    id={`command-item-${itemId}`}
                    aria-selected={index === selectedIndex}
                  >
                    <button
                      onClick={() => void handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      tabIndex={-1}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-all ${
                        index === selectedIndex
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'text-muted-foreground hover:bg-muted/50 border border-transparent'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate flex items-center justify-between">
                          {title}
                          {index === selectedIndex && <ArrowRight className="w-4 h-4 opacity-50" />}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {description}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="py-12 px-4 text-center text-muted-foreground">
              <Command className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>
                No commands found matching &ldquo;
                <span className="text-foreground">{searchTerm}</span>
                &rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-muted/50 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="bg-muted border border-border rounded px-1.5 py-0.5 font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="bg-muted border border-border rounded px-1.5 py-0.5 font-mono text-[10px]">
                ↓
              </kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="bg-muted border border-border rounded px-1.5 py-0.5 font-mono text-[10px]">
                ↵
              </kbd>
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
