import { marked } from 'marked';

export type BlogCategory = 'release' | 'improvement' | 'fix';

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: BlogCategory;
  summary: string;
  summaryHtml: string;
  content: string;
  contentHtml: string;
}

type ParsedFrontmatter = Record<string, string>;

const MARKDOWN_POSTS = import.meta.glob('../content/blog/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

const BLOG_CATEGORY_SET: Set<BlogCategory> = new Set(['release', 'improvement', 'fix']);

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

const extractSummary = (frontmatterSummary: string | undefined, body: string): string => {
  if (frontmatterSummary) return frontmatterSummary;

  const firstParagraph = body
    .split('\n\n')
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk && !chunk.startsWith('- '));

  return firstParagraph ?? 'No summary provided.';
};

const parseInlineMarkdown = (input: string): string => {
  if (!input.trim()) return '';

  const parsed = marked.parseInline(input, { gfm: true, breaks: true });
  return typeof parsed === 'string' ? parsed : '';
};

const parseBlockMarkdown = (input: string): string => {
  if (!input.trim()) return '';

  const parsed = marked.parse(input, { gfm: true, breaks: true });
  return typeof parsed === 'string' ? parsed : '';
};

const toBlogCategory = (value: string | undefined): BlogCategory => {
  if (value && BLOG_CATEGORY_SET.has(value as BlogCategory)) {
    return value as BlogCategory;
  }
  return 'improvement';
};

const toIdFromPath = (path: string): string => {
  const fileName = path.split('/').pop() ?? '';
  return fileName.replace(/\.md$/i, '');
};

const parseBlogPost = (path: string, rawMarkdown: string): BlogPost => {
  const { frontmatter, body } = parseFrontmatter(rawMarkdown);
  const id = frontmatter.id?.trim() || toIdFromPath(path);
  const title = frontmatter.title?.trim() || id.replace(/-/g, ' ');
  const date = frontmatter.date?.trim() || '1970-01-01';
  const category = toBlogCategory(frontmatter.category?.trim());
  const summary = extractSummary(frontmatter.summary?.trim(), body);
  const summaryHtml = parseInlineMarkdown(summary);
  const content = body;
  const contentHtml = parseBlockMarkdown(content);

  return {
    id,
    title,
    date,
    category,
    summary,
    summaryHtml,
    content,
    contentHtml,
  };
};

export const BLOG_POSTS: BlogPost[] = Object.entries(MARKDOWN_POSTS)
  .map(([path, rawMarkdown]) => parseBlogPost(path, rawMarkdown))
  .sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) {
      return dateDiff;
    }

    if (a.id === 'auto-release-notes') return -1;
    if (b.id === 'auto-release-notes') return 1;
    return b.id.localeCompare(a.id);
  });
