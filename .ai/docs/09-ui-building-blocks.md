# UI Building Blocks

All shared UI components live in `src/components/ui/`. They are designed for consistency across tools — always use them instead of raw HTML elements.

---

## `cn()` — Class Utility

```ts
import { cn } from '../../lib/utils';

// Merges clsx + tailwind-merge: deduplicates Tailwind classes, supports conditionals
cn('px-4 py-2', isActive && 'bg-primary', className);
```

---

## `ToolLayout` — Tool Page Wrapper

Compound component that provides the standard tool page structure with optional header (icon + title + description).  
Tool titles/section titles support copyable anchor links (`#...`) for deep-linking.

```ts
import ToolLayout from '../ui/ToolLayout';
```

### Props

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | Page content |
| `className?` | `string` | Additional classes (e.g. `max-w-5xl mx-auto`) |
| `title?` | `string` | Page heading (h1) |
| `description?` | `string` | Subtitle text |
| `icon?` | `LucideIcon` | Icon displayed beside the title |

### `ToolLayout.Section` — Titled Section

Wraps content inside a `Card`. Used for logical groupings (Input, Output, etc.)

| Prop | Type | Description |
|---|---|---|
| `title?` | `string` | Uppercase section label |
| `actions?` | `ReactNode` | Buttons/controls aligned right |
| `children` | `ReactNode` | Content (rendered inside `CardContent` with `p-0`) |
| `className?` | `string` | Additional classes |

When `title` is provided, ToolLayout generates a section anchor id and the heading can copy a deep link.

### `ToolLayout.Panel` — Card Panel

Standalone card with optional header bar. Useful for split layouts (side-by-side panels).

| Prop | Type | Description |
|---|---|---|
| `title?` | `string` | Panel header label |
| `actions?` | `ReactNode` | Header-right actions |
| `children` | `ReactNode` | Content (rendered with `p-4`) |
| `className?` | `string` | Additional classes |

### Usage Pattern

```tsx
<ToolLayout>
  {/* Simple section */}
  <ToolLayout.Section title="Input" actions={<Button onClick={clear}>Clear</Button>}>
    <div className="p-4">
      <Textarea value={input} onChange={e => setInput(e.target.value)} />
    </div>
  </ToolLayout.Section>

  {/* Side-by-side panels */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <ToolLayout.Panel title="Original" actions={<CopyButton value={original} />}>
      <pre>{original}</pre>
    </ToolLayout.Panel>
    <ToolLayout.Panel title="Result" actions={<CopyButton value={result} />}>
      <pre>{result}</pre>
    </ToolLayout.Panel>
  </div>
</ToolLayout>
```

---

## `Button` — Action Button

CVA-based button with variant and size props. Supports Radix `asChild` for polymorphic rendering.

```ts
import { Button } from '../ui/Button';
```

### Variants

| Variant | Appearance |
|---|---|
| `default` | Primary solid (blue/accent) |
| `destructive` | Red solid |
| `outline` | Border + transparent bg |
| `secondary` | Muted solid |
| `ghost` | No border, hover highlight |
| `link` | Text with underline on hover |

### Sizes

| Size | Dimensions |
|---|---|
| `default` | `h-9 px-4` |
| `sm` | `h-8 px-3 text-xs` |
| `lg` | `h-10 px-8` |
| `icon` | `h-9 w-9` (square, for icon-only buttons) |

### Examples

```tsx
<Button onClick={handleRun}>Run</Button>
<Button variant="outline" size="sm">Clear</Button>
<Button variant="ghost" size="icon"><Copy className="w-4 h-4" /></Button>
<Button variant="destructive" onClick={handleDelete}>Delete All</Button>
```

---

## `Card` — Container Card

Standard card container with sub-components for structured layouts.

```ts
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
```

### Sub-components

| Component | Default padding | Purpose |
|---|---|---|
| `Card` | — | Outer container (`rounded-xl border shadow-sm`) |
| `CardHeader` | `p-6` | Top section |
| `CardTitle` | — | Heading (`h3`, `font-semibold`) |
| `CardDescription` | — | Subtitle (`text-sm text-muted-foreground`) |
| `CardContent` | `p-6 pt-0` | Main body |
| `CardFooter` | `p-6 pt-0` | Bottom actions row (`flex items-center`) |

### Example

```tsx
<Card>
  <CardHeader>
    <CardTitle>Configuration</CardTitle>
    <CardDescription>Adjust settings below</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* form fields */}
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

---

## `Input` — Text Input

Styled `<input>` with consistent border, focus ring, and disabled states. Accepts all standard HTML input attributes.

```ts
import { Input } from '../ui/Input';
```

```tsx
<Input type="text" placeholder="Enter value..." value={val} onChange={e => setVal(e.target.value)} />
<Input type="number" min={1} max={100} className="w-20 font-mono" />
```

---

## `Textarea` — Multi-line Input

Styled `<textarea>`. Min height 60px.

```ts
import { Textarea } from '../ui/Textarea';
```

```tsx
<Textarea
  rows={10}
  placeholder="Paste your text here..."
  value={input}
  onChange={e => setInput(e.target.value)}
  className="font-mono text-sm"
