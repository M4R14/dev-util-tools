import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { encodeJwt, type JwtSigningAlgorithm } from '../lib/tools/jwtSign';
import { useShareableUrlState } from './useShareableUrlState';

const DEFAULT_PAYLOAD = JSON.stringify({ sub: '1234567890', name: 'John Doe' }, null, 2);

/**
 * The secret is deliberately kept out of the shareable URL — only the payload syncs. A signing
 * key in a link would end up in history, bookmarks and screenshots.
 */
export const useJwtEncoder = () => {
  const [searchParams] = useSearchParams();
  const [payload, setPayload] = useState(() => searchParams.get('payload') ?? DEFAULT_PAYLOAD);
  const [secret, setSecret] = useState('');
  const [algorithm, setAlgorithm] = useState<JwtSigningAlgorithm>('HS256');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEncoding, setIsEncoding] = useState(false);

  useShareableUrlState([{ key: 'payload', value: payload, defaultValue: DEFAULT_PAYLOAD }]);

  const encode = useCallback(async () => {
    let parsedPayload: Record<string, unknown>;

    try {
      const parsed: unknown = JSON.parse(payload);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('Payload must be a JSON object');
      }
      parsedPayload = parsed as Record<string, unknown>;
    } catch (e: unknown) {
      setToken('');
      setError(e instanceof Error ? e.message : 'Payload is not valid JSON');
      return;
    }

    setIsEncoding(true);
    try {
      setToken(await encodeJwt({ payload: parsedPayload, secret, algorithm }));
      setError(null);
    } catch (e: unknown) {
      setToken('');
      setError(e instanceof Error ? e.message : 'Unable to sign token');
    } finally {
      setIsEncoding(false);
    }
  }, [algorithm, payload, secret]);

  return {
    payload,
    setPayload,
    secret,
    setSecret,
    algorithm,
    setAlgorithm,
    token,
    error,
    isEncoding,
    isSigned: Boolean(secret),
    encode,
  };
};
