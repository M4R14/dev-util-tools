import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';
import App from './App';
import './index.css';

const SW_UPDATE_TOAST_ID = 'sw-update-available';
const PWA_LAST_UPDATED_STORAGE_KEY = 'devpulse-last-updated-at';

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

const registerServiceWorker = () => {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    const scope = import.meta.env.BASE_URL;
    const swUrl = `${scope}sw.js`;

    navigator.serviceWorker
      .register(swUrl, { scope })
      .then((registration) => {
        let isRefreshing = false;

        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'SW_ACTIVATED' && typeof event.data?.timestamp === 'number') {
            localStorage.setItem(PWA_LAST_UPDATED_STORAGE_KEY, String(event.data.timestamp));
          }
        });

        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (isRefreshing) {
            return;
          }
          localStorage.setItem(PWA_LAST_UPDATED_STORAGE_KEY, String(Date.now()));
          isRefreshing = true;
          window.location.reload();
        });

        if (registration.waiting) {
          promptServiceWorkerUpdate(registration);
        }

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) {
            return;
          }

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              promptServiceWorkerUpdate(registration);
            }
          });
        });
      })
      .catch((error) => {
        console.error('Service worker registration failed:', error);
      });
  });
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
const basename = import.meta.env.BASE_URL;

root.render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

registerServiceWorker();
