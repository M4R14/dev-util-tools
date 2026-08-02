import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  describeTimestamp,
  nowTimestamps,
  parseTimestamp,
  summarizeTimestamp,
  type TimestampSummary,
  type TimestampUnit,
  type TimestampView,
} from '../../lib/tools/timestamp';
import { useShareableUrlState } from '../useShareableUrlState';

export const useTimestampConverter = () => {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState(() => searchParams.get('ts') ?? '');

  useShareableUrlState([{ key: 'ts', value: input }]);

  const { views, summary, detectedUnit, error } = useMemo((): {
    views: TimestampView[];
    summary: TimestampSummary | null;
    detectedUnit: TimestampUnit | null;
    error: string | null;
  } => {
    if (!input.trim()) return { views: [], summary: null, detectedUnit: null, error: null };

    try {
      const parsed = parseTimestamp(input);
      return {
        views: describeTimestamp(parsed),
        summary: summarizeTimestamp(parsed),
        detectedUnit: parsed.detectedUnit,
        error: null,
      };
    } catch (e: unknown) {
      return {
        views: [],
        summary: null,
        detectedUnit: null,
        error: e instanceof Error ? e.message : 'Unable to read that timestamp',
      };
    }
  }, [input]);

  return {
    input,
    setInput,
    views,
    summary,
    detectedUnit,
    error,
    useNowSeconds: () => setInput(String(nowTimestamps().seconds)),
    useNowMilliseconds: () => setInput(String(nowTimestamps().milliseconds)),
    clear: () => setInput(''),
  };
};
