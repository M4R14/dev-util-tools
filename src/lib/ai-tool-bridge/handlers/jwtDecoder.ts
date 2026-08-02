import { decodeJwt } from '../../jwt';
import { assertSupportedOperation, asString } from '../validators';
import type { ToolRunner } from './types';

export const runJwtDecoder: ToolRunner = (operation, input, context) => {
  assertSupportedOperation(context.tool, operation, context.supportedOperations);
  const raw = asString(input, 'input');
  const decoded = decodeJwt(raw);

  if (operation === 'decode') {
    // Dates are serialised to ISO strings so the response stays JSON-safe over the bridge.
    return {
      header: decoded.header,
      payload: decoded.payload,
      algorithm: decoded.algorithm,
      signature: decoded.signature,
      issuedAt: decoded.issuedAt?.toISOString() ?? null,
      notBefore: decoded.notBefore?.toISOString() ?? null,
      expiresAt: decoded.expiresAt?.toISOString() ?? null,
      isExpired: decoded.isExpired,
      // Stated in every response so an agent cannot mistake decoding for verification.
      signatureVerified: false,
    };
  }
  if (operation === 'claims') {
    return decoded.payload;
  }

  throw new Error(`Unsupported operation "${operation}" for jwt-decoder`);
};
