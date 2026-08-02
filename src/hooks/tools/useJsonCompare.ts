import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  compareJsonText,
  summarizeJsonDifferences,
  type JsonCompareSummary,
  type JsonDifference,
} from '../../lib/tools/jsonCompare';
import { useShareableUrlState } from '../useShareableUrlState';

export const useJsonCompare = () => {
  const [searchParams] = useSearchParams();
  const [left, setLeft] = useState(() => searchParams.get('left') ?? '');
  const [right, setRight] = useState(() => searchParams.get('right') ?? '');

  useShareableUrlState([
    { key: 'left', value: left },
    { key: 'right', value: right },
  ]);

  const { differences, summary, error, hasInput } = useMemo((): {
    differences: JsonDifference[];
    summary: JsonCompareSummary;
    error: string | null;
    hasInput: boolean;
  } => {
    const empty = { added: 0, removed: 0, changed: 0, typeChanged: 0, total: 0 };

    if (!left.trim() || !right.trim()) {
      return { differences: [], summary: empty, error: null, hasInput: false };
    }

    try {
      const result = compareJsonText(left, right);
      return {
        differences: result.differences,
        summary: summarizeJsonDifferences(result.differences),
        error: null,
        hasInput: true,
      };
    } catch (e: unknown) {
      return {
        differences: [],
        summary: empty,
        error: e instanceof Error ? e.message : 'Unable to compare',
        hasInput: true,
      };
    }
  }, [left, right]);

  return {
    left,
    setLeft,
    right,
    setRight,
    differences,
    summary,
    error,
    hasInput,
    /** Only meaningful once both sides parsed; the caller checks `hasInput` and `error` first. */
    identical: hasInput && !error && differences.length === 0,
    swap: () => {
      setLeft(right);
      setRight(left);
    },
    clear: () => {
      setLeft('');
      setRight('');
    },
  };
};
