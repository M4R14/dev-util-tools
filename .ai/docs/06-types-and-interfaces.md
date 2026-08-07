# Key Interfaces & Types

```ts
// src/types.ts
enum ToolID {
  BASE64_TOOL = 'base64-tool',
  AI_ASSISTANT = 'ai-assistant',
  URL_PARSER = 'url-parser',
  DIFF_VIEWER = 'diff-viewer',

  // generator
  UUID_GENERATOR = 'uuid-generator',
  PASSWORD_GEN = 'password-gen',

  // converter
  THAI_DATE_CONVERTER = 'thai-date-converter',
  THAI_ID = 'thai-id',
  TIMEZONE_CONVERTER = 'timezone-converter',
  CASE_CONVERTER = 'case-converter',
  XML_TO_JSON = 'xml-to-json',

  // formatter
  JSON_FORMATTER = 'json-formatter',
  XML_FORMATTER = 'xml-formatter',

  // external tool
  CRONTAB = 'crontab-guru',
  DUMMY_IMAGE = 'dummy-image',
  REGEX_TESTER = 'regex-tester',
  WHEEL_RANDOM = 'wheel-random',
  WORD_COUNTER = 'word-counter',
  VIN_TOOL = 'vin-tool',
}

interface ToolMetadata {
  id: ToolID;
  name: string;
  description: string;
  icon: LucideIcon;
  tags?: string[];
  /** Curated related tools, shown first on the tool page (order is preserved). */
  related?: ToolID[];
}
```

```ts
// src/lib/search/relatedTools.ts — curated `related` first, MiniSearch auto-query for the rest
const RELATED_TOOLS_LIMIT = 4;
const getRelatedTools: (
  tool: ToolMetadata,
  tools: ToolMetadata[],
  limit?: number,
) => ToolMetadata[];
```

```ts
// src/lib/tools/diffUtils.ts
type DiffLineType = 'added' | 'removed' | 'unchanged';
interface DiffLine {
  type: DiffLineType;
  value: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}
interface DiffStats {
  additions: number;
  deletions: number;
  unchanged: number;
}
```

```ts
// src/lib/tools/passwordStrength.ts
interface PasswordStrength {
  label: 'Weak' | 'Medium' | 'Strong';
  color: string;
  textColor: string;
  percent: number;
  message: string;
}
interface PasswordOptions {
  length: number;
  includeUpper: boolean;
  includeLower: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}
```

```ts
// src/lib/platform/randomUtils.ts — all credential randomness; throws if Web Crypto is unavailable
const randomInt: (maxExclusive: number) => number; // uniform, rejection-sampled
const randomString: (charset: string, length: number) => string;
const randomUUID: () => string; // RFC 4122 v4

// src/lib/tools/passwordGenerator.ts
const getPasswordCharset: (options: PasswordOptions) => string;
const generatePassword: (options: PasswordOptions) => string;
```

```ts
// src/lib/tools/urlUtils.ts
interface UrlParam {
  key: string;
  value: string;
}
```

---

## Related

- [Tool Registry](04-tool-registry.md) — How ToolID maps to routes & components
- [Adding a New Tool](05-adding-new-tool.md) — Where to add new ToolID values
- [Architecture](02-architecture.md) — How types flow through the app
