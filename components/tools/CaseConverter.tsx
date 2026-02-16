import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../lib/utils';

const CaseConverter: React.FC = () => {
  const [text, setText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const conversions = [
    { label: 'UPPERCASE', fn: (s: string) => s.toUpperCase() },
    { label: 'lowercase', fn: (s: string) => s.toLowerCase() },
    { label: 'camelCase', fn: (s: string) => s.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, '') },
    { label: 'PascalCase', fn: (s: string) => s.replace(/(?:^\w|[A-Z]|\b\w)/g, (w) => w.toUpperCase()).replace(/\s+/g, '') },
    // Simplified snake_case simple for demo, complex regex in original was fine too but this is cleaner to read
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
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="h-32 border-none focus-visible:ring-0 shadow-none resize-none bg-transparent"
        />
      </ToolLayout.Section>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            Conversions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conversions.map((conv) => {
            const result = conv.fn ? conv.fn(text) : '';
            return (
                <Card key={conv.label} className="group hover:border-primary/50 transition-colors">
                 <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{conv.label}</span>
                        <Button 
                        variant="ghost"
                        size="icon"
                        disabled={!result}
                        onClick={() => {
                            if (result) handleCopy(result, conv.label);
                        }}
                        className={cn("h-7 w-7 disabled:opacity-0",
                            copiedId === conv.label ? "text-green-500" : "text-muted-foreground hover:text-foreground"
                        )}
                        >
                        {copiedId === conv.label ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                    </div>
                    <div className="font-mono text-sm truncate text-primary min-h-[1.5rem]" title={result}>
                        {result || <span className="text-muted/50 select-none">...</span>}
                    </div>
                 </CardContent>
                </Card>
            );
            })}
        </div>
      </div>
    </ToolLayout>
  );
};

export default CaseConverter;
