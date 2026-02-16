import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../../ui/Input';
import { cn } from '../../../lib/utils';

const EXAMPLES = ['1 ม.ค. 2567', '12 สิงหาคม 60', '14/02/2569'];

interface TextParserInputProps {
  parseInput: string;
  onChange: (value: string) => void;
}

const TextParserInput: React.FC<TextParserInputProps> = ({ parseInput, onChange }) => (
  <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50">
    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider block">
      พิมพ์วันที่ภาษาไทย
    </label>
    <div className="relative group">
      <Input
        value={parseInput}
        onChange={(e) => onChange(e.target.value)}
        placeholder="เช่น 1 ม.ค. 2567, 12 สิงหาคม 60"
        className="h-11 text-base pl-10 pr-4 transition-all group-hover:border-primary/50 focus:border-primary bg-background"
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4.5 h-4.5 group-hover:text-primary transition-colors" />
    </div>

    <div className="flex flex-wrap gap-1.5">
      {EXAMPLES.map((example) => (
        <button
          key={example}
          onClick={() => onChange(example)}
          className={cn(
            'text-xs px-2.5 py-1 rounded-full transition-colors border',
            parseInput === example
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-muted hover:bg-muted/80 border-transparent hover:border-border text-muted-foreground',
          )}
        >
          {example}
        </button>
      ))}
    </div>
  </div>
);

export default TextParserInput;
