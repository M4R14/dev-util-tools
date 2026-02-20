# AI Smart Assistant

| Field | Value |
|---|---|
| **ToolID** | `ai-assistant` |
| **Route** | `/ai-assistant` |
| **Component** | `AIAssistant.tsx` (with sub-components) |
| **Hook** | `useAIChat` |
| **Lib** | `gemini.ts` service |

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
- `src/services/gemini.ts`

## Usage Pattern
- Input: Chat prompt, code snippets
- Output: AI-generated responses, code blocks
- Actions: Send, Copy, Settings (API key)

## UI
- Uses `ToolLayout`, `Input`, `Button`, `CopyButton`, `Card`

## Related

- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
- `src/services/gemini.ts` — AI API service used by the assistant
