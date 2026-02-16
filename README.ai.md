# DevPulse — AI Context Document

> This file is designed for AI assistants (Copilot, Cursor, Codeium, etc.) to quickly understand the codebase.
> Last updated: 2026-02-16

## Project Overview

**DevPulse** is a single-page React application providing 11 developer utility tools with an integrated Gemini AI assistant. It runs entirely client-side (no backend) except for the optional Gemini API calls.

- **Framework:** React 19 + TypeScript 5.8 + Vite 6
- **Styling:** Tailwind CSS 3 + Radix UI primitives
- **Routing:** React Router DOM 7 (hash-free, path-based)
- **State:** React Context (theme, search, user preferences) — no Redux/Zustand
- **Testing:** Vitest + React Testing Library + jsdom (configured, no test files yet)

---

## Architecture

```
App.tsx                          ← ThemeProvider > UserPreferencesProvider > SearchProvider > MainLayout
  └─ MainLayout.tsx              ← Sidebar + Header + CommandPalette + ErrorBoundary + ToolPageLayout
       └─ <Route /:toolId>      ← Lazy-loaded tool component (code-split per tool)
       └─ <Route />             ← Dashboard (landing page)
```

### Key Patterns

| Pattern | Implementation |
|---|---|
| **Code splitting** | Every tool is `React.lazy()` imported in `App.tsx` via `TOOL_COMPONENTS` map |
| **Error isolation** | Each tool route is wrapped in `<ErrorBoundary>` (class component) |
| **Hook-per-tool** | Business logic lives in `src/hooks/use<ToolName>.ts`, UI in `src/components/tools/<ToolName>.tsx` |
| **Pure utilities** | Reusable logic extracted to `src/lib/*.ts` (no React dependencies) |
| **Compound components** | `ToolLayout` has `.Section` and `.Panel` sub-components |
| **Search** | MiniSearch index with fuzzy matching, prefix search, field boosting (name 3× > tags 2× > description 1×) |
| **Persistence** | Favorites & recents stored in `localStorage`; theme in `localStorage` + system preference |

---

## Directory Map

```
src/
├── types.ts                    # ToolID enum, ToolMetadata interface
├── App.tsx                     # Routes + providers + lazy loading
├── main.tsx                    # ReactDOM entry point
├── index.css                   # Tailwind directives + CSS variables
│
├── components/
│   ├── MainLayout.tsx          # Shell: sidebar + header + cmd palette + content area
│   ├── Sidebar.tsx             # Navigation with search, favorites, recents, all tools
│   ├── Header.tsx              # Top bar: title, search, theme toggle, GitHub link
│   ├── Dashboard.tsx           # Landing page: hero search + tool cards grid
│   ├── CommandPalette.tsx      # Cmd+K modal with keyboard navigation
│   ├── ToolPageLayout.tsx      # Tool page wrapper: icon, name, description, clickable tags
│   ├── ErrorBoundary.tsx       # Class component error boundary with recovery UI
│   ├── ToolLinkItem.tsx        # Sidebar NavLink item with active/selected states
│   ├── tools/                  # One component per tool (11 files)
│   │   ├── JSONFormatter.tsx
│   │   ├── Base64Tool.tsx
│   │   ├── CaseConverter.tsx
│   │   ├── PasswordGenerator.tsx
│   │   ├── TimezoneConverter.tsx
│   │   ├── ThaiDateConverter.tsx
│   │   ├── CrontabTool.tsx
│   │   ├── AIAssistant.tsx     # + AICodeBlock.tsx, AIMessageContent.tsx, SettingsModal.tsx
│   │   ├── UUIDGenerator.tsx
│   │   ├── UrlParser.tsx
│   │   └── DiffViewer.tsx
│   └── ui/                     # Shared UI primitives
│       ├── Button.tsx          # CVA variants: default/destructive/outline/secondary/ghost/link
│       ├── Card.tsx            # Card + CardHeader + CardTitle + CardDescription + CardContent + CardFooter
│       ├── CopyButton.tsx      # Clipboard copy with toast feedback
│       ├── Input.tsx           # Styled HTML input
│       ├── Textarea.tsx        # Styled HTML textarea
│       ├── Slider.tsx          # Radix UI Slider wrapper
│       ├── Switch.tsx          # Radix UI Switch wrapper
│       ├── ToolLayout.tsx      # Layout + Section + Panel compound component
│       └── sonner.tsx          # Sonner toast provider (theme-aware)
│
├── hooks/                      # One hook per tool (business logic)
│   ├── useBase64.ts
│   ├── useCaseConverter.ts
│   ├── useDiffViewer.ts
│   ├── useJsonFormatter.ts
│   ├── usePasswordGenerator.ts
│   ├── useThaiDateConverter.ts
│   ├── useTimezoneConverter.ts
│   ├── useToolSearch.ts        # MiniSearch-powered fuzzy search
│   ├── useUrlParser.ts
│   ├── useUUIDGenerator.ts
│   └── useAIChat.ts            # (in hooks/ directory, used by AIAssistant)
│
├── context/
│   ├── ThemeContext.tsx         # { theme, toggleTheme } — persists to localStorage
│   ├── SearchContext.tsx        # { searchTerm, setSearchTerm } — global search state
│   └── UserPreferencesContext.tsx # { favorites, recents, toggleFavorite, addRecent }
│
├── data/
│   └── tools.tsx               # TOOLS array (11 entries) + getToolById()
│
├── lib/                        # Pure utility functions (no React)
│   ├── utils.ts                # cn() — clsx + tailwind-merge
│   ├── caseUtils.ts            # toSnakeCase, toKebabCase, toCamelCase, toPascalCase
│   ├── diffUtils.ts            # computeDiff, getDiffStats, toUnifiedDiff (uses `diff` lib)
│   ├── passwordStrength.ts     # getPasswordStrength()
│   ├── thaiDate.ts             # Thai date formatting/parsing (uses `dayjs`)
│   ├── urlUtils.ts             # parseUrl, updateUrlParam
│   └── obfuscate.ts            # obfuscate/deobfuscate (Base64 key storage)
│
├── services/
│   └── gemini.ts               # askGemini(prompt, codeContext?, apiKey?) — Google Gemini API
│
└── test/
    └── setup.ts                # Vitest setup: jest-dom matchers + RTL cleanup
```

