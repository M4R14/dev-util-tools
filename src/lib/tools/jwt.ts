import { jwtDecode } from 'jwt-decode';

/**
 * JWT inspection — decode only.
 *
 * NOTHING here verifies a token. The signature is returned as an opaque string and never
 * checked, because verification needs the issuer's key and, for asymmetric algorithms, that key
 * is not something the browser has. A decoded token proves only what the token *claims*; treat
 * every field as attacker-controlled until a server has verified it.
 *
 * `alg: "none"` tokens decode perfectly happily. That is the point of the warning above.
 *
 * base64url and JSON parsing are delegated to `jwt-decode`. The checks around it are ours on
 * purpose: `jwt-decode` splits on "." and reads part #2 without validating the segment count, so
 * on its own it accepts `a.b` and silently presents the second segment of a 5-part JWE as the
 * payload — and accepts arrays, `null` and numbers as claims. For a tool whose job is to explain
 * what is wrong with a token, that is the opposite of helpful.
 */

export interface JwtClaims {
  [claim: string]: unknown;
}

export interface DecodedJwt {
  header: JwtClaims;
  payload: JwtClaims;
  /** Raw base64url signature segment. Empty for unsigned (`alg: none`) tokens. */
  signature: string;
  /** Algorithm from the header, when present. */
  algorithm: string | null;
  issuedAt: Date | null;
  notBefore: Date | null;
  expiresAt: Date | null;
  /** True when `exp` is in the past. `null` when the token has no `exp` claim. */
  isExpired: boolean | null;
}

const decodePart = (token: string, part: 'header' | 'payload'): JwtClaims => {
  let parsed: unknown;

  try {
    parsed =
      part === 'header' ? jwtDecode<unknown>(token, { header: true }) : jwtDecode<unknown>(token);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    throw new Error(
      message.includes('invalid json')
        ? `JWT ${part} is not valid JSON`
        : `JWT ${part} is not valid base64url`,
    );
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`JWT ${part} must be a JSON object`);
  }

  return parsed as JwtClaims;
};

/** NumericDate claims are seconds since the epoch, not milliseconds. */
const toDate = (claim: unknown): Date | null => {
  if (typeof claim !== 'number' || !Number.isFinite(claim)) return null;

  return new Date(claim * 1000);
};

export const decodeJwt = (token: string, now: Date = new Date()): DecodedJwt => {
  const trimmed = token.trim();
  if (!trimmed) {
    throw new Error('JWT is empty');
  }

  const segments = trimmed.split('.');

  if (segments.length === 5) {
    throw new Error('This looks like a JWE (5 segments); only JWS tokens can be decoded here');
  }
  if (segments.length !== 3) {
    throw new Error(`JWT must have 3 segments separated by ".", received ${segments.length}`);
  }

  const header = decodePart(trimmed, 'header');
  const payload = decodePart(trimmed, 'payload');
  const expiresAt = toDate(payload.exp);

  return {
    header,
    payload,
    signature: segments[2],
    algorithm: typeof header.alg === 'string' ? header.alg : null,
    issuedAt: toDate(payload.iat),
    notBefore: toDate(payload.nbf),
    expiresAt,
    isExpired: expiresAt ? expiresAt.getTime() < now.getTime() : null,
  };
};
