# JWT Decoder

| Field | Value |
|---|---|
| **ToolID** | `jwt-decoder` |
| **Route** | `/jwt-decoder` |
| **Component** | `JwtDecoder.tsx` |
| **Hook** | `src/hooks/tools/useJwtDecoder.ts` |
| **Lib** | `src/lib/tools/jwt.ts` |
| **AI Bridge** | `jwt-decoder` — operations `decode`, `claims` |

## Description
Decodes a JWS compact token into its header, payload and time claims, and can verify an HMAC
signature against a shared secret.

**Decoding and verification are separate steps.** Until you verify, the displayed values are only
what the token *claims* — tokens signed with `alg: none` decode just as happily. The UI says so
under the signature, and the AI bridge (decode only) repeats it as `signatureVerified: false` in
every response.

Verification is HMAC-only (HS256/HS384/HS512) and needs a secure context; see
[JWT Encoder](./jwt-encoder.md) for the shared constraints.

## Files
- `src/lib/tools/jwt.ts` — `decodeJwt(token, now?)`; base64url + JSON parsing delegated to `jwt-decode`,
  validation and claim interpretation kept locally
- `src/lib/tools/jwt.test.ts` — includes the canonical jwt.io sample token
- `src/hooks/tools/useJwtDecoder.ts` — input state + shareable `token` query param
- `src/components/tools/JwtDecoder.tsx`
- `src/lib/ai-tool-bridge/handlers/jwtDecoder.ts`

## Usage Pattern
- Input: JWT string (`header.payload.signature`)
- Output: decoded header/payload JSON, algorithm, `iat`/`nbf`/`exp`, expiry status
- Actions: Copy header, Copy payload, Clear

## Behaviour Notes
- Decoding uses `jwt-decode`; the surrounding validation is local because that library accepts
  `a.b` (2 segments), returns segment #2 of a 5-part JWE as if it were the payload, and accepts
  arrays/`null`/numbers as claims. The "rejects malformed input" tests pin exactly those cases.
- base64url (`-` `_`, no padding) handling is covered by the canonical jwt.io token, whose
  signature contains `_`.
- `exp`/`iat`/`nbf` are NumericDate — **seconds**, not milliseconds.
- `isExpired` is `null` when the token has no `exp` claim, rather than defaulting to `false`.
- A 5-segment token is reported as JWE specifically, not as a generic segment-count error.
- `decodeJwt` accepts an injected `now` so expiry logic is testable without faking the clock.

## Shareable URL State
- `token` — the raw token

## Related

- [Tool Registry](../04-tool-registry.md)
- [AI Bridge](./ai-bridge.md)
- [Directory Map](../03-directory-map.md)