---

## Tool Registry

All tools are defined in `src/data/tools.tsx` and enumerated in `src/types.ts`.

| ToolID | Route | Component | Hook | Lib |
|---|---|---|---|---|
| `json-formatter` | `/json-formatter` | `JSONFormatter.tsx` | `useJsonFormatter` | — |
| `base64-tool` | `/base64-tool` | `Base64Tool.tsx` | `useBase64` | — |
| `case-converter` | `/case-converter` | `CaseConverter.tsx` | `useCaseConverter` | `caseUtils.ts` |
| `password-gen` | `/password-gen` | `PasswordGenerator.tsx` | `usePasswordGenerator` | `passwordStrength.ts` |
| `timezone-converter` | `/timezone-converter` | `TimezoneConverter.tsx` | `useTimezoneConverter` | dayjs + timezone plugin |
| `thai-date-converter` | `/thai-date-converter` | `ThaiDateConverter.tsx` | `useThaiDateConverter` | `thaiDate.ts` (dayjs) |
| `crontab-guru` | `/crontab-guru` | `CrontabTool.tsx` | — (static) | — |
| `ai-assistant` | `/ai-assistant` | `AIAssistant.tsx` | `useAIChat` | `gemini.ts` service |
| `uuid-generator` | `/uuid-generator` | `UUIDGenerator.tsx` | `useUUIDGenerator` | — |
| `url-parser` | `/url-parser` | `UrlParser.tsx` | `useUrlParser` | `urlUtils.ts` |
| `diff-viewer` | `/diff-viewer` | `DiffViewer.tsx` | `useDiffViewer` | `diffUtils.ts` (diff lib) |

---

## How to Add a New Tool

1. **`src/types.ts`** — Add to `ToolID` enum: `MY_TOOL = 'my-tool'`
2. **`src/lib/myToolUtils.ts`** _(optional)_ — Pure utility functions
3. **`src/hooks/useMyTool.ts`** — Hook with state & logic, returns values for the component
4. **`src/components/tools/MyTool.tsx`** — React component using `ToolLayout` + hook, `export default`
5. **`src/data/tools.tsx`** — Add entry to `TOOLS` array with `id`, `name`, `description`, `icon` (from lucide-react), `tags`
6. **`src/App.tsx`** — Add to `TOOL_COMPONENTS`: `[ToolID.MY_TOOL]: lazy(() => import('./components/tools/MyTool'))`

