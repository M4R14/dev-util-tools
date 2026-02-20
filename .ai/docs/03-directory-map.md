# Directory Map

```
src/
├── types.ts                    # ToolID enum, ToolMetadata interface
├── App.tsx                     # Routes + providers + lazy loading
├── tools.smoke.test.ts         # Module + registry smoke tests for key tool pages
├── main.tsx                    # ReactDOM entry point
├── index.css                   # Tailwind directives + CSS variables
│
├── components/
│   ├── MainLayout.tsx          # Shell: sidebar + header + cmd palette + content area + footer
│   ├── main-layout/            # Main layout sub-modules (page meta, command actions, shell fragments)
│   │   ├── meta.ts
│   │   ├── useCommandPaletteActions.ts
│   │   ├── MainFooter.tsx
│   │   ├── MobileCommandPaletteButton.tsx
│   │   └── index.ts            # Barrel exports for main-layout module
│   ├── Sidebar.tsx             # Navigation with search, favorites, recents, all tools
│   ├── Header.tsx              # Top bar: title, search, theme toggle, GitHub link
│   ├── Dashboard.tsx           # Landing page: hero search + tool cards grid
│   ├── Blog.tsx                # Product updates page (renders posts from markdown)
│   ├── Settings.tsx            # App-level settings page (offline status, install prompt, cache/update actions)
│   ├── blog/                   # Blog page sub-components
│   │   ├── BlogPostCard.tsx
│   │   └── index.ts            # Barrel exports for blog module
│   ├── dashboard/              # Dashboard sub-components
│   │   ├── DashboardHero.tsx
│   │   ├── DashboardToolSection.tsx
│   │   ├── ToolCard.tsx
│   │   └── index.ts            # Barrel exports for dashboard module
│   ├── CommandPalette.tsx      # Cmd+K modal container (state + keyboard orchestration)
│   ├── command-palette/        # Command palette sub-components + local models/helpers
│   │   ├── CommandPaletteList.tsx
│   │   ├── CommandPaletteOption.tsx
│   │   ├── CommandPaletteEmptyState.tsx
│   │   ├── CommandPaletteFooter.tsx
│   │   ├── items.ts
│   │   ├── types.ts
│   │   └── index.ts            # Barrel exports for command palette module
│   ├── ToolPageLayout.tsx      # Tool page wrapper: icon, name, favorite + share actions, description, clickable tags
│   ├── ErrorBoundary.tsx       # Class component error boundary with recovery UI
│   ├── ToolLinkItem.tsx        # Sidebar NavLink item with active/selected states
│   ├── AIAgentBridge.tsx       # AI Agent Bridge route page (orchestrates AI bridge UI + state)
│   ├── ai-bridge/              # AI Agent Bridge module files
│   │    ├── BridgeHeroCard.tsx
│   │    ├── EndpointNavigatorCard.tsx
│   │    ├── ExecutionModesCard.tsx
│   │    ├── QuickstartCard.tsx
│   │    ├── RunQueryCard.tsx
│   │    ├── LiveResponseCard.tsx
│   │    └── index.ts           # Barrel exports for ai-bridge module
│   ├── tools/                  # One component per tool (18 tools)
│   │   ├── JSONFormatter.tsx
│   │   ├── Base64Tool.tsx
│   │   ├── CaseConverter.tsx
│   │   ├── PasswordGenerator.tsx # Main Password Generator composition
│   │   ├── password-generator/   # Password Generator sub-components and local helpers
│   │   │   ├── PasswordOutputPanel.tsx
│   │   │   ├── PasswordOptionsPanel.tsx
│   │   │   ├── PasswordGuidancePanel.tsx
│   │   │   ├── constants.ts
│   │   │   ├── types.ts
│   │   │   ├── utils.ts
│   │   │   └── index.ts        # Barrel exports for password-generator module
│   │   ├── TimezoneConverter.tsx
│   │   ├── ThaiIdTool.tsx
│   │   ├── thai-date/          # Thai Date Converter (split into sub-components)
│   │   │   ├── index.tsx       # Main composition component
│   │   │   ├── CurrentTimeSection.tsx
│   │   │   ├── DateConverterSection.tsx
│   │   │   ├── DateFormatCard.tsx
│   │   │   ├── DatePickerInput.tsx
│   │   │   ├── TextParserInput.tsx
│   │   │   └── ParserResultSection.tsx
│   │   ├── CrontabTool.tsx
│   │   ├── WordCounterTool.tsx
│   │   ├── WheelRandomTool.tsx
│   │   ├── DummyImageTool.tsx
│   │   ├── AIAssistant.tsx     # AI Smart Assistant page composition
│   │   ├── ai/                 # AI Smart Assistant sub-components
│   │   │   ├── AssistantHeader.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── Composer.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── MessageContent.tsx
│   │   │   ├── SettingsModal.tsx
│   │   │   └── index.ts        # Barrel exports for AI assistant module
│   │   ├── UUIDGenerator.tsx    # Main UUID Generator composition
│   │   ├── uuid-generator/      # UUID Generator sub-components and local helpers
│   │   │   ├── UUIDOptionsPanel.tsx
│   │   │   ├── UUIDResultsHeader.tsx
│   │   │   ├── UUIDResultsList.tsx
│   │   │   ├── constants.ts
│   │   │   ├── utils.ts
│   │   │   └── index.ts        # Barrel exports for uuid-generator module
│   │   ├── UrlParser.tsx
│   │   ├── url-parser/         # URL parser sub-components
│   │   │   ├── UrlComponentInput.tsx
│   │   │   ├── UrlComponents.tsx
│   │   │   ├── UrlInputSection.tsx
│   │   │   ├── UrlQueryParams.tsx
│   │   │   └── index.ts        # Barrel exports for url-parser module
│   │   ├── DiffViewer.tsx      # Main Diff Viewer composition
│   │   ├── diff-viewer/        # Diff Viewer sub-components and local helpers
│   │   │   ├── DiffInputPanels.tsx
│   │   │   ├── DiffToolbar.tsx
│   │   │   ├── DiffOutputPanel.tsx
│   │   │   ├── DiffLineRows.tsx
│   │   │   ├── constants.ts
│   │   │   ├── utils.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts        # Barrel exports for diff-viewer module
│   │   ├── RegexTester.tsx
│   │   ├── XMLFormatter.tsx
│   │   └── XMLToJson.tsx
│   ├── sidebar/                # Sidebar sub-components
│   │   ├── SidebarBrand.tsx    # Logo and app name
│   │   ├── SidebarFooter.tsx   # Footer links (GitHub, theme toggle)
│   │   ├── SidebarNavigation.tsx # Favorites, recents, apps, external sections
│   │   ├── SidebarSearch.tsx   # Search input in sidebar
│   │   ├── useSidebarNavigation.ts # Keyboard nav hook for sidebar items
│   │   └── index.ts            # Barrel exports for sidebar module
│   └── ui/                     # Shared UI primitives
│       ├── Button.tsx          # CVA variants: default/destructive/outline/secondary/ghost/link
│       ├── Card.tsx            # Card + CardHeader + CardTitle + CardDescription + CardContent + CardFooter
│       ├── CodeHighlight.tsx   # Syntax-highlighted code display
│       ├── CopyButton.tsx      # Clipboard copy with toast feedback
│       ├── FavoriteButton.tsx  # Reusable toggle favorite icon button
│       ├── FavoriteIcon.tsx    # Reusable star icon with active fill state
│       ├── SnippetCard.tsx     # Reusable code snippet card (title + copy + highlight)
│       ├── Input.tsx           # Styled HTML input
│       ├── Textarea.tsx        # Styled HTML textarea
│       ├── Slider.tsx          # Radix UI Slider wrapper
│       ├── Switch.tsx          # Radix UI Switch wrapper
│       ├── ToolLayout.tsx      # Layout + Section + Panel compound component
│       └── sonner.tsx          # Sonner toast provider (theme-aware)
│
├── hooks/                      # One hook per tool (business logic)
│   ├── useAIChat.ts            # AI Assistant chat logic
│   ├── useBase64.ts
│   ├── useCaseConverter.ts
│   ├── useDiffViewer.ts
│   ├── useJsonFormatter.ts
│   ├── usePasswordGenerator.ts
│   ├── useThaiId.ts
│   ├── useThaiDateConverter.ts
│   ├── useTimezoneConverter.ts
│   ├── useToolSearch.ts        # MiniSearch-powered fuzzy search
│   ├── useUrlParser.ts
│   ├── useUUIDGenerator.ts
│   ├── usePwaSettings.ts       # Shared PWA/offline hook entry (exports hook + format helpers)
│   ├── pwa-settings/           # Internal modules used by usePwaSettings
│   │   ├── cache.ts
│   │   ├── constants.ts
│   │   ├── environment.ts
│   │   ├── events.ts
│   │   ├── formatters.ts
│   │   ├── serviceWorker.ts
│   │   ├── types.ts
│   │   └── index.ts            # Barrel exports for pwa-settings module
│   ├── useXmlFormatter.ts
│   └── useXmlToJson.ts
│
├── context/
│   ├── ThemeContext.tsx         # { theme, toggleTheme } — persists to localStorage
│   ├── SearchContext.tsx        # { searchTerm, setSearchTerm } — global search state
│   └── UserPreferencesContext.tsx # { favorites, recents, toggleFavorite, addRecent }
│
├── data/
│   ├── tools.tsx               # TOOLS array (18 entries) + getToolById()
│   ├── blogPosts.ts            # Markdown loader/parser for blog posts (frontmatter + markdown-to-HTML)
│   └── aiBridge.ts             # AI Bridge endpoint specs + query templates/snippets
│
├── content/
│   └── blog/                   # Blog source files in markdown
│       ├── 2026-02-20-project-overview.md
│       ├── 2026-02-20-blog-markdown-html-styling.md
│       ├── 2026-02-20-navigation-refresh.md
│       ├── 2026-02-20-thai-date-ui-refresh.md
│       ├── 2026-02-20-ai-assisted-development.md
│       ├── 2026-02-19-ai-assistant-updates.md
│       ├── 2026-02-18-external-tools-addition.md
│       ├── 2026-02-17-ai-bridge-output-mode.md
│       └── auto-release-notes.md # Auto-generated mini release notes from git history
│
├── lib/                        # Pure utility functions (no React)
│   ├── utils.ts                # cn() — clsx + tailwind-merge
│   ├── caseUtils.ts            # toSnakeCase, toKebabCase, toCamelCase, toPascalCase
│   ├── caseUtils.test.ts       # Unit tests for case conversion utilities
│   ├── diffUtils.ts            # computeDiff, getDiffStats, toUnifiedDiff (uses `diff` lib)
│   ├── diffUtils.test.ts       # Unit tests for diff utility helpers
│   ├── aiBridgeQuery.ts        # Parse/normalize AI bridge query parameters into AIToolRequest
│   ├── passwordStrength.ts     # getPasswordStrength()
│   ├── passwordStrength.test.ts # Unit tests for password strength scoring
│   ├── thaiId.ts               # Thai ID decode/validation helpers
│   ├── thaiId.test.ts          # Unit tests for Thai ID utility helpers
│   ├── thaiDate.ts             # Thai date formatting/parsing (uses `dayjs`)
│   ├── shareableUrlState.ts    # Shared helper for shareable URL query sync rules
│   ├── shareableUrlState.test.ts # Unit tests for query sync helper behavior
│   ├── urlUtils.ts             # parseUrl, updateUrlParam
│   ├── urlUtils.test.ts        # Unit tests for URL parsing and param helpers
│   ├── xmlToJson.ts            # XML document to JSON conversion logic
│   └── crypto.ts               # encrypt/decrypt (Base64 obfuscation for API key storage)
│
├── services/
│   └── gemini.ts               # askGemini(prompt, codeContext?, apiKey?) — Google Gemini API
│
└── test/
    └── setup.ts                # Vitest setup: jest-dom matchers + RTL cleanup
```

Additional static assets (copied as-is at build time):

```
public/
├── 404.html                    # GitHub Pages SPA redirect handler
├── manifest.webmanifest        # PWA manifest metadata
├── offline.html                # Offline fallback page
├── sw.js                       # Service worker (offline cache + runtime caching)
└── icons/
    ├── icon-192.svg            # PWA icon
    └── icon-512.svg            # PWA icon
```

Automation scripts:

```
scripts/
└── generate-release-notes.mjs  # Builds auto-release markdown from recent commits/PR refs
```

---

## Related

- [Architecture](02-architecture.md) — Component tree & key patterns
- [Tool Registry](04-tool-registry.md) — ToolID → Route → Component → Hook → Lib
- [Adding a New Tool](05-adding-new-tool.md) — Which files to touch
- [Blog Updates](11-blog-updates.md) — How markdown blog posts are structured
