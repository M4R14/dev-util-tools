# Architecture

```
App.tsx                          ← ThemeProvider > UserPreferencesProvider > SearchProvider > MainLayout
  └─ MainLayout.tsx              ← Sidebar + Header + CommandPalette + ErrorBoundary + ToolPageLayout
       └─ <Route /:toolId>      ← Lazy-loaded tool component (code-split per tool)
       └─ <Route />             ← Dashboard (landing page)
       └─ <Route /ai-bridge*>   ← Machine-readable AI bridge pages (`/`, `/catalog`, `/spec`)
```

## Key Patterns

| Pattern | Implementation |
|---|---|
| **Code splitting** | Every tool is `React.lazy()` imported in `App.tsx` via `TOOL_COMPONENTS` map |
| **Error isolation** | Each tool route is wrapped in `<ErrorBoundary>` (class component) |
| **Hook-per-tool** | Business logic lives in `src/hooks/use<ToolName>.ts`, UI in `src/components/tools/<ToolName>.tsx` |
| **Pure utilities** | Reusable logic extracted to `src/lib/*.ts` (no React dependencies) |
| **Compound components** | `ToolLayout` has `.Section` and `.Panel` sub-components |
| **Sidebar decomposition** | `Sidebar.tsx` composed from `sidebar/` sub-components: Brand, Footer, Navigation, Search + `useSidebarNavigation` hook |
| **Tool sub-components** | Complex tools split into folders: `thai-date/` (6 files), `ai/` (3 files), `url-parser/` (4 files) |
| **AI automation bridge** | `/ai-bridge` executes requests, `/ai-bridge/catalog` exposes capability discovery, `/ai-bridge/spec` serves JSON schema |
| **Search** | MiniSearch index with fuzzy matching, prefix search, field boosting (name 3× > tags 2× > description 1×) |
| **Persistence** | Favorites & recents stored in `localStorage`; theme in `localStorage` + system preference |

---

## Related

- [Project Overview](01-project-overview.md) — Framework & tech stack summary
- [Directory Map](03-directory-map.md) — Full file tree with annotations
- [Types & Interfaces](06-types-and-interfaces.md) — Core type definitions
- [Tool Registry](04-tool-registry.md) — All tools & their mappings
