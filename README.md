# ⚡ DevPulse - Developer Utility Suite

DevPulse is a comprehensive collection of developer tools integrated with AI capabilities. Built with React, TypeScript, and Tailwind CSS, it aims to boost productivity by providing essential utilities in a single, well-designed interface.

## 🚀 Features

- ⌘ **Global Command Palette**: Quickly access tools with `Cmd+K` (macOS) or `Ctrl+K` (Windows/Linux).
- ⌨️ **Keyboard-First Navigation**: Optimized for power users with keyboard shortcuts and navigation.
- 🌑 **Dark Mode UI**: Clean, modern interface designed for extended coding sessions.
- 🔗 **Dynamic Routing**: Instant tool switching with URL synchronization.
- 🤖 **AI-Powered Assistance**: Integrated Gemini AI smart assistant for code analysis and problem-solving.
- ♿ **Accessible**: WCAG-compliant with ARIA labels, skip-to-content, keyboard navigation, and proper focus management.
- ⚡ **Lazy Loading**: Code-split routes with `React.lazy()` and optimized vendor chunks for fast initial loads.
- 🛡️ **Error Boundaries**: Per-tool error boundaries prevent a single tool crash from taking down the entire app.
- 🔍 **Fuzzy Search**: Powered by MiniSearch with prefix matching, typo tolerance, and tag-based filtering.
- 🏷️ **Tool Tags**: Each tool has searchable tags for quick discovery.

### 🛠️ Available Tools

| #   | Tool                   | Description                                                             |
| --- | ---------------------- | ----------------------------------------------------------------------- |
| 1   | 📝 JSON Formatter      | Prettify, minify, and validate JSON data.                               |
| 2   | 🔢 Base64 Tool         | Encode and decode strings/files to Base64.                              |
| 3   | 🔠 Case Converter      | Switch between camelCase, PascalCase, snake_case, kebab-case, and more. |
| 4   | 🔐 Password Generator  | Create secure, random passwords with customizable options.              |
| 5   | 🌍 Timezone Converter  | Convert dates and times across different global timezones.              |
| 6   | 📅 Thai Date Converter | Convert Gregorian dates to Thai Buddhist Era (BE) formats.              |
| 7   | ⏰ Crontab Guru        | Generate and explain cron schedule expressions.                         |
| 8   | ✨ AI Smart Assistant  | Analyze code snippets and get intelligent suggestions via Gemini AI.    |
| 9   | 🆔 UUID Generator      | Create Version 4 UUIDs (GUIDs).                                        |
| 10  | 🔗 URL Parser          | Parse, encode, and decode URLs.                                         |
| 11  | 📊 Diff Viewer         | Compare two texts side-by-side and view differences.                    |

## 💻 Tech Stack

| Category        | Technologies                                            |
| --------------- | ------------------------------------------------------- |
| ⚛️ Frontend     | React 19, TypeScript 5.8, Vite 6                        |
| 🎨 Styling      | Tailwind CSS 3, Radix UI (Switch, Slider, Slot)         |
| 🔹 Icons        | Lucide React                                            |
| 🧠 AI           | Google Gemini API (`@google/genai`)                     |
| 🛣️ Routing      | React Router DOM 7                                      |
| 📦 UI Utilities | CVA, clsx, tailwind-merge, Sonner (toasts)              |
| 🔍 Search       | MiniSearch (fuzzy full-text search)                      |
| 📅 Date/Time    | Day.js (with timezone plugin)                            |
| 📊 Diff         | diff (line-based text comparison)                        |
| 🧪 Testing      | Vitest, React Testing Library, jsdom                     |
| 🧹 Code Quality | ESLint 8, Prettier 3, TypeScript strict mode             |
| 🔄 CI/CD        | GitHub Actions (lint, format, typecheck)                 |

## 📁 Project Structure

```
src/
├── components/
│   ├── tools/          # Individual tool page components
│   ├── ui/             # Shared UI primitives (Button, Card, Input, etc.)
│   ├── Dashboard.tsx   # Landing page with tool grid
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── Header.tsx      # App header with controls
│   ├── MainLayout.tsx  # Top-level layout wrapper
│   ├── CommandPalette.tsx  # Cmd+K search modal
│   ├── ErrorBoundary.tsx   # Per-tool error boundary
│   └── ToolPageLayout.tsx  # Tool page wrapper
├── hooks/              # Custom hooks (business logic per tool)
├── context/            # Theme & user preferences providers
├── data/               # Tool registry
├── services/           # API services (Gemini)
├── lib/                # Shared utilities
└── types.ts            # Shared type definitions
```

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### 📥 Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/M4R14/dev-util-tools.git
    cd dev-util-tools
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  **Configure API Key** (for AI Assistant):
    - **Option A (Recommended)**: Create a `.env.local` file in the root directory:
      ```env
      GEMINI_API_KEY=your_gemini_api_key_here
      ```
    - **Option B (UI)**: Enter your key directly in the AI Assistant settings (stored in browser local storage).

    Get an API key from [Google AI Studio](https://aistudio.google.com/).

4.  Run the development server:

    ```bash
    npm run dev
    ```

5.  Open your browser and navigate to `http://localhost:3000`.

## 📜 Available Scripts

| Command                | Description                                   |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Start the Vite development server             |
| `npm run build`        | Build for production                          |
| `npm run preview`      | Preview the production build locally          |
| `npm test`             | Run unit tests with Vitest                    |
| `npm run test:ui`      | Run tests with Vitest UI                      |
| `npm run coverage`     | Run tests with code coverage                  |
| `npm run lint`         | Run ESLint on `.ts` and `.tsx` files          |
| `npm run lint:fix`     | Run ESLint with auto-fix                      |
| `npm run format`       | Format all files with Prettier                |
| `npm run format:check` | Check formatting without writing changes      |
| `npm run typecheck`    | Run TypeScript type checking (`tsc --noEmit`) |

## ⌨️ Keyboard Shortcuts

| Shortcut                  | Action                                      |
| ------------------------- | ------------------------------------------- |
| `Cmd+K` / `Ctrl+K`        | Open Command Palette                        |
| `Arrow Up` / `Arrow Down` | Navigate Sidebar or Command Palette results |
| `Enter`                   | Select Tool                                 |
| `Escape`                  | Close Command Palette                       |

## 🔄 CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs on every push and pull request to `main`:

1. **Lint** — ESLint checks for code quality issues
2. **Format** — Prettier verifies consistent formatting
3. **Typecheck** — TypeScript validates type safety

## License

This project is open source and available under the [MIT License](LICENSE).
