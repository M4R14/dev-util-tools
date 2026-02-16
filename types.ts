
export enum ToolID {
  JSON_FORMATTER = 'json-formatter',
  BASE64_TOOL = 'base64-tool',
  CASE_CONVERTER = 'case-converter',
  PASSWORD_GEN = 'password-gen',
  TIMEZONE_CONVERTER = 'timezone-converter',
  AI_ASSISTANT = 'ai-assistant',
  THAI_DATE_CONVERTER = 'thai-date-converter'
}

export interface ToolMetadata {
  id: ToolID;
  name: string;
  description: string;
  icon: React.ReactNode;
}
