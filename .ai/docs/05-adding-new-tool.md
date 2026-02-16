# How to Add a New Tool

1. **`src/types.ts`** — Add to `ToolID` enum: `MY_TOOL = 'my-tool'`
2. **`src/lib/myToolUtils.ts`** _(optional)_ — Pure utility functions
3. **`src/hooks/useMyTool.ts`** — Hook with state & logic, returns values for the component
4. **`src/components/tools/MyTool.tsx`** — React component using `ToolLayout` + hook, `export default`
5. **`src/data/tools.tsx`** — Add entry to `TOOLS` array with `id`, `name`, `description`, `icon` (from lucide-react), `tags`
6. **`src/App.tsx`** — Add to `TOOL_COMPONENTS`: `[ToolID.MY_TOOL]: lazy(() => import('./components/tools/MyTool'))`

That's it — routing, sidebar, search, command palette, and dashboard all pick up the new tool automatically.

---

## Related

- [Tool Registry](04-tool-registry.md) — Existing tools & their mappings
- [Types & Interfaces](06-types-and-interfaces.md) — ToolID enum & ToolMetadata to extend
- [Directory Map](03-directory-map.md) — Where to place new files
- [Build, Env & Conventions](08-build-env-conventions.md) — Naming & export conventions
