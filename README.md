# ⚡ DevPulse — Developer Utility Suite

> **19 developer tools + AI assistant** in a single, fast, keyboard-driven web app.

<p align="center">
  <a href="https://m4r14.github.io/dev-util-tools/">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-m4r14.github.io/dev--util--tools-blue?style=for-the-badge" alt="Live Demo" />
  </a>
</p>

---

## 🛠️ Tools (19)

| #  | Tool | Description |
|----|------|-------------|
| 1  | 📝 **JSON Formatter** | Prettify, minify, and validate JSON data |
| 2  | 🔢 **Base64 Tool** | Encode and decode strings/files to Base64 |
| 3  | 🔠 **Case Converter** | camelCase ↔ PascalCase ↔ snake_case ↔ kebab-case and more |
| 4  | 🔐 **Password Generator** | Secure random passwords with strength meter |
| 5  | 🌍 **Timezone Converter** | Convert dates/times across global timezones |
| 6  | 📅 **Thai Date Converter** | Gregorian ↔ Thai Buddhist Era (พ.ศ.) formats |
| 7  | 🪪 **Thai ID Decoder** | Decode Thai citizen ID digits and verify checksum |
| 8  | ⏰ **Crontab Guru** | Generate and explain cron schedule expressions |
| 9  | ✨ **AI Smart Assistant** | Code analysis & suggestions via Gemini AI |
| 10 | 🆔 **UUID Generator** | Version 4 UUIDs (GUIDs) |
| 11 | 🔗 **URL Parser** | Parse, encode, and decode URLs |
| 12 | 📊 **Diff Viewer** | Side-by-side text comparison |
| 13 | 🔍 **Regex Tester** | Live regex matching & debugging |
| 14 | 📚 **Word Counter** | Quick access to wordcounter.net for writing metrics |
| 15 | 🎡 **Wheel Random** | Spin a random wheel for names, tasks, and giveaways |
| 16 | 🖼️ **Dummy Image** | Generate placeholder images via dummyimage.com |
| 17 | 📄 **XML Formatter** | Prettify and minify XML data |
| 18 | 🔁 **XML to JSON** | Convert XML documents into structured JSON |
| 19 | 🚗 **VIN Generator & Decoder** | Random ISO 3779 VINs with valid check digit, via tetono.com |

---

## 💻 Tech Stack

| Category | Technologies |
|----------|-------------|
| ⚛️ Frontend | React 19 · TypeScript 5.8 · Vite 6 |
| 🎨 Styling | Tailwind CSS 3 · Radix UI |
| 🧠 AI | Google Gemini API (`@google/genai`) |
| 🛣️ Routing | React Router DOM 7 |
| 📦 Utilities | CVA · clsx · tailwind-merge · Sonner · Lucide icons |
| 🔍 Search | MiniSearch (fuzzy full-text) |
| 📅 Date | Day.js + timezone plugin |
| 📊 Diff | `diff` (line-based comparison) |
| 🧪 Testing | Vitest · React Testing Library · jsdom |
| 🧹 Quality | ESLint 8 · Prettier 3 · TypeScript strict |
| 🚀 Deploy | GitHub Actions → GitHub Pages |

---

## ✨ Highlights

| | |
|---|---|
| ⌘ **Command Palette** | `Cmd+K` / `Ctrl+K` — instant fuzzy search + quick actions (`Open settings`, `Check updates`, `Clear offline cache`) |
| ⌨️ **Keyboard-First** | Arrow keys, Enter, Escape — navigate without a mouse |
| 🌑 **Dark Mode** | Clean UI designed for long coding sessions |
| 🤖 **AI-Powered** | Gemini AI assistant for code review & problem-solving |
| ⚡ **Lazy Loading** | Code-split routes via `React.lazy()` + optimized vendor chunks |
| 🛡️ **Error Boundaries** | Per-tool isolation — one crash won't break the app |
| 🔍 **Fuzzy Search** | MiniSearch with prefix matching, typo tolerance & tag filtering |
| ♿ **Accessible** | ARIA labels, skip-to-content, focus management |
| 📶 **Offline-Ready** | PWA service worker caches app shell and local tools for offline usage |
| 📰 **Auto Release Notes** | Blog includes mini release notes generated from recent commits/PR references |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` / `Ctrl+K` | Open Command Palette |
| `↑` / `↓` | Navigate results |
| `Enter` | Run selected tool/action |
| `Escape` | Close palette |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── tools/              # 19 tool components
│   │   ├── thai-date/      #   └ sub-components (6 files)
│   │   ├── ai/             #   └ sub-components
│   │   ├── diff-viewer/    #   └ sub-components
│   │   ├── password-generator/ # └ sub-components
│   │   ├── uuid-generator/ #   └ sub-components
│   │   └── url-parser/     #   └ sub-components
│   ├── ui/                 # Shared primitives (Button, Card, Input…)
│   ├── sidebar/            # Sidebar sub-components
│   ├── command-palette/    # Command palette sub-components + helpers
│   ├── main-layout/        # Main layout sub-components + helpers
│   ├── Dashboard.tsx       # Landing page — tool grid
│   ├── MainLayout.tsx      # Top-level layout
│   ├── CommandPalette.tsx  # ⌘K search modal
│   ├── ErrorBoundary.tsx   # Per-tool error boundary
│   └── ToolPageLayout.tsx  # Tool page wrapper
├── hooks/                  # Business logic per tool
├── context/                # Theme · search · user preferences
├── data/                   # Tool registry
├── services/               # Gemini API service
├── lib/                    # Shared utilities
└── types.ts                # Shared type definitions
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**

### Installation

```bash
git clone https://github.com/M4R14/dev-util-tools.git
cd dev-util-tools
npm install
npm run dev
# → http://localhost:3000
```

### AI Assistant Setup (optional)

Create `.env.local` in the project root:

```env
GEMINI_API_KEY=your_key_here
```

Or enter your key in the AI Assistant settings UI (stored in localStorage).

> Get a free key at [Google AI Studio](https://aistudio.google.com/).

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run release-notes:generate` | Generate blog mini release notes from git history |
| `npm test` | Run tests (Vitest) |
| `npm run test:ui` | Vitest UI |
| `npm run coverage` | Tests with coverage |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run format` | Prettier format |
| `npm run format:check` | Prettier check |
| `npm run typecheck` | `tsc --noEmit` |

---

## 🔄 CI/CD

### CI — `.github/workflows/ci.yml` (push & PRs to `main`)

Lint → Format check → Typecheck

### Deploy — `.github/workflows/deploy.yml` (push to `main`)

Lint + Typecheck → Vite build → GitHub Pages (`actions/deploy-pages@v4`)

---

## 📄 License

[MIT](LICENSE)
