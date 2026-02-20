# Shareable URL State Features

Last updated: 2026-02-20

This document tracks shareable query-string state support across tools.

## Coverage (Phase 2)

| Tool | Route | Query Keys | Synced State |
|---|---|---|---|
| JSON Formatter | `/json-formatter` | `input`, `indent` | JSON text input and formatting indentation |
| XML Formatter | `/xml-formatter` | `input` | XML editor content |
| Base64 Tool | `/base64-tool` | `text`, `b64` | Plain text and Base64 text |
| Case Converter | `/case-converter` | `input` | Source input text |
| Timezone Converter | `/timezone-converter` | `date`, `from`, `to` | Datetime, source timezone, target timezone |
| Thai Date Converter | `/thai-date-converter` | `date`, `parse`, `pd`, `pm`, `py`, `pmf` | Date value, parser text, picker day/month/year, picker month format |
| Thai ID Decoder | `/thai-id` | `input` | Thai ID input value |
| UUID Generator | `/uuid-generator` | `q`, `hy`, `up` | Quantity, hyphen toggle, uppercase toggle |
| URL Parser | `/url-parser` | `input` | URL input value |
| Diff Viewer | `/diff-viewer` | `original`, `modified`, `view` | Original text, modified text, view mode |
| Password Generator | `/password-gen` | `len`, `u`, `l`, `n`, `s` | Length and charset toggles |
| XML to JSON | `/xml-to-json` | `input`, `attrs` | XML input and include-attributes toggle |

## UX Notes

- Query updates use replace-style navigation to avoid noisy history entries.
- Default values are omitted from query string when possible for cleaner URLs.
- Existing page-level share action copies current URL, so synced state is included automatically.
- Phase 2 coverage now includes all local tools in the current registry.
- Query sync rule application is centralized via `src/lib/shareableUrlState.ts` to keep behavior consistent across hooks.

## Shared Helper Contract

Source: `src/lib/shareableUrlState.ts`

`buildShareableSearchParams(currentQuery, params)` accepts a list of `ShareableQueryParam`:

| Field | Type | Behavior |
|---|---|---|
| `key` | `string` | Query key to set/delete |
| `value` | `string \| null \| undefined` | Current state value to sync |
| `defaultValue` | `string` (optional) | If `value === defaultValue`, key is removed from URL |

Rules:
- `value` is empty string/null/undefined -> delete key
- `value` equals `defaultValue` -> delete key
- otherwise -> set key with that value

## Hook Integration Pattern

Use this pattern in tool hooks:

```ts
const currentQuery = searchParams.toString();

useEffect(() => {
  const nextParams = buildShareableSearchParams(currentQuery, [
    { key: 'input', value: input },
    { key: 'view', value: viewMode, defaultValue: 'split' },
  ]);

  if (nextParams.toString() !== currentQuery) {
    setSearchParams(nextParams, { replace: true });
  }
}, [input, viewMode, currentQuery, setSearchParams]);
```

## Current Adoption

`buildShareableSearchParams` is used by:
- `useJsonFormatter`
- `useXmlFormatter`
- `useBase64`
- `useCaseConverter`
- `useTimezoneConverter`
- `useThaiDateConverter`
- `useThaiId`
- `useUUIDGenerator`
- `useUrlParser`
- `useDiffViewer`
- `usePasswordGenerator`
- `useXmlToJson`

## Related

- [Web Features](./web-features.md)
- [Tool Features](./tool-features.md)
- [Platform UX Features](./platform-ux-features.md)
