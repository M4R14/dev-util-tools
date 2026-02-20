import React from 'react';
import { toast } from 'sonner';
import ToolLayout from '../ui/ToolLayout';
import { useDiffViewer } from '../../hooks/useDiffViewer';
import {
  buildSplitRows,
  DiffInputPanels,
  DiffOutputPanel,
  DiffToolbar,
  getTextMetrics,
  SAMPLE_MODIFIED,
  SAMPLE_ORIGINAL,
} from './diff-viewer';

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
      <DiffInputPanels
        original={original}
        modified={modified}
        originalMetrics={originalMetrics}
        modifiedMetrics={modifiedMetrics}
        onOriginalChange={setOriginal}
        onModifiedChange={setModified}
      />

      <DiffToolbar
        hasDiff={hasDiff}
        hasChanges={hasChanges}
        stats={stats}
        changeRatio={changeRatio}
        viewMode={viewMode}
        showOnlyChanges={showOnlyChanges}
        wrapLines={wrapLines}
        unifiedText={unifiedText}
        onLoadSample={handleLoadSample}
        onSwap={handleSwap}
        onClearAll={handleClearAll}
        onViewModeChange={setViewMode}
        onToggleChangesOnly={() => setShowOnlyChanges((previous) => !previous)}
        onToggleWrapLines={() => setWrapLines((previous) => !previous)}
      />

      <DiffOutputPanel
        hasDiff={hasDiff}
        hasChanges={hasChanges}
        visibleDiff={visibleDiff}
        splitRows={splitRows}
        viewMode={viewMode}
        wrapLines={wrapLines}
        onLoadSample={handleLoadSample}
      />
    </ToolLayout>
  );
};

export default DiffViewer;
