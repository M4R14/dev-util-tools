# AI Smart Assistant

| Field         | Value                                   |
| ------------- | --------------------------------------- |
| **ToolID**    | `ai-assistant`                          |
| **Route**     | `/ai-assistant`                         |
| **Component** | `AIAssistant.tsx` (with sub-components) |
| **Hook**      | `useAIChat`                             |
| **Lib**       | `gemini.ts` service                     |

## Description

Analyze code snippets and get intelligent suggestions via Gemini AI. Supports chat, code block rendering, and settings modal.

## Files

- `src/components/tools/AIAssistant.tsx`
- `src/components/tools/ai/AssistantHeader.tsx`
- `src/components/tools/ai/EmptyState.tsx`
- `src/components/tools/ai/ChatMessage.tsx`
- `src/components/tools/ai/ChatPanel.tsx`
- `src/components/tools/ai/Composer.tsx`
- `src/components/tools/ai/CodeBlock.tsx`
- `src/components/tools/ai/MessageContent.tsx`
- `src/components/tools/ai/SettingsModal.tsx`
- `src/hooks/useAIChat.ts`
- `src/hooks/useGeminiApiKey.ts`
- `src/services/gemini.ts`

## API Key Storage

`src/hooks/useGeminiApiKey.ts` is the only owner of the stored key. Both the assistant's settings
modal and the `/settings` page go through it, so the two surfaces cannot disagree about where the
key lives or how it is encoded.

The key is **obfuscated, not encrypted** — `src/lib/obfuscation.ts` is `base64(reverse(text))`,
which has no key and protects nothing from anyone with access to the browser profile. It exists so
that a casual glance at devtools does not show a raw API key.

The UI must say so plainly. It previously told users their key was "stored securely in your
browser's local storage", promising a guarantee this design cannot give. The copy now states the
real limitation and points at `/settings`, where the key can be removed.

## Usage Pattern

- Input: Chat prompt, code snippets
- Output: AI-generated responses, code blocks
- Actions: Send, Clear chat, Settings (API key), Copy code blocks

## UI

- Uses `ToolLayout`, `Input`, `Button`, `CopyButton`, `Card`

## Related

- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
- `src/services/gemini.ts` — AI API service used by the assistant
