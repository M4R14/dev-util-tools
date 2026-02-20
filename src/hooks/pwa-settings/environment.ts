import { PWA_LAST_UPDATED_STORAGE_KEY } from './constants';

export const getOnlineStatus = () => (typeof navigator !== 'undefined' ? navigator.onLine : true);

export const getStandaloneStatus = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const isStandaloneByMedia = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return isStandaloneByMedia || nav.standalone === true;
};

export const getStoredLastUpdatedAt = () => {
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

export const setStoredLastUpdatedAt = (timestamp: number) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(PWA_LAST_UPDATED_STORAGE_KEY, String(timestamp));
};