That's it — routing, sidebar, search, command palette, and dashboard all pick up the new tool automatically.

---

## Key Interfaces & Types

```ts
// src/types.ts
enum ToolID {
  JSON_FORMATTER = 'json-formatter',
  BASE64_TOOL = 'base64-tool',
  CASE_CONVERTER = 'case-converter',
  PASSWORD_GEN = 'password-gen',
  TIMEZONE_CONVERTER = 'timezone-converter',
  AI_ASSISTANT = 'ai-assistant',
  THAI_DATE_CONVERTER = 'thai-date-converter',
  CRONTAB = 'crontab-guru',
  UUID_GENERATOR = 'uuid-generator',
  URL_PARSER = 'url-parser',
  DIFF_VIEWER = 'diff-viewer',
}

interface ToolMetadata {
  id: ToolID;
  name: string;
  description: string;
  icon: LucideIcon;
  tags?: string[];
}
```

```ts
// src/lib/diffUtils.ts
type DiffLineType = 'added' | 'removed' | 'unchanged';
interface DiffLine { type: DiffLineType; value: string; oldLineNumber?: number; newLineNumber?: number }
interface DiffStats { additions: number; deletions: number; unchanged: number }
```

```ts
// src/lib/passwordStrength.ts
interface PasswordStrength { label: 'Weak' | 'Medium' | 'Strong'; color: string; textColor: string; percent: number; message: string }
interface PasswordOptions { length: number; includeUpper: boolean; includeLower: boolean; includeNumbers: boolean; includeSymbols: boolean }
```

```ts
// src/lib/urlUtils.ts
interface UrlParam { key: string; value: string }
```

---

## Dependencies (Production)

| Package | Purpose |
|---|---|
| `react`, `react-dom` | UI framework (v19) |
| `react-router-dom` | Client-side routing (v7) |
| `lucide-react` | Icon library |
| `@radix-ui/react-slider` | Accessible slider primitive |
| `@radix-ui/react-switch` | Accessible toggle switch |
| `@radix-ui/react-slot` | Polymorphic component pattern (asChild) |
| `class-variance-authority` | Button/component variant system |
| `clsx` + `tailwind-merge` | Conditional + deduplicated Tailwind class merging |
| `sonner` | Toast notifications |
| `dayjs` | Date/time manipulation (+ utc & timezone plugins) |
| `diff` | Line-based text diffing (Myers algorithm) |
| `minisearch` | Fuzzy full-text search index |
| `@google/genai` | Google Gemini AI API client |

---

## Build & Dev

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server on `http://localhost:3000` |
| `npm run build` | Production build (code-split, 3 vendor chunks) |
| `npm test` | Vitest (watch mode) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

### Vendor Chunks (Rollup)

| Chunk | Contents |
|---|---|
| `vendor-react` | react, react-dom, react-router-dom |
| `vendor-radix` | @radix-ui/react-slot, switch, slider |
| `vendor-ui` | lucide-react, sonner, CVA, clsx, tailwind-merge |

Each tool component is its own lazy chunk (~2–12 kB gzipped).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Optional | Google Gemini API key (in `.env.local`). Can also be set via the AI Assistant UI (stored in localStorage). |

---

## Conventions

- **File naming:** PascalCase for components (`MyTool.tsx`), camelCase for hooks (`useMyTool.ts`) and utilities (`myUtils.ts`)
- **Exports:** Tool components use `export default`. Hooks and utilities use named exports.
- **Styling:** Tailwind utility classes only. Theme variables defined as CSS custom properties in `index.css`. Use `cn()` for conditional classes.
- **Icons:** Always from `lucide-react`. Each tool has one icon in its metadata.
- **Toasts:** Use `toast.success()` / `toast.error()` from `sonner`.
- **Accessibility:** ARIA labels on interactive elements, `role` attributes on landmarks, keyboard navigation support.
- **No test files exist yet.** The test infrastructure (Vitest + RTL + jsdom) is configured and ready.
