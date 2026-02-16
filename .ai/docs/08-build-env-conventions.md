# Build, Environment & Conventions

## Build & Dev

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server on `http://localhost:3000` |
| `npm run build` | Production build (code-split, 3 vendor chunks) |
| `npm test` | Vitest (watch mode) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

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
- **No test files exist yet.** The test infrastructure (Vitest + RTL + jsdom) is configured and ready.

---

## Related

- [Project Overview](01-project-overview.md) — Tech stack summary
- [Dependencies](07-dependencies.md) — Production packages & vendor chunks
- [Adding a New Tool](05-adding-new-tool.md) — Naming & export conventions in practice
