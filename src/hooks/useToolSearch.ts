import { useMemo } from 'react';
import MiniSearch from 'minisearch';
import { ToolMetadata } from '../types';
import { TOOLS } from '../data/tools';

/**
 * Build a MiniSearch index from a list of tools.
 * Runs once per unique tool list reference.
 */
const buildIndex = (tools: ToolMetadata[]) => {
  const ms = new MiniSearch<ToolMetadata>({
    fields: ['name', 'description', 'tagsJoined'],
    storeFields: ['id'],
    searchOptions: {
      boost: { name: 3, tagsJoined: 2, description: 1 },
      fuzzy: 0.2,
      prefix: true,
    },
  });

  ms.addAll(
    tools.map((tool) => ({
      ...tool,
      tagsJoined: tool.tags?.join(' ') ?? '',
    })),
  );

  return ms;
};

/**
 * Hook to filter tools based on a search term using MiniSearch.
 * Supports fuzzy matching, prefix search, and field boosting
 * (name > tags > description).
 *
 * @param searchTerm The term to search for
 * @param tools Optional list of tools to search through. Defaults to all TOOLS.
 * @returns Filtered & ranked array of ToolMetadata
 */
export const useToolSearch = (
  searchTerm: string,
  tools: ToolMetadata[] = TOOLS,
): ToolMetadata[] => {
  const index = useMemo(() => buildIndex(tools), [tools]);

  return useMemo(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return tools;

    const results = index.search(trimmed);
    const idOrder = new Map(results.map((r, i) => [r.id, i]));

    return tools
      .filter((tool) => idOrder.has(tool.id))
      .sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));
  }, [searchTerm, tools, index]);
};
