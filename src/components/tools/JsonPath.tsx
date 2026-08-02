import React from 'react';
import { Trash2 } from 'lucide-react';
import { ToolLayout } from '../ui/ToolLayout';
import { Textarea } from '../ui/Textarea';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { CopyButton } from '../ui/CopyButton';
import { SendToToolButton } from '../ui/SendToToolButton';
import { useJsonPath } from '../../hooks/tools/useJsonPath';

const EXAMPLES = ['$.data.items[*].id', '$.data.items[-1]', '$["content-type"]', '$.*'];

const JsonPath: React.FC = () => {
  const { json, setJson, path, setPath, matches, output, error, hasQuery, clear } = useJsonPath();

  return (
    <ToolLayout>
      <ToolLayout.Panel
        title="JSON"
        actions={
          <Button
            variant="ghost"
            size="icon"
            onClick={clear}
            disabled={!json}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            aria-label="Clear"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      >
        <Textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          data-testid="jsonpath-input"
          placeholder='{"data": {"items": [{"id": 1}, {"id": 2}]}}'
          className="h-48 w-full resize-none border-none bg-transparent p-0 font-mono text-sm shadow-none focus-visible:ring-0"
        />
      </ToolLayout.Panel>

      <ToolLayout.Panel title="Path" className="mt-4">
        <Input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          data-testid="jsonpath-path"
          placeholder="$.data.items[*].id"
          className="font-mono"
          aria-label="JSON path"
          aria-invalid={!!error}
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setPath(example)}
              className="rounded-md border border-border/70 px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              {example}
            </button>
          ))}
        </div>
      </ToolLayout.Panel>

      <ToolLayout.Section
        title={matches.length > 0 ? `Result (${matches.length})` : 'Result'}
        className="mt-6"
        actions={
          output ? (
            <>
              <SendToToolButton value={output} valueName="result" />
              <CopyButton value={output} successMessage="Result copied" />
            </>
          ) : null
        }
      >
        {error ? (
          <p className="text-sm font-medium text-destructive" role="alert">
            {error}
          </p>
        ) : !hasQuery ? (
          <p className="text-sm text-muted-foreground">
            Property access, array indexing and <code className="font-mono">*</code> wildcards.
            Filters and recursive descent are not supported.
          </p>
        ) : matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No match for that path.</p>
        ) : (
          <>
            <pre className="max-h-80 overflow-auto rounded-lg border border-border/60 bg-muted/30 p-3 font-mono text-xs">
              {output}
            </pre>
            {matches.length > 1 && (
              <ul className="mt-3 space-y-1 font-mono text-[11px] text-muted-foreground">
                {matches.map((match) => (
                  <li key={match.path} className="break-all">
                    {match.path}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </ToolLayout.Section>
    </ToolLayout>
  );
};

export default JsonPath;
