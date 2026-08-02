import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatCurlBody, parseCurl, type ParsedCurl } from '../../lib/tools/curlParser';
import { useShareableUrlState } from '../useShareableUrlState';

export const useCurlParser = () => {
  const [searchParams] = useSearchParams();
  const [command, setCommand] = useState(() => searchParams.get('curl') ?? '');

  useShareableUrlState([{ key: 'curl', value: command }]);

  const { parsed, error } = useMemo((): { parsed: ParsedCurl | null; error: string | null } => {
    if (!command.trim()) return { parsed: null, error: null };

    try {
      return { parsed: parseCurl(command), error: null };
    } catch (e: unknown) {
      return { parsed: null, error: e instanceof Error ? e.message : 'Unable to parse' };
    }
  }, [command]);

  const body = useMemo(() => formatCurlBody(parsed?.body ?? null), [parsed?.body]);

  return { command, setCommand, parsed, body, error, clear: () => setCommand('') };
};
