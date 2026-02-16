# UI Components (`components/ui`)

This directory contains the core UI building blocks and layout components used throughout the DevUtil application.

## Core Layout

### `ToolLayout`

The main layout wrapper for all tools. It provides a consistent header with icon, title, and description, and handles the responsive grid layout.

**Usage:**

```tsx
import { Link2 } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';

<ToolLayout
    title="My Tool"
    description="A short description of what this tool does."
    icon={Link2}
>
    {/* Content goes here */}
    <ToolLayout.Section title="Input">
        {/* Input content */}
    </ToolLayout.Section>

    <ToolLayout.Panel title="Output">
        {/* Output content */}
    </ToolLayout.Panel>
</ToolLayout>
```

**Props:**
- `title` (string): The title of the tool.
- `description` (string): A short description of the tool.
- `icon` (LucideIcon): The icon component from `lucide-react`.

### `ToolLayout.Section`

Use for input areas or configuration sections that don't need to span the full height.

**Props:**
- `title` (string): Section title.
- `actions` (ReactNode): Optional buttons or controls for the header.

### `ToolLayout.Panel`

Use for output areas, lists, or complex components that benefit from a card-like container.

**Props:**
- `title` (string): Panel title.
- `actions` (ReactNode): Optional buttons or controls for the header.
- `className` (string): Additional styles (useful for `h-full`, `overflow-y-auto`).

## Basic Components

### `Button`
A rigorous implementation of the shadcn/ui button component. Supports variants (`default`, `secondary`, `destructive`, `ghost`, `link`, `outline`) and sizes.

### `Card`
Container component for grouping related content. Used internally by `ToolLayout.Section` and `ToolLayout.Panel`.

### `Input` & `Textarea`
Standard form inputs with consistent styling (focus rings, muted backgrounds for read-only states, etc.).

### `CopyButton`
A utility button that copies the provided `value` to the clipboard and shows a toast notification.

**Usage:**
```tsx
<CopyButton value="Text to copy" className="custom-class" />
```

## Utilities

### `sonner`
Toast notification provider component. Ensure `<Toaster />` is rendered at the root of the app.
