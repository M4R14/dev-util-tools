import React from 'react';
import { Code, RotateCcw, Trash2 } from 'lucide-react';
import ToolLayout from '../../ui/ToolLayout';
import { Button } from '../../ui/Button';
import { Textarea } from '../../ui/Textarea';
import { CopyButton } from '../../ui/CopyButton';

interface UrlInputSectionProps {
  input: string;
  error: string | null;
  onInputChange: (value: string) => void;
  onEncode: () => void;
  onDecode: () => void;
  onClear: () => void;
}

const UrlInputSection: React.FC<UrlInputSectionProps> = ({
  input,
  error,
  onInputChange,
  onEncode,
  onDecode,
  onClear,
}) => (
  <ToolLayout.Section
    title="Input URL"
    actions={
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="h-8 text-muted-foreground hover:text-destructive transition-colors"
      >
        <Trash2 className="w-4 h-4 mr-1.5" />
        Clear
      </Button>
    }
  >
    <div className="space-y-4 p-6">
      <div className="relative group">
        <Textarea
          placeholder="Paste your URL here..."
          className="font-mono text-sm min-h-[120px] resize-y bg-background focus:ring-2 ring-primary/20 transition-all border-muted-foreground/20"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
        />
        {input && (
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton value={input} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onEncode}
            className="hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <Code className="w-4 h-4 mr-2" />
            Encode
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onDecode}
            className="hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Decode
          </Button>
        </div>

        {error && (
          <div className="text-sm font-medium text-destructive flex items-center animate-in fade-in slide-in-from-left-2">
            <span className="w-2 h-2 rounded-full bg-destructive mr-2" />
            {error}
          </div>
        )}
      </div>
    </div>
  </ToolLayout.Section>
);

export default UrlInputSection;
