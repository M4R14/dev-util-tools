# JWT Encoder

| Field | Value |
|---|---|
| **ToolID** | `jwt-encoder` |
| **Route** | `/jwt-encoder` |
| **Component** | `JwtEncoder.tsx` |
| **Hook** | `src/hooks/useJwtEncoder.ts` |
| **Lib** | `src/lib/jwtSign.ts` (uses `jose`) |
| **AI Bridge** | Not exposed — see below |

## Description
Builds a JWT from a JSON payload. With no secret it produces an **unsigned** `alg: none` token
(useful for fixtures); with a secret it signs using HS256/HS384/HS512 through `jose` on top of
Web Crypto.

## Files
- `src/lib/jwtSign.ts` — `encodeJwt`, `verifyJwt`, `JWT_SIGNING_ALGORITHMS`
- `src/lib/jwtSign.test.ts`
- `src/hooks/useJwtEncoder.ts`
- `src/components/tools/JwtEncoder.tsx`

## Security Notes
- **The secret is never put in the shareable URL** — only the payload syncs to `?payload=`. A
  signing key in a link would land in history, bookmarks and screenshots. `useJwtDecoder` follows
  the same rule for its verification secret.
- Signing and verification need `crypto.subtle`, which browsers expose **only in secure contexts**
  (https or localhost). On a plain-HTTP origin `jwtSign.ts` throws with an explicit message rather
  than silently returning an unsigned or unchecked result. Building an unsigned token still works
  because it needs no crypto.
- Symmetric algorithms only. RS256/ES256 verification needs a public key in JWK/PEM form, which is
  a separate input problem and is not supported yet.
- `verifyJwt` returns `{ valid: false, reason }` for a bad signature rather than throwing — that is
  an answer the caller asked for. Missing Web Crypto still throws.

## Shareable URL State
- `payload` — the claims JSON (default payload is elided from the URL)

## Why it is not on the AI Bridge
`ToolRunner` is synchronous and `runAITool` returns its response synchronously, but signing and
verification are async (Web Crypto). Exposing them would mean making the whole bridge — including
the public `window.DevPulseAI.run()` contract — async. That is a deliberate scope boundary, not an
oversight.

## Related

- [JWT Decoder](./jwt-decoder.md) — decoding and verification
- [Tool Registry](../04-tool-registry.md)
- [Dependencies](../07-dependencies.md)
