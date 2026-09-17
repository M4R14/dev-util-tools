import { describe, it, expect } from 'vitest';
import {
  API_KEY_HASH_COLUMN,
  API_KEY_VENDOR_PREFIX_MAX_LENGTH,
  buildApiKeyEnvAssignment,
  buildApiKeyInsertSql,
  buildApiKeyNamespace,
  buildApiKeyScanPattern,
  DEFAULT_API_KEY_VENDOR_PREFIX,
  generateApiKey,
  generateApiKeys,
  normalizeVendorPrefix,
  parseScopeList,
  type ApiKeyIssueContext,
} from './apiKeyGenerator';
import { sha256Hex } from '../platform/sha256';

const context = (overrides: Partial<ApiKeyIssueContext> = {}): ApiKeyIssueContext => ({
  consumer: 'orders-api',
  scopes: ['sms:send'],
  ticket: 'PROJ-123',
  issuedBy: 'alex',
  ...overrides,
});

describe('generateApiKey', () => {
  it('builds a flat key as <vendor>_<env>_<64 hex> and hashes the whole key', () => {
    const generated = generateApiKey({ environment: 'prod', format: 'flat' });

    expect(generated.key).toMatch(/^app_prod_[0-9a-f]{64}$/);
    expect(generated.lookupPrefix).toBeNull();
    expect(generated.hash).toBe(sha256Hex(generated.key));
  });

  it('builds a prefixed key as <vendor>_<env>_<8 hex>.<64 hex> and hashes only the secret', () => {
    const generated = generateApiKey({ environment: 'beta', format: 'prefixed' });

    expect(generated.key).toMatch(/^app_beta_[0-9a-f]{8}\.[0-9a-f]{64}$/);
    expect(generated.key.startsWith(`app_beta_${generated.lookupPrefix}.`)).toBe(true);

    const secret = generated.key.split('.')[1];
    expect(generated.hash).toBe(sha256Hex(secret));
  });

  it('never repeats a key', () => {
    const keys = generateApiKeys({ environment: 'dev', format: 'flat' }, 10);

    expect(new Set(keys.map((key) => key.key)).size).toBe(10);
  });

  it('rejects a non-positive quantity', () => {
    expect(() => generateApiKeys({ environment: 'dev', format: 'flat' }, 0)).toThrow(RangeError);
  });
});

describe('buildApiKeyScanPattern', () => {
  it('matches both key formats and nothing else', () => {
    const pattern = new RegExp(buildApiKeyScanPattern());

    expect(pattern.test(generateApiKey({ environment: 'prod', format: 'flat' }).key)).toBe(true);
    expect(pattern.test(generateApiKey({ environment: 'alpha', format: 'prefixed' }).key)).toBe(
      true,
    );
    expect(pattern.test('app_staging_0123abcd')).toBe(false);
  });

  it('follows the namespace the keys were issued under', () => {
    const pattern = new RegExp(buildApiKeyScanPattern('acme-co'));

    expect(
      pattern.test(
        generateApiKey({ environment: 'prod', format: 'flat', vendorPrefix: 'acme-co' }).key,
      ),
    ).toBe(true);
    expect(pattern.test(generateApiKey({ environment: 'prod', format: 'flat' }).key)).toBe(false);
  });
});

describe('normalizeVendorPrefix', () => {
  it('keeps a namespace that is already usable', () => {
    expect(normalizeVendorPrefix('acme-co')).toBe('acme-co');
  });

  it('case-folds and drops anything outside the charset', () => {
    expect(normalizeVendorPrefix('  ACME Co_1!  ')).toBe('acmeco1');
  });

  it('falls back to the default rather than returning nothing', () => {
    // A key starting with `_` is what an empty namespace would produce.
    expect(normalizeVendorPrefix('')).toBe(DEFAULT_API_KEY_VENDOR_PREFIX);
    expect(normalizeVendorPrefix('!!!')).toBe(DEFAULT_API_KEY_VENDOR_PREFIX);
  });

  it('truncates rather than letting the namespace dwarf the key', () => {
    expect(normalizeVendorPrefix('a'.repeat(40))).toHaveLength(API_KEY_VENDOR_PREFIX_MAX_LENGTH);
  });
});

describe('buildApiKeyNamespace', () => {
  it('defaults to the built-in namespace', () => {
    expect(buildApiKeyNamespace('prod')).toBe('app_prod_');
  });

  it('takes any other, sanitised', () => {
    expect(buildApiKeyNamespace('beta', 'Acme Co')).toBe('acmeco_beta_');
  });
});

