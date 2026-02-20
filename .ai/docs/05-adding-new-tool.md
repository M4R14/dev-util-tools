# How to Add a New Tool

## Quick Steps (6 files)

1. **`src/types.ts`** — Add to `ToolID` enum under the right category comment:

```ts
// Pick a category: (generator), (converter), (formatter), or top-level
MY_TOOL = 'my-tool',
```

2. **`src/lib/myToolUtils.ts`** _(optional)_ — Pure utility functions (no React imports). Named exports only.

3. **`src/hooks/useMyTool.ts`** — Custom hook encapsulating all state & logic:

```ts
export function useMyTool() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  // ... business logic
  return { input, setInput, result };
}
```

4. **`src/components/tools/MyTool.tsx`** — UI component using `ToolLayout`:

```tsx
import ToolLayout from '../ui/ToolLayout';
import { useMyTool } from '../../hooks/useMyTool';

const MyTool = () => {
  const { input, setInput, result } = useMyTool();
  return (
    <ToolLayout>
      <ToolLayout.Section title="Input">
        {/* input controls */}
      </ToolLayout.Section>
      <ToolLayout.Section title="Output">
        {/* result display */}
      </ToolLayout.Section>
    </ToolLayout>
  );
};
export default MyTool;
```

5. **`src/data/tools.tsx`** — Add entry to `TOOLS` array:

```tsx
import { MyIcon } from 'lucide-react'; // pick an icon from lucide-react

{
  id: ToolID.MY_TOOL,
  name: 'My Tool',
  description: 'Short description for search & dashboard card.',
  icon: MyIcon,
  tags: ['keyword1', 'keyword2', 'keyword3'], // used by fuzzy search
}
```

6. **`src/App.tsx`** — Add lazy import to `TOOL_COMPONENTS` map:

```tsx
[ToolID.MY_TOOL]: lazy(() => import('./components/tools/MyTool')),
```

That's it — **routing, sidebar, search, command palette, and dashboard** all pick up the new tool automatically.

## Key Conventions

| Convention | Detail |
|---|---|
| **Component** | `export default`, PascalCase filename |
| **Hook** | Named export, `use` prefix, camelCase filename |
| **Lib** | Named exports, camelCase filename, no React imports |
| **Icon** | Always from `lucide-react` |
| **Tags** | 5-7 lowercase keywords for search discoverability |
| **Toast** | Use `toast.success()` / `toast.error()` from `sonner` |
| **Copy** | Use `<CopyButton />` from `ui/CopyButton.tsx` |
| **Styling** | Tailwind classes only, use `cn()` for conditionals |

## UI Building Blocks

See **[UI Building Blocks](09-ui-building-blocks.md)** for full API reference, props, and layout patterns for all shared components (`ToolLayout`, `Button`, `Card`, `CopyButton`, `Input`, `Textarea`, `Switch`, `Slider`, `CodeHighlight`, `Toaster`).

## Complex Tool Pattern

If a tool grows large (>300 lines), split into a sub-folder:

```
tools/
└── my-tool/
    ├── index.tsx           # Main composition (import from App.tsx)
    ├── InputSection.tsx
    ├── ResultSection.tsx
    └── utils.ts            # (optional) local helpers
```

Examples: `thai-date/` (6 files), `ai/` (8 files), `url-parser/` (4 files).

---

## Related

- [UI Building Blocks](09-ui-building-blocks.md) — Component API, props & layout patterns
- [Tool Registry](04-tool-registry.md) — Existing tools & their mappings
- [Types & Interfaces](06-types-and-interfaces.md) — ToolID enum & ToolMetadata to extend
- [Directory Map](03-directory-map.md) — Where to place new files
- [Build, Env & Conventions](08-build-env-conventions.md) — Naming & export conventions
