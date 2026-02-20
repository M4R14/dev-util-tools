import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import { PWA_LAST_UPDATED_STORAGE_KEY } from './constants';
import { getStoredLastUpdatedAt, setStoredLastUpdatedAt } from './environment';
import type { BeforeInstallPromptEvent, ServiceWorkerMessagePayload } from './types';

export const attachOnlineStatusListeners = (setIsOnline: Dispatch<SetStateAction<boolean>>) => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

interface InstallPromptListenerOptions {
  setInstallPromptEvent: Dispatch<SetStateAction<BeforeInstallPromptEvent | null>>;
  setIsInstalled: Dispatch<SetStateAction<boolean>>;
}

export const attachInstallPromptListeners = ({
  setInstallPromptEvent,
  setIsInstalled,
}: InstallPromptListenerOptions) => {
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
};

export const attachServiceWorkerMessageListener = (
  setLastUpdatedAt: Dispatch<SetStateAction<number | null>>,
) => {
  const handleServiceWorkerMessage = (event: MessageEvent<ServiceWorkerMessagePayload>) => {
    if (event.data?.type === 'SW_ACTIVATED' && typeof event.data.timestamp === 'number') {
      setStoredLastUpdatedAt(event.data.timestamp);
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
};

export const attachLastUpdatedStorageListener = (
  setLastUpdatedAt: Dispatch<SetStateAction<number | null>>,
) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === PWA_LAST_UPDATED_STORAGE_KEY) {
      setLastUpdatedAt(getStoredLastUpdatedAt());
    }
  };

  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
};
