import MiniSearch from 'minisearch';
import { tokenizeText } from './searchTokenizer';

/**
 * One place that decides how search works in this app.
 *
 * There were four MiniSearch indexes — tools, related tools, blog posts, palette actions — each
 * configured by hand. They disagreed about tokenising, about whether extra words narrow or widen a
 * query, and about whether the index was cached per component or per module. That was not four
 * deliberate decisions; it was one decision made four times and then only fixed in one of them:
 * Thai tokenising landed on the blog and never reached tool search, where `ประชาชน` matched
 * nothing despite `บัตรประชาชน` sitting in the data.
 *
 * Callers describe their documents and get back `search(term) => T[]`. Everything else —
 * tokenising, the MiniSearch instance, mapping hits back to the caller's objects, ranking, and
 * caching — lives here.
 */

export interface SearchIndex<T> {
  /** Ranked matches. An empty or whitespace term returns every document, unranked. */
  search: (term: string) => T[];
}

export interface SearchIndexOptions<T> {
  /**
   * Cache identity. Two indexes over the *same* array with different settings — `TOOLS` is indexed
   * once for tool search and again, differently, for related tools — must not share an entry.
   * Making this explicit keeps that a decision rather than an accident waiting to happen.
   */
  name: string;
  /** Field name to the text indexed for it. Field names are what `boost` refers to. */
  fields: Record<string, (document: T) => string>;
  getId: (document: T) => string;
  boost?: Record<string, number>;
  /** Edit-distance tolerance, as a fraction of term length. */
  fuzzy?: number;
  prefix?: boolean;
  /**
   * `AND` is the default because typing another word is how people narrow a search. Under `OR`,
   * `thai` returned 2 tools and `thai date` returned 5 — being more specific produced more noise.
   *
   * Use `OR` when the query is a bag of terms rather than a phrase the user typed, as in related
   * tools, where the query is a tool's own name and tags and any overlap is a signal.
   */
  combineWith?: 'AND' | 'OR';
}

const DEFAULTS = { fuzzy: 0.2, prefix: true, combineWith: 'AND' as const };

interface IndexedDocument {
  id: string;
  [field: string]: string;
}

/**
 * Built once per (documents array, name) pair. `useToolSearch` used to build inside a `useMemo`, so
 * the same 21 tools were indexed separately by the sidebar, the dashboard and the command palette.
 */
const indexCache = new WeakMap<object, Map<string, MiniSearch<IndexedDocument>>>();

const buildIndex = <T>(documents: T[], options: SearchIndexOptions<T>) => {
  const fieldNames = Object.keys(options.fields);

  const index = new MiniSearch<IndexedDocument>({
    fields: fieldNames,
    storeFields: ['id'],
    // The reason this module exists: one tokeniser, applied everywhere. Thai is written without
    // spaces, so the default tokeniser turns a whole phrase into a single unsearchable term.
    tokenize: tokenizeText,
    searchOptions: {
      // MiniSearch throws on an undefined boost rather than treating it as "no boosting", and the
      // interface here says it is optional — so the default has to be supplied, not passed through.
      boost: options.boost ?? {},
      fuzzy: options.fuzzy ?? DEFAULTS.fuzzy,
      prefix: options.prefix ?? DEFAULTS.prefix,
      combineWith: options.combineWith ?? DEFAULTS.combineWith,
    },
  });

  index.addAll(
    documents.map((document) => {
      const indexed: IndexedDocument = { id: options.getId(document) };
      for (const name of fieldNames) {
        indexed[name] = options.fields[name](document);
      }
      return indexed;
    }),
  );

  return index;
};

export const createSearchIndex = <T>(
  documents: T[],
  options: SearchIndexOptions<T>,
): SearchIndex<T> => {
  const cacheKey = documents as unknown as object;
  let byName = indexCache.get(cacheKey);
  if (!byName) {
    byName = new Map();
    indexCache.set(cacheKey, byName);
  }

  let index = byName.get(options.name);
  if (!index) {
    index = buildIndex(documents, options);
    byName.set(options.name, index);
  }

  const byId = new Map(documents.map((document) => [options.getId(document), document]));

  return {
    search: (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return documents;

      return index
        .search(trimmed)
        .map((result) => byId.get(result.id as string))
        .filter((document): document is T => document !== undefined);
    },
  };
};
