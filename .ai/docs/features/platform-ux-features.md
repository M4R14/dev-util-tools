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
- Arrowing through the sidebar stops on each tool **once**, even though a favourited tool is listed
  twice — under Favorites and again in the full Apps catalogue.
- The moving selection is announced to screen readers (`SidebarSelectionAnnouncer`) as
  `"<tool name>, <n> of <total>"`; without it the selection is conveyed by background colour alone.

## Sidebar Focus Behaviour

Below the `md` breakpoint the sidebar is an overlay above the content, so it behaves as a modal:
focus moves into it on open, `Tab`/`Shift+Tab` cycle inside it, and closing returns focus to the
control that opened it. `src/hooks/useFocusTrap.ts` owns this.

At `md` and above the sidebar is a permanent landmark beside the content and the trap is **off** —
trapping there would make the rest of the page unreachable. The breakpoint is read reactively
through `useIsDesktopViewport`, so resizing a window while the sidebar is open switches behaviour
instead of leaving a stale decision from render time.

**Known gap:** when closed on mobile the sidebar is translated off-screen at `opacity: 0` but is
still in the DOM without `inert` or `aria-hidden`, so its ~51 focusable controls remain in the tab
order. The trap does not cover this, because it only applies while the sidebar is open.

## Selection Announcement vs. `aria-activedescendant`

The combobox pattern would be the textbook approach, but it needs `role="option"` items inside a
`role="listbox"` that owns them. These items are `NavLink`s nested several levels deep inside
sections, so making that structure valid would mean overriding the link role on every tool — in a
navigation landmark whose purpose is to expose links.

`aria-activedescendant` also only announces while focus sits in the element carrying it, and these
arrow keys are handled globally. A polite live region announces the movement wherever focus is.

Trade-off: this reports position but does not collapse the list into a single tab stop the way a
real combobox would.

## App Shell Layout

The header is a navigation bar. It does not repeat what the page below it already shows.

- **The page title and its favourite toggle appear in the header only once the page's own heading
  has scrolled away** (`useScrolledPast(mainContentRef, 80)`). They used to render in both places
  at once, about sixty pixels apart, with two identical stars — both labelled just
  `"Add to Favorites"` while the sidebar's stars named their tool. The header's star now passes
  `itemName` like every other one.
- **Pages without their own heading — Dashboard, Blog, Settings — always show the header title.**
  The scroll rule applies only to tool pages.
- **The header has no search input.** A second "Search tools" field used to sit there, bound to the
  same `SearchContext` value as the sidebar's and rendered only at `md` and up — exactly the widths
  where the sidebar's search box is already on screen. Two fields, one value, identical
  `aria-label`. Below roughly 1100px it also squeezed to 78px, about six characters, while the page
  title truncated beside it.
- **One link per destination.** The footer's "App Settings" chip duplicated the header's "Settings".
- **The footer scrolls with the content** rather than sitting above it permanently. It was a flex
  sibling of `<main>`, holding 51px — 5% of the viewport — for a copyright line. It now renders
  inside the scroll container via `MainContentWrapper`'s `footer` slot.
  - `role="contentinfo"` is set explicitly, because a `<footer>` nested in `<main>` does not get
    the landmark implicitly.
  - `min-h-full` came off the content wrapper at the same time: with the footer inside the
    container, forcing content to fill the viewport pushed the footer permanently below the fold.

## Sidebar Layout

- **The permanent desktop column can be hidden** (`useSidebarCollapsed`, persisted under
  `sidebar-collapsed`), toggled from the header. Reclaims its full 280px for the content.
  - Separate from `useMainLayoutState().sidebar`, which is the mobile drawer. Hiding the column on
    a laptop does not change what the hamburger does on a phone.
  - Hidden rather than collapsed to an icon rail: every tool stays reachable through `Cmd+K`, and a
    rail of 21 icons would trade one navigation problem for another.

- **Sections fold away and stay folded.** `useCollapsedSections` persists the set under
  `sidebar-collapsed-sections`. The External group starts 960px into a ~835px viewport, so those
  six tools sat below the fold on every window height; collapsing Apps brings External to 356px.
  A collapsed section keeps its count visible, so it still says how much is hidden.
