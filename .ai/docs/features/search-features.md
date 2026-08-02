# Search Features

Every search in DevPulse goes through `src/lib/search/search.ts`. Do not construct MiniSearch directly.

## Why one module

There were four indexes — tools, related tools, blog posts, command-palette actions — each
configured by hand. They disagreed about three things at once, and nobody had decided any of it on
purpose:

- **Tokenising.** Thai support was added for the blog and never reached tool search, where
  `ประชาชน` matched nothing despite `บัตรประชาชน` being a tag on the Thai ID Decoder.
- **AND vs OR.** The blog used `AND`; everything else took MiniSearch's `OR` default. In tool
  search that meant `thai` matched 2 tools and `thai date` matched 5 — typing more to be more
  specific produced more noise.
- **Caching.** Related tools and palette actions cached per module; tool search built inside a
  `useMemo`, so the sidebar, the dashboard and the command palette each indexed the same 21 tools
  separately.

## The interface

```ts
const index = createSearchIndex(documents, {
  name: 'tools', // cache identity
  getId: (tool) => tool.id,
  fields: {
    // field name -> indexed text
    name: (tool) => tool.name,
    description: (tool) => tool.description,
    tags: (tool) => tool.tags?.join(' ') ?? '',
  },
  boost: { name: 3, tags: 2, description: 1 },
});

index.search('ประชาชน'); // => ranked documents, or all documents for a blank term
```

`name` is the cache key alongside the documents array, and it is required. `TOOLS` is indexed twice
in this app — once for tool search, once for related tools — with different settings. Keying the
cache on the array alone silently hands one caller the other's index.

## Defaults

| Option        | Default                                   | Why                                    |
| ------------- | ----------------------------------------- | -------------------------------------- |
| `tokenize`    | `Intl.Segmenter` via `searchTokenizer.ts` | Thai has no spaces between words       |
| `fuzzy`       | `0.2`                                     | Forgives a typo                        |
| `prefix`      | `true`                                    | Matches while the user is still typing |
| `combineWith` | `AND`                                     | Another word should narrow, not widen  |

## Deliberate departures

`relatedTools.ts` overrides all three search options, and the reasons are recorded there:

- `combineWith: 'OR'` — its query is a tool's own name plus its tags, a bag of terms rather than a
  phrase someone typed. Under `AND`, requiring every term to match returns nothing.
- `fuzzy: 0.1`, `prefix: false` — a person typing "cro" wants prefix matches; a related-tools list
  should only surface genuine term overlap.

**If you add a search, take the defaults unless you can write down why not.**

## Tokeniser Behaviour

`src/lib/search/searchTokenizer.ts` uses `Intl.Segmenter`, which carries Unicode word-break data and is
built into the platform — no dependency, no word list to maintain.

It also splits on `.` `_` `/` while keeping the whole term, because Unicode treats those as
word-internal between letters. Correct for `example.com`, wrong for a developer tool where both
`crypto.subtle` and `subtle` should match.

## Search Term Lifetime

The tool search term lives in `SearchContext` and is shared by the sidebar and header inputs — two
views of one value, deliberately.

`useMainLayoutRouteEffects` clears it on navigation. It used to survive: after clicking a result the
sidebar stayed collapsed to a single "Results" section showing 2 of 21 tools, with nothing but the
leftover text in the box to explain where the navigation had gone.

The command palette and the blog keep their own local terms; neither outlives its surface.

## Thai Coverage in Tool Metadata

Thai terms are tags in `src/data/tools.tsx`. Fixing the tokeniser does not help if the words are not
there — `ไทย` matched neither Thai tool until it was added.

Current Thai tags: Thai Date Converter, Thai ID Decoder, Password Generator, Timezone Converter,
Word Counter, VIN Tool.

Add Thai tags where a Thai developer would plausibly search in Thai. Most tools are known by their
English names (`JSON`, `Base64`, `UUID`) and do not need them.

## Source of Truth

- Shared index + defaults: `src/lib/search/search.ts`
- Tokeniser: `src/lib/search/searchTokenizer.ts`
- Tool search: `src/hooks/useToolSearch.ts`
- Related tools: `src/lib/search/relatedTools.ts`
- Blog search: `src/hooks/useBlogFilters.ts`
- Palette actions: `src/components/command-palette/items.ts`
- Shared term: `src/context/SearchContext.tsx`

## Related

- [Command Palette Features](./command-palette-features.md)
- [Platform UX Features](./platform-ux-features.md)
- [Blog Updates](../11-blog-updates.md)
