# Send Output To Another Tool

Chaining tools without a round trip through the clipboard: format some JSON, then send it straight
to the Base64 encoder or the diff viewer.

## How a value travels

Through the **target tool's own query param** — `/case-converter?input=aGVsbG8=` — not through a
store.

That is already how every tool seeds itself and how its state becomes shareable, so a piped result
arrives with a URL you can hand to someone else for free. Nothing new had to be invented, and no
tool needed a second way to receive input.

## The picker is the command palette

`SendToToolButton` does not open a dropdown. It puts a value into `SendToToolContext` and asks the
command palette to open.

The palette already searches tools (fuzzy, Thai-aware), handles the keyboard, carries combobox
semantics and traps focus. A bespoke picker would be a worse second copy of all of that, and would
need a popover dependency the project does not have.

In send mode the palette:

- shows **only tools that declare `inputParam`** — a generator or a link-out tool has nothing to
  receive
- hides app actions, because "Clear offline cache" is not a destination for a value
- reads `Send to which tool?` instead of `Type a command or search...`
- confirms with a `Sent to <tool>` toast

Dismissing the palette abandons the send. Without that, the next `Cmd+K` would silently reopen in
send mode still holding a value from minutes ago.

## `inputParam` in tool metadata

`ToolMetadata.inputParam` names the query param that seeds a tool's primary text input. Presence is
what makes a tool a valid destination.

The names are **not uniform** — six tools use `input`, the rest use their own — which is why the
mapping is recorded in `src/data/tools.tsx` rather than guessed at the call site:

| Param      | Tools                                                                           |
| ---------- | ------------------------------------------------------------------------------- |
| `input`    | JSON Formatter, XML Formatter, XML to JSON, Case Converter, URL Parser, Thai ID |
| `text`     | Base64 Tool                                                                     |
| `token`    | JWT Decoder                                                                     |
| `payload`  | JWT Encoder                                                                     |
| `original` | Diff Viewer                                                                     |

Tools with no `inputParam`: Password Generator, UUID Generator, AI Assistant, and the six link-out
tools. They cannot receive a value and do not appear in the picker.

**When adding a tool that accepts text, set `inputParam` to the param its hook reads** — the value
must match what `searchParams.get(...)` looks for in that tool's hook, or the destination will open
empty.

## Adding the button to a tool

Place it beside the copy button for the same value:

```tsx
<SendToToolButton value={base64} valueName="Base64 output" />
```

`valueName` names the output in the accessible label. A blank `value` disables the button.

Currently wired into: Base64 Tool (output panel) and JSON Formatter.

## Known limits

- **Large values make large URLs.** The pipe uses the query string, and so does every tool's normal
  state sync, so this is not new — but sending a very large document produces a correspondingly
  long URL.
- **No type checking between tools.** Sending arbitrary text to the JWT Decoder is allowed and will
  simply fail to decode. The picker filters on "can receive text", not "can receive _this_ text";
  guessing would be worse than letting the destination report the problem itself.

## Source of Truth

- Value handoff: `src/context/SendToToolContext.tsx`
- Button: `src/components/ui/SendToToolButton.tsx`
- Send mode: `src/components/CommandPalette.tsx`
- Param mapping: `src/data/tools.tsx`, typed in `src/types.ts`

## Related

- [Command Palette Features](./command-palette-features.md)
- [Shareable URL State](./shareable-url-state-features.md)
- [Platform UX Features](./platform-ux-features.md)
