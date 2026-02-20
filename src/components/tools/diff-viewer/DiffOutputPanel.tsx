import React from 'react';
import ToolLayout from '../../ui/ToolLayout';
import { Button } from '../../ui/Button';
import type { DiffLine } from '../../../lib/diffUtils';
import type { DiffViewMode } from '../../../hooks/useDiffViewer';
import type { SplitRow } from './types';
import { DiffLineRow, SplitLineRow } from './DiffLineRows';

interface DiffOutputPanelProps {
  hasDiff: boolean;
  hasChanges: boolean;
  visibleDiff: DiffLine[];
  splitRows: SplitRow[];
  viewMode: DiffViewMode;
  wrapLines: boolean;
  onLoadSample: () => void;
}

const DiffOutputPanel: React.FC<DiffOutputPanelProps> = ({
  hasDiff,
  hasChanges,
  visibleDiff,
  splitRows,
  viewMode,
  wrapLines,
  onLoadSample,
}) => {
  if (!hasDiff) {
    return (
      <ToolLayout.Panel title="Start comparing">
        <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Add text on either side, or load a sample to preview the diff view.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={onLoadSample}>
            Load sample
          </Button>
        </div>
      </ToolLayout.Panel>
    );
  }

  return (
    <ToolLayout.Panel title={hasChanges ? 'Differences' : 'No differences found'}>
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <div className="grid grid-cols-2 gap-0 bg-muted/60 text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">
          {viewMode === 'unified' ? (
            <div className="col-span-2 px-3 py-2">Unified Diff</div>
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
            visibleDiff.map((line, index) => (
              <DiffLineRow key={index} line={line} wrapLines={wrapLines} />
            ))
          ) : (
            splitRows.map((row, index) => (
              <SplitLineRow
                key={index}
                oldLine={row.oldLine}
                newLine={row.newLine}
                wrapLines={wrapLines}
              />
            ))
          )}
        </div>
      </div>
    </ToolLayout.Panel>
  );
};

export default DiffOutputPanel;
