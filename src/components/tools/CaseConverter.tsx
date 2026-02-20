import React from 'react';
import { Eraser, Hash, Rows3, Type, Wand2 } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Textarea } from '../ui/Textarea';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { CopyButton } from '../ui/CopyButton';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useCaseConverter } from '../../hooks/useCaseConverter';

const EXAMPLE_INPUTS = [
  'hello world',
  'HelloWorld',
  'hello_world',
  'api response code',
] as const;

const CaseConverter: React.FC = () => {
  const { input, setInput, results } = useCaseConverter();
  const hasInput = input.trim().length > 0;
  const stats = React.useMemo(() => {
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const lines = input ? input.split(/\r?\n/).length : 0;

    return {
      chars: input.length,
      words,
      lines,
    };
  }, [input]);

  return (
    <ToolLayout>
      <ToolLayout.Panel
        title="Input Text"
        actions={(
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInput('')}
              disabled={!hasInput}
              className="h-7 px-2 text-xs"
            >
              <Eraser className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
            <CopyButton
              value={input}
              disabled={!hasInput}
              className="h-7 w-7"
            />
          </div>
        )}
      >
        <div className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste your text here..."
            className="h-44 min-h-[170px] bg-transparent resize-y border-none focus-visible:ring-0 shadow-none font-mono text-sm"
          />

          <div className="flex flex-wrap gap-2">
            {EXAMPLE_INPUTS.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setInput(example)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs transition-colors',
                  input === example
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border bg-muted/20 text-muted-foreground hover:text-foreground hover:border-primary/30',
                )}
              >
                {example}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-center">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
                <Type className="w-3 h-3" />
                Chars
              </div>
              <div className="font-mono text-base text-foreground">{stats.chars}</div>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-center">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
                <Rows3 className="w-3 h-3" />
                Lines
              </div>
              <div className="font-mono text-base text-foreground">{stats.lines}</div>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-center">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
                <Hash className="w-3 h-3" />
                Words
              </div>
              <div className="font-mono text-base text-foreground">{stats.words}</div>
            </div>
          </div>
        </div>
      </ToolLayout.Panel>

      <ToolLayout.Section
        title="Conversions"
        actions={(
          <span className="text-xs text-muted-foreground px-2 py-1 rounded-md border border-border/60 bg-muted/20">
            {results.length} outputs
          </span>
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
          {results.map((item, index) => (
            <Card
              key={item.label}
              className={cn(
                'group transition-all bg-background/60 border-border hover:border-primary/40',
                item.value ? 'hover:shadow-sm' : 'opacity-80',
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Format {index + 1}
                  </div>
                  <div className="text-sm font-semibold text-foreground truncate">{item.label}</div>
                </div>
                <CopyButton
                  value={item.value}
                  className="h-7 w-7"
                  disabled={!item.value}
                />
              </CardHeader>
              <CardContent className="p-3 pt-2">
                <div className="rounded-md border border-border/50 bg-muted/10 px-2.5 py-2 min-h-[56px]">
                  <div className="font-mono text-sm break-all text-foreground">
                    {item.value || <span className="text-muted-foreground select-none">No output</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ToolLayout.Section>
    </ToolLayout>
  );
};

export default CaseConverter;
