
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';

const CaseConverter: React.FC = () => {
  const [text, setText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const conversions = [
    { label: 'UPPERCASE', fn: (s: string) => s.toUpperCase() },
    { label: 'lowercase', fn: (s: string) => s.toLowerCase() },
    { label: 'camelCase', fn: (s: string) => s.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, '') },
    { label: 'PascalCase', fn: (s: string) => s.replace(/(?:^\w|[A-Z]|\b\w)/g, (w) => w.toUpperCase()).replace(/\s+/g, '') },
    { label: 'snake_case', fn: (s: string) => s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('_') || '' },
    { label: 'kebab-case', fn: (s: string) => s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('-') || '' },
  ];

  const handleCopy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(label);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <ToolLayout>
      <ToolLayout.Section title="Input Text">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full h-32 bg-slate-950 border-none rounded-xl p-4 focus:ring-0 outline-none resize-none transition-all placeholder-slate-600"
        />
      </ToolLayout.Section>

      <ToolLayout.Section title="Conversions">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-transparent border-none">
            {conversions.map((conv) => {
            const result = conv.fn(text);
            return (
                <div key={conv.label} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-2 group hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{conv.label}</span>
                    <button 
                    disabled={!result}
                    onClick={() => handleCopy(result, conv.label)}
                    className={`p-1.5 rounded-lg transition-all ${
                        copiedId === conv.label ? 'bg-green-600 text-white' : 'hover:bg-slate-700 text-slate-500 group-hover:text-slate-300'
                    } disabled:opacity-0`}
                    >
                    {copiedId === conv.label ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                </div>
                <div className="font-mono text-sm truncate text-indigo-200 min-h-[1.5rem]">
                    {result || <span className="text-slate-700 select-none">...</span>}
                </div>
                </div>
            );
            })}
        </div>
      </ToolLayout.Section>
    </ToolLayout>
  );
};

export default CaseConverter;
