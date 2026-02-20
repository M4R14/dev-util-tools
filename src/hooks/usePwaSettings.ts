import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

interface ServiceWorkerMessagePayload {
  type?: string;
  timestamp?: number;
}

export interface UsePwaSettingsOptions {
  loadCacheStatsOnMount?: boolean;
}

const SW_UPDATE_TOAST_ID = 'sw-update-available';
const PWA_CACHE_PREFIX = 'devpulse-static-';
const PWA_LAST_UPDATED_STORAGE_KEY = 'devpulse-last-updated-at';

const getOnlineStatus = () => (typeof navigator !== 'undefined' ? navigator.onLine : true);

const getStandaloneStatus = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const isStandaloneByMedia = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return isStandaloneByMedia || nav.standalone === true;
};

const getStoredLastUpdatedAt = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(PWA_LAST_UPDATED_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

const promptServiceWorkerUpdate = (registration: ServiceWorkerRegistration) => {
  if (!registration.waiting) {
    return;
  }

  toast.info('New version available', {
    id: SW_UPDATE_TOAST_ID,
    description: 'Refresh to update the app.',
    duration: Infinity,
    action: {
      label: 'Refresh',
      onClick: () => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      },
    },
  });
};

export const formatPwaBytes = (bytes: number | null) => {
  if (bytes === null) return 'Unavailable';
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

export const formatPwaLastUpdated = (timestamp: number | null) =>
  timestamp ? new Date(timestamp).toLocaleString() : 'Not recorded';

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

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setInstallPromptEvent(installEvent);
    };

    const handleAppInstalled = () => {
      setInstallPromptEvent(null);
      setIsInstalled(true);
      toast.success('App installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent<ServiceWorkerMessagePayload>) => {
      if (event.data?.type === 'SW_ACTIVATED' && typeof event.data.timestamp === 'number') {
        localStorage.setItem(PWA_LAST_UPDATED_STORAGE_KEY, String(event.data.timestamp));
        setLastUpdatedAt(event.data.timestamp);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === PWA_LAST_UPDATED_STORAGE_KEY) {
        setLastUpdatedAt(getStoredLastUpdatedAt());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const refreshCacheStats = useCallback(async () => {
    if (!('caches' in window)) {
      setCacheSizeBytes(null);
      return;
    }

    setIsLoadingCacheStats(true);
    try {
      const cacheKeys = await caches.keys();
      const targetCaches = cacheKeys.filter((key) => key.startsWith(PWA_CACHE_PREFIX));
      let totalBytes = 0;

      for (const cacheKey of targetCaches) {
        const cache = await caches.open(cacheKey);
        const requests = await cache.keys();

        for (const request of requests) {
          const response = await cache.match(request);
          if (!response) continue;

          const contentLength = response.headers.get('content-length');
          const parsedContentLength = contentLength ? Number(contentLength) : NaN;
          if (Number.isFinite(parsedContentLength) && parsedContentLength > 0) {
            totalBytes += parsedContentLength;
            continue;
          }

          const blob = await response.clone().blob();
          totalBytes += blob.size;
        }
      }

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
      const scope = import.meta.env.BASE_URL;
      const registration =
        (await navigator.serviceWorker.getRegistration(scope)) ??
        (await navigator.serviceWorker.getRegistration());

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
      const cacheKeys = await caches.keys();
      const targetCaches = cacheKeys.filter((key) => key.startsWith(PWA_CACHE_PREFIX));
      await Promise.all(targetCaches.map((key) => caches.delete(key)));
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
