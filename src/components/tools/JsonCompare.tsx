import React from 'react';
import { ArrowLeftRight, Check, Minus, Plus, Trash2, Type } from 'lucide-react';
import { ToolLayout } from '../ui/ToolLayout';
import { CodeEditor } from '../ui/CodeEditor';
import { Button } from '../ui/Button';
import { CopyButton } from '../ui/CopyButton';
import { SendToToolButton } from '../ui/SendToToolButton';
import { useCopyToClipboard } from '../../hooks/ui/useCopyToClipboard';
import { useJsonCompare } from '../../hooks/tools/useJsonCompare';
import type { JsonDifference, JsonDifferenceKind } from '../../lib/tools/jsonCompare';
import { cn } from '../../lib/utils';

const KIND_META: Record<
  JsonDifferenceKind,
  { label: string; icon: typeof Plus; className: string }
> = {
  added: {
    label: 'Added',
    icon: Plus,
    className: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  removed: {
    label: 'Removed',
    icon: Minus,
    className: 'text-red-700 dark:text-red-400 bg-red-500/10 border-red-500/20',
  },
  changed: {
    label: 'Changed',
    icon: ArrowLeftRight,
    className: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  'type-changed': {
    label: 'Type',
    icon: Type,
    className: 'text-purple-700 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
};

/** `undefined` prints as nothing, which would render an empty cell with no explanation. */
const preview = (value: unknown): string =>
  value === undefined ? '—' : (JSON.stringify(value) ?? String(value));

const DifferenceRow: React.FC<{
  difference: JsonDifference;
  onCopyPath: (path: string) => void;
}> = ({ difference, onCopyPath }) => {
  const meta = KIND_META[difference.kind];
  const Icon = meta.icon;

  return (
    <li className="flex flex-col gap-1.5 rounded-lg border border-border/60 px-3 py-2 sm:flex-row sm:items-start sm:gap-3">
      <span
        className={cn(
          'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
          meta.className,
        )}
      >
        <Icon className="h-3 w-3" aria-hidden="true" />
        {meta.label}
      </span>

      <div className="min-w-0 flex-1">
        {/*
          The path is the useful part of a finding — it is what gets pasted into a test assertion
          or a bug report — so clicking it copies it. Scrolling the input to the matching line was
          considered and dropped: pasted JSON is often minified onto one line, where it would
          silently do nothing.
        */}
        <button
          type="button"
          onClick={() => onCopyPath(difference.path)}
          title={`Copy ${difference.path}`}
          className="block max-w-full break-all rounded text-left font-mono text-xs text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {difference.path}
        </button>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-muted-foreground">
          {difference.kind === 'added' ? (
            <span className="text-emerald-700 dark:text-emerald-400">
              {preview(difference.right)}
            </span>
          ) : difference.kind === 'removed' ? (
            <span className="text-red-700 dark:text-red-400">{preview(difference.left)}</span>
          ) : (
            <>
              <span className="text-red-700 dark:text-red-400">{preview(difference.left)}</span>
              <span aria-hidden="true">→</span>
              <span className="text-emerald-700 dark:text-emerald-400">
                {preview(difference.right)}
              </span>
              {difference.kind === 'type-changed' && (
                <span className="text-purple-700 dark:text-purple-400">
                  ({difference.leftType} → {difference.rightType})
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </li>
  );
};

const JsonCompare: React.FC = () => {
  const {
    left,
    setLeft,
    right,
    setRight,
    differences,
    summary,
    error,
    hasInput,
    identical,
    swap,
    clear,
  } = useJsonCompare();
  const { copy } = useCopyToClipboard();

  const report = differences
    .map((d) =>
      d.kind === 'added'
        ? `+ ${d.path}: ${preview(d.right)}`
        : d.kind === 'removed'
          ? `- ${d.path}: ${preview(d.left)}`
          : `~ ${d.path}: ${preview(d.left)} -> ${preview(d.right)}`,
    )
    .join('\n');

  return (
    <ToolLayout>
      <ToolLayout.Section
        title="Differences"
        className="mb-6"
        actions={
          differences.length > 0 ? (
            <CopyButton value={report} successMessage="Difference report copied" />
          ) : null
        }
      >
        {error ? (
          <p className="text-sm font-medium text-destructive" role="alert">
            {error}
          </p>
        ) : !hasInput ? (
          <p className="text-sm text-muted-foreground">
            Paste two JSON documents. Key order and whitespace are ignored — only the values are
            compared.
          </p>
        ) : identical ? (
          <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <Check className="h-4 w-4" aria-hidden="true" />
            Structurally identical
          </p>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap gap-2 text-xs">
              {(
                [
                  ['added', summary.added],
                  ['removed', summary.removed],
                  ['changed', summary.changed],
                  ['type-changed', summary.typeChanged],
                ] as const
              )
                .filter(([, count]) => count > 0)
                .map(([kind, count]) => (
                  <span
                    key={kind}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold',
                      KIND_META[kind].className,
                    )}
                  >
                    {KIND_META[kind].label} {count}
                  </span>
                ))}
            </div>

            <ul className="space-y-1.5">
              {differences.map((difference) => (
                <DifferenceRow
                  key={`${difference.kind}-${difference.path}`}
                  difference={difference}
                  onCopyPath={(path) => void copy(path, { success: `Copied ${path}` })}
                />
              ))}
            </ul>
          </>
        )}
      </ToolLayout.Section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ToolLayout.Panel
          title="Expected"
          actions={<SendToToolButton value={left} valueName="expected JSON" />}
        >
          <CodeEditor
            value={left}
            onChange={setLeft}
            language="json"
            data-testid="json-compare-left"
            placeholder='{"id": 1, "name": "a"}'
          />
        </ToolLayout.Panel>

        <ToolLayout.Panel
          title="Actual"
          actions={<SendToToolButton value={right} valueName="actual JSON" />}
          className={error ? 'border-destructive/50' : ''}
        >
          <CodeEditor
            value={right}
            onChange={setRight}
            language="json"
            data-testid="json-compare-right"
            placeholder='{"name": "a", "id": 1}'
          />
        </ToolLayout.Panel>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={swap} disabled={!left && !right}>
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          Swap
        </Button>
        <Button variant="outline" size="sm" onClick={clear} disabled={!left && !right}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
    </ToolLayout>
  );
};

export default JsonCompare;
