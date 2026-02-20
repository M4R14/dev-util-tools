# Tool Features

Last updated: 2026-02-20

This file lists user-facing capabilities for each tool.

## Tool Matrix

| Tool | ToolID / Route | Type | Key Features |
|---|---|---|---|
| JSON Formatter | `json-formatter` / `/json-formatter` | Local | Format, minify, validate JSON |
| XML Formatter | `xml-formatter` / `/xml-formatter` | Local | Format, minify, validate XML |
| Base64 Tool | `base64-tool` / `/base64-tool` | Local | Encode/decode Base64 text |
| Case Converter | `case-converter` / `/case-converter` | Local | Convert text case (snake, kebab, camel, pascal) |
| Timezone Converter | `timezone-converter` / `/timezone-converter` | Local | Convert datetime across timezones |
| Thai Date Converter | `thai-date-converter` / `/thai-date-converter` | Local | Thai date format conversion + parsing |
| Thai ID Decoder | `thai-id` / `/thai-id` | Local | Decode Thai ID structure, checksum validation, valid ID generation |
| URL Parser | `url-parser` / `/url-parser` | Local | Parse URL components, query parameter editing |
| XML to JSON | `xml-to-json` / `/xml-to-json` | Local | Convert XML to JSON with structured output |
| UUID Generator | `uuid-generator` / `/uuid-generator` | Local | Generate UUID v4 values |
| Password Generator | `password-gen` / `/password-gen` | Local | Generate secure passwords + strength feedback |
| Diff Viewer | `diff-viewer` / `/diff-viewer` | Local | Side-by-side diff and unified diff |
| Regex Tester | `regex-tester` / `/regex-tester` | External helper | Shortcut + reference workflow for regex101 |
| Crontab Guru | `crontab-guru` / `/crontab-guru` | External helper | Shortcut + reference workflow for crontab.guru |
| Word Counter | `word-counter` / `/word-counter` | External helper | Shortcut workflow for wordcounter.net |
| Wheel Random | `wheel-random` / `/wheel-random` | External helper | Shortcut workflow for wheelrandom.com |
| Dummy Image | `dummy-image` / `/dummy-image` | External helper | Placeholder image URL templates + open dummyimage.com |
| AI Smart Assistant | `ai-assistant` / `/ai-assistant` | AI | Gemini-powered coding assistant chat |

## Local vs External Tool Pattern

- Local tools execute logic directly in the browser and provide immediate output.
- External helper tools provide curated shortcuts, templates, and references, then open trusted external sites.

## Tool Discoverability

- All tools are indexed by name, description, and tags.
- Tool metadata is centralized in `src/data/tools.tsx`.
- Route registration is centralized in `src/App.tsx` via lazy-loaded map.

## Related

- [Web Features](./web-features.md)
- [Platform UX Features](./platform-ux-features.md)
- [Tool Registry](../04-tool-registry.md)
- [Adding a New Tool](../05-adding-new-tool.md)
