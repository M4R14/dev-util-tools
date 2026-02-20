# Key Interfaces & Types

```ts
// src/types.ts
enum ToolID {
  BASE64_TOOL = 'base64-tool',
  AI_ASSISTANT = 'ai-assistant',
  CRONTAB = 'crontab-guru',
  URL_PARSER = 'url-parser',
  DIFF_VIEWER = 'diff-viewer',
  REGEX_TESTER = 'regex-tester',

  // generator
  UUID_GENERATOR = 'uuid-generator',
  PASSWORD_GEN = 'password-gen',

  // converter
  THAI_DATE_CONVERTER = 'thai-date-converter',
  TIMEZONE_CONVERTER = 'timezone-converter',
  CASE_CONVERTER = 'case-converter',
  XML_TO_JSON = 'xml-to-json',

  // formatter
  JSON_FORMATTER = 'json-formatter',
  XML_FORMATTER = 'xml-formatter',
}

interface ToolMetadata {
  id: ToolID;
  name: string;
  description: string;
  icon: LucideIcon;
  tags?: string[];
}
```

```ts
// src/lib/diffUtils.ts
type DiffLineType = 'added' | 'removed' | 'unchanged';
interface DiffLine { type: DiffLineType; value: string; oldLineNumber?: number; newLineNumber?: number }
interface DiffStats { additions: number; deletions: number; unchanged: number }
```

```ts
// src/lib/passwordStrength.ts
interface PasswordStrength { label: 'Weak' | 'Medium' | 'Strong'; color: string; textColor: string; percent: number; message: string }
interface PasswordOptions { length: number; includeUpper: boolean; includeLower: boolean; includeNumbers: boolean; includeSymbols: boolean }
```

```ts
// src/lib/urlUtils.ts
interface UrlParam { key: string; value: string }
```

---

## Related

- [Tool Registry](04-tool-registry.md) — How ToolID maps to routes & components
- [Adding a New Tool](05-adding-new-tool.md) — Where to add new ToolID values
- [Architecture](02-architecture.md) — How types flow through the app
