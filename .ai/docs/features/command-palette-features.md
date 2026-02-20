# Command Palette Features

Last updated: 2026-02-20

This document describes command-palette behavior, keyboard flow, and built-in actions.

## Entry Points

- Shortcut: `Cmd+K` (macOS) / `Ctrl+K` (Windows/Linux)
- Shell trigger: quick-search button on mobile (`MainLayout` floating button)
- Scope: global app shell (available from all routes)

## Search Coverage

The command palette returns two result types in one list:

1. Actions (app-level commands)
2. Tools (tool routes from metadata)

Tool search uses fuzzy matching over:
- Name
- Description
- Tags

Action search uses case-insensitive text matching over:
- Action name
- Action description
- Action keywords

## Built-in Actions

| Action | Behavior | Notes |
|---|---|---|
| Open settings | Navigates to `/settings` | Fast access to app preferences |
| Check updates | Calls service-worker update check | Shows `New version available` toast with `Refresh` when update is waiting |
| Clear offline cache | Deletes app caches with `devpulse-static-` prefix | Intended for cache reset / recovery |

## Keyboard Behavior

- `Cmd+K` / `Ctrl+K`: open or toggle palette
- `ArrowDown` / `ArrowUp`: move active selection
- `Enter`: execute selected action or open selected tool route
- `Escape`: close palette

## UX & Accessibility Notes

- Palette uses `role="dialog"` and search input uses combobox semantics.
- Active item is exposed via `aria-activedescendant`.
- Backdrop click closes the palette.
- Empty-state message appears when there are no matching results.

## Source of Truth

- UI + selection logic: `src/components/CommandPalette.tsx`
- Action wiring (settings/update/cache): `src/components/MainLayout.tsx`
- Tool metadata search index: `src/hooks/useToolSearch.ts` + `src/data/tools.tsx`

## Related

- [Web Features](./web-features.md)
- [Platform UX Features](./platform-ux-features.md)
- [Delivery & Ops Features](./delivery-ops-features.md)
