import { randomHex } from '../platform/randomUtils';
import { sha256Hex } from '../platform/sha256';

/**
 * Client API key issuance — the key itself, the hash a service stores, and the lines a developer
 * has to paste somewhere else (SQL, env, secret-scanning rule).
 *
 * The shapes follow a three-tier client API key design: the env-var and single-table tiers share
 * one flat key, while the full tier splits the key into a plain lookup prefix and a secret. All
 * three hash with **sha256 hex, lower-case**, which is what lets a service move up a tier without
 * reissuing keys that are already in the field.
 *
 * The digest comes from `src/lib/platform/sha256.ts` rather than `crypto.subtle`, so the tool also
 * works on the plain-HTTP LAN origin Vite prints — see that file for why.
 *
 * bcrypt/argon2 are deliberately absent. They exist to slow down brute force against low-entropy
 * human passwords; a 32-byte random secret is not brute-forceable, so the only thing they would
 * buy is latency on every request that passes the guard.
 */

export const API_KEY_ENVIRONMENTS = ['dev', 'alpha', 'beta', 'prod'] as const;

export type ApiKeyEnvironment = (typeof API_KEY_ENVIRONMENTS)[number];

/**
 * `flat`     — `<vendor>_<env>_<64 hex>`, stored as one `key_hash`. The env and Lite designs.
 * `prefixed` — `<vendor>_<env>_<8 hex>.<64 hex>`, stored as a plain indexed `prefix` plus a
 *              `secret_hash`. Matches the full design: the row is found by prefix instead of
 *              scanned for, and the prefix is safe to write to a log.
 */
export const API_KEY_FORMATS = ['flat', 'prefixed'] as const;

export type ApiKeyFormat = (typeof API_KEY_FORMATS)[number];

/**
 * Vendor namespace. Present so a leaked key is greppable, not because any guard reads it, which is
 * why it is a default rather than a constant: every organisation wants its own, and the scan
 * pattern follows whatever is chosen.
 */
export const DEFAULT_API_KEY_VENDOR_PREFIX = 'app';

/**
 * Lower-case alphanumerics and hyphens only, and never empty.
 *
 * `_` is excluded because it separates the namespace from the environment: a prefix containing one
 * would make `a_b_prod_<hex>` impossible to split back apart. The charset also means the prefix can
 * be dropped into the scan regex without escaping.
 */
export const API_KEY_VENDOR_PREFIX_PATTERN = /^[a-z0-9-]+$/;

export const API_KEY_VENDOR_PREFIX_MAX_LENGTH = 16;

/**
 * Coerce whatever was typed into a usable namespace: case-folded, with anything outside the
 * charset dropped. Falls back to the default rather than returning an empty namespace, which would
 * produce a key starting with `_`.
 */
export const normalizeVendorPrefix = (value: string): string => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, API_KEY_VENDOR_PREFIX_MAX_LENGTH);

  return API_KEY_VENDOR_PREFIX_PATTERN.test(normalized)
    ? normalized
    : DEFAULT_API_KEY_VENDOR_PREFIX;
};

/** 32 bytes — the `openssl rand -hex 32` the manual procedure uses. */
export const API_KEY_SECRET_BYTES = 32;

/** 4 bytes = the 8 hex characters the full design indexes on. */
export const API_KEY_LOOKUP_PREFIX_BYTES = 4;

export const API_KEY_QUANTITY_BOUNDS = { min: 1, max: 10 } as const;

/** The column each format's hash belongs in, so the UI can label it without guessing. */
export const API_KEY_HASH_COLUMN: Record<ApiKeyFormat, string> = {
  flat: 'key_hash',
  prefixed: 'secret_hash',
};

export interface GeneratedApiKey {
  /** The full value. Shown once, handed to the consumer, never stored. */
  key: string;
  environment: ApiKeyEnvironment;
  format: ApiKeyFormat;
  /** `prefixed` only: the 8 hex characters stored in plain text and used to find the row. */
  lookupPrefix: string | null;
  /**
   * What the service stores — sha256 of the whole key for `flat`, of the secret half for
   * `prefixed`, since that is the half the guard has left to check once the prefix found the row.
   */
  hash: string;
}

export interface ApiKeyRequest {
  environment: ApiKeyEnvironment;
  format: ApiKeyFormat;
  /** Anything outside `[a-z0-9-]` is dropped; blank falls back to the default namespace. */
  vendorPrefix?: string;
}

export interface ApiKeyIssueContext {
  /** The calling service. Not unique: one consumer holds several keys while rotating. */
  consumer: string;
  /** `prefixed` only. Empty means no rights at all — the design is default-deny. */
  scopes: string[];
  ticket: string;
  issuedBy: string;
}

