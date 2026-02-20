export type BlogCategory = 'release' | 'improvement' | 'fix';

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: BlogCategory;
  summary: string;
  content: string;
  changes: string[];
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

const extractChanges = (body: string): string[] => {
  const changes = body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.replace(/^- /, '').trim())
    .filter(Boolean);

  return changes;
};

const extractSummary = (frontmatterSummary: string | undefined, body: string): string => {
  if (frontmatterSummary) return frontmatterSummary;

  const firstParagraph = body
    .split('\n\n')
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk && !chunk.startsWith('- '));

  return firstParagraph ?? 'No summary provided.';
};

const extractNarrativeContent = (body: string): string => {
  const narrativeParagraphs = body
    .split('\n\n')
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk && !chunk.startsWith('- '));

  return narrativeParagraphs.join('\n\n');
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
  const content = extractNarrativeContent(body);
  const changes = extractChanges(body);

  return {
    id,
    title,
    date,
    category,
    summary,
    content,
    changes,
  };
};

export const BLOG_POSTS: BlogPost[] = Object.entries(MARKDOWN_POSTS)
  .map(([path, rawMarkdown]) => parseBlogPost(path, rawMarkdown))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
