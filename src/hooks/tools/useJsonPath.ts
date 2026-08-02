import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatJsonPathMatches, queryJsonText, type JsonPathMatch } from '../../lib/tools/jsonPath';
import { useShareableUrlState } from '../useShareableUrlState';

const DEFAULT_PATH = '$';

export const useJsonPath = () => {
  const [searchParams] = useSearchParams();
  const [json, setJson] = useState(() => searchParams.get('input') ?? '');
  const [path, setPath] = useState(() => searchParams.get('path') ?? DEFAULT_PATH);

  useShareableUrlState([
    { key: 'input', value: json },
    { key: 'path', value: path, defaultValue: DEFAULT_PATH },
  ]);

  const { matches, output, error } = useMemo((): {
    matches: JsonPathMatch[];
    output: string;
    error: string | null;
  } => {
    if (!json.trim() || !path.trim()) return { matches: [], output: '', error: null };

    try {
      const found = queryJsonText(json, path);
      return { matches: found, output: formatJsonPathMatches(found), error: null };
    } catch (e: unknown) {
      return { matches: [], output: '', error: e instanceof Error ? e.message : 'Unable to query' };
    }
  }, [json, path]);

  return {
    json,
    setJson,
    path,
    setPath,
    matches,
    output,
    error,
    /** Distinguishes "nothing matched" from "nothing asked" so the UI can say which. */
    hasQuery: Boolean(json.trim() && path.trim()),
    clear: () => {
      setJson('');
      setPath(DEFAULT_PATH);
    },
  };
};
