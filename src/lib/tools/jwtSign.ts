import { SignJWT, UnsecuredJWT, jwtVerify, errors } from 'jose';
import type { JwtClaims } from './jwt';

/**
 * JWT creation and verification, backed by `jose`.
 *
 * Signing and verification are the one part of this codebase that must never be hand-rolled, so
 * every HMAC operation goes through `jose` on top of the Web Crypto API.
 *
 * Web Crypto's `subtle` is only exposed in **secure contexts** (https or localhost). Over a plain
 * HTTP origin — a LAN IP during development, for example — these functions throw instead of
 * silently producing an unsigned or unchecked result.
 *
 * Symmetric algorithms only. Verifying RS256/ES256 needs a public key in JWK/PEM form, which is a
 * separate input problem and is not supported here yet.
 */

export const JWT_SIGNING_ALGORITHMS = ['HS256', 'HS384', 'HS512'] as const;

export type JwtSigningAlgorithm = (typeof JWT_SIGNING_ALGORITHMS)[number];

export interface EncodeJwtOptions {
  payload: JwtClaims;
  /** Omit or leave empty to produce an unsigned (`alg: none`) token. */
  secret?: string;
  algorithm?: JwtSigningAlgorithm;
}

export type VerifyJwtResult =
  | { valid: true; payload: JwtClaims; protectedHeader: JwtClaims }
  | { valid: false; reason: string };

const assertSubtleCrypto = () => {
  if (typeof globalThis.crypto?.subtle === 'undefined') {
    throw new Error(
      'Signing and verification need Web Crypto, which browsers only expose over https or localhost.',
    );
  }
};

const toKey = (secret: string) => new TextEncoder().encode(secret);

/**
 * Build a JWT. Without a secret this produces an **unsigned** `alg: none` token, which is useful
 * for fixtures and for seeing the structure, and is rejected by any server that checks signatures.
 */
export const encodeJwt = async ({
  payload,
  secret,
  algorithm = 'HS256',
}: EncodeJwtOptions): Promise<string> => {
  if (!secret) {
    return new UnsecuredJWT(payload).encode();
  }

  assertSubtleCrypto();

  return new SignJWT(payload)
    .setProtectedHeader({ alg: algorithm, typ: 'JWT' })
    .sign(toKey(secret));
};

/**
 * Check a token's signature against a shared secret.
 *
 * Returns a result object rather than throwing for an invalid signature: "this token is not
 * authentic" is an answer the caller asked for, not an exceptional condition. Genuine faults
 * (no Web Crypto) still throw.
 */
export const verifyJwt = async (
  token: string,
  secret: string,
  algorithms: JwtSigningAlgorithm[] = [...JWT_SIGNING_ALGORITHMS],
): Promise<VerifyJwtResult> => {
  if (!token.trim()) return { valid: false, reason: 'Token is empty' };
  if (!secret) return { valid: false, reason: 'Secret is empty' };

  assertSubtleCrypto();

  try {
    const { payload, protectedHeader } = await jwtVerify(token, toKey(secret), { algorithms });

    return {
      valid: true,
      payload: payload as JwtClaims,
      protectedHeader: protectedHeader as unknown as JwtClaims,
    };
  } catch (error) {
    if (error instanceof errors.JWSSignatureVerificationFailed) {
      return { valid: false, reason: 'Signature does not match this secret' };
    }
    if (error instanceof errors.JWTExpired) {
      return { valid: false, reason: 'Signature is valid but the token has expired' };
    }
    if (error instanceof errors.JOSEAlgNotAllowed) {
      return { valid: false, reason: 'Token algorithm is not one of the allowed HMAC algorithms' };
    }

    return { valid: false, reason: error instanceof Error ? error.message : 'Verification failed' };
  }
};
