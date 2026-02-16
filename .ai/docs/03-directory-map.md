# Directory Map

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

## Related

- [Architecture](02-architecture.md) — Component tree & key patterns
- [Tool Registry](04-tool-registry.md) — ToolID → Route → Component → Hook → Lib
- [Adding a New Tool](05-adding-new-tool.md) — Which files to touch
