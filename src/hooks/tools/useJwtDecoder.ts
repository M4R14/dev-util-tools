import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { decodeJwt, type DecodedJwt } from '../../lib/tools/jwt';
import { verifyJwt, type VerifyJwtResult } from '../../lib/tools/jwtSign';
import { useShareableUrlState } from '../useShareableUrlState';

export const useJwtDecoder = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(() => searchParams.get('token') ?? '');
  // The secret never joins the shareable state — see useJwtEncoder for the same rule.
  const [secret, setSecret] = useState('');
  const [verification, setVerification] = useState<VerifyJwtResult | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useShareableUrlState([{ key: 'token', value: token }]);

  const { decoded, error } = useMemo((): {
    decoded: DecodedJwt | null;
    error: string | null;
  } => {
    if (!token.trim()) return { decoded: null, error: null };

    try {
      return { decoded: decodeJwt(token), error: null };
    } catch (e: unknown) {
      return { decoded: null, error: e instanceof Error ? e.message : 'Unable to decode token' };
    }
  }, [token]);

  const verify = useCallback(async () => {
    setIsVerifying(true);
    try {
      setVerification(await verifyJwt(token, secret));
      setVerifyError(null);
    } catch (e: unknown) {
      setVerification(null);
      setVerifyError(e instanceof Error ? e.message : 'Unable to verify token');
    } finally {
      setIsVerifying(false);
    }
  }, [secret, token]);

  const updateToken = useCallback((value: string) => {
    setToken(value);
    // A verdict about the previous token says nothing about this one.
    setVerification(null);
    setVerifyError(null);
  }, []);

  return {
    token,
    setToken: updateToken,
    decoded,
    error,
    secret,
    setSecret,
    verification,
    verifyError,
    isVerifying,
    verify,
    clear: () => updateToken(''),
  };
};
