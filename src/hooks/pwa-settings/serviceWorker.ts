import { toast } from 'sonner';
import { SW_UPDATE_TOAST_ID } from './constants';

export const promptServiceWorkerUpdate = (registration: ServiceWorkerRegistration) => {
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

export const getServiceWorkerRegistration = async (scope: string) =>
  (await navigator.serviceWorker.getRegistration(scope)) ??
  (await navigator.serviceWorker.getRegistration());
