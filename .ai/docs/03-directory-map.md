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
│   ├── main-layout/            # Main layout sub-modules (command actions, shell fragments)
│   │   │                       # Page-meta logic lives in src/lib/pageMeta.ts — it is pure
│   │   ├── BackgroundDecor.tsx
│   │   ├── MainContentWrapper.tsx
│   │   ├── SkipToMainContentLink.tsx
│   │   ├── useCommandPaletteActions.ts # Palette actions; PWA ones delegate to hooks/pwa-settings
│   │   ├── useCommandPaletteHotkey.ts  # Cmd/Ctrl+K listener + exported isEditableTarget
│   │   ├── useCommandPaletteHotkey.test.ts # Unit tests for the editable-target predicate
│   │   ├── useMainLayoutRouteEffects.ts
│   │   ├── useMainLayoutState.ts
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
│   ├── ToolPageLayout.tsx      # Tool page wrapper: icon, name, favorite + share actions, description, clickable tags, related tools
│   ├── RelatedTools.tsx        # "Related Tools" grid rendered on every tool page
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
│   │    ├── SnippetCard.tsx    # Code snippet card (moved from ui/: only the bridge uses it)
│   │    └── index.ts           # Barrel exports for ai-bridge module
│   ├── tools/                  # One component per tool (19 tools)
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
│   │   ├── ExternalToolPage.tsx  # Shared data-driven landing page for external tools
│   │   ├── DummyImageTool.tsx    # (external tools below are one-line adapters over it)
│   │   ├── VinTool.tsx
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
│   │   ├── SidebarEmptyState.tsx # Empty result message for sidebar search
│   │   ├── SidebarFooter.tsx   # Footer links (GitHub, theme toggle)
│   │   ├── SidebarNavigation.tsx # Favorites, recents, apps, external sections
│   │   ├── SidebarSearch.tsx   # Search input in sidebar
│   │   ├── navigationLayout.ts # Sidebar section index-offset helpers
│   │   ├── useSidebarNavigation.ts # Keyboard nav hook for sidebar items
│   │   ├── useSidebarSections.ts # Sidebar section config builder hook
│   │   └── index.ts            # Barrel exports for sidebar module
│   └── ui/                     # Shared UI primitives — all named exports, no default exports
│       ├── Button.tsx          # CVA variants: default/destructive/outline/secondary/ghost/link
│       ├── Card.tsx            # Card + CardHeader + CardTitle + CardDescription + CardContent + CardFooter
│       ├── CodeHighlight.tsx   # Syntax-highlighted code display
│       ├── CopyButton.tsx      # Icon button over useCopyToClipboard; use successMessage, not onCopy
│       ├── FavoriteButton.tsx  # Favourite toggle; pass itemName so list items name themselves
│       ├── FavoriteIcon.tsx    # Reusable star icon with active fill state
│       ├── Input.tsx           # Styled HTML input
│       ├── Textarea.tsx        # Styled HTML textarea
│       ├── Slider.tsx          # Radix UI Slider wrapper
│       ├── Switch.tsx          # Radix UI Switch wrapper
│       ├── ToolLayout.tsx      # Layout + Section + Panel compound component
│       └── sonner.tsx          # Sonner toast provider (theme-aware)
│
├── hooks/                      # One hook per tool (business logic) + shared behaviour hooks
│   ├── useCopyToClipboard.ts   # Clipboard write + toast + copied flag; the app's only copy path
│   ├── useCopyToClipboard.test.ts # Unit tests for the message-resolution rules
│   ├── useShareableUrlState.ts # Mirrors tool state into the query string (one write per tool)
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
│   ├── pwa-settings/           # PWA helpers shared by usePwaSettings, the command palette, and main.tsx
│   │   ├── cache.ts
│   │   ├── constants.ts        # Single source for the cache prefix and toast/storage keys
│   │   ├── environment.ts
│   │   ├── events.ts
│   │   ├── formatters.ts
│   │   ├── operations.ts       # checkForServiceWorkerUpdate / clearOfflineCache incl. their toasts
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
│   ├── tools.tsx               # TOOLS array (19 entries) + getToolById()
│   ├── externalTools.ts        # Hero + section content for every external-tool landing page
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
├── lib/                        # Framework-free logic (no React, no react-router)
│   │                           # Most modules are pure functions. Two exceptions, both deliberate:
│   │                           #   relatedTools.ts caches its MiniSearch index in a WeakMap
│   │                           #   randomUtils.ts + obfuscation.ts read platform globals (crypto, btoa)
│   ├── utils.ts                # cn() — clsx + tailwind-merge
│   ├── caseUtils.ts            # toSnakeCase, toKebabCase, toCamelCase, toPascalCase
│   ├── caseUtils.test.ts       # Unit tests for case conversion utilities
│   ├── diffUtils.ts            # computeDiff, getDiffStats, toUnifiedDiff (uses `diff` lib)
│   ├── diffUtils.test.ts       # Unit tests for diff utility helpers
│   ├── randomUtils.ts          # randomInt/randomString/randomUUID on crypto.getRandomValues
│   ├── randomUtils.test.ts     # Unit tests incl. the no-native-randomUUID and no-crypto paths
│   ├── passwordGenerator.ts    # Password charsets + generatePassword (uses randomUtils)
│   ├── passwordGenerator.test.ts
│   ├── obfuscation.ts          # obfuscate/deobfuscate for localStorage — encoding, NOT encryption
│   ├── obfuscation.test.ts     # Unit tests for the obfuscation round-trip
│   ├── jsonUtils.ts            # formatJson/minifyJson/assertValidJson (shared with the AI bridge)
│   ├── jsonUtils.test.ts       # Unit tests for JSON transforms
│   ├── xmlUtils.ts             # formatXml/minifyXml/assertValidXml (shared with the AI bridge)
│   ├── xmlUtils.test.ts        # Unit tests incl. xml-formatter's lenient validation
│   ├── base64Utils.ts          # Unicode-safe encode/decode (shared with the AI bridge)
│   ├── base64Utils.test.ts     # Unit tests incl. Thai text and emoji round-trips
│   ├── xmlToJson.ts            # convertXmlToJson (uses `simple-xml-to-json` + DOMParser)
│   ├── xmlToJson.test.ts       # Unit tests; DOMParser is stubbed because jsdom cannot boot here
│   ├── pageMeta.ts             # resolvePageMeta — pathname to title/description/documentTitle
│   ├── pageMeta.test.ts        # Table tests across tool, blog, settings, ai-bridge, dashboard routes
│   ├── relatedTools.ts         # getRelatedTools — curated `related` IDs then MiniSearch auto-query fallback
│   ├── relatedTools.test.ts    # Unit tests for related-tool resolution
│   ├── aiBridgeQuery.ts        # Parse/normalize AI bridge query parameters into AIToolRequest (zod-validated)
│   ├── aiBridgeQuery.test.ts   # Unit tests for AI bridge query parsing/normalization
│   ├── aiToolBridge.ts         # Public facade for AI bridge exports (backward-compatible import path)
│   ├── ai-tool-bridge/         # Internal AI bridge modules (catalog/schema/runners/snapshot/types)
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── catalog.ts
│   │   ├── contracts.ts
│   │   ├── schema.ts
│   │   ├── errors.ts
│   │   ├── validators.ts
│   │   ├── registry.ts
│   │   ├── errorTaxonomy.ts
│   │   ├── errorResponse.ts
│   │   ├── snapshotPolicy.ts
│   │   ├── snapshot.ts
│   │   ├── runners.ts
│   │   ├── runners.test.ts
│   │   ├── handlers/
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── jsonFormatter.ts
│   │   │   ├── xmlFormatter.ts
│   │   │   ├── base64Tool.ts
│   │   │   ├── caseConverter.ts
│   │   │   ├── urlParser.ts
│   │   │   ├── diffViewer.ts
│   │   │   └── thaiDateConverter.ts
│   ├── passwordStrength.ts     # getPasswordStrength() + PasswordOptions (zod-validated)
│   ├── passwordStrength.test.ts # Unit tests for password strength scoring
│   ├── thaiId.ts               # Thai ID decode/validation helpers (zod-validated IDs)
│   ├── thaiId.test.ts          # Unit tests for Thai ID utility helpers
│   ├── thaiDate.ts             # Thai date formatting/parsing (uses `dayjs`, zod-validated parse input)
│   ├── thaiDate.test.ts        # Unit tests for Thai date utilities
│   ├── shareableUrlState.ts    # Shared helper for shareable URL query sync rules
│   ├── shareableUrlState.test.ts # Unit tests for query sync helper behavior
│   ├── urlUtils.ts             # parseUrl, updateUrlParam (zod-validated param mutations)
│   └── urlUtils.test.ts        # Unit tests for URL parsing and param helpers
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
