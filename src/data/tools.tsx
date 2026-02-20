import {
  Code2,
  Binary,
  Type,
  Lock,
  Sparkles,
  CalendarDays,
  Globe,
  Clock,
  Fingerprint,
  Link2,
  FileDiff,
  FileCode2,
  FileBraces,
  FileText,
  RotateCw,
} from 'lucide-react';
import { ToolID, ToolMetadata } from '../types';

export const TOOLS: ToolMetadata[] = [
  {
    id: ToolID.URL_PARSER,
    name: 'URL Parser & Encoder',
    description: 'Parse URLs into their components, encode/decode, and manage query parameters.',
    icon: Link2,
    tags: ['url', 'parse', 'encode', 'decode', 'query', 'uri'],
  },
  {
    id: ToolID.UUID_GENERATOR,
    name: 'UUID Generator',
    description: 'Generate version 4 UUIDs (GUIDs).',
    icon: Fingerprint,
    tags: ['uuid', 'guid', 'random', 'id', 'generate'],
  },
  {
    id: ToolID.JSON_FORMATTER,
    name: 'JSON Formatter',
    description: 'Prettify, minify, and validate JSON data.',
    icon: Code2,
    tags: ['json', 'format', 'prettify', 'minify', 'validate'],
  },
  {
    id: ToolID.BASE64_TOOL,
    name: 'Base64 Tool',
    description: 'Encode and decode strings to Base64 format.',
    icon: Binary,
    tags: ['base64', 'encode', 'decode', 'binary', 'string'],
  },
  {
    id: ToolID.CASE_CONVERTER,
    name: 'Case Converter',
    description: 'Switch between camelCase, PascalCase, and more.',
    icon: Type,
    tags: ['case', 'camel', 'pascal', 'snake', 'kebab', 'text', 'convert'],
  },
  {
    id: ToolID.PASSWORD_GEN,
    name: 'Password Generator',
    description: 'Create secure, random passwords instantly.',
    icon: Lock,
    tags: ['password', 'generate', 'random', 'security', 'strong'],
  },
  {
    id: ToolID.TIMEZONE_CONVERTER,
    name: 'Timezone Converter',
    description: 'Convert date and time across different timezones.',
    icon: Globe,
    tags: ['timezone', 'time', 'date', 'convert', 'utc', 'zone'],
  },
  {
    id: ToolID.THAI_DATE_CONVERTER,
    name: 'Thai Date Converter',
    description: 'Convert dates to various Thai formats (BE 25xx).',
    icon: CalendarDays,
    tags: ['thai', 'date', 'buddhist', 'calendar', 'convert', 'พ.ศ.'],
  },
  {
    id: ToolID.CRONTAB,
    name: 'Crontab Guru',
    description: 'The quick and simple editor for cron schedule expressions.',
    icon: Clock,
    tags: ['cron', 'crontab', 'schedule', 'job', 'timer', 'external tool'],
  },
  {
    id: ToolID.WORD_COUNTER,
    name: 'Word Counter',
    description: 'Count words, characters, and readability metrics (opens wordcounter.net).',
    icon: FileText,
    tags: ['word', 'counter', 'text', 'writing', 'seo', 'external tool'],
  },
  {
    id: ToolID.WHEEL_RANDOM,
    name: 'Wheel Random',
    description: 'Spin a random decision wheel for names, tasks, and giveaways.',
    icon: RotateCw,
    tags: ['wheel', 'random', 'picker', 'spin', 'decision', 'external tool'],
  },
  {
    id: ToolID.DIFF_VIEWER,
    name: 'Diff Viewer',
    description: 'Compare two texts side-by-side to find differences (diff).',
    icon: FileDiff,
    tags: ['diff', 'compare', 'text', 'code', 'difference'],
  },
  {
    id: ToolID.REGEX_TESTER,
    name: 'Regex Tester',
    description: 'Create, test, debug and explain Regular Expressions (redirects to regex101.com).',
    icon: Code2, // Fallback icon
    tags: ['regex', 'regexp', 'regular expression', 'match', 'replace', 'find', 'external tool'],
  },
  {
    id: ToolID.AI_ASSISTANT,
    name: 'AI Smart Assistant',
    description: 'Analyze code snippets and solve dev problems with Gemini.',
    icon: Sparkles,
    tags: ['ai', 'gemini', 'code', 'assistant', 'analyze', 'chat'],
  },
  {
    id: ToolID.XML_FORMATTER,
    name: 'XML Formatter',
    description: 'Prettify, minify, and validate XML data.',
    icon: FileCode2,
    tags: ['xml', 'format', 'prettify', 'minify', 'validate', 'markup'],
  },
  {
    id: ToolID.XML_TO_JSON,
    name: 'XML to JSON',
    description: 'Convert XML documents into structured JSON output.',
    icon: FileBraces,
    tags: ['xml', 'json', 'convert', 'transform', 'parser', 'attributes'],
  },
];

export const getToolById = (id: string): ToolMetadata | undefined => {
  return TOOLS.find((t) => t.id === id);
};
