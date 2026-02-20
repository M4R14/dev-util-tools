# Platform UX Features

Last updated: 2026-02-20

This file captures cross-tool user experience features.

## Navigation & Discovery

- Sidebar navigation with grouped sections (favorites, recents, apps, external).
- Global command palette with keyboard-first selection.
- Fuzzy search across tool name, tags, and descriptions.
- Clickable tags on tool pages for faster discovery workflows.

## Command Palette

- Trigger via `Cmd+K` (macOS) or `Ctrl+K` (Windows/Linux).
- Central entry point for searching and opening tools without browsing the sidebar.
- Integrates with fuzzy search index from tool metadata (name, description, tags).

## Keyboard-First Interaction

- `Cmd+K` / `Ctrl+K` opens command palette.
- Arrow keys navigate results.
- `Enter` selects highlighted route.
- `Escape` closes active overlay.
- Supports low-mouse workflows for faster tool switching during development.

## Dark Mode

- Light/dark theme toggle available in the app shell.
- Selected theme is persisted in localStorage.
- Theme applies consistently to shared UI primitives and tool pages.

## Personalization & Persistence

- Favorites are persisted in localStorage.
- Recent tools history is persisted in localStorage.
- Theme preference persists and syncs with app state.

## Accessibility Baseline

- ARIA labels on interactive controls.
- Focus-visible styling and keyboard reachability.
- Landmark/semantic layout support from shared wrappers.

## Cross-Tool UI Consistency

- Shared `ToolLayout` with standard section/panel composition.
- Shared UI primitives: `Button`, `Input`, `Textarea`, `CopyButton`, `Card`, `Switch`, `Slider`.
- Standard toast feedback pattern via `sonner`.

## Resilience & Safety UX

- Per-tool error boundaries prevent a single tool failure from breaking the entire app.
- Copy actions are explicit and user-triggered.
- External tool actions use safe new-tab links.

## Related

- [Web Features](./web-features.md)
- [Tool Features](./tool-features.md)
- [UI Building Blocks](../09-ui-building-blocks.md)
- [Architecture](../02-architecture.md)
