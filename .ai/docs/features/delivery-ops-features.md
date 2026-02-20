# Delivery & Ops Features

Last updated: 2026-02-20

This file summarizes build, performance, deployment, and quality capabilities.

## Build & Run

- Dev server via Vite (`npm run dev`).
- Production build with route-based code splitting (`npm run build`).
- Production preview (`npm run preview`).

## Performance Characteristics

- Lazy-loaded tool routes in `src/App.tsx`.
- Vendor split strategy for React, Radix, and shared UI dependencies.
- Tool pages shipped as separate chunks for faster first load.

## Quality Workflow

- Type safety gate: `npm run typecheck`.
- Lint gate: `npm run lint`.
- Optional test workflow: `npm test` / coverage scripts.

## Deployment Model

- CI/CD via GitHub Actions.
- Deploy target: GitHub Pages.
- SPA path handling via Vite `base` and `404.html` fallback.

## Environment Contract

- `GEMINI_API_KEY` is optional.
- App remains functional without backend runtime for non-AI tools.

## Related

- [Web Features](./web-features.md)
- [Build, Env & Conventions](../08-build-env-conventions.md)
- [Project Overview](../01-project-overview.md)
- [Architecture](../02-architecture.md)
