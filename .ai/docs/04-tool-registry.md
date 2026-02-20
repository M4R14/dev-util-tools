# Tool Registry

All tools are defined in `src/data/tools.tsx` and enumerated in `src/types.ts`.

The registry below groups tools by responsibility to make discovery easier for contributors and AI assistants.

## Formatters

- `json-formatter` — `/json-formatter`
  - Component: `src/components/tools/JSONFormatter.tsx`
  - Hook: `src/hooks/useJsonFormatter.ts`
  - Doc: [.ai doc](./tools/json-formatter.md)

- `xml-formatter` — `/xml-formatter`
  - Component: `src/components/tools/XMLFormatter.tsx`
  - Hook: `src/hooks/useXmlFormatter.ts`
  - Lib: `xml-formatter` (package)
  - Doc: [.ai doc](./tools/xml-formatter.md)

## Converters

- `base64-tool` — `/base64-tool`
  - Component: `src/components/tools/Base64Tool.tsx`
  - Hook: `src/hooks/useBase64.ts`
  - Doc: [.ai doc](./tools/base64-tool.md)

- `case-converter` — `/case-converter`
  - Component: `src/components/tools/CaseConverter.tsx`
  - Hook: `src/hooks/useCaseConverter.ts`
  - Lib: `src/lib/caseUtils.ts`
  - Doc: [.ai doc](./tools/case-converter.md)

- `timezone-converter` — `/timezone-converter`
  - Component: `src/components/tools/TimezoneConverter.tsx`
  - Hook: `src/hooks/useTimezoneConverter.ts`
  - Lib: `dayjs` + timezone plugin
  - Doc: [.ai doc](./tools/timezone-converter.md)

- `thai-date-converter` — `/thai-date-converter`
  - Component: `src/components/tools/thai-date/index.tsx` (+ subcomponents)
  - Hook: `src/hooks/useThaiDateConverter.ts`
  - Lib: `src/lib/thaiDate.ts` (dayjs)
  - Doc: [.ai doc](./tools/thai-date-converter.md)

- `url-parser` — `/url-parser`
  - Component: `src/components/tools/UrlParser.tsx` (+ `url-parser/` subcomponents)
  - Hook: `src/hooks/useUrlParser.ts`
  - Lib: `src/lib/urlUtils.ts`
  - Doc: [.ai doc](./tools/url-parser.md)

## Generators

- `uuid-generator` — `/uuid-generator`
  - Component: `src/components/tools/UUIDGenerator.tsx`
  - Hook: `src/hooks/useUUIDGenerator.ts`
  - Doc: [.ai doc](./tools/uuid-generator.md)

- `password-gen` — `/password-gen`
  - Component: `src/components/tools/PasswordGenerator.tsx`
  - Hook: `src/hooks/usePasswordGenerator.ts`
  - Lib: `src/lib/passwordStrength.ts`
  - Doc: [.ai doc](./tools/password-gen.md)

## Viewers & Utilities

- `diff-viewer` — `/diff-viewer`
  - Component: `src/components/tools/DiffViewer.tsx`
  - Hook: `src/hooks/useDiffViewer.ts`
  - Lib: `src/lib/diffUtils.ts`
  - Doc: [.ai doc](./tools/diff-viewer.md)

- `regex-tester` — `/regex-tester`
  - Component: `src/components/tools/RegexTester.tsx`
  - Doc: [.ai doc](./tools/regex-tester.md)

- `crontab-guru` — `/crontab-guru`
  - Component: `src/components/tools/CrontabTool.tsx`
  - Doc: [.ai doc](./tools/crontab-guru.md)

- `word-counter` — `/word-counter`
  - Component: `src/components/tools/WordCounterTool.tsx`
  - Doc: [.ai doc](./tools/word-counter.md)

## AI

- `ai-assistant` — `/ai-assistant`
  - Component: `src/components/tools/AIAssistant.tsx` (+ `ai/` subcomponents)
  - Hook: `src/hooks/useAIChat.ts`
  - Service: `src/services/gemini.ts`
  - Doc: [.ai doc](./tools/ai-assistant.md)

- `ai-bridge` — `/ai-bridge`
  - Component: `src/components/AIAgentBridge.tsx`
  - Runner lib: `src/lib/aiToolBridge.ts`
  - Extra endpoints: `/ai-bridge/catalog`, `/ai-bridge/spec`
  - Static JSON endpoints: `/ai-bridge/catalog.json`, `/ai-bridge/spec.json`
  - Purpose: machine-readable, deterministic tool execution for browser-controlled AI agents
  - Doc: [.ai doc](./tools/ai-bridge.md)

---

## Related

- [Adding a New Tool](05-adding-new-tool.md) — Step-by-step guide to register a new tool
- [Types & Interfaces](06-types-and-interfaces.md) — ToolID enum & ToolMetadata interface
- [Directory Map](03-directory-map.md) — Where each file lives
- [Architecture](02-architecture.md) — How tools are lazy-loaded & routed
