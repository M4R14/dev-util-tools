import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { buildShareableSearchParams } from '../lib/shareableUrlState';

export interface UUIDOptions {
  version: 'v4';
  quantity: number;
  hyphens: boolean;
  uppercase: boolean;
}

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 100;

const clampQuantity = (value: number) => Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, value));
const parseBoolean = (value: string | null, fallback: boolean) =>
  value === null ? fallback : value === '1' || value === 'true';
const parseQuantity = (value: string | null) => {
  if (!value) return 1;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? clampQuantity(parsed) : 1;
};

export const useUUIDGenerator = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [uuids, setUuids] = useState<string[]>([]);
  const [options, setOptions] = useState<UUIDOptions>({
    version: 'v4',
    quantity: parseQuantity(searchParams.get('q')),
    hyphens: parseBoolean(searchParams.get('hy'), true),
    uppercase: parseBoolean(searchParams.get('up'), false),
  });
  const currentQuery = searchParams.toString();

  const hasSecureUUID = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function';

  useEffect(() => {
    const nextParams = buildShareableSearchParams(currentQuery, [
      { key: 'q', value: String(options.quantity), defaultValue: '1' },
      { key: 'hy', value: options.hyphens ? '1' : '0', defaultValue: '1' },
      { key: 'up', value: options.uppercase ? '1' : '0', defaultValue: '0' },
    ]);

    const nextQuery = nextParams.toString();
    if (nextQuery !== currentQuery) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [options.quantity, options.hyphens, options.uppercase, currentQuery, setSearchParams]);

  const generateUUID = useCallback(() => {
    const newUuids: string[] = [];

    for (let i = 0; i < options.quantity; i++) {
      let uuid: string;

      if (hasSecureUUID) {
        uuid = crypto.randomUUID();
      } else {
        // Fallback
        uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      }

      if (!options.hyphens) {
        uuid = uuid.replace(/-/g, '');
      }

      if (options.uppercase) {
        uuid = uuid.toUpperCase();
      }

      newUuids.push(uuid);
    }

    setUuids(newUuids);
  }, [hasSecureUUID, options]);

  const setQuantity = useCallback((quantity: number) => {
    setOptions((prev) => ({ ...prev, quantity: clampQuantity(quantity) }));
  }, []);

  const clear = useCallback(() => {
    setUuids([]);
  }, []);

  const copyAll = useCallback(() => {
    if (uuids.length > 0) {
      navigator.clipboard.writeText(uuids.join('\n'));
      toast.success('Copied all UUIDs to clipboard');
    }
  }, [uuids]);

  const download = useCallback(() => {
    if (uuids.length === 0) return;
    const blob = new Blob([uuids.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded UUIDs as text file');
  }, [uuids]);

  return {
    uuids,
    options,
    setOptions,
    setQuantity,
    hasSecureUUID,
    generateUUID,
    clear,
    copyAll,
    download,
    minQuantity: MIN_QUANTITY,
    maxQuantity: MAX_QUANTITY,
  };
};