export const buildApiKeyNamespace = (
  environment: ApiKeyEnvironment,
  vendorPrefix: string = DEFAULT_API_KEY_VENDOR_PREFIX,
): string => `${normalizeVendorPrefix(vendorPrefix)}_${environment}_`;

export const generateApiKey = ({
  environment,
  format,
  vendorPrefix,
}: ApiKeyRequest): GeneratedApiKey => {
  const secret = randomHex(API_KEY_SECRET_BYTES);
  const namespace = buildApiKeyNamespace(environment, vendorPrefix);

  if (format === 'flat') {
    const key = `${namespace}${secret}`;

    return { key, environment, format, lookupPrefix: null, hash: sha256Hex(key) };
  }

  const lookupPrefix = randomHex(API_KEY_LOOKUP_PREFIX_BYTES);

  return {
    key: `${namespace}${lookupPrefix}.${secret}`,
    environment,
    format,
    lookupPrefix,
    hash: sha256Hex(secret),
  };
};

export const generateApiKeys = (request: ApiKeyRequest, quantity: number): GeneratedApiKey[] => {
  if (!Number.isInteger(quantity) || quantity < API_KEY_QUANTITY_BOUNDS.min) {
    throw new RangeError(`generateApiKeys needs a positive quantity, received ${quantity}`);
  }

  return Array.from({ length: quantity }, () => generateApiKey(request));
};

/**
 * Regex for gitleaks / Bitbucket secret scanning — the reason the namespace exists at all. It
 * follows whatever namespace the keys were issued under, since a rule pinned to one namespace
 * would not catch a key issued under another.
 */
export const buildApiKeyScanPattern = (
  vendorPrefix: string = DEFAULT_API_KEY_VENDOR_PREFIX,
): string =>
  `${normalizeVendorPrefix(vendorPrefix)}_(?:${API_KEY_ENVIRONMENTS.join('|')})_[0-9a-f]{8}`;

const quote = (value: string) => `'${value.replace(/'/g, "''")}'`;

const buildDescription = ({ ticket, issuedBy }: ApiKeyIssueContext) =>
  [ticket.trim(), issuedBy.trim() ? `requested by ${issuedBy.trim()}` : '']
    .filter(Boolean)
    .join(' · ');

/**
 * The `INSERT` that registers the keys. The hash is computed here rather than left to MySQL's
 * `SHA2()` on purpose: the key would otherwise travel through the general log and the binlog in
 * plain text, which is the one place it must never end up.
 */
export const buildApiKeyInsertSql = (
  keys: GeneratedApiKey[],
  context: ApiKeyIssueContext,
): string => {
  if (keys.length === 0) return '';

  const consumer = context.consumer.trim() || 'consumer-name';
  const description = buildDescription(context);
  // Both nullable columns take NULL rather than an empty string: '' reads as "someone filled this
  // in with nothing", NULL as "nobody filled it in", and only the second is true here.
  const descriptionLiteral = description ? quote(description) : 'NULL';
  const format = keys[0].format;

  if (format === 'flat') {
    const values = keys
      .map((key) => `  (${quote(consumer)}, ${quote(key.hash)}, ${descriptionLiteral})`)
      .join(',\n');

    return `INSERT INTO client_api_key (consumer, key_hash, description) VALUES\n${values};`;
  }

  const scopes = JSON.stringify(context.scopes);
  const issuedBy = context.issuedBy.trim() || 'unknown';
  const ticket = context.ticket.trim();
  const values = keys
    .map(
      (key) =>
        `  (${quote(consumer)}, ${quote(key.lookupPrefix ?? '')}, ${quote(key.hash)}, ${quote(scopes)}, ${quote(issuedBy)}, ${ticket ? quote(ticket) : 'NULL'}, ${descriptionLiteral})`,
    )
    .join(',\n');

  return `INSERT INTO client_api_key (consumer, prefix, secret_hash, scopes, issued_by, ticket, description) VALUES\n${values};`;
};

/**
 * The `CLIENT_API_KEYS` line for the env-var tier. Comma-separated `<consumer>:<key>` pairs —
 * several pairs at once is what makes a rotation possible without a window where the two sides
 * hold different keys.
 */
export const buildApiKeyEnvAssignment = (
  keys: GeneratedApiKey[],
  context: ApiKeyIssueContext,
): string => {
  const consumer = context.consumer.trim() || 'consumer-name';

  return `CLIENT_API_KEYS=${keys.map((key) => `${consumer}:${key.key}`).join(',')}`;
};

/** Parse a comma or whitespace separated scope list into the array the `scopes` column holds. */
export const parseScopeList = (value: string): string[] =>
  value
    .split(/[\s,]+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
