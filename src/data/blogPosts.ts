import { z } from 'zod';
import { renderInlineMarkdown, renderMarkdown } from '../lib/content/markdown';
import {
  isLanguageNeutral,
  splitLanguageSections,
  type BlogLanguageSections,
} from '../lib/content/blogContent';

export type BlogCategory = 'release' | 'improvement' | 'fix';

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: BlogCategory;
  summary: string;
  summaryHtml: string;
  /** Raw markdown per language. Kept for search, which wants text rather than markup. */
  sections: BlogLanguageSections;
  /** Rendered HTML per language. */
  html: BlogLanguageSections;
  /** True when the post has no `## TH` / `## EN` split, so a language filter must not hide it. */
  languageNeutral: boolean;
}

export interface BlogPostIssue {
  path: string;
  problem: string;
}

/**
 * Frontmatter is hand-typed, so every field here used to have a silent fallback: `catagory:`
 * misspelt became `improvement`, and a missing `date` became `1970-01-01`, which quietly sorted the
 * post to the bottom of the page where nobody would notice it. Validating instead means a bad post
 * is dropped and reported rather than shipped looking almost right.
 *
 * `id` is the one field that keeps a fallback: deriving it from the filename is always correct, so
 * there is nothing to catch.
 */
const FrontmatterSchema = z.object({
  id: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1, 'title is required'),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be an ISO date (YYYY-MM-DD)')
    // The shape check alone accepts 2026-13-99, which becomes an Invalid Date and poisons the
    // sort comparison with NaN. Round-tripping proves the day actually exists — and the timestamp
    // is checked first, because toISOString() throws on an Invalid Date rather than returning it.
    .refine((value) => {
      const parsed = new Date(value);
      return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
    }, 'date is not a real calendar date'),
  category: z.enum(['release', 'improvement', 'fix']),
  summary: z.string().trim().min(1, 'summary is required'),
});

type ParsedFrontmatter = Record<string, string>;

const MARKDOWN_POSTS = import.meta.glob('../content/blog/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

const parseFrontmatter = (raw: string): { frontmatter: ParsedFrontmatter; body: string } => {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: raw.trim() };
  }

  const [, frontmatterText, body] = match;
  const frontmatter = frontmatterText.split('\n').reduce<ParsedFrontmatter>((acc, line) => {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex <= 0) return acc;

    const key = line.slice(0, separatorIndex).trim();
    const value = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^"(.*)"$/, '$1')
      .replace(/^'(.*)'$/, '$1');

    if (key) acc[key] = value;
    return acc;
  }, {});

  return { frontmatter, body: body.trim() };
};

const toIdFromPath = (path: string): string => {
  const fileName = path.split('/').pop() ?? '';
  return fileName.replace(/\.md$/i, '');
};

const parseBlogPost = (
  path: string,
  rawMarkdown: string,
): { post: BlogPost; issue: null } | { post: null; issue: BlogPostIssue } => {
  const { frontmatter, body } = parseFrontmatter(rawMarkdown);
  const result = FrontmatterSchema.safeParse(frontmatter);

  if (!result.success) {
    const problem = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'frontmatter'}: ${issue.message}`)
      .join('; ');

    return { post: null, issue: { path, problem } };
  }

  const { id, title, date, category, summary } = result.data;
  const sections = splitLanguageSections(body);

  return {
    post: {
      id: id ?? toIdFromPath(path),
      title,
      date,
      category,
      summary,
      summaryHtml: renderInlineMarkdown(summary),
      sections,
      html: {
        shared: renderMarkdown(sections.shared),
        th: renderMarkdown(sections.th),
        en: renderMarkdown(sections.en),
      },
      languageNeutral: isLanguageNeutral(sections),
    },
    issue: null,
  };
};

const parsed = Object.entries(MARKDOWN_POSTS).map(([path, rawMarkdown]) =>
  parseBlogPost(path, rawMarkdown),
);

/** Exported so a test can assert the shipped content set is clean. */
export const BLOG_POST_ISSUES: BlogPostIssue[] = parsed
  .map((entry) => entry.issue)
  .filter((issue): issue is BlogPostIssue => issue !== null);

for (const issue of BLOG_POST_ISSUES) {
  console.error(`[blog] skipped ${issue.path} — ${issue.problem}`);
}

export const BLOG_POSTS: BlogPost[] = parsed
  .map((entry) => entry.post)
  .filter((post): post is BlogPost => post !== null)
  .sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) {
      return dateDiff;
    }

    if (a.id === 'auto-release-notes') return -1;
    if (b.id === 'auto-release-notes') return 1;
    return b.id.localeCompare(a.id);
  });
