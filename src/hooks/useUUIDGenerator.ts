import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { readBooleanParam, readNumberParam, serializeBooleanParam } from '../lib/shareableUrlState';
import { randomUUID } from '../lib/randomUtils';
import { useShareableUrlState } from './useShareableUrlState';
import { useCopyToClipboard } from './useCopyToClipboard';

export interface UUIDOptions {
  version: 'v4';
  quantity: number;
  hyphens: boolean;
  uppercase: boolean;
}

const DEFAULT_QUANTITY = 1;
const QUANTITY_BOUNDS = { min: 1, max: 100 };
const clampQuantity = (value: number) =>
  Math.min(QUANTITY_BOUNDS.max, Math.max(QUANTITY_BOUNDS.min, value));
const parseQuantity = (value: string | null) =>
  readNumberParam(value, DEFAULT_QUANTITY, QUANTITY_BOUNDS);

export const useUUIDGenerator = () => {
  const [searchParams] = useSearchParams();
  const [uuids, setUuids] = useState<string[]>([]);
  const { copy } = useCopyToClipboard();
  const [options, setOptions] = useState<UUIDOptions>({
    version: 'v4',
    quantity: parseQuantity(searchParams.get('q')),
    hyphens: readBooleanParam(searchParams.get('hy'), true),
    uppercase: readBooleanParam(searchParams.get('up'), false),
  });

  useShareableUrlState([
    { key: 'q', value: String(options.quantity), defaultValue: String(DEFAULT_QUANTITY) },
    { key: 'hy', value: serializeBooleanParam(options.hyphens), defaultValue: '1' },
    { key: 'up', value: serializeBooleanParam(options.uppercase), defaultValue: '0' },
  ]);

  const generateUUID = useCallback(() => {
    const newUuids: string[] = [];

    for (let i = 0; i < options.quantity; i++) {
      let uuid = randomUUID();

      if (!options.hyphens) {
        uuid = uuid.replace(/-/g, '');
      }

      if (options.uppercase) {
        uuid = uuid.toUpperCase();
      }

      newUuids.push(uuid);
    }

    setUuids(newUuids);
  }, [options]);

  const setQuantity = useCallback((quantity: number) => {
    setOptions((prev) => ({ ...prev, quantity: clampQuantity(quantity) }));
  }, []);

  const clear = useCallback(() => {
    setUuids([]);
  }, []);

  const copyAll = useCallback(() => {
    void copy(uuids.join('\n'), { success: 'Copied all UUIDs to clipboard' });
  }, [copy, uuids]);

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
    generateUUID,
    clear,
    copyAll,
    download,
    minQuantity: QUANTITY_BOUNDS.min,
    maxQuantity: QUANTITY_BOUNDS.max,
  };
};
