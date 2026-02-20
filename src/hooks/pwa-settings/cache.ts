export const getPwaCacheKeysByPrefix = async (prefix: string) => {
  const cacheKeys = await caches.keys();
  return cacheKeys.filter((key) => key.startsWith(prefix));
};

export const calculatePwaCacheSizeBytes = async (cacheKeys: string[]) => {
  let totalBytes = 0;

  for (const cacheKey of cacheKeys) {
    const cache = await caches.open(cacheKey);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (!response) continue;

      const contentLength = response.headers.get('content-length');
      const parsedContentLength = contentLength ? Number(contentLength) : Number.NaN;
      if (Number.isFinite(parsedContentLength) && parsedContentLength > 0) {
        totalBytes += parsedContentLength;
        continue;
      }

      const blob = await response.clone().blob();
      totalBytes += blob.size;
    }
  }

  return totalBytes;
};

export const clearPwaCaches = async (cacheKeys: string[]) =>
  Promise.all(cacheKeys.map((key) => caches.delete(key)));
