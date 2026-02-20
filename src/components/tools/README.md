# Developer Tools Components

This directory contains all user-facing tool pages rendered by routes in `src/App.tsx`.

## Architecture

Most tools follow a Hook-View split:

1. Logic/state in `src/hooks/*`
2. Rendering in `src/components/tools/*`

Some tools are static or external-link based and do not need a hook.

## Available Tools

| Tool Component | Hook / Service | Notes |
|---|---|---|
| `JSONFormatter.tsx` | `useJsonFormatter` | Format, minify, and validate JSON |
| `XMLFormatter.tsx` | `useXmlFormatter` | Format, minify, and validate XML |
| `Base64Tool.tsx` | `useBase64` | Encode/decode text |
| `CaseConverter.tsx` | `useCaseConverter` | Case transforms (`snake`, `kebab`, `camel`, `pascal`) |
| `PasswordGenerator.tsx` | `usePasswordGenerator` | Password generation + strength meter (`src/lib/passwordStrength.ts`) |
| `UUIDGenerator.tsx` | `useUUIDGenerator` | Batch UUID generation with copy/download |
| `TimezoneConverter.tsx` | `useTimezoneConverter` | Convert datetime between source/target timezones |
| `thai-date/index.tsx` | `useThaiDateConverter` | Thai date formatting/parsing with subcomponents |
| `UrlParser.tsx` | `useUrlParser` | URL parse/update/encode with `url-parser/` subcomponents |
| `DiffViewer.tsx` | `useDiffViewer` | Text diff and unified output |
| `RegexTester.tsx` | _(none)_ | Cheatsheet + external link to `regex101.com` |
| `CrontabTool.tsx` | _(none)_ | Cheatsheet + external link to `crontab.guru` |
| `WordCounterTool.tsx` | _(none)_ | External link helper for `wordcounter.net` |
| `WheelRandomTool.tsx` | _(none)_ | External link helper for `wheelrandom.com` |
| `AIAssistant.tsx` | `useAIChat` + `askGemini` service | AI chat UI composed from `tools/ai/*` subcomponents |

## Shared UI

Common primitives from `src/components/ui`:

- `ToolLayout`
- `Card`
- `Button`
- `Input` / `Textarea`
- `CopyButton`
