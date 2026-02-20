const CACHE_VERSION = 'v1';
const CACHE_NAME = `devpulse-static-${CACHE_VERSION}`;
const CACHE_PREFIX = 'devpulse-static-';
const PRECACHE_MANIFEST_PATH = 'pwa-assets.json';
const NAVIGATION_FALLBACK_PATH = 'index.html';
const OFFLINE_FALLBACK_PATH = 'offline.html';

const ASSET_DESTINATIONS = new Set(['script', 'style', 'font', 'image', 'manifest']);

const getScope = () =>
  self.registration.scope.endsWith('/') ? self.registration.scope : `${self.registration.scope}/`;

const toScopedUrl = (path) => new URL(path, getScope()).toString();

const fetchPrecacheManifest = async () => {
  try {
    const response = await fetch(toScopedUrl(PRECACHE_MANIFEST_PATH), { cache: 'no-store' });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload) ? payload.filter((value) => typeof value === 'string') : [];
  } catch {
    return [];
  }
};

const cacheAddAllSettled = async (cache, urls) => {
  await Promise.allSettled(urls.map((url) => cache.add(url)));
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const manifestEntries = await fetchPrecacheManifest();
      const baseEntries = [NAVIGATION_FALLBACK_PATH, OFFLINE_FALLBACK_PATH, 'manifest.webmanifest'];
      const entries = Array.from(new Set([...baseEntries, ...manifestEntries]));
      const scopedEntries = entries.map(toScopedUrl);

      await cacheAddAllSettled(cache, scopedEntries);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();

      const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      const payload = {
        type: 'SW_ACTIVATED',
        timestamp: Date.now(),
      };
      for (const client of clients) {
        client.postMessage(payload);
      }
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

const canCacheResponse = (response) =>
  response.ok && (response.type === 'basic' || response.type === 'cors');

const respondWithNavigation = async (request) => {
  const cache = await caches.open(CACHE_NAME);

  try {
    const networkResponse = await fetch(request);
    if (canCacheResponse(networkResponse)) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cachedPage = await cache.match(request, { ignoreSearch: true });
    if (cachedPage) return cachedPage;

    const appShell = await cache.match(toScopedUrl(NAVIGATION_FALLBACK_PATH));
    if (appShell) return appShell;

    const offlinePage = await cache.match(toScopedUrl(OFFLINE_FALLBACK_PATH));
    if (offlinePage) return offlinePage;

    return new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
};

const respondWithCacheFirst = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (canCacheResponse(response)) {
    await cache.put(request, response.clone());
  }
  return response;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(respondWithNavigation(request));
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  const isStaticAsset =
    ASSET_DESTINATIONS.has(request.destination) ||
    url.pathname.includes('/assets/') ||
    url.pathname.endsWith('.json');

  if (isStaticAsset) {
    event.respondWith(respondWithCacheFirst(request));
  }
});
