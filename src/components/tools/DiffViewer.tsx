import React from 'react';
import ToolLayout from '../ui/ToolLayout';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { CopyButton } from '../ui/CopyButton';
import { useDiffViewer, DiffViewMode } from '../../hooks/useDiffViewer';
import { DiffLine } from '../../lib/diffUtils';
import { toast } from 'sonner';
import { ArrowLeftRight, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

/* ──────────────── Diff output sub-components ──────────────── */

const DiffLineRow: React.FC<{ line: DiffLine }> = ({ line }) => {
  const bg =
    line.type === 'added'
      ? 'bg-emerald-500/15 text-emerald-300'
      : line.type === 'removed'
        ? 'bg-red-500/15 text-red-300'
        : 'text-muted-foreground';

  const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';

  return (
    <div className={cn('flex font-mono text-xs leading-6 min-h-[1.5rem]', bg)}>
      <span className="w-12 shrink-0 text-right pr-2 select-none text-muted-foreground/60 border-r border-border/30">
        {line.oldLineNumber ?? ''}
      </span>
      <span className="w-12 shrink-0 text-right pr-2 select-none text-muted-foreground/60 border-r border-border/30">
        {line.newLineNumber ?? ''}
      </span>
      <span className="w-5 shrink-0 text-center select-none opacity-60">{prefix}</span>
      <span className="flex-1 whitespace-pre pr-4">{line.value}</span>
    </div>
  );
};

const SplitLineRow: React.FC<{
  oldLine?: DiffLine;
  newLine?: DiffLine;
}> = ({ oldLine, newLine }) => {
  const leftBg =
    oldLine?.type === 'removed'
      ? 'bg-red-500/15 text-red-300'
      : 'text-muted-foreground';

  const rightBg =
    newLine?.type === 'added'
      ? 'bg-emerald-500/15 text-emerald-300'
      : 'text-muted-foreground';

  return (
    <div className="flex font-mono text-xs leading-6 min-h-[1.5rem]">
      {/* Left (original) */}
      <div className={cn('flex flex-1 min-w-0', leftBg)}>
        <span className="w-10 shrink-0 text-right pr-2 select-none text-muted-foreground/60 border-r border-border/30">
          {oldLine?.oldLineNumber ?? ''}
        </span>
        <span className="flex-1 whitespace-pre pl-2 pr-2 overflow-x-auto">
          {oldLine?.value ?? ''}
        </span>
      </div>

      <div className="w-px bg-border/50 shrink-0" />

      {/* Right (modified) */}
      <div className={cn('flex flex-1 min-w-0', rightBg)}>
        <span className="w-10 shrink-0 text-right pr-2 select-none text-muted-foreground/60 border-r border-border/30">
          {newLine?.newLineNumber ?? ''}
        </span>
        <span className="flex-1 whitespace-pre pl-2 pr-2 overflow-x-auto">
          {newLine?.value ?? ''}
        </span>
      </div>
    </div>
  );
};

/** Build split-view pair rows from diff lines */
const buildSplitRows = (diff: DiffLine[]): { oldLine?: DiffLine; newLine?: DiffLine }[] => {
  const rows: { oldLine?: DiffLine; newLine?: DiffLine }[] = [];

  let i = 0;
  while (i < diff.length) {
    const line = diff[i];

    if (line.type === 'unchanged') {
      rows.push({ oldLine: line, newLine: line });
      i++;
    } else if (line.type === 'removed') {
      // Pair consecutive removed + added lines
      const nextLine = diff[i + 1];
      if (nextLine && nextLine.type === 'added') {
        rows.push({ oldLine: line, newLine: nextLine });
        i += 2;
      } else {
        rows.push({ oldLine: line, newLine: undefined });
        i++;
      }
    } else {
      // added without a preceding removed
      rows.push({ oldLine: undefined, newLine: line });
      i++;
    }
  }

  return rows;
};

/* ──────────────── Main Component ──────────────── */

const DiffViewer: React.FC = () => {
  const {
    original,
    modified,
    setOriginal,
    setModified,
    diff,
    stats,
    unifiedText,
    viewMode,
    setViewMode,
    hasDiff,
    hasChanges,
    handleSwap,
    handleClear,
  } = useDiffViewer();

  const splitRows = React.useMemo(() => buildSplitRows(diff), [diff]);

  return (
    <ToolLayout>
      {/* ─── Input panels ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[280px]">
        <ToolLayout.Panel
          title="Original"
          actions={
            <CopyButton value={original} onCopy={() => toast.success('Original text copied')} />
          }
        >
          <Textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste original text here…"
            className="w-full h-full bg-transparent border-none focus-visible:ring-0 p-0 font-mono text-sm resize-none placeholder-muted-foreground shadow-none"
          />
        </ToolLayout.Panel>

        <ToolLayout.Panel
          title="Modified"
          actions={
            <CopyButton value={modified} onCopy={() => toast.success('Modified text copied')} />
          }
        >
          <Textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder="Paste modified text here…"
            className="w-full h-full bg-transparent border-none focus-visible:ring-0 p-0 font-mono text-sm resize-none placeholder-muted-foreground shadow-none"
          />
        </ToolLayout.Panel>
      </div>

      {/* ─── Toolbar ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSwap} title="Swap original & modified">
            <ArrowLeftRight className="w-4 h-4 mr-1.5" />
            Swap
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear} title="Clear both sides">
            <Trash2 className="w-4 h-4 mr-1.5" />
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {hasDiff && (
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-emerald-400">+{stats.additions}</span>
              <span className="text-red-400">-{stats.deletions}</span>
              <span className="text-muted-foreground">{stats.unchanged} unchanged</span>
            </div>
          )}

          <div className="flex rounded-md border border-border overflow-hidden">
            {(['split', 'unified'] as DiffViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                  viewMode === mode
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-muted text-muted-foreground',
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          <CopyButton
            value={unifiedText}
            onCopy={() => toast.success('Unified diff copied')}
          />
        </div>
      </div>

      {/* ─── Diff output ─── */}
      {hasDiff && (
        <ToolLayout.Panel title={hasChanges ? 'Differences' : 'No differences found'}>
          <div className="overflow-auto max-h-[400px] -m-4">
            {viewMode === 'unified' ? (
              diff.map((line, i) => <DiffLineRow key={i} line={line} />)
            ) : (
              splitRows.map((row, i) => (
                <SplitLineRow key={i} oldLine={row.oldLine} newLine={row.newLine} />
              ))
            )}
          </div>
        </ToolLayout.Panel>
      )}
    </ToolLayout>
  );
};

export default DiffViewer;
