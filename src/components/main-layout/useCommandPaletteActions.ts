import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Settings2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { CommandPaletteAction } from '../CommandPalette';

const SW_UPDATE_TOAST_ID = 'sw-update-available';
const PWA_CACHE_PREFIX = 'devpulse-static-';

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

export const useCommandPaletteActions = () => {
  const navigate = useNavigate();

  const handleCheckForUpdates = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      toast.error('Service worker is not available');
      return;
    }

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
    }
  }, []);

  const handleClearOfflineCache = useCallback(async () => {
    if (!('caches' in window)) {
      toast.error('Cache API is not available');
      return;
    }

    try {
      const cacheKeys = await caches.keys();
      const targetCaches = cacheKeys.filter((key) => key.startsWith(PWA_CACHE_PREFIX));
      await Promise.all(targetCaches.map((key) => caches.delete(key)));
      toast.success('Offline cache cleared');
    } catch {
      toast.error('Failed to clear offline cache');
    }
  }, []);

  return useMemo<CommandPaletteAction[]>(
    () => [
      {
        id: 'open-settings',
        name: 'Open settings',
        description: 'Go to app settings page.',
        icon: Settings2,
        keywords: ['settings', 'preferences', 'config', 'pwa'],
        onSelect: () => navigate('/settings'),
      },
      {
        id: 'check-updates',
        name: 'Check updates',
        description: 'Check for a newer app version.',
        icon: RefreshCw,
        keywords: ['update', 'service worker', 'refresh'],
        onSelect: handleCheckForUpdates,
      },
      {
        id: 'clear-offline-cache',
        name: 'Clear offline cache',
        description: 'Delete cached offline app assets.',
        icon: Trash2,
        keywords: ['cache', 'offline', 'pwa', 'storage'],
        onSelect: handleClearOfflineCache,
      },
    ],
    [navigate, handleCheckForUpdates, handleClearOfflineCache],
  );
};
