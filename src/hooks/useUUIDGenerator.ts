import { useState, useCallback } from 'react';

export interface UUIDOptions {
  version: 'v4';
  quantity: number;
  hyphens: boolean;
  uppercase: boolean;
}

export const useUUIDGenerator = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [options, setOptions] = useState<UUIDOptions>({
    version: 'v4',
    quantity: 1,
    hyphens: true,
    uppercase: false,
  });

  const generateUUID = useCallback(() => {
    const newUuids: string[] = [];

    for (let i = 0; i < options.quantity; i++) {
      let uuid: string;

      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
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
  }, [options]);

  const clear = useCallback(() => {
    setUuids([]);
  }, []);

  return {
    uuids,
    options,
    setOptions,
    generateUUID,
    clear,
  };
};
