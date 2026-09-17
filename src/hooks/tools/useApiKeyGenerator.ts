import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { readNumberParam } from '../../lib/platform/shareableUrlState';
import {
  API_KEY_ENVIRONMENTS,
  API_KEY_FORMATS,
  API_KEY_QUANTITY_BOUNDS,
  API_KEY_VENDOR_PREFIX_MAX_LENGTH,
  DEFAULT_API_KEY_VENDOR_PREFIX,
  generateApiKeys,
  normalizeVendorPrefix,
  type ApiKeyEnvironment,
  type ApiKeyFormat,
  type GeneratedApiKey,
} from '../../lib/tools/apiKeyGenerator';
import { useShareableUrlState } from '../useShareableUrlState';

const DEFAULT_ENVIRONMENT: ApiKeyEnvironment = 'dev';
const DEFAULT_FORMAT: ApiKeyFormat = 'flat';
const DEFAULT_QUANTITY = 1;

const readEnvironmentParam = (raw: string | null): ApiKeyEnvironment =>
  API_KEY_ENVIRONMENTS.find((value) => value === raw) ?? DEFAULT_ENVIRONMENT;

const readFormatParam = (raw: string | null): ApiKeyFormat =>
  API_KEY_FORMATS.find((value) => value === raw) ?? DEFAULT_FORMAT;

/**
 * Typed freely, sanitised only on the way into a key. Rejecting keystrokes as they are typed would
 * make the field impossible to edit — you could never clear it to type a different namespace — so
 * the input keeps what was typed and `normalizeVendorPrefix` decides what it means.
 */
const readVendorPrefixParam = (raw: string | null): string =>
  raw === null ? DEFAULT_API_KEY_VENDOR_PREFIX : raw.slice(0, API_KEY_VENDOR_PREFIX_MAX_LENGTH);

const clampQuantity = (value: number) =>
  Math.min(API_KEY_QUANTITY_BOUNDS.max, Math.max(API_KEY_QUANTITY_BOUNDS.min, Math.round(value)));

/**
 * Generation is synchronous, so the keys are derived state rather than something an effect fills
 * in after a render — there is no window where the panel shows a key and the SQL below it still
 * describes the previous one.
 *
 * Only the three inputs that change the key itself live in the URL. `consumer`, `ticket` and
 * `issuedBy` stay out of it: they name an internal service and a person, and the whole point of
 * the shareable link is that it can be pasted into a ticket.
 *
 * The keys themselves are state, never a param — a generated key in an address bar ends up in
 * browser history, in the referrer of the next request, and in whatever chat it was shared to.
 */
export const useApiKeyGenerator = () => {
  const [searchParams] = useSearchParams();
  const [environment, setEnvironment] = useState<ApiKeyEnvironment>(() =>
    readEnvironmentParam(searchParams.get('env')),
  );
  const [format, setFormat] = useState<ApiKeyFormat>(() =>
    readFormatParam(searchParams.get('fmt')),
  );
  const [quantity, setQuantityState] = useState(() =>
    clampQuantity(
      readNumberParam(searchParams.get('qty'), DEFAULT_QUANTITY, API_KEY_QUANTITY_BOUNDS),
    ),
  );

  const [vendorPrefixInput, setVendorPrefixInput] = useState(() =>
    readVendorPrefixParam(searchParams.get('pfx')),
  );
  const vendorPrefix = normalizeVendorPrefix(vendorPrefixInput);

  const [consumer, setConsumer] = useState('');
  const [scopeInput, setScopeInput] = useState('');
  const [ticket, setTicket] = useState('');
  const [issuedBy, setIssuedBy] = useState('');

  // Bumped by the Generate button. The options alone cannot drive the memo, because asking for a
  // fresh key with the same options must still produce a fresh key.
  const [generation, setGeneration] = useState(0);

  useShareableUrlState([
    { key: 'env', value: environment, defaultValue: DEFAULT_ENVIRONMENT },
    { key: 'fmt', value: format, defaultValue: DEFAULT_FORMAT },
    { key: 'qty', value: String(quantity), defaultValue: String(DEFAULT_QUANTITY) },
    { key: 'pfx', value: vendorPrefix, defaultValue: DEFAULT_API_KEY_VENDOR_PREFIX },
  ]);

  const keys: GeneratedApiKey[] = useMemo(
    () => generateApiKeys({ environment, format, vendorPrefix }, quantity),
    // `generation` is the whole point of the dependency list here: it is what a click on Generate
    // changes when nothing else has.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [environment, format, vendorPrefix, quantity, generation],
  );

  return {
    environment,
    setEnvironment,
    format,
    setFormat,
    vendorPrefixInput,
    setVendorPrefixInput: (value: string) =>
      setVendorPrefixInput(value.slice(0, API_KEY_VENDOR_PREFIX_MAX_LENGTH)),
    /** What `vendorPrefixInput` actually resolves to — what the keys and the scan pattern use. */
    vendorPrefix,
    quantity,
    setQuantity: (value: number) => setQuantityState(clampQuantity(value)),
    consumer,
    setConsumer,
    scopeInput,
    setScopeInput,
    ticket,
    setTicket,
    issuedBy,
    setIssuedBy,
    keys,
    regenerate: () => setGeneration((previous) => previous + 1),
  };
};
