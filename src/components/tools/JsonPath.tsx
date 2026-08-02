import React from 'react';
import { Trash2 } from 'lucide-react';
import { ToolLayout } from '../ui/ToolLayout';
import { CodeEditor } from '../ui/CodeEditor';
import { CodeHighlight } from '../ui/CodeHighlight';
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
      <ToolLayout.Panel title="Path">
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
            <div className="max-h-80 overflow-auto rounded-lg border border-border/60 bg-muted/30 p-3">
              <CodeHighlight code={output} language="json" className="text-xs" />
            </div>
            {/*
              The values are already above; listing every resolved path again doubled the page
              height for one dataset shown twice. Kept behind a toggle for when the path itself is
              what you are after.
            */}
            {matches.length > 1 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                  Show {matches.length} matched paths
                </summary>
                <ul className="mt-2 space-y-1 font-mono text-[11px] text-muted-foreground">
                  {matches.map((match) => (
                    <li key={match.path} className="break-all">
                      {match.path}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </>
        )}
      </ToolLayout.Section>
      <ToolLayout.Panel
        className="mt-6"
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
        <CodeEditor
          value={json}
          onChange={setJson}
          language="json"
          data-testid="jsonpath-input"
          placeholder='{"data": {"items": [{"id": 1}, {"id": 2}]}}'
        />
      </ToolLayout.Panel>
    </ToolLayout>
  );
};

export default JsonPath;
