import { useEffect, useMemo, useState } from 'react';
import { BLOG_POSTS, type BlogCategory, type BlogPost } from '../data/blogPosts';
import { BLOG_LANGUAGES, type BlogLanguage } from '../lib/blogContent';
import { createSearchIndex } from '../lib/search';
import { readPersistedRaw, writePersistedRaw } from '../lib/persistedState';

export type BlogCategoryFilter = 'all' | BlogCategory;

const LANGUAGE_STORAGE_KEY = 'blog-language';

const isBlogLanguage = (value: string | null): value is BlogLanguage =>
  value !== null && (BLOG_LANGUAGES as readonly string[]).includes(value);

/**
 * Stored choice wins; otherwise follow the browser. A Thai reader landing on an English-only page
 * is the case worth avoiding, and `navigator.language` is the only signal available without asking.
 */
const resolveInitialLanguage = (): BlogLanguage => {
  if (typeof window === 'undefined') return 'en';

  const stored = readPersistedRaw(LANGUAGE_STORAGE_KEY);
  if (isBlogLanguage(stored)) return stored;

  return navigator.language?.toLowerCase().startsWith('th') ? 'th' : 'en';
};

/**
 * Searching every language at once is deliberate: the reader viewing English should still find a
 * post by a Thai term they remember, since the two sections describe the same change. The
 * Thai-aware tokeniser that makes it work now comes from `createSearchIndex`, along with the
 * fuzzy/prefix/AND defaults this used to spell out for itself.
 */
const buildIndex = (posts: BlogPost[]) =>
  createSearchIndex(posts, {
    name: 'blog-posts',
    getId: (post) => post.id,
    fields: {
      title: (post) => post.title,
      summary: (post) => post.summary,
      body: (post) => [post.sections.shared, post.sections.th, post.sections.en].join('\n'),
    },
    boost: { title: 3, summary: 2, body: 1 },
  });

export const useBlogFilters = (posts: BlogPost[] = BLOG_POSTS) => {
  const [language, setLanguage] = useState<BlogLanguage>(resolveInitialLanguage);
  const [category, setCategory] = useState<BlogCategoryFilter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    writePersistedRaw(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const index = useMemo(() => buildIndex(posts), [posts]);

  const visiblePosts = useMemo(() => {
    const byCategory =
      category === 'all' ? posts : posts.filter((post) => post.category === category);

    if (!search.trim()) return byCategory;

    // Rank by relevance, but only among posts the category filter already allowed.
    const allowed = new Set(byCategory.map((post) => post.id));

    return index.search(search).filter((post) => allowed.has(post.id));
  }, [category, index, posts, search]);

  const counts = useMemo(
    () =>
      posts.reduce(
        (acc, post) => {
          acc[post.category] += 1;
          return acc;
        },
        { all: posts.length, release: 0, improvement: 0, fix: 0 } as Record<
          BlogCategoryFilter,
          number
        >,
      ),
    [posts],
  );

  return {
    language,
    setLanguage,
    category,
    setCategory,
    search,
    setSearch,
    visiblePosts,
    counts,
    /** True when filters are active but nothing matched — the empty state is the caller's problem. */
    isEmpty: visiblePosts.length === 0,
  };
};
