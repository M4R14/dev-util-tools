import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface UUIDOptions {
  version: 'v4';
  quantity: number;
  hyphens: boolean;
  uppercase: boolean;
}

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 100;

const clampQuantity = (value: number) => Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, value));

export const useUUIDGenerator = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [options, setOptions] = useState<UUIDOptions>({
    version: 'v4',
    quantity: 1,
    hyphens: true,
    uppercase: false,
  });

  const hasSecureUUID = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function';

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
