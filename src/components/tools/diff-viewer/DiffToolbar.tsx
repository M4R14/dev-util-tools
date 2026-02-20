import React from 'react';
import { toast } from 'sonner';
import { ArrowLeftRight, Trash2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { CopyButton } from '../../ui/CopyButton';
import { cn } from '../../../lib/utils';
import type { DiffStats } from '../../../lib/diffUtils';
import type { DiffViewMode } from '../../../hooks/useDiffViewer';

interface DiffToolbarProps {
  hasDiff: boolean;
  hasChanges: boolean;
  stats: DiffStats;
  changeRatio: number;
  viewMode: DiffViewMode;
  showOnlyChanges: boolean;
  wrapLines: boolean;
  unifiedText: string;
  onLoadSample: () => void;
  onSwap: () => void;
  onClearAll: () => void;
  onViewModeChange: (viewMode: DiffViewMode) => void;
  onToggleChangesOnly: () => void;
  onToggleWrapLines: () => void;
}

const DiffToolbar: React.FC<DiffToolbarProps> = ({
  hasDiff,
  hasChanges,
  stats,
  changeRatio,
  viewMode,
  showOnlyChanges,
  wrapLines,
  unifiedText,
  onLoadSample,
  onSwap,
  onClearAll,
  onViewModeChange,
  onToggleChangesOnly,
  onToggleWrapLines,
}) => (
  <div className="rounded-xl border border-border/60 bg-card/60 p-3 md:p-4 space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadSample}
          data-action="load-diff-sample"
          data-testid="diff-load-sample-button"
        >
          Load sample
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSwap}
          data-action="swap-diff-sides"
          data-testid="diff-swap-button"
          title="Swap original & modified"
        >
          <ArrowLeftRight className="w-4 h-4 mr-1.5" />
          Swap
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          data-action="clear-diff-inputs"
          data-testid="diff-clear-button"
          title="Clear both sides"
        >
          <Trash2 className="w-4 h-4 mr-1.5" />
          Clear
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border border-border overflow-hidden">
          {(['split', 'unified'] as DiffViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              data-action={`set-diff-view-${mode}`}
              data-testid="diff-viewmode-button"
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
          onClick={onToggleChangesOnly}
          data-action="toggle-diff-changes-only"
          data-testid="diff-toggle-changes-button"
        >
          Changes only
        </Button>

        <Button
          variant={wrapLines ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleWrapLines}
          data-action="toggle-diff-wrap-lines"
          data-testid="diff-toggle-wrap-button"
        >
          Wrap lines
        </Button>

        <CopyButton
          value={unifiedText}
          data-action="copy-diff-unified"
          data-testid="diff-copy-unified-button"
          disabled={!hasChanges}
          onCopy={() => toast.success('Unified diff copied')}
          title={hasChanges ? 'Copy unified diff' : 'No changes to copy'}
        />
      </div>
    </div>

    {hasDiff ? (
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
    ) : null}
  </div>
);

export default DiffToolbar;
