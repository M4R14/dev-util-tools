import React from 'react';
import type { CommandPaletteItem } from './types';
import CommandPaletteOption from './CommandPaletteOption';

interface CommandPaletteListProps {
  items: CommandPaletteItem[];
  selectedIndex: number;
  listRef: React.RefObject<HTMLUListElement | null>;
  onHoverItem: (index: number) => void;
  onSelectItem: (item: CommandPaletteItem) => void;
}

const CommandPaletteList: React.FC<CommandPaletteListProps> = ({
  items,
  selectedIndex,
  listRef,
  onHoverItem,
  onSelectItem,
}) => (
  <ul
    ref={listRef}
    className="p-2 space-y-1"
    role="listbox"
    id="command-palette-list"
    aria-label="Available commands"
  >
    {items.map((item, index) => (
      <CommandPaletteOption
        key={item.id}
        item={item}
        isSelected={index === selectedIndex}
        onSelect={onSelectItem}
        onHover={() => onHoverItem(index)}
      />
    ))}
  </ul>
);

export default CommandPaletteList;
