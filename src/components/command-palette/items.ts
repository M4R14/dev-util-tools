import type { ToolMetadata } from '../../types';
import type { CommandPaletteAction, CommandPaletteItem } from './types';

export const filterCommandPaletteActions = (
  actions: CommandPaletteAction[],
  searchTerm: string,
) => {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  if (!normalizedSearchTerm) {
    return actions;
  }

  return actions.filter((action) => {
    const haystack = [action.name, action.description, ...(action.keywords ?? [])]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedSearchTerm);
  });
};

export const buildCommandPaletteItems = (
  actions: CommandPaletteAction[],
  tools: ToolMetadata[],
): CommandPaletteItem[] => [
  ...actions.map((action) => ({
    type: 'action' as const,
    id: `action-${action.id}`,
    action,
  })),
  ...tools.map((tool) => ({
    type: 'tool' as const,
    id: `tool-${tool.id}`,
    tool,
  })),
];