- **`search` is not collapsible.** It is the only section on screen while searching, and folding it
  would leave an empty sidebar.
- **The active page is highlighted once.** A favourited or recent tool is also listed in the full
  Apps catalogue; only the first listing is treated as canonical (`isCanonical` on `ToolLinkItem`).
  Before, the current tool lit up under Recent _and_ again under Apps.
- **Recent excludes the tool you are on**, as well as favourites — it is a way back to what you
  were doing before, and the current page is neither. Filtered before the limit, so it still offers
  three genuinely previous tools.
- **No summary chip strip.** Four 10px chips used to repeat the Favorites/Recent/Apps/External
  counts that the section headers below carry with their names attached. While searching they
  showed a breakdown ("External: 4") without marking which results were external, so the count
  could not be acted on.

## Reliability Guarantees

- Sidebar keyboard selection remains stable when there are zero visible tools (no modulo-by-zero behavior).
- **`visibleTools` is derived from the rendered sections**, not assembled beside them.
  `toVisibleTools(sections)` reads the indices `buildSidebarSections` handed out. When the two were
  built separately, every rule about reachability — skip repeats, skip collapsed sections — had to
  be written twice and kept identical by hand, or `ArrowDown` would highlight one row while `Enter`
  opened another.
- Repeat listings and collapsed sections get `NOT_NAVIGABLE`; navigable indices stay contiguous
  from zero so `selectedIndex` maps straight into `visibleTools`.
- Route transition effects always close sidebar and reset main scroll position with motion preference support.

## Dark Mode

- Three theme preferences: `light`, `dark`, and `system` (`src/lib/theme.ts`).
- `system` follows `prefers-color-scheme` **live** via a `matchMedia` listener, so the app changes
  with the OS while it stays selected. An explicit `light`/`dark` never moves on its own.
- The header button cycles light → dark → system; `/settings` offers the three as a segmented
  control. Both read the cycle order from `THEME_PREFERENCES`.
- Persisted in localStorage under `theme` as a **bare string, not JSON**, so installs holding the
  previous raw `dark`/`light` keep their choice instead of being reset on upgrade.
- Theme applies consistently to shared UI primitives and tool pages.

## Personalization & Persistence

- Favorites and recents are persisted in localStorage, both read through `src/lib/persistedState.ts`.
- Stored tool ids are validated against `TOOLS` on read; ids for tools that no longer exist are
  dropped and the pruned list is written back, so the sidebar count and storage cannot drift.
- Theme preference persists and syncs with app state.
- Shareable URL state is available for all local tools (see `shareable-url-state-features.md` for keys/coverage).
- Offline-ready local tool workflows are available after service-worker cache warmup.
- App Settings page (`/settings`) has three groups:
  - **Theme** — the light/dark/system control.
  - **Stored Data** — counts for favorites, recents, and the Gemini key, each with a way to clear
    it. Before this existed there was no way to clear recents at all, and no way to delete the API
    key once saved.
  - **Offline & Installation** — connectivity status, install availability, cache diagnostics, and
    maintenance actions (`Check for updates`, `Clear offline cache`).

## localStorage Is Never Trusted

All reads go through `src/lib/persistedState.ts`, which validates with zod and falls back rather
than throwing.

This is not defensive decoration. `UserPreferencesContext` previously called
`JSON.parse(localStorage.getItem('favorites'))` inside a `useState` initialiser, in a provider
mounted **above every ErrorBoundary** — a single malformed byte rendered a blank page with zero
DOM nodes and no way back except clearing storage from devtools.

Handled failure modes: unreadable storage (private mode, blocked cookies), malformed JSON,
well-formed JSON of the wrong shape, and `setItem` throwing on quota exhaustion.

Corrupt values are left in place rather than deleted; callers persist their state on mount, so the
bad value is overwritten on the next write and the key self-heals.

**When adding new persisted state, use `readPersisted`/`writePersisted` — do not call
`localStorage` directly.**

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
