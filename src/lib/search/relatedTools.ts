import { ToolID, ToolMetadata } from '../../types';
import { createSearchIndex } from './search';

/** Default number of related tools rendered on a tool page. */
export const RELATED_TOOLS_LIMIT = 4;

/**
 * Tags shared by many tools that carry no relatedness signal. Without this, every
 * external tool would be "related" to every other external tool and nothing else.
 */
const GENERIC_TAGS = new Set(['external tool']);

const meaningfulTags = (tool: ToolMetadata): string[] =>
  (tool.tags ?? []).filter((tag) => !GENERIC_TAGS.has(tag));

/**
 * Every setting here is a deliberate departure from the shared defaults, because this is the one
 * search in the app whose query is not typed by a person.
 *
 * - `combineWith: 'OR'` — the query is a tool's own name plus its tags, a bag of terms rather than
 *   a phrase. Under the shared `AND` default, requiring every term to match would return nothing.
 * - `fuzzy: 0.1`, `prefix: false` — tighter than tool search. Someone typing "cro" wants prefix
 *   matches; a related-tools list should only surface genuine term overlap. Prefix matching pulled
 *   in noise like Base64 → Crontab Guru, while 0.1 still keeps near-misses such as Crontab Guru's
 *   "timer" → Timezone Converter.
 */
const getIndex = (tools: ToolMetadata[]) =>
  createSearchIndex(tools, {
    name: 'related-tools',
    getId: (tool) => tool.id,
    fields: {
      name: (tool) => tool.name,
      description: (tool) => tool.description,
      tags: (tool) => meaningfulTags(tool).join(' '),
    },
    boost: { tags: 3, name: 2, description: 1 },
    fuzzy: 0.1,
    prefix: false,
    combineWith: 'OR',
  });

/**
 * Resolve the related tools for a tool page.
 *
 * Curated `related` IDs come first in their declared order; any remaining slots are
 * filled by querying the MiniSearch index with the tool's own name and tags, so a tool
 * without curation still gets sensible suggestions.
 */
export const getRelatedTools = (
  tool: ToolMetadata,
  tools: ToolMetadata[],
  limit: number = RELATED_TOOLS_LIMIT,
): ToolMetadata[] => {
  if (limit <= 0) return [];

  const byId = new Map(tools.map((candidate) => [candidate.id, candidate]));
  const picked = new Map<ToolID, ToolMetadata>();

  for (const id of tool.related ?? []) {
    if (id === tool.id || picked.has(id)) continue;

    const candidate = byId.get(id);
    if (!candidate) continue;

    picked.set(id, candidate);
    if (picked.size >= limit) return [...picked.values()];
  }

  const query = `${tool.name} ${meaningfulTags(tool).join(' ')}`.trim();
  if (!query) return [...picked.values()];

  for (const candidate of getIndex(tools).search(query)) {
    if (candidate.id === tool.id || picked.has(candidate.id)) continue;

    picked.set(candidate.id, candidate);
    if (picked.size >= limit) break;
  }

  return [...picked.values()];
};
