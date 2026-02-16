import React from 'react';
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
    Link2
  } from 'lucide-react';
import { ToolID, ToolMetadata } from '../types';

export const TOOLS: ToolMetadata[] = [
    { 
      id: ToolID.URL_PARSER,
      name: 'URL Parser',
      description: 'Parse, encode, and decode URLs.',
      icon: <Link2 className="w-5 h-5" /> 
    },
    { 
      id: ToolID.UUID_GENERATOR,
      name: 'UUID Generator',
      description: 'Generate version 4 UUIDs (GUIDs).',
      icon: <Fingerprint className="w-5 h-5" /> 
    },
    { 
      id: ToolID.JSON_FORMATTER, 
      name: 'JSON Formatter', 
      description: 'Prettify, minify, and validate JSON data.',
      icon: <Code2 className="w-5 h-5" /> 
    },
    { 
      id: ToolID.BASE64_TOOL, 
      name: 'Base64 Tool', 
      description: 'Encode and decode strings to Base64 format.',
      icon: <Binary className="w-5 h-5" /> 
    },
    { 
      id: ToolID.CASE_CONVERTER, 
      name: 'Case Converter', 
      description: 'Switch between camelCase, PascalCase, and more.',
      icon: <Type className="w-5 h-5" /> 
    },
    { 
      id: ToolID.PASSWORD_GEN, 
      name: 'Password Generator', 
      description: 'Create secure, random passwords instantly.',
      icon: <Lock className="w-5 h-5" /> 
    },
    { 
      id: ToolID.TIMEZONE_CONVERTER, 
      name: 'Timezone Converter', 
      description: 'Convert date and time across different timezones.',
      icon: <Globe className="w-5 h-5" /> 
    },
    { 
      id: ToolID.THAI_DATE_CONVERTER, 
      name: 'Thai Date Converter', 
      description: 'Convert dates to various Thai formats (BE 25xx).',
      icon: <CalendarDays className="w-5 h-5" /> 
    },
    { 
      id: ToolID.CRONTAB, 
      name: 'Crontab Guru', 
      description: 'The quick and simple editor for cron schedule expressions.',
      icon: <Clock className="w-5 h-5" /> 
    },
    { 
      id: ToolID.AI_ASSISTANT, 
      name: 'AI Smart Assistant', 
      description: 'Analyze code snippets and solve dev problems with Gemini.',
      icon: <Sparkles className="w-5 h-5" /> 
    },
];

export const getToolById = (id: string): ToolMetadata | undefined => {
    return TOOLS.find(t => t.id === id);
};
