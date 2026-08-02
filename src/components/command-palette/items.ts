import type { ToolMetadata } from '../../types';
import { createSearchIndex } from '../../lib/search/search';
import type { CommandPaletteAction, CommandPaletteItem } from './types';

/**
 * Actions are matched exactly like the tools they sit beside in the list, because they share
 * `createSearchIndex`.
 *
 * They used to use a plain lowercase `includes()`, so a single list applied two different rules:
 * typing `jsn` found the JSON tools by fuzzy match, while `settngs` found nothing at all. Nothing
 * in the UI tells the user which half of the list forgives a typo.
 */
const getIndex = (actions: CommandPaletteAction[]) =>
  createSearchIndex(actions, {
    name: 'palette-actions',
    getId: (action) => action.id,
    fields: {
      name: (action) => action.name,
      description: (action) => action.description,
      keywords: (action) => action.keywords?.join(' ') ?? '',
    },
    boost: { name: 3, keywords: 2, description: 1 },
  });

export const filterCommandPaletteActions = (
  actions: CommandPaletteAction[],
  searchTerm: string,
): CommandPaletteAction[] => {
  if (actions.length === 0) return actions;

  return getIndex(actions).search(searchTerm);
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
