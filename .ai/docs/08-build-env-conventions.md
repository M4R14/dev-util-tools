# Build, Environment & Conventions

## Build & Dev

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server on `http://localhost:3000` |
| `npm run build` | Production build (code-split, 3 vendor chunks) |
| `npm run release-notes:generate` | Generate `src/content/blog/auto-release-notes.md` from recent git commits/PR references |
| `npm test` | Vitest (watch mode) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run format:check` | Prettier (check only) |

PWA/offline assets:

- `public/sw.js` handles cache and offline runtime behavior.
- `public/manifest.webmanifest` defines install metadata.
- Build emits `pwa-assets.json` via Vite plugin for precache manifest.
- `src/main.tsx` listens for service-worker updates and shows a toast prompt to refresh when a new version is ready.
- `src/components/Settings.tsx` uses `src/hooks/usePwaSettings.ts` for cache diagnostics, install prompt, update checks, and cache-clear actions.

### Deployment

| Target | URL |
|---|---|
| **GitHub Pages** | [https://m4r14.github.io/dev-util-tools/](https://m4r14.github.io/dev-util-tools/) |

Deploy is automatic on push to `main` via `.github/workflows/deploy.yml`. Vite `base` is set to `/dev-util-tools/` when `GITHUB_ACTIONS` env is detected. `BrowserRouter` uses `import.meta.env.BASE_URL` as `basename`. A `public/404.html` handles SPA routing on GitHub Pages.
Service worker is registered in production from `src/main.tsx` using the same `BASE_URL` scope for local and GitHub Pages deployments.
`npm run dev` and `npm run build` run release-note generation first via `predev` / `prebuild`.

### Vendor Chunks (Rollup)

| Chunk | Contents |
|---|---|
| `vendor-react` | react, react-dom, react-router-dom |
| `vendor-radix` | @radix-ui/react-slot, switch, slider |
| `vendor-ui` | lucide-react, sonner, CVA, clsx, tailwind-merge |

Each tool component is its own lazy chunk (~2–12 kB gzipped).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Optional | Google Gemini API key (in `.env.local`). Can also be set via the AI Assistant UI (stored in localStorage). |

## Conventions

- **File naming:** PascalCase for components (`MyTool.tsx`), camelCase for hooks (`useMyTool.ts`) and utilities (`myUtils.ts`)
- **Exports:** Tool components use `export default`. Hooks and utilities use named exports.
- **Styling:** Tailwind utility classes only. Theme variables defined as CSS custom properties in `index.css`. Use `cn()` for conditional classes.
- **Icons:** Always from `lucide-react`. Each tool has one icon in its metadata.
- **Toasts:** Use `toast.success()` / `toast.error()` from `sonner`.
- **Accessibility:** ARIA labels on interactive elements, `role` attributes on landmarks, keyboard navigation support.
- **Testing baseline:** Unit tests live with utilities in `src/lib/*.test.ts`; key tool smoke tests live in `src/tools.smoke.test.ts`.

---

## Related

- [Project Overview](01-project-overview.md) — Tech stack summary
- [Dependencies](07-dependencies.md) — Production packages & vendor chunks
- [Adding a New Tool](05-adding-new-tool.md) — Naming & export conventions in practice
