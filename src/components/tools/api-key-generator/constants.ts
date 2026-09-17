import type { ApiKeyEnvironment, ApiKeyFormat } from '../../../lib/tools/apiKeyGenerator';

export const ENVIRONMENT_OPTIONS: Array<{ value: ApiKeyEnvironment; label: string }> = [
  { value: 'dev', label: 'dev' },
  { value: 'alpha', label: 'alpha' },
  { value: 'beta', label: 'beta' },
  { value: 'prod', label: 'prod' },
];

export interface FormatOption {
  value: ApiKeyFormat;
  label: string;
  shape: string;
  summary: string;
}

/** The shapes quote the namespace in use, so the preview matches the keys the panel shows. */
export const buildFormatOptions = (vendorPrefix: string): FormatOption[] => [
  {
    value: 'flat',
    label: 'Flat key',
    shape: `${vendorPrefix}_<env>_<64 hex>`,
    summary: 'One key_hash column. The env-var and single-table designs.',
  },
  {
    value: 'prefixed',
    label: 'Prefix + secret',
    shape: `${vendorPrefix}_<env>_<8 hex>.<64 hex>`,
    summary: 'Indexed plain prefix beside secret_hash — findable, and safe to log.',
  },
];

export const QUANTITY_PRESETS = [1, 2, 5] as const;

/**
 * The parts of the design that are easy to get wrong once and then live with for years. Kept
 * beside the tool rather than in a linked document because the moment to read them is the moment
 * a key is on screen.
 */
export const API_KEY_GUIDANCE = [
  'Show the key once, hand it over, store only the hash. A plain key in a table is a key for everyone who can read that table — including whoever restores the dump onto dev.',
  'The hash can go into git. The key cannot.',
  'Do not let the database hash it with SHA2() — the key would pass through the general log and the binlog in clear text on its way in.',
  'Rotate by issuing the second key first. consumer is not unique, so both work at once; revoke the old one after it goes quiet.',
  'Put the scan pattern into gitleaks so the next leak is caught at commit time instead of in a log.',
] as const;
