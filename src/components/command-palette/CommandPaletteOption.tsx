import React from 'react';
import { ArrowRight } from 'lucide-react';
import {
  getCommandPaletteItemContent,
  getCommandPaletteOptionId,
  type CommandPaletteItem,
} from './types';

interface CommandPaletteOptionProps {
  item: CommandPaletteItem;
  isSelected: boolean;
  onSelect: (item: CommandPaletteItem) => void;
  onHover: () => void;
}

const CommandPaletteOption: React.FC<CommandPaletteOptionProps> = ({
  item,
  isSelected,
  onSelect,
  onHover,
}) => {
  const { title, description, icon: Icon } = getCommandPaletteItemContent(item);

  return (
    <li role="option" id={getCommandPaletteOptionId(item.id)} aria-selected={isSelected}>
      <button
        onClick={() => onSelect(item)}
        onMouseEnter={onHover}
        tabIndex={-1}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-all ${
          isSelected
            ? 'bg-primary/20 text-primary border border-primary/30'
            : 'text-muted-foreground hover:bg-muted/50 border border-transparent'
        }`}
      >
        <div
          className={`p-2 rounded-lg ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground truncate flex items-center justify-between">
            {title}
            {isSelected ? <ArrowRight className="w-4 h-4 opacity-50" /> : null}
          </div>
          <div className="text-xs text-muted-foreground truncate">{description}</div>
        </div>
      </button>
    </li>
  );
};

export default CommandPaletteOption;
