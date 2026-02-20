import type { LucideIcon } from 'lucide-react';
import type { ToolMetadata } from '../../types';

export interface CommandPaletteAction {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  keywords?: string[];
  onSelect: () => void | Promise<void>;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions?: CommandPaletteAction[];
}

export type CommandPaletteItem =
  | { type: 'action'; id: string; action: CommandPaletteAction }
  | { type: 'tool'; id: string; tool: ToolMetadata };

export interface CommandPaletteItemContent {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const getCommandPaletteItemContent = (
  item: CommandPaletteItem,
): CommandPaletteItemContent =>
  item.type === 'action'
    ? {
        title: item.action.name,
        description: item.action.description,
        icon: item.action.icon,
      }
    : {
        title: item.tool.name,
        description: item.tool.description,
        icon: item.tool.icon,
      };

export const getCommandPaletteOptionId = (itemId: string) => `command-item-${itemId}`;
