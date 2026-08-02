# Tool Features

Last updated: 2026-08-02

This file lists user-facing capabilities for each tool.

## Tool Matrix

| Tool | ToolID / Route | Type | Key Features |
|---|---|---|---|
| JSON Formatter | `json-formatter` / `/json-formatter` | Local | Format, minify, validate JSON + shareable `input`/`indent` query state |
| XML Formatter | `xml-formatter` / `/xml-formatter` | Local | Format, minify, validate XML + shareable `input` query state |
| Base64 Tool | `base64-tool` / `/base64-tool` | Local | Encode/decode Base64 text + shareable text state (`text`, `b64`) |
| Case Converter | `case-converter` / `/case-converter` | Local | Convert text case (snake, kebab, camel, pascal) + shareable `input` query state |
| Timezone Converter | `timezone-converter` / `/timezone-converter` | Local | Convert datetime across timezones + shareable state (`date`, `from`, `to`) |
| Thai Date Converter | `thai-date-converter` / `/thai-date-converter` | Local | Thai date format conversion + parsing + shareable parser/picker state (`date`, `parse`, `pd`, `pm`, `py`, `pmf`) |
| Thai ID Decoder | `thai-id` / `/thai-id` | Local | Decode Thai ID structure, checksum validation, valid ID generation + shareable `input` query state |
| URL Parser | `url-parser` / `/url-parser` | Local | Parse URL components, query parameter editing + shareable `input` query state |
| XML to JSON | `xml-to-json` / `/xml-to-json` | Local | Convert XML to JSON with structured output + shareable state (`input`, `attrs`) |
| UUID Generator | `uuid-generator` / `/uuid-generator` | Local | Generate UUID v4 values + shareable options (`q`, `hy`, `up`) |
| Password Generator | `password-gen` / `/password-gen` | Local | Generate secure passwords + strength feedback + shareable options (`len`, `u`, `l`, `n`, `s`) |
| Diff Viewer | `diff-viewer` / `/diff-viewer` | Local | Side-by-side diff and unified diff + shareable text/view state (`original`, `modified`, `view`) |
| Regex Tester | `regex-tester` / `/regex-tester` | External helper | Shortcut + reference workflow for regex101 |
| Crontab Guru | `crontab-guru` / `/crontab-guru` | External helper | Shortcut + reference workflow for crontab.guru |
| Word Counter | `word-counter` / `/word-counter` | External helper | Shortcut workflow for wordcounter.net |
| Wheel Random | `wheel-random` / `/wheel-random` | External helper | Shortcut workflow for wheelrandom.com |
| Dummy Image | `dummy-image` / `/dummy-image` | External helper | Placeholder image URL templates + open dummyimage.com |
| VIN Generator & Decoder | `vin-tool` / `/vin-tool` | External helper | ISO 3779 VIN structure reference + open tetono.com VIN generator/validator |
| AI Smart Assistant | `ai-assistant` / `/ai-assistant` | AI | Gemini-powered coding assistant chat |

## Related Tools

Every tool page renders a **Related Tools** section below its content, injected once in
`src/components/ToolPageLayout.tsx` (no per-tool wiring required).

- Resolution lives in `src/lib/search/relatedTools.ts` (`getRelatedTools`), limit `RELATED_TOOLS_LIMIT = 4`.
- Curated `related?: ToolID[]` in `src/data/tools.tsx` wins and keeps its declared order. It is optional —
  treat it as an override for pairs the search misses or ranks badly.
- Remaining slots are filled automatically by querying a MiniSearch index (same engine as tool search)
  with the tool's own `name + tags`, boosted `tagsJoined:3 / name:2 / description:1`.
- Matching is deliberately tighter than tool search: `fuzzy: 0.1`, `prefix: false` (search uses
  `0.2` + prefix). Prefix matching produced false neighbours such as Base64 → Crontab Guru, while
  going fully exact lost real ones such as Crontab Guru's `timer` → Timezone Converter.
- The generic `external tool` tag is stripped from both the query and the indexed document, otherwise
  every external tool ranks as "related" to every other external tool and nothing else.
- The index is cached per tool-list reference in a `WeakMap`, so the shared `TOOLS` array is indexed once.
- Unknown or self-referencing IDs are dropped; the section is hidden when nothing matches.
- With curation disabled, auto-resolution covers 18 of 19 tools (only Dummy Image has no lexical
  neighbour) — that gap is why curation stays in place.

## Local vs External Tool Pattern

- Local tools execute logic directly in the browser and provide immediate output.
- External helper tools provide curated shortcuts, templates, and references, then open trusted external sites.
- All six external helper pages render through `src/components/tools/ExternalToolPage.tsx`; their
  content lives as data in `src/data/externalTools.ts`, so each tool component is one line.
- Core transforms are shared between the UI and the AI bridge: `src/lib/tools/jsonUtils.ts`,
  `src/lib/tools/xmlUtils.ts`, and `src/lib/tools/base64Utils.ts` back both `useJsonFormatter`/`useXmlFormatter`/
  `useBase64` and the matching bridge handlers, so both surfaces cannot drift apart.

## Tool Discoverability

- All tools are indexed by name, description, and tags.
- Tool metadata is centralized in `src/data/tools.tsx`.
- Route registration is centralized in `src/App.tsx` via lazy-loaded map.

## Shareable URL State

Shareable query-state coverage is documented in [Shareable URL State Features](./shareable-url-state-features.md).

## Related

- [Web Features](./web-features.md)
- [Platform UX Features](./platform-ux-features.md)
- [Shareable URL State Features](./shareable-url-state-features.md)
- [Tool Registry](../04-tool-registry.md)
- [Adding a New Tool](../05-adding-new-tool.md)
