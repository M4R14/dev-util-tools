import { toast } from 'sonner';
import { clearPwaCaches, getPwaCacheKeysByPrefix } from './cache';
import { PWA_CACHE_PREFIX } from './constants';
import { getServiceWorkerRegistration, promptServiceWorkerUpdate } from './serviceWorker';

/**
 * The two PWA maintenance actions, including their user-facing messaging.
 *
 * They are reachable from two places — the Settings page and the Cmd+K palette — which
 * previously carried separate copies of this logic, each with its own cache prefix constant.
 * The toasts live here on purpose: if the wording or the guards lived in the callers, the two
 * entry points would keep drifting apart. Callers add only their own concerns (loading flags,
 * cache-stat refresh).
 */

export const checkForServiceWorkerUpdate = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    toast.error('Service worker is not available');
    return;
  }

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
  }
};

/** Returns true when the caches were cleared, so callers can refresh derived state. */
export const clearOfflineCache = async (): Promise<boolean> => {
  if (!('caches' in window)) {
    toast.error('Cache API is not available');
    return false;
  }

  try {
    const targetCaches = await getPwaCacheKeysByPrefix(PWA_CACHE_PREFIX);
    await clearPwaCaches(targetCaches);
    toast.success('Offline cache cleared');
    return true;
  } catch {
    toast.error('Failed to clear offline cache');
    return false;
  }
};
