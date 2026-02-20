# Project Overview

**DevPulse** is a single-page React application providing 14 developer utility tools with an integrated Gemini AI assistant. It runs entirely client-side (no backend) except for the optional Gemini API calls.

**Live:** [https://m4r14.github.io/dev-util-tools/](https://m4r14.github.io/dev-util-tools/)

| Aspect | Detail |
|---|---|
| **Framework** | React 19 + TypeScript 5.8 + Vite 6 |
| **Styling** | Tailwind CSS 3 + Radix UI primitives |
| **Routing** | React Router DOM 7 (hash-free, path-based) |
| **State** | React Context (theme, search, user preferences) — no Redux/Zustand |
| **Hosting** | GitHub Pages (auto-deploy on push to `main`) |
| **Testing** | Vitest + React Testing Library + jsdom (configured, no test files yet) |

---

## Related

- [Architecture](02-architecture.md) — Component tree & key patterns
- [Dependencies](07-dependencies.md) — Production packages used
- [Build, Env & Conventions](08-build-env-conventions.md) — Commands & coding standards
