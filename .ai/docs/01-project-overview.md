# Project Overview

**DevPulse** is a single-page React application providing 18 developer utility tools, an integrated Gemini AI assistant, AI Bridge endpoints, and a markdown-driven Blog updates page. It runs entirely client-side (no backend) except for the optional Gemini API calls.

**Live:** [https://m4r14.github.io/dev-util-tools/](https://m4r14.github.io/dev-util-tools/)

| Aspect | Detail |
|---|---|
| **Framework** | React 19 + TypeScript 5.8 + Vite 6 |
| **Styling** | Tailwind CSS 3 + Radix UI primitives |
| **Routing** | React Router DOM 7 (hash-free, path-based) |
| **State** | React Context (theme, search, user preferences) — no Redux/Zustand |
| **Content** | Blog updates sourced from local Markdown files (`src/content/blog/*.md`), including auto-generated mini release notes from git history |
| **Offline/PWA** | Service worker + web manifest; local tools available offline after initial cache warmup |
| **Hosting** | GitHub Pages (auto-deploy on push to `main`) |
| **Testing** | Vitest + React Testing Library + jsdom (baseline lib unit tests + tool route smoke tests) |

---

## Related

- [Architecture](02-architecture.md) — Component tree & key patterns
- [Blog Updates](11-blog-updates.md) — Markdown content format and rendering flow
- [Dependencies](07-dependencies.md) — Production packages used
- [Build, Env & Conventions](08-build-env-conventions.md) — Commands & coding standards
