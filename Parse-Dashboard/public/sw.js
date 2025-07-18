const CACHE_NAME = 'dashboard-cache-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.destination === 'script' || req.destination === 'style' || req.url.includes('/bundles/')) {
    event.respondWith(
      caches.match(req).then(cached => {
        return (
          cached ||
          fetch(req).then(resp => {
            const resClone = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
            return resp;
          })
        );
      })
    );
  }
});

self.addEventListener('message', event => {
  if (event.data === 'unregister') {
    self.registration.unregister();
  }
});
