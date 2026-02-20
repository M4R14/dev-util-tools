# Delivery & Ops Features

Last updated: 2026-02-20

This file summarizes build, performance, deployment, and quality capabilities.

## Build & Run

- Dev server via Vite (`npm run dev`).
- Production build with route-based code splitting (`npm run build`).
- Production preview (`npm run preview`).
- Auto release-note generation from git log via `npm run release-notes:generate` (runs in `predev` and `prebuild`).

## Performance Characteristics

- Lazy-loaded tool routes in `src/App.tsx`.
- Vendor split strategy for React, Radix, and shared UI dependencies.
- Tool pages shipped as separate chunks for faster first load.

## PWA & Offline Runtime

- Production builds register a service worker (`public/sw.js`) from `src/main.tsx`.
- Precache asset list is generated at build time (`pwa-assets.json`) from emitted bundle files.
- Navigation requests use app-shell fallback (`index.html`) and offline fallback page (`offline.html`).
- Local tools can continue running offline after the app has been loaded and cached.
- If a new service-worker version is installed in the background, the app shows an update toast with `Refresh`; clicking it sends `SKIP_WAITING` and reloads on `controllerchange`.
- Settings page controls can trigger manual `registration.update()` checks and clear offline caches (`devpulse-static-*`) for recovery/debug workflows.

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
