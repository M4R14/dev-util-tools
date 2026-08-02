import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useToolSearch } from '../hooks/useToolSearch';
import { useFocusTrap } from '../hooks/ui/useFocusTrap';
import { scrollBehavior } from '../lib/platform/motion';
import { useSendToTool } from '../context/SendToToolContext';
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  /**
   * `aria-modal="true"` below is a promise that the rest of the page is out of play. Without a
   * trap it was only a promise: two Tab presses left the dialog for the sidebar behind it, and
   * closing dropped focus on `<body>` instead of the control that opened the palette.
   *
   * This also focuses the input on open — it is the first focusable element in the dialog — which
   * replaces a `setTimeout(..., 50)` that guessed at when the DOM would be ready.
   */
  useFocusTrap(dialogRef, { active: isOpen });

  const { pendingValue, clearPendingValue } = useSendToTool();
  /** Send mode: the palette is picking a destination for a value, not navigating freely. */
  const isSendMode = pendingValue !== null;

  const filteredTools = useToolSearch(searchTerm);

  /**
   * In send mode only tools that declare an `inputParam` can appear — a generator or a link-out
   * tool has nothing to receive — and app actions are hidden, since "Clear offline cache" is not
   * a destination for a value.
   */
  const toolResults = useMemo(
    () => (isSendMode ? filteredTools.filter((tool) => tool.inputParam) : filteredTools),
    [filteredTools, isSendMode],
  );

  const filteredActions = useMemo(
    () => (isSendMode ? [] : filterCommandPaletteActions(actions, searchTerm)),
    [actions, isSendMode, searchTerm],
  );

  const items = useMemo(
    () => buildCommandPaletteItems(filteredActions, toolResults),
    [filteredActions, toolResults],
  );

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
      return;
    }

    // Dismissing without choosing a destination abandons the send. Without this the next Cmd+K
    // would silently reopen in send mode, still holding a value from minutes ago.
    clearPendingValue();
  }, [clearPendingValue, isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  const handleSelect = useCallback(
    async (item: CommandPaletteItem) => {
      if (item.type === 'tool') {
        if (pendingValue !== null && item.tool.inputParam) {
          // The value rides in the target's own param, so the destination arrives seeded and its
          // URL is shareable exactly like any other visit to that tool.
          const params = new URLSearchParams({ [item.tool.inputParam]: pendingValue });
          navigate(`/${item.tool.id}?${params.toString()}`);
          clearPendingValue();
          onClose();
          toast.success(`Sent to ${item.tool.name}`);
          return;
        }

        navigate(`/${item.tool.id}`);
        onClose();
        return;
      }

      onClose();
      try {
        await item.action.onSelect();
      } catch (error: unknown) {
        // Action handlers own their own success/failure toasts; anything reaching here is a fault
        // they did not anticipate, and swallowing it left the user staring at a closed palette
        // wondering whether the command ran.
        toast.error(
          error instanceof Error ? error.message : `"${item.action.name}" could not be completed`,
        );
      }
    },
    [clearPendingValue, navigate, onClose, pendingValue],
  );

  /**
   * Bound to the dialog rather than the input. On the input it stopped working the moment focus
   * moved anywhere else — one Tab to the close button was enough to make Escape and the arrow keys
   * do nothing at all.
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (items.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % items.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (items[selectedIndex]) {
        void handleSelect(items[selectedIndex]);
      }
    }
  };

  // Ensure selected item is scrolled into view
  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      (listRef.current.children[selectedIndex] as HTMLElement).scrollIntoView({
        block: 'nearest',
        behavior: scrollBehavior(),
      });
    }
  }, [selectedIndex, items.length]);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onKeyDown={handleKeyDown}
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
            placeholder={isSendMode ? 'Send to which tool?' : 'Type a command or search...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-lg text-foreground placeholder-muted-foreground outline-none border-none focus:ring-0"
            aria-label={isSendMode ? 'Choose a tool to send the value to' : 'Search commands'}
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
