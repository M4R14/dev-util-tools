import React from 'react';
import { ChevronDown, ChevronUp, Code2, Loader2, Send } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Textarea } from '../../ui/Textarea';
import { Card } from '../../ui/Card';
import { cn } from '../../../lib/utils';

interface ComposerProps {
  isContextOpen: boolean;
  codeContext: string;
  prompt: string;
  loading: boolean;
  hasApiKey: boolean;
  onToggleContext: () => void;
  onCodeContextChange: (value: string) => void;
  onPromptChange: (value: string) => void;
  onAsk: () => void;
}

const getContextLabel = (isContextOpen: boolean, codeContext: string): string => {
  if (isContextOpen) return 'Hide Context';
  if (codeContext) return 'Context Active';
  return 'Add Context Code';
};

const Composer: React.FC<ComposerProps> = ({
  isContextOpen,
  codeContext,
  prompt,
  loading,
  hasApiKey,
  onToggleContext,
  onCodeContextChange,
  onPromptChange,
  onAsk,
}) => {
  const contextLines = codeContext.trim() ? codeContext.trim().split('\n').length : 0;

  return (
    <div className="p-4 bg-muted/30 border-t border-border backdrop-blur-sm">
      <div className="mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleContext}
          className={cn(
            'text-xs font-medium h-8 gap-2',
            isContextOpen || codeContext
              ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:text-primary'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Code2 className="w-3.5 h-3.5" />
          {getContextLabel(isContextOpen, codeContext)}
          {isContextOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </Button>
        {!isContextOpen && contextLines > 0 && (
          <span className="ml-2 text-[11px] text-muted-foreground">{contextLines} lines attached</span>
        )}

        {isContextOpen && (
          <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
            <Card className="shadow-lg border-primary/20 bg-muted/50">
              <Textarea
                value={codeContext}
                onChange={(e) => onCodeContextChange(e.target.value)}
                placeholder="Paste relevant code snippets here for context..."
                className="min-h-[150px] border-0 bg-transparent focus-visible:ring-0 font-mono text-sm resize-none"
              />
            </Card>
          </div>
        )}
      </div>

      <div
        className={cn(
          'relative flex items-end gap-2 rounded-xl p-2 border border-input bg-background transition-all shadow-sm',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        )}
      >
        <Textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onAsk();
            }
          }}
          placeholder={
            hasApiKey ? 'Ask a question about your code...' : 'Configure API key to start chatting...'
          }
          className="w-full min-h-[44px] max-h-32 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2 text-sm resize-none shadow-none"
          style={{ height: 'auto' }}
          rows={1}
        />
        <Button
          onClick={onAsk}
          disabled={loading || !prompt.trim() || !hasApiKey}
          className="shrink-0 mb-0.5 shadow-sm gap-1.5 px-3"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Thinking</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </Button>
      </div>
      <div className="text-[10px] text-muted-foreground text-center mt-2">
        Use <span className="font-mono bg-muted px-1 rounded text-foreground">Shift + Enter</span>{' '}
        for newline and{' '}
        <span className="font-mono bg-muted px-1 rounded text-foreground">Enter</span> to send.
      </div>
    </div>
  );
};

export default Composer;
