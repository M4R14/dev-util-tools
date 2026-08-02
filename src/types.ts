export enum ToolID {
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

  // inspector
  JWT_DECODER = 'jwt-decoder',
  JWT_ENCODER = 'jwt-encoder',

  // external tool
  DUMMY_IMAGE = 'dummy-image',
  REGEX_TESTER = 'regex-tester',
  WHEEL_RANDOM = 'wheel-random',
  CRONTAB = 'crontab-guru',
  WORD_COUNTER = 'word-counter',
  VIN_TOOL = 'vin-tool',
}

import type { LucideIcon } from 'lucide-react';

export interface ToolMetadata {
  id: ToolID;
  name: string;
  description: string;
  icon: LucideIcon;
  tags?: string[];
  /** Curated related tools, shown first on the tool page (order is preserved). */
  related?: ToolID[];
  /**
   * Query param that seeds this tool's primary text input — `input` for the JSON Formatter,
   * `token` for the JWT Decoder, and so on.
   *
   * Presence is what makes a tool a valid "send output to…" target: generators (Password, UUID)
   * and link-out tools have nothing to receive. The names are not uniform — six tools use `input`
   * and the rest use their own — which is why the mapping is recorded here rather than guessed at
   * the call site.
   */
  inputParam?: string;
}
