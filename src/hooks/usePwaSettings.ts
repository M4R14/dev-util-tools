import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  calculatePwaCacheSizeBytes,
  clearPwaCaches,
  getOnlineStatus,
  getPwaCacheKeysByPrefix,
  getServiceWorkerRegistration,
  getStandaloneStatus,
  getStoredLastUpdatedAt,
  PWA_CACHE_PREFIX,
  promptServiceWorkerUpdate,
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
    if (!('serviceWorker' in navigator)) {
      toast.error('Service worker is not available');
      return;
    }

    setIsCheckingUpdates(true);
    try {
      const registration = await getServiceWorkerRegistration(import.meta.env.BASE_URL);

      if (!registration) {
        toast.info('Service worker is not ready yet');
        return;
      }

      await registration.update();
      if (registration.waiting) {
        promptServiceWorkerUpdate(registration);
      } else {
        toast.success('You are on the latest version');
      }
    } catch {
      toast.error('Failed to check for updates');
    } finally {
      setIsCheckingUpdates(false);
    }
  }, []);

  const clearOfflineCache = useCallback(async () => {
    if (!('caches' in window)) {
      toast.error('Cache API is not available');
      return;
    }

    setIsClearingCache(true);
    try {
      const targetCaches = await getPwaCacheKeysByPrefix(PWA_CACHE_PREFIX);
      await clearPwaCaches(targetCaches);
      toast.success('Offline cache cleared');
      await refreshCacheStats();
    } catch {
      toast.error('Failed to clear offline cache');
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
