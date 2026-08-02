import MiniSearch from 'minisearch';
import { ToolID, ToolMetadata } from '../types';

/** Default number of related tools rendered on a tool page. */
export const RELATED_TOOLS_LIMIT = 4;

/**
 * Tags shared by many tools that carry no relatedness signal. Without this, every
 * external tool would be "related" to every other external tool and nothing else.
 */
const GENERIC_TAGS = new Set(['external tool']);

interface IndexedTool extends ToolMetadata {
  tagsJoined: string;
}

const meaningfulTags = (tool: ToolMetadata): string[] =>
  (tool.tags ?? []).filter((tag) => !GENERIC_TAGS.has(tag));

/** One index per tool list; keyed by reference so the shared TOOLS array is built once. */
const indexCache = new WeakMap<ToolMetadata[], MiniSearch<IndexedTool>>();

const buildIndex = (tools: ToolMetadata[]): MiniSearch<IndexedTool> => {
  const index = new MiniSearch<IndexedTool>({
    fields: ['name', 'description', 'tagsJoined'],
    storeFields: ['id'],
    searchOptions: {
      boost: { tagsJoined: 3, name: 2, description: 1 },
      // Tighter than tool search (fuzzy 0.2 + prefix): a user typing "cro" wants prefix
      // matches, but a related-tools list should only surface genuine term overlap.
      // Prefix matching pulled in noise like Base64 -> Crontab Guru; dropping to 0.1
      // still keeps near-misses such as Crontab Guru's "timer" -> Timezone Converter.
      fuzzy: 0.1,
      prefix: false,
    },
  });

  index.addAll(
    tools.map((tool) => ({
      ...tool,
      tagsJoined: meaningfulTags(tool).join(' '),
    })),
  );

  return index;
};

const getIndex = (tools: ToolMetadata[]): MiniSearch<IndexedTool> => {
  const cached = indexCache.get(tools);
  if (cached) return cached;

  const index = buildIndex(tools);
  indexCache.set(tools, index);
  return index;
};

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

  for (const result of getIndex(tools).search(query)) {
    const id = result.id as ToolID;
    if (id === tool.id || picked.has(id)) continue;

    const candidate = byId.get(id);
    if (!candidate) continue;

    picked.set(id, candidate);
    if (picked.size >= limit) break;
  }

  return [...picked.values()];
};
