import React from 'react';
import ToolLayout from '../ui/ToolLayout';
import { Textarea } from '../ui/Textarea';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { CopyButton } from '../ui/CopyButton';
import { useCaseConverter } from '../../hooks/useCaseConverter';

const CaseConverter: React.FC = () => {
  const { input, setInput, results } = useCaseConverter();

  return (
    <ToolLayout>
      <ToolLayout.Section title="Input Text">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste your text here..."
          className="h-32 min-h-[120px] bg-transparent resize-none border-none focus-visible:ring-0 shadow-none"
        />
      </ToolLayout.Section>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between px-1">
          Conversions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((item) => (
            <Card
              key={item.label}
              className="group hover:border-primary/50 transition-colors bg-background/50 border-border"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-0">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </span>
                <CopyButton
                  value={item.value}
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={!item.value}
                />
              </CardHeader>
              <CardContent className="p-3 pt-2">
                <div
                  className="font-mono text-sm truncate text-primary min-h-[1.5rem]"
                  title={item.value}
                >
                  {item.value || <span className="text-muted/50 select-none">...</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
};

export default CaseConverter;
