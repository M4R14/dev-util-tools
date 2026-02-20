import { useState, useMemo, useCallback } from 'react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { computeDiff, getDiffStats, toUnifiedDiff, DiffLine, DiffStats } from '../lib/diffUtils';
import { buildShareableSearchParams } from '../lib/shareableUrlState';

export type DiffViewMode = 'split' | 'unified';
const parseViewMode = (value: string | null): DiffViewMode =>
  value === 'unified' ? 'unified' : 'split';

export const useDiffViewer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [original, setOriginal] = useState(() => searchParams.get('original') ?? '');
  const [modified, setModified] = useState(() => searchParams.get('modified') ?? '');
  const [viewMode, setViewMode] = useState<DiffViewMode>(() => parseViewMode(searchParams.get('view')));
  const currentQuery = searchParams.toString();

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

  useEffect(() => {
    const nextParams = buildShareableSearchParams(currentQuery, [
      { key: 'original', value: original },
      { key: 'modified', value: modified },
      { key: 'view', value: viewMode, defaultValue: 'split' },
    ]);

    const nextQuery = nextParams.toString();
    if (nextQuery !== currentQuery) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [original, modified, viewMode, currentQuery, setSearchParams]);

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
