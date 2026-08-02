# Blog Updates

The blog page (`/blog`) is used for **product/news updates** about DevPulse changes.

## Source of Truth

Blog content is stored as markdown files in:

`src/content/blog/*.md`

Auto-generated release notes are written to:

`src/content/blog/auto-release-notes.md` (via `npm run release-notes:generate`)

The app loads these files in `src/data/blogPosts.ts` using `import.meta.glob(..., query: '?raw')`, then:

- parses and **validates** frontmatter against a zod schema
- splits the body into `## TH` / `## EN` sections (`src/lib/blogContent.ts`)
- renders each section to HTML via `src/lib/markdown.ts`

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

- `id` — unique post id (recommended same as file name). **Optional** — falls back to the filename,
  which is always correct, so there is nothing to get silently wrong.
- `title` — post title shown on blog card
- `date` — ISO date (`YYYY-MM-DD`) used for sorting (newest first). Must be a real calendar date;
  `2026-13-99` is rejected.
- `category` — one of: `release`, `improvement`, `fix`
- `summary` — short summary paragraph

### Validation is strict, and a test enforces it

Every field except `id` is required. A post that fails validation is **dropped** and logged as
`[blog] skipped <path> — <reason>`; it does not render with defaults.

This replaced a set of silent fallbacks that made authoring mistakes invisible: a misspelt
`catagory:` used to become `improvement`, and a missing `date` used to become `1970-01-01`, which
quietly sorted the post to the bottom of the page.

Dropping a post only helps if someone notices, so `src/data/blogPosts.test.ts` asserts
`BLOG_POST_ISSUES` is empty. A malformed post fails `npm test` rather than shipping.

## Bilingual Body (`## TH` / `## EN`)

Posts are written in Thai and English. Mark each with a heading on its own line:

```md
## TH

เนื้อหาภาษาไทย

## EN

English content
```

- The reader picks a language in the blog filter bar; only that section renders. Their choice is
  stored in `localStorage` under `blog-language`, defaulting to `navigator.language`.
- The `## TH` / `## EN` headings are **removed** during rendering — the language picker already says
  which one you are reading. Any other heading level works (`# th`, `#### EN`), and matching is
  case-insensitive, but the heading text must be exactly `TH` or `EN`.
- Content **before** the first language heading is shared and renders in both languages.
- A post with no language headings at all — `auto-release-notes.md`, for instance — is treated as
  language-neutral and always renders in full. Unconventional posts degrade to "always visible"
  rather than disappearing.

## Body Format

Within a language section, the body supports 3 styles:

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

- The markdown body is rendered to HTML in `src/data/blogPosts.ts` via `src/lib/markdown.ts`.
- Inline markdown like emphasis (`*text*`), strong text, inline code, and links is supported.
- List markdown (`- item`, `1. item`) stays in the body and is rendered as normal HTML lists.

## Raw HTML Is Escaped, Not Rendered

`src/lib/markdown.ts` configures `marked` so that raw HTML in a post is escaped and shown as text,
and so that link/image URLs are limited to `http:`, `https:`, `mailto:`, and relative paths.

Do not write HTML in a post expecting it to render — it will appear literally.

Two reasons this matters:

- **Text loss.** By default `marked` emits raw HTML untouched, so a release note reading
  `support <div> wrappers` silently lost `<div>` from the page. That is the failure you are most
  likely to hit.
- **Uncurated input.** `auto-release-notes.md` is generated from git commit subjects, which nobody
  reviews for markup. `scripts/generate-release-notes.mjs` additionally backslash-escapes markdown
  characters in those subjects so `fix: drop *args handling` keeps its asterisks.

This is an escaping layer, not a sanitiser, and it is sufficient only because every post is
markdown committed to this repository. Rendering third-party or user-submitted markdown here would
need a real sanitiser such as DOMPurify.

## Filtering and Search

`src/hooks/useBlogFilters.ts` owns the blog's category filter, language choice, and search:

- Category chips filter to `release` / `improvement` / `fix`; clicking the active chip clears it.
- Search uses MiniSearch over title, summary, and body, boosted in that order. It indexes **both**
  languages, so a reader on English can still find a post by a Thai term they remember.
- The language choice selects which section renders; it never hides a post.

### Thai search needs a custom tokeniser

MiniSearch's default tokeniser splits on whitespace and punctuation. Thai is written without spaces
between words, so a whole Thai sentence became a single token and searching `ลายเซ็น` matched
nothing.

This is no longer blog-specific. All four search surfaces go through `src/lib/search.ts`, which
owns the tokeniser — see [Search](./features/search-features.md).

> An earlier version of this page claimed the limitation "has not bitten" tool search because its
> content is mostly English. That was wrong: `บัตรประชาชน` is a tag on the Thai ID Decoder, and
> searching `ประชาชน` returned nothing until the shared module landed.

## Conventions

- Keep filename format: `YYYY-MM-DD-slug.md`
- Write both `## TH` and `## EN` sections
- Keep updates factual and concise
- Prefer one logical change group per post
- Use absolute dates (no “today/yesterday” wording)
- `auto-release-notes.md` is generated from recent git commits/PR references and should not be manually edited

## Files

| File                                 | Role                                                             |
| ------------------------------------ | ---------------------------------------------------------------- |
| `src/content/blog/*.md`              | The posts themselves                                             |
| `src/data/blogPosts.ts`              | Frontmatter validation, language split, HTML rendering           |
| `src/data/blogCategories.ts`         | Category labels/icons, shared by the card badge and filter chips |
| `src/lib/markdown.ts`                | `marked` configuration — HTML escaping and URL allowlist         |
| `src/lib/blogContent.ts`             | `## TH` / `## EN` splitting                                      |
| `src/lib/searchTokenizer.ts`         | Thai-aware tokenising for search                                 |
| `src/hooks/useBlogFilters.ts`        | Category, language, and search state                             |
| `src/components/Blog.tsx`            | Page shell and empty state                                       |
| `src/components/blog/`               | `BlogPostCard`, `BlogFilters`                                    |
| `scripts/generate-release-notes.mjs` | Writes `auto-release-notes.md` from git history                  |

## Related

- [Project Overview](01-project-overview.md)
- [Architecture](02-architecture.md)
- [Directory Map](03-directory-map.md)
