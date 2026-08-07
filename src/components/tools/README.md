# Developer Tools Components

This directory contains all user-facing tool pages rendered by routes in `src/App.tsx`.

## Architecture

Most tools follow a Hook-View split:

1. Logic/state in `src/hooks/*`
2. Rendering in `src/components/tools/*`

Pure transforms live in `src/lib/*` rather than in the hook, so the AI bridge handlers in
`src/lib/ai-tool-bridge/handlers/*` can run the exact same code the UI runs.

External-link tools need no hook at all: they render `ExternalToolPage.tsx` with a spec from
`src/data/externalTools.ts`.

## Available Tools

| Tool Component          | Hook / Service                    | Notes                                                                |
| ----------------------- | --------------------------------- | -------------------------------------------------------------------- |
| `JSONFormatter.tsx`     | `useJsonFormatter`                | Format, minify, and validate JSON                                    |
| `XMLFormatter.tsx`      | `useXmlFormatter`                 | Format, minify, and validate XML                                     |
| `XMLToJson.tsx`         | `useXmlToJson`                    | Convert XML documents to JSON                                        |
| `Base64Tool.tsx`        | `useBase64`                       | Encode/decode text                                                   |
| `CaseConverter.tsx`     | `useCaseConverter`                | Case transforms (`snake`, `kebab`, `camel`, `pascal`)                |
| `PasswordGenerator.tsx` | `usePasswordGenerator`            | Password generation + strength meter (`src/lib/passwordStrength.ts`) |
| `UUIDGenerator.tsx`     | `useUUIDGenerator`                | Batch UUID generation with copy/download                             |
| `TimezoneConverter.tsx` | `useTimezoneConverter`            | Convert datetime between source/target timezones                     |
| `thai-date/index.tsx`   | `useThaiDateConverter`            | Thai date formatting/parsing with subcomponents                      |
| `ThaiIdTool.tsx`        | `useThaiId`                       | Decode Thai ID digits and validate checksum                          |
| `UrlParser.tsx`         | `useUrlParser`                    | URL parse/update/encode with `url-parser/` subcomponents             |
| `DiffViewer.tsx`        | `useDiffViewer`                   | Text diff and unified output                                         |
| `ExternalToolPage.tsx`  | _(none)_                          | Shared landing page driven by `src/data/externalTools.ts`            |
| `RegexTester.tsx`       | _(spec)_                          | `REGEX_TESTER_SPEC` → `regex101.com`                                 |
| `CrontabTool.tsx`       | _(spec)_                          | `CRONTAB_SPEC` → `crontab.guru`, plus a bespoke syntax diagram       |
| `WordCounterTool.tsx`   | _(spec)_                          | `WORD_COUNTER_SPEC` → `wordcounter.net`                              |
| `WheelRandomTool.tsx`   | _(spec)_                          | `WHEEL_RANDOM_SPEC` → `wheelrandom.com`                              |
| `DummyImageTool.tsx`    | _(spec)_                          | `DUMMY_IMAGE_SPEC` → `dummyimage.com`                                |
| `VinTool.tsx`           | _(spec)_                          | `VIN_TOOL_SPEC` → `tetono.com/tools/vin`                             |
| `AIAssistant.tsx`       | `useAIChat` + `askGemini` service | AI chat UI composed from `tools/ai/*` subcomponents                  |

## Shared UI

Common primitives from `src/components/ui`:

- `ToolLayout`
- `Card`
- `Button`
- `Input` / `Textarea`
- `CopyButton`