describe('generateApiKey with a custom namespace', () => {
  it('leads the key with it, in both formats', () => {
    expect(
      generateApiKey({ environment: 'prod', format: 'flat', vendorPrefix: 'acme' }).key,
    ).toMatch(/^acme_prod_[0-9a-f]{64}$/);
    expect(
      generateApiKey({ environment: 'prod', format: 'prefixed', vendorPrefix: 'acme' }).key,
    ).toMatch(/^acme_prod_[0-9a-f]{8}\.[0-9a-f]{64}$/);
  });

  it('hashes the key as issued, namespace included', () => {
    const generated = generateApiKey({ environment: 'dev', format: 'flat', vendorPrefix: 'acme' });

    expect(generated.hash).toBe(sha256Hex(generated.key));
    expect(generated.hash).not.toBe(sha256Hex(generated.key.replace('acme_', 'app_')));
  });
});

describe('buildApiKeyInsertSql', () => {
  it('writes the flat columns and one row per key', () => {
    const keys = generateApiKeys({ environment: 'prod', format: 'flat' }, 2);
    const sql = buildApiKeyInsertSql(keys, context());

    expect(sql).toContain('INSERT INTO client_api_key (consumer, key_hash, description) VALUES');
    expect(sql).toContain(`'${keys[0].hash}'`);
    expect(sql).toContain(`'${keys[1].hash}'`);
    expect(sql).toContain("'PROJ-123 · requested by alex'");
    expect(sql.trimEnd().endsWith(';')).toBe(true);
  });

  it('never writes the key itself — only its hash', () => {
    const keys = generateApiKeys({ environment: 'prod', format: 'flat' }, 1);

    expect(buildApiKeyInsertSql(keys, context())).not.toContain(keys[0].key);
  });

  it('writes prefix, scopes and audit columns for the prefixed format', () => {
    const keys = generateApiKeys({ environment: 'prod', format: 'prefixed' }, 1);
    const sql = buildApiKeyInsertSql(keys, context({ scopes: ['sms:send', 'email:send'] }));

    expect(sql).toContain('prefix, secret_hash, scopes, issued_by, ticket, description');
    expect(sql).toContain(`'${keys[0].lookupPrefix}'`);
    expect(sql).toContain('\'["sms:send","email:send"]\'');
    expect(sql).toContain("'alex'");
  });

  it('keeps a quote in a consumer name from ending the SQL string', () => {
    const keys = generateApiKeys({ environment: 'dev', format: 'flat' }, 1);
    const sql = buildApiKeyInsertSql(keys, context({ consumer: "o'brien-api" }));

    expect(sql).toContain("'o''brien-api'");
  });

  it('writes NULL, not an empty string, for an unfilled description', () => {
    const keys = generateApiKeys({ environment: 'dev', format: 'flat' }, 1);
    const sql = buildApiKeyInsertSql(keys, context({ ticket: '', issuedBy: '' }));

    expect(sql).toContain(`'${keys[0].hash}', NULL)`);
    expect(sql).not.toContain(", '')");
  });

  it('is empty when there is nothing to insert', () => {
    expect(buildApiKeyInsertSql([], context())).toBe('');
  });
});

describe('buildApiKeyEnvAssignment', () => {
  it('pairs every key with the consumer so both can be live at once', () => {
    const keys = generateApiKeys({ environment: 'prod', format: 'flat' }, 2);

    expect(buildApiKeyEnvAssignment(keys, context())).toBe(
      `CLIENT_API_KEYS=orders-api:${keys[0].key},orders-api:${keys[1].key}`,
    );
  });

  it('falls back to a placeholder rather than emitting a nameless pair', () => {
    const keys = generateApiKeys({ environment: 'prod', format: 'flat' }, 1);

    expect(buildApiKeyEnvAssignment(keys, context({ consumer: '  ' }))).toContain('consumer-name:');
  });
});

describe('parseScopeList', () => {
  it('accepts commas, spaces and newlines', () => {
    expect(parseScopeList('sms:send, email:send\n order:read')).toEqual([
      'sms:send',
      'email:send',
      'order:read',
    ]);
  });

  it('is empty for blank input — default deny', () => {
    expect(parseScopeList('   ')).toEqual([]);
  });
});

describe('API_KEY_HASH_COLUMN', () => {
  it('names the column each format stores its hash in', () => {
    expect(API_KEY_HASH_COLUMN.flat).toBe('key_hash');
    expect(API_KEY_HASH_COLUMN.prefixed).toBe('secret_hash');
  });
});
