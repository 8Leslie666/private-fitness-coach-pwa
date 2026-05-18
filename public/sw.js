const CACHE_NAME = 'private-fitness-coach-v3';
const BASE_URL = new URL(self.registration.scope).pathname;
const fromBase = (path) => `${BASE_URL}${path}`.replace(/\/{2,}/g, '/');
const ASSETS = [
  fromBase(''),
  fromBase('index.html'),
  fromBase('manifest.webmanifest'),
  fromBase('icon-192.png'),
  fromBase('icon-512.png'),
  fromBase('apple-touch-icon.png'),
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(fromBase('index.html'), copy));
          return response;
        })
        .catch(() => caches.match(fromBase('index.html'))),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(fromBase('index.html')));
    }),
  );
});
