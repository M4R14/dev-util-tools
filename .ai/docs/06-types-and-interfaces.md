# Key Interfaces & Types

```ts
// src/types.ts
enum ToolID {
  JSON_FORMATTER = 'json-formatter',
  BASE64_TOOL = 'base64-tool',
  CASE_CONVERTER = 'case-converter',
  PASSWORD_GEN = 'password-gen',
  TIMEZONE_CONVERTER = 'timezone-converter',
  AI_ASSISTANT = 'ai-assistant',
  THAI_DATE_CONVERTER = 'thai-date-converter',
  CRONTAB = 'crontab-guru',
  UUID_GENERATOR = 'uuid-generator',
  URL_PARSER = 'url-parser',
  DIFF_VIEWER = 'diff-viewer',
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
