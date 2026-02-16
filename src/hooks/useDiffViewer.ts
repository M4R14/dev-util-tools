import { useState, useMemo, useCallback } from 'react';
import { computeDiff, getDiffStats, toUnifiedDiff, DiffLine, DiffStats } from '../lib/diffUtils';

export type DiffViewMode = 'split' | 'unified';

export const useDiffViewer = () => {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [viewMode, setViewMode] = useState<DiffViewMode>('split');

  const diff: DiffLine[] = useMemo(() => computeDiff(original, modified), [original, modified]);

  const stats: DiffStats = useMemo(() => getDiffStats(diff), [diff]);

  const unifiedText: string = useMemo(
    () => toUnifiedDiff(original, modified),
    [original, modified],
  );

  const hasDiff = original !== '' || modified !== '';
  const hasChanges = stats.additions > 0 || stats.deletions > 0;

  const handleSwap = useCallback(() => {
    setOriginal((prev) => {
      const oldOriginal = prev;
      setModified(oldOriginal);
      return modified;
    });
  }, [modified]);

  const handleClear = useCallback(() => {
    setOriginal('');
    setModified('');
  }, []);

  return {
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
  };
};