/>
```

---

## `CopyButton` — Clipboard Copy

Icon button that copies a value to clipboard with toast feedback. Shows checkmark for 2 seconds after copy.

```ts
import { CopyButton } from '../ui/CopyButton';
```

### Props

| Prop | Type | Description |
|---|---|---|
| `value` | `string` | **Required.** Text to copy |
| `className?` | `string` | Button wrapper classes |
| `iconClassName?` | `string` | Icon size/color classes |
| + all `ButtonProps` | | Passed through to inner `Button` |

```tsx
<CopyButton value={result} />
<CopyButton value={uuid} className="h-6 w-6" iconClassName="w-3 h-3" />
```

---

## `SnippetCard` — Reusable Snippet Block

Reusable card for code snippets with title, description, syntax-highlighted content, and built-in copy.

```ts
import SnippetCard from '../ui/SnippetCard';
```

### Props

| Prop | Type | Description |
|---|---|---|
| `icon` | `ReactNode` | Leading icon in the header |
| `title` | `string` | Snippet title |
| `description` | `string` | Supporting description text |
| `code` | `string` | Code content |
| `language` | `'json' \| 'xml' \| 'javascript' \| 'bash' \| 'plaintext'` | Highlight language |

```tsx
<SnippetCard
  icon={<Code2 className="w-4 h-4" />}
  title="JSON Format"
  description="Request payload example"
  code='{"tool":"json-formatter","operation":"format"}'
  language="json"
/>
```

---

## `Switch` — Toggle

Radix UI toggle switch. Accepts all Radix `Switch.Root` props.

```ts
import { Switch } from '../ui/Switch';
```

```tsx
<div className="flex items-center gap-2">
  <Switch
    id="uppercase"
    checked={options.uppercase}
    onCheckedChange={(checked) => setOptions(prev => ({ ...prev, uppercase: checked }))}
  />
  <label htmlFor="uppercase" className="text-sm">Include uppercase</label>
</div>
```

---

## `Slider` — Range Slider

Radix UI slider. Single thumb. Accepts all Radix `Slider.Root` props.

```ts
import { Slider } from '../ui/Slider';
```

```tsx
<Slider
  value={[length]}
  min={4}
  max={128}
  step={1}
  onValueChange={([val]) => setLength(val)}
/>
```

> **Note:** `value` and `onValueChange` use arrays (Radix convention). For single values: `value={[n]}`, destructure `([val]) =>`.

---

## `CodeHighlight` — Syntax Highlighting

Syntax-highlighted code display using `highlight.js`.

```ts
import { CodeHighlight } from '../ui/CodeHighlight';
```

### Props

| Prop | Type | Description |
|---|---|---|
| `code` | `string` | Code string to highlight |
| `language` | `'json' \| 'xml' \| 'javascript' \| 'bash' \| 'plaintext'` | Syntax language |
| `className?` | `string` | Additional classes |

```tsx
<CodeHighlight code={formattedJson} language="json" />
<CodeHighlight code={formattedXml} language="xml" className="max-h-96" />
<CodeHighlight code={script} language="bash" />
```

---

## `Toaster` — Toast Provider

Theme-aware toast notification provider (wraps `sonner`).  
Provider component: `src/components/ui/sonner.tsx` (mounted in `main.tsx`) — call `toast()` from any component.

```ts
import { toast } from 'sonner';

toast.success('Copied to clipboard');
toast.error('Invalid JSON');
toast.info('Processing...');
```

---

## Common Layout Patterns

### Two-column (Input / Output)

```tsx
<ToolLayout>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <ToolLayout.Panel title="Input" actions={<Button variant="ghost" size="sm" onClick={clear}>Clear</Button>}>
      <Textarea value={input} onChange={e => setInput(e.target.value)} className="min-h-[300px] font-mono" />
    </ToolLayout.Panel>
    <ToolLayout.Panel title="Output" actions={<CopyButton value={output} />}>
      <pre className="font-mono text-sm whitespace-pre-wrap">{output}</pre>
    </ToolLayout.Panel>
  </div>
</ToolLayout>
```

### Config sidebar + Main content (3-col grid)

```tsx
<ToolLayout>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
    <Card className="lg:col-span-1">
      <CardContent className="p-6 space-y-6">
        {/* switches, sliders, inputs */}
      </CardContent>
    </Card>
    <div className="lg:col-span-2 space-y-4">
      {/* main output area */}
    </div>
  </div>
</ToolLayout>
```

### Section with action buttons

```tsx
<ToolLayout.Section
  title="Result"
  actions={
    <div className="flex gap-2">
      <CopyButton value={result} />
      <Button variant="ghost" size="icon" onClick={download}><Download className="w-4 h-4" /></Button>
    </div>
  }
>
  <div className="p-4">{result}</div>
</ToolLayout.Section>
```

---

## Related

- [Adding a New Tool](05-adding-new-tool.md) — Where to use these components
- [Build, Env & Conventions](08-build-env-conventions.md) — Styling & naming conventions
- [Directory Map](03-directory-map.md) — File locations for all UI components
