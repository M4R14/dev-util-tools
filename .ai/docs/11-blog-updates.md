# Blog Updates

The blog page (`/blog`) is used for **product/news updates** about DevPulse changes.

## Source of Truth

Blog content is stored as markdown files in:

`src/content/blog/*.md`

The app loads these files in `src/data/blogPosts.ts` using `import.meta.glob(..., query: '?raw')`, then parses:

- frontmatter (metadata)
- body bullet list (`- `) as change items

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

Use bullet lines for changes:

```md
- Improved sidebar navigation hierarchy.
- Added inline favorite toggle in sidebar nav items.
- Updated dashboard search result layout.
```

These bullets are rendered as `changes` in each blog card.

## Conventions

- Keep filename format: `YYYY-MM-DD-slug.md`
- Keep updates factual and concise
- Prefer one logical change group per post
- Use absolute dates (no “today/yesterday” wording)

## Related

- [Project Overview](01-project-overview.md)
- [Architecture](02-architecture.md)
- [Directory Map](03-directory-map.md)
