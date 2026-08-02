import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { ToolLayout } from '../ui/ToolLayout';
import { CodeEditor } from '../ui/CodeEditor';
import { CodeHighlight } from '../ui/CodeHighlight';
import { Button } from '../ui/Button';
import { CopyButton } from '../ui/CopyButton';
import { SendToToolButton } from '../ui/SendToToolButton';
import { useCurlParser } from '../../hooks/tools/useCurlParser';
import { triageHeaders } from '../../lib/tools/curlParser';

const KeyValueTable: React.FC<{ rows: { key: string; value: string }[] }> = ({ rows }) => (
  <dl className="divide-y divide-border/50">
    {rows.map((row) => (
      <div key={`${row.key}-${row.value}`} className="flex flex-wrap gap-x-3 py-1.5">
        <dt className="w-48 shrink-0 break-all font-mono text-xs text-muted-foreground">
          {row.key}
        </dt>
        <dd className="min-w-0 flex-1 break-all font-mono text-xs text-foreground">{row.value}</dd>
      </div>
    ))}
  </dl>
);

const CurlParser: React.FC = () => {
  const { command, setCommand, parsed, body, error, clear } = useCurlParser();
  const headers = React.useMemo(() => triageHeaders(parsed?.headers ?? []), [parsed?.headers]);

  return (
    <ToolLayout>
      <ToolLayout.Panel
        title="curl command"
        className={error ? 'border-destructive/50' : ''}
        actions={
          <Button
            variant="ghost"
            size="icon"
            onClick={clear}
            disabled={!command}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            aria-label="Clear command"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      >
        <CodeEditor
          value={command}
          onChange={setCommand}
          language="bash"
          data-testid="curl-input"
          initialHeightClassName="h-28"
          placeholder="Paste a command from DevTools → Network → Copy as cURL"
        />
      </ToolLayout.Panel>

      {error && (
        <p className="mt-3 text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      )}

      {parsed && (
        <>
          <ToolLayout.Section title="Request" className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2 py-1 font-mono text-xs font-semibold text-primary">
                {parsed.method}
              </span>
              <code className="min-w-0 flex-1 break-all font-mono text-sm text-foreground">
                {parsed.url}
              </code>
              <CopyButton value={parsed.url} successMessage="URL copied" />
            </div>

            {parsed.flags.length > 0 && (
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                {parsed.flags.join(' ')}
              </p>
            )}
          </ToolLayout.Section>

          {parsed.query.length > 0 && (
            <ToolLayout.Section title={`Query (${parsed.query.length})`} className="mt-6">
              <KeyValueTable rows={parsed.query} />
            </ToolLayout.Section>
          )}

          {parsed.body !== null && (
            <ToolLayout.Section
              title={body.isJson ? 'Body (JSON)' : 'Body'}
              className="mt-6"
              actions={
                <>
                  <SendToToolButton value={body.text} valueName="request body" />
                  <CopyButton value={body.text} successMessage="Body copied" />
                </>
              }
            >
              <div className="max-h-80 overflow-auto rounded-lg border border-border/60 bg-muted/30 p-3">
                {/* A form body is not JSON; highlighting it as JSON would paint it wrong. */}
                <CodeHighlight
                  code={body.text}
                  language={body.isJson ? 'json' : 'plaintext'}
                  className="text-xs"
                />
              </div>
            </ToolLayout.Section>
          )}
          {parsed.headers.length > 0 && (
            <ToolLayout.Section title={`Headers (${parsed.headers.length})`} className="mt-6">
              <KeyValueTable rows={headers.significant} />

              {/*
                A real copy-as-cURL carries fifteen or more headers, most of them sec-fetch-*,
                priority and user-agent that nobody debugging a request reads. Listing them in
                order pushed the body — the thing people come for — 1,382px down the page.
              */}
              {headers.noise.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                    Show {headers.noise.length} browser headers
                  </summary>
                  <div className="mt-2">
                    <KeyValueTable rows={headers.noise} />
                  </div>
                </details>
              )}
            </ToolLayout.Section>
          )}
          {parsed.unrecognized.length > 0 && (
            <ToolLayout.Section title="Not interpreted" className="mt-6">
              <p className="mb-2 inline-flex items-start gap-2 text-xs text-muted-foreground">
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                  aria-hidden="true"
                />
                <span>
                  Shown rather than dropped, so nothing disappears without you noticing. Shell
                  expansion and variables are not evaluated.
                </span>
              </p>
              <ul className="space-y-1 font-mono text-xs text-foreground">
                {parsed.unrecognized.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </ToolLayout.Section>
          )}
        </>
      )}
    </ToolLayout>
  );
};

export default CurlParser;
