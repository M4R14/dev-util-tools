import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Textarea } from '../ui/Textarea';

interface QueryTemplate {
  label: string;
  value: string;
}

interface RunQueryCardProps {
  queryInput: string;
  queryError: string | null;
  templates: readonly QueryTemplate[];
  onQueryInputChange: (value: string) => void;
  onRun: () => void;
  onReset: () => void;
  onPickTemplate: (value: string) => void;
}

const RunQueryCard: React.FC<RunQueryCardProps> = ({
  queryInput,
  queryError,
  templates,
  onQueryInputChange,
  onRun,
  onReset,
  onPickTemplate,
}) => {
  return (
    <Card className="bg-muted/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Play className="h-4 w-4 text-primary" />
          Run Query
        </CardTitle>
        <CardDescription className="text-xs">
          รองรับทั้งแบบเต็ม <code>/ai-bridge?tool=...</code>, แบบ query ล้วน <code>tool=...</code>,
          shortcut <code>catalog/spec</code>, และ static JSON <code>catalog.json/spec.json</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <Textarea
          value={queryInput}
          onChange={(e) => onQueryInputChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              onRun();
            }
          }}
          placeholder="/ai-bridge?tool=json-formatter&op=format&input=%7B%22a%22%3A1%7D"
          className="min-h-[88px] font-mono text-xs"
        />
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onRun}>
            Run Query
          </Button>
          <Button size="sm" variant="ghost" onClick={onReset}>
            Reset
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {templates.map((template) => (
            <Button
              key={template.label}
              size="sm"
              variant="outline"
              onClick={() => onPickTemplate(template.value)}
            >
              {template.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Tip: กด <code>Cmd/Ctrl + Enter</code> เพื่อ Run ได้ทันที
        </p>
        {queryError && <p className="text-xs text-destructive">{queryError}</p>}
      </CardContent>
    </Card>
  );
};

export default RunQueryCard;
