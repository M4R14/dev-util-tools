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
- Central entry point for searching tools and running quick actions without browsing the sidebar.
- Integrates with fuzzy search index from tool metadata (name, description, tags).
- Includes app actions: `Open settings`, `Check updates`, and `Clear offline cache`.
- Full behavior reference: `command-palette-features.md`.

## Keyboard-First Interaction

- `Cmd+K` / `Ctrl+K` opens command palette.
- Arrow keys navigate results.
- `Enter` executes highlighted action or opens highlighted tool route.
- `Escape` closes active overlay.
- Supports low-mouse workflows for faster tool switching during development.
- Sidebar keyboard navigation only responds to navigation keys (`ArrowDown`, `ArrowUp`, `Enter`) and ignores modified combos (`Ctrl`, `Cmd`, `Alt`).
- Sidebar keyboard navigation ignores typing targets except the sidebar search input (`data-sidebar-search-input="true"`).
- Sidebar `Enter` selection ignores repeated keydown events to avoid duplicate route navigation.

## Reliability Guarantees

- Sidebar keyboard selection remains stable when there are zero visible tools (no modulo-by-zero behavior).
- Sidebar index offsets are derived from rendered sections in a deterministic sequence.
- Route transition effects always close sidebar and reset main scroll position with motion preference support.

## Dark Mode

- Light/dark theme toggle available in the app shell.
- Selected theme is persisted in localStorage.
- Theme applies consistently to shared UI primitives and tool pages.

## Personalization & Persistence

- Favorites are persisted in localStorage.
- Recent tools history is persisted in localStorage.
- Theme preference persists and syncs with app state.
- Shareable URL state is available for all local tools (see `shareable-url-state-features.md` for keys/coverage).
- Offline-ready local tool workflows are available after service-worker cache warmup.
- App Settings page (`/settings`) exposes runtime connectivity status, install availability, cache diagnostics, and maintenance actions (`Check for updates`, `Clear offline cache`).

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
- [Command Palette Features](./command-palette-features.md)
- [Tool Features](./tool-features.md)
- [UI Building Blocks](../09-ui-building-blocks.md)
- [Architecture](../02-architecture.md)
