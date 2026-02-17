# Tool Registry

All tools are defined in `src/data/tools.tsx` and enumerated in `src/types.ts`.

| ToolID | Route | Component | Hook | Lib |
|---|---|---|---|---|
| `json-formatter` | `/json-formatter` | `JSONFormatter.tsx` | `useJsonFormatter` | — |
| `base64-tool` | `/base64-tool` | `Base64Tool.tsx` | `useBase64` | — |
| `case-converter` | `/case-converter` | `CaseConverter.tsx` | `useCaseConverter` | `caseUtils.ts` |
| `password-gen` | `/password-gen` | `PasswordGenerator.tsx` | `usePasswordGenerator` | `passwordStrength.ts` |
| `timezone-converter` | `/timezone-converter` | `TimezoneConverter.tsx` | `useTimezoneConverter` | dayjs + timezone plugin |
| `thai-date-converter` | `/thai-date-converter` | `thai-date/index.tsx` | `useThaiDateConverter` | `thaiDate.ts` (dayjs) |
| `crontab-guru` | `/crontab-guru` | `CrontabTool.tsx` | — (static) | — |
| `ai-assistant` | `/ai-assistant` | `AIAssistant.tsx` | `useAIChat` | `gemini.ts` service |
| `uuid-generator` | `/uuid-generator` | `UUIDGenerator.tsx` | `useUUIDGenerator` | — |
| `url-parser` | `/url-parser` | `UrlParser.tsx` | `useUrlParser` | `urlUtils.ts` |
| `diff-viewer` | `/diff-viewer` | `DiffViewer.tsx` | `useDiffViewer` | `diffUtils.ts` (diff lib) |
| `regex-tester` | `/regex-tester` | `RegexTester.tsx` | — | — |
| `xml-formatter` | `/xml-formatter` | `XMLFormatter.tsx` | `useXmlFormatter` | xml-formatter lib |

---

## Related

- [Adding a New Tool](05-adding-new-tool.md) — Step-by-step guide to register a new tool
- [Types & Interfaces](06-types-and-interfaces.md) — ToolID enum & ToolMetadata interface
- [Directory Map](03-directory-map.md) — Where each file lives
- [Architecture](02-architecture.md) — How tools are lazy-loaded & routed
