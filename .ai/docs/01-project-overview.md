# Project Overview

**DevPulse** is a single-page React application providing 11 developer utility tools with an integrated Gemini AI assistant. It runs entirely client-side (no backend) except for the optional Gemini API calls.

| Aspect | Detail |
|---|---|
| **Framework** | React 19 + TypeScript 5.8 + Vite 6 |
| **Styling** | Tailwind CSS 3 + Radix UI primitives |
| **Routing** | React Router DOM 7 (hash-free, path-based) |
| **State** | React Context (theme, search, user preferences) — no Redux/Zustand |
| **Testing** | Vitest + React Testing Library + jsdom (configured, no test files yet) |

---

## Related

- [Architecture](02-architecture.md) — Component tree & key patterns
- [Dependencies](07-dependencies.md) — Production packages used
- [Build, Env & Conventions](08-build-env-conventions.md) — Commands & coding standards
