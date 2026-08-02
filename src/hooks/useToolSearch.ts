import { useMemo } from 'react';
import { ToolMetadata } from '../types';
import { TOOLS } from '../data/tools';
import { createSearchIndex } from '../lib/search';

/**
 * Filter and rank tools by a search term.
 *
 * Ranking, tokenising and index caching all come from `createSearchIndex`, shared with related
 * tools, the blog and the command palette. Two behaviours changed when this moved over:
 *
 * - Thai queries work mid-word. `ประชาชน` used to match nothing even though `บัตรประชาชน` is a tag
 *   on the Thai ID Decoder, because the default tokeniser cannot split Thai.
 * - Extra words narrow the result set instead of widening it. Under the previous `OR` default,
 *   `thai` matched 2 tools and `thai date` matched 5.
 */
export const useToolSearch = (
  searchTerm: string,
  tools: ToolMetadata[] = TOOLS,
): ToolMetadata[] => {
  const index = useMemo(
    () =>
      createSearchIndex(tools, {
        name: 'tools',
        getId: (tool) => tool.id,
        fields: {
          name: (tool) => tool.name,
          description: (tool) => tool.description,
          tags: (tool) => tool.tags?.join(' ') ?? '',
        },
        boost: { name: 3, tags: 2, description: 1 },
      }),
    [tools],
  );

  return useMemo(() => index.search(searchTerm), [index, searchTerm]);
};
