# DevPulse — AI Context Document

> This file is designed for AI assistants (Copilot, Cursor, Codeium, etc.) to quickly understand the codebase.
> Last updated: 2026-02-17

**DevPulse** is a single-page React 19 + TypeScript 5.8 + Vite 6 application providing 13 developer utility tools with an integrated Gemini AI assistant. Deployed to [GitHub Pages](https://m4r14.github.io/dev-util-tools/).

---

## 📚 Documentation Index

| # | File | Contents |
|---|---|---|
| 01 | [Project Overview](docs/01-project-overview.md) | Framework, styling, routing, state, testing |
| 02 | [Architecture](docs/02-architecture.md) | Component tree, key patterns (code splitting, hooks, search) |
| 03 | [Directory Map](docs/03-directory-map.md) | Full `src/` directory tree with annotations |
| 04 | [Tool Registry](docs/04-tool-registry.md) | All tools: ToolID → Route → Component → Hook → Lib |
| 05 | [Adding a New Tool](docs/05-adding-new-tool.md) | Step-by-step guide (6 steps) |
| 06 | [Types & Interfaces](docs/06-types-and-interfaces.md) | ToolID enum, ToolMetadata, DiffLine, PasswordStrength, etc. |
| 07 | [Dependencies](docs/07-dependencies.md) | Production dependency table |
| 08 | [Build, Env & Conventions](docs/08-build-env-conventions.md) | Commands, env vars, naming/export conventions |
| 09 | [UI Building Blocks](docs/09-ui-building-blocks.md) | ToolLayout, Button, Card, CopyButton, Input, Textarea, Switch, Slider, CodeHighlight — props, variants, layout patterns |
