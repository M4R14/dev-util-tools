import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToolSearch } from '../hooks/useToolSearch';
import {
  buildCommandPaletteItems,
  CommandPaletteEmptyState,
  CommandPaletteFooter,
  CommandPaletteList,
  filterCommandPaletteActions,
  getCommandPaletteOptionId,
  type CommandPaletteItem,
  type CommandPaletteProps,
} from './command-palette';

export type { CommandPaletteAction } from './command-palette';

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, actions = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();

  const filteredTools = useToolSearch(searchTerm);
  const filteredActions = useMemo(
    () => filterCommandPaletteActions(actions, searchTerm),
    [actions, searchTerm],
  );
  const items = useMemo(
    () => buildCommandPaletteItems(filteredActions, filteredTools),
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
            aria-activedescendant={
              items[selectedIndex] ? getCommandPaletteOptionId(items[selectedIndex].id) : undefined
            }
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
            <CommandPaletteList
              items={items}
              selectedIndex={selectedIndex}
              listRef={listRef}
              onHoverItem={setSelectedIndex}
              onSelectItem={(item) => void handleSelect(item)}
            />
          ) : (
            <CommandPaletteEmptyState searchTerm={searchTerm} />
          )}
        </div>

        <CommandPaletteFooter />
      </div>
    </div>
  );
};

export default CommandPalette;
