import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  calculatePwaCacheSizeBytes,
  checkForServiceWorkerUpdate,
  clearOfflineCache as runClearOfflineCache,
  getOnlineStatus,
  getPwaCacheKeysByPrefix,
  getStandaloneStatus,
  getStoredLastUpdatedAt,
  PWA_CACHE_PREFIX,
  attachInstallPromptListeners,
  attachLastUpdatedStorageListener,
  attachOnlineStatusListeners,
  attachServiceWorkerMessageListener,
} from './pwa-settings';
export { formatPwaBytes, formatPwaLastUpdated } from './pwa-settings';
import type { BeforeInstallPromptEvent, UsePwaSettingsOptions } from './pwa-settings';

export type { UsePwaSettingsOptions } from './pwa-settings';

export const usePwaSettings = (options: UsePwaSettingsOptions = {}) => {
  const { loadCacheStatsOnMount = false } = options;
  const [isOnline, setIsOnline] = useState(getOnlineStatus);
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [isInstalled, setIsInstalled] = useState(getStandaloneStatus);
  const [cacheSizeBytes, setCacheSizeBytes] = useState<number | null>(null);
  const [isLoadingCacheStats, setIsLoadingCacheStats] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(getStoredLastUpdatedAt);

  useEffect(() => attachOnlineStatusListeners(setIsOnline), []);

  useEffect(() => {
    return attachInstallPromptListeners({
      setInstallPromptEvent,
      setIsInstalled,
    });
  }, []);

  useEffect(() => attachServiceWorkerMessageListener(setLastUpdatedAt), []);

  useEffect(() => attachLastUpdatedStorageListener(setLastUpdatedAt), []);

  const refreshCacheStats = useCallback(async () => {
    if (!('caches' in window)) {
      setCacheSizeBytes(null);
      return;
    }

    setIsLoadingCacheStats(true);
    try {
      const targetCaches = await getPwaCacheKeysByPrefix(PWA_CACHE_PREFIX);
      const totalBytes = await calculatePwaCacheSizeBytes(targetCaches);
      setCacheSizeBytes(totalBytes);
    } catch {
      setCacheSizeBytes(null);
    } finally {
      setIsLoadingCacheStats(false);
    }
  }, []);

  const checkForUpdates = useCallback(async () => {
    setIsCheckingUpdates(true);
    try {
      await checkForServiceWorkerUpdate();
    } finally {
      setIsCheckingUpdates(false);
    }
  }, []);

  const clearOfflineCache = useCallback(async () => {
    setIsClearingCache(true);
    try {
      const cleared = await runClearOfflineCache();
      if (cleared) {
        await refreshCacheStats();
      }
    } finally {
      setIsClearingCache(false);
    }
  }, [refreshCacheStats]);

  useEffect(() => {
    if (!loadCacheStatsOnMount) {
      return;
    }

    setLastUpdatedAt(getStoredLastUpdatedAt());
    void refreshCacheStats();
  }, [loadCacheStatsOnMount, refreshCacheStats]);

  const installApp = useCallback(async () => {
    if (!installPromptEvent) {
      return;
    }

    await installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    setInstallPromptEvent(null);

    if (outcome === 'accepted') {
      toast.success('Installing app');
    }
  }, [installPromptEvent]);

  return {
    isOnline,
    isInstalled,
    canInstallApp: !isInstalled && installPromptEvent !== null,
    cacheSizeBytes,
    isLoadingCacheStats,
    isCheckingUpdates,
    isClearingCache,
    lastUpdatedAt,
    installApp,
    refreshCacheStats,
    checkForUpdates,
    clearOfflineCache,
  };
};
