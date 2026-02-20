# Blog Updates

The blog page (`/blog`) is used for **product/news updates** about DevPulse changes.

## Source of Truth

Blog content is stored as markdown files in:

`src/content/blog/*.md`

The app loads these files in `src/data/blogPosts.ts` using `import.meta.glob(..., query: '?raw')`, then parses:

- frontmatter (metadata)
- body paragraphs as narrative content
- body bullet list (`- `) as change items (optional)

## Required Frontmatter

Each blog markdown file must start with:

```md
---
id: 2026-02-20-navigation-refresh
title: Navigation and Sidebar Refresh
date: 2026-02-20
category: improvement
summary: Refined sidebar navigation and dashboard UX.
---
```

### Fields

- `id` — unique post id (recommended same as file name)
- `title` — post title shown on blog card
- `date` — ISO date (`YYYY-MM-DD`) used for sorting (newest first)
- `category` — one of: `release`, `improvement`, `fix`
- `summary` — short summary paragraph

## Body Format

Blog body supports 3 styles:

```md
Paragraph content here...

- Improved sidebar navigation hierarchy.
- Added inline favorite toggle in sidebar nav items.
- Updated dashboard search result layout.
```

1. Narrative paragraphs only
2. Bullet list only
3. Mixed paragraphs + bullet list

Render behavior:

- Paragraph blocks are shown as post content.
- Bullet lines (`- `) are shown in the changes list.
- Inline emphasis `*text*` is supported in summary/content/changes.

## Conventions

- Keep filename format: `YYYY-MM-DD-slug.md`
- Keep updates factual and concise
- Prefer one logical change group per post
- Use absolute dates (no “today/yesterday” wording)

## Related

- [Project Overview](01-project-overview.md)
- [Architecture](02-architecture.md)
- [Directory Map](03-directory-map.md)
