import React from 'react';
import { toast } from 'sonner';
import { ArrowLeftRight, Trash2 } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { CopyButton } from '../ui/CopyButton';
import { useDiffViewer, DiffViewMode } from '../../hooks/useDiffViewer';
import { DiffLine } from '../../lib/diffUtils';
import { cn } from '../../lib/utils';

/* ──────────────── Diff output sub-components ──────────────── */

const DiffLineRow: React.FC<{ line: DiffLine; wrapLines: boolean }> = ({ line, wrapLines }) => {
  const bg =
    line.type === 'added'
      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
      : line.type === 'removed'
        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
        : 'text-foreground/80';

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
      <span className={cn('flex-1 pr-4', wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre')}>
        {line.value}
      </span>
    </div>
  );
};

const SplitLineRow: React.FC<{
  oldLine?: DiffLine;
  newLine?: DiffLine;
  wrapLines: boolean;
}> = ({ oldLine, newLine, wrapLines }) => {
  const leftBg =
    oldLine?.type === 'removed'
      ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
      : 'text-foreground/80';

  const rightBg =
    newLine?.type === 'added'
      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
      : 'text-foreground/80';

  return (
    <div className="flex font-mono text-xs leading-6 min-h-[1.5rem]">
      {/* Left (original) */}
      <div className={cn('flex flex-1 min-w-0', leftBg)}>
        <span className="w-10 shrink-0 text-right pr-2 select-none text-muted-foreground/60 border-r border-border/30">
          {oldLine?.oldLineNumber ?? ''}
        </span>
        <span className={cn('flex-1 pl-2 pr-2', wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto')}>
          {oldLine?.value ?? ''}
        </span>
      </div>

      <div className="w-px bg-border/50 shrink-0" />

      {/* Right (modified) */}
      <div className={cn('flex flex-1 min-w-0', rightBg)}>
        <span className="w-10 shrink-0 text-right pr-2 select-none text-muted-foreground/60 border-r border-border/30">
          {newLine?.newLineNumber ?? ''}
        </span>
        <span className={cn('flex-1 pl-2 pr-2', wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto')}>
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

const getTextMetrics = (text: string) => ({
  lines: text ? text.split('\n').length : 0,
  chars: text.length,
});

const SAMPLE_ORIGINAL = `function sum(a, b) {
  return a + b;
}

console.log(sum(1, 2));`;

const SAMPLE_MODIFIED = `function sum(a, b, c = 0) {
  return a + b + c;
}

console.log(sum(1, 2, 3));`;

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

  const [showOnlyChanges, setShowOnlyChanges] = React.useState(false);
  const [wrapLines, setWrapLines] = React.useState(false);

  const originalMetrics = React.useMemo(() => getTextMetrics(original), [original]);
  const modifiedMetrics = React.useMemo(() => getTextMetrics(modified), [modified]);

  const visibleDiff = React.useMemo(
    () => (showOnlyChanges ? diff.filter((line) => line.type !== 'unchanged') : diff),
    [diff, showOnlyChanges],
  );

  const splitRows = React.useMemo(() => buildSplitRows(visibleDiff), [visibleDiff]);

  const totalLines = stats.additions + stats.deletions + stats.unchanged;
  const changedLines = stats.additions + stats.deletions;
  const changeRatio = totalLines > 0 ? Math.round((changedLines / totalLines) * 100) : 0;

  const handleLoadSample = () => {
    setOriginal(SAMPLE_ORIGINAL);
    setModified(SAMPLE_MODIFIED);
    toast.info('Sample texts loaded');
  };

  const handleClearAll = () => {
    handleClear();
    setShowOnlyChanges(false);
    toast.info('Both sides cleared');
  };

  return (
    <ToolLayout>
      {/* ─── Input panels ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[18rem]">
        <ToolLayout.Panel
          title={`Original · ${originalMetrics.lines}L / ${originalMetrics.chars}C`}
          actions={
            <CopyButton value={original} onCopy={() => toast.success('Original text copied')} />
          }
        >
          <Textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste original text here…"
            className="w-full min-h-[16rem] h-full bg-transparent border-none focus-visible:ring-0 p-0 font-mono text-sm resize-none placeholder-muted-foreground shadow-none"
          />
        </ToolLayout.Panel>

        <ToolLayout.Panel
          title={`Modified · ${modifiedMetrics.lines}L / ${modifiedMetrics.chars}C`}
          actions={
            <CopyButton value={modified} onCopy={() => toast.success('Modified text copied')} />
          }
        >
          <Textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder="Paste modified text here…"
            className="w-full min-h-[16rem] h-full bg-transparent border-none focus-visible:ring-0 p-0 font-mono text-sm resize-none placeholder-muted-foreground shadow-none"
          />
        </ToolLayout.Panel>
      </div>

      {/* ─── Toolbar ─── */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-3 md:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleLoadSample}>
              Load sample
            </Button>
            <Button variant="outline" size="sm" onClick={handleSwap} title="Swap original & modified">
              <ArrowLeftRight className="w-4 h-4 mr-1.5" />
              Swap
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAll} title="Clear both sides">
              <Trash2 className="w-4 h-4 mr-1.5" />
              Clear
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

            <Button
              variant={showOnlyChanges ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowOnlyChanges((prev) => !prev)}
            >
              Changes only
            </Button>

            <Button
              variant={wrapLines ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWrapLines((prev) => !prev)}
            >
              Wrap lines
            </Button>

            <CopyButton
              value={unifiedText}
              disabled={!hasChanges}
              onCopy={() => toast.success('Unified diff copied')}
              title={hasChanges ? 'Copy unified diff' : 'No changes to copy'}
            />
          </div>
        </div>

        {hasDiff && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-emerald-600 dark:text-emerald-300">
              +{stats.additions} additions
            </span>
            <span className="rounded-md border border-rose-500/25 bg-rose-500/10 px-2 py-1 text-rose-600 dark:text-rose-300">
              -{stats.deletions} deletions
            </span>
            <span className="rounded-md border border-border/80 bg-muted/40 px-2 py-1 text-muted-foreground">
              {stats.unchanged} unchanged
            </span>
            <span className="rounded-md border border-border/80 bg-muted/40 px-2 py-1 text-muted-foreground">
              {changeRatio}% changed
            </span>
          </div>
        )}
      </div>

      {/* ─── Diff output ─── */}
      {hasDiff ? (
        <ToolLayout.Panel title={hasChanges ? 'Differences' : 'No differences found'}>
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <div className="grid grid-cols-2 gap-0 bg-muted/60 text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">
              {viewMode === 'unified' ? (
                <>
                  <div className="col-span-2 px-3 py-2">Unified Diff</div>
                </>
              ) : (
                <>
                  <div className="px-3 py-2 border-r border-border/50">Original</div>
                  <div className="px-3 py-2">Modified</div>
                </>
              )}
            </div>

            <div className="overflow-auto max-h-[430px]">
              {visibleDiff.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No changed lines in current filter.
                </div>
              ) : viewMode === 'unified' ? (
                visibleDiff.map((line, i) => <DiffLineRow key={i} line={line} wrapLines={wrapLines} />)
              ) : (
                splitRows.map((row, i) => (
                  <SplitLineRow key={i} oldLine={row.oldLine} newLine={row.newLine} wrapLines={wrapLines} />
                ))
              )}
            </div>
          </div>
        </ToolLayout.Panel>
      ) : (
        <ToolLayout.Panel title="Start comparing">
          <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Add text on either side, or load a sample to preview the diff view.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleLoadSample}>
              Load sample
            </Button>
          </div>
        </ToolLayout.Panel>
      )}
    </ToolLayout>
  );
};

export default DiffViewer;
