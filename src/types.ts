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
  TIMEZONE_CONVERTER = 'timezone-converter',
  CASE_CONVERTER = 'case-converter',
  XML_TO_JSON = 'xml-to-json',
  
  // formatter
  JSON_FORMATTER = 'json-formatter',
  XML_FORMATTER = 'xml-formatter',

  // external tool
  DUMMY_IMAGE = 'dummy-image',
  REGEX_TESTER = 'regex-tester',
  WHEEL_RANDOM = 'wheel-random',
  CRONTAB = 'crontab-guru',
  WORD_COUNTER = 'word-counter',
}

import type { LucideIcon } from 'lucide-react';

export interface ToolMetadata {
  id: ToolID;
  name: string;
  description: string;
  icon: LucideIcon;
  tags?: string[];
}
