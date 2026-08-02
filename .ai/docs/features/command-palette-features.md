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

**Both halves use the same MiniSearch settings** (`fuzzy: 0.2`, `prefix: true`) so one list applies
one rule.

Tool search (`useToolSearch`) covers name, description, and tags. Action search
(`filterCommandPaletteActions`) covers name, description, and keywords, with the index cached in a
`WeakMap` keyed by the actions array.

Actions previously used a plain lowercase `includes()`. Typing `jsn` found the JSON tools by fuzzy
match while `settngs` found no actions at all — the same list forgave a typo in one half and not
the other, with nothing in the UI to explain why.

## Built-in Actions

| Action              | Behavior                                          | Notes                                                                     |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------------------- |
| Open settings       | Navigates to `/settings`                          | Fast access to app preferences                                            |
| Check updates       | Calls service-worker update check                 | Shows `New version available` toast with `Refresh` when update is waiting |
| Clear offline cache | Deletes app caches with `devpulse-static-` prefix | Intended for cache reset / recovery                                       |

## Keyboard Behavior

- `Cmd+K` / `Ctrl+K`: open or toggle palette
- `ArrowDown` / `ArrowUp`: move active selection
- `Enter`: execute selected action or open selected tool route
- `Escape`: close palette
- Global hotkey ignores repeated keydown events and IME composition events to prevent accidental rapid toggles.
- Global hotkey does not trigger while focus is in editable targets (`input`, `textarea`, or contenteditable nodes).

**Keys are handled on the dialog, not on the input.** They used to be bound to the search field, so
a single `Tab` to the close button killed `Escape` and both arrow keys — the palette looked
interactive and answered nothing.

## Focus & Scroll

- `useFocusTrap` moves focus to the search input on open, cycles `Tab`/`Shift+Tab` inside the
  dialog, and returns focus to the control that opened the palette on close.
- This backs the `aria-modal="true"` claim. Without it, two `Tab` presses left the dialog for the
  sidebar behind it while screen readers were told the rest of the page was out of play, and
  closing dropped focus on `<body>`.
- Focus on open comes from the trap, replacing a `setTimeout(..., 50)` that guessed when the DOM
  would be ready and was never cleared on unmount.
- `useScrollLock` freezes the scroll container while the palette is open. The lock is applied in
  `MainLayout`, not in the palette, because the layout owns the container: this shell is
  `h-screen overflow-hidden` and `<main>` scrolls, so the usual `body { overflow: hidden }` recipe
  is a no-op here.

### Focus-trap gotchas, both found by testing

- **Options are `tabIndex={-1}`.** They are driven by `aria-activedescendant`, not `Tab`. A
  focusable-element query must filter on `tabIndex >= 0`, because `button:not([disabled])` matches
  them anyway — otherwise the trap computes its wrap point on an element `Tab` never reaches.
- **The palette unmounts on close.** React detaches the container and the browser drops focus onto
  `<body>`, so a restore guarded only by "is focus still inside the container" never fires. Both
  rules live in `src/hooks/ui/focusTrapTargets.ts` with tests.

## UX & Accessibility Notes

- Palette uses `role="dialog"` and search input uses combobox semantics.
- Active item is exposed via `aria-activedescendant`.
- Backdrop click closes the palette.
- Empty-state message appears when there are no matching results.
- `scrollIntoView` for the active item honours `prefers-reduced-motion` via `src/lib/platform/motion.ts`,
  which route transitions also use.
- A failing action surfaces a toast. Errors used to be swallowed with a comment asserting that
  handlers report their own failures — true for the built-ins, but an unexpected throw vanished and
  left the user unsure whether the command had run.

## Source of Truth

- UI + selection orchestration: `src/components/CommandPalette.tsx`
- Sub-components + local helpers: `src/components/command-palette/*`
- Action search index: `src/components/command-palette/items.ts`
- Action wiring (settings/update/cache): `src/components/main-layout/useCommandPaletteActions.ts`
- Global hotkey handler: `src/components/main-layout/useCommandPaletteHotkey.ts`
- Tool metadata search index: `src/hooks/useToolSearch.ts` + `src/data/tools.tsx`
- Focus trap: `src/hooks/ui/useFocusTrap.ts` + `src/hooks/ui/focusTrapTargets.ts`
- Scroll lock: `src/hooks/ui/useScrollLock.ts`
- Motion preference: `src/lib/platform/motion.ts`

## Related

- [Web Features](./web-features.md)
- [Platform UX Features](./platform-ux-features.md)
- [Delivery & Ops Features](./delivery-ops-features.md)
