const CACHE_NAME = 'langjp-pwa-v13';

// Core local files that MUST be cached for 100% offline capability
const CORE_ASSETS = [
  './',
  './index.html',
  './bai1.html',
  './data/hiragana.js',
  './data/bai1.js',
  './js/ime.js',
  './js/hiragana-app.js',
  './js/lesson-app.js',
  './manifest.json'
];

// External CDNs to cache for styling & icons
const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Zen+Maru+Gothic:wght@500;700;900&display=swap'
];

// Install Event - Pre-cache core assets resiliently
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Cache core assets
      const corePromises = CORE_ASSETS.map((url) => {
        return fetch(new Request(url, { cache: 'reload' }))
          .then((response) => {
            if (response.ok) return cache.put(url, response);
          })
          .catch((err) => console.warn('Failed to pre-cache core asset:', url, err));
      });

      // 2. Cache external CDN assets (allow opaque responses)
      const externalPromises = EXTERNAL_ASSETS.map((url) => {
        return fetch(new Request(url, { mode: 'no-cors' }))
          .then((response) => cache.put(url, response))
          .catch((err) => console.warn('Failed to pre-cache external asset:', url, err));
      });

      await Promise.allSettled([...corePromises, ...externalPromises]);
    })
  );
});

// Activate Event - Clean up old cache versions immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Cleaning old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate with full offline fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET
  if (event.request.method !== 'GET') return;

  // Don't intercept Google TTS audio streaming if user is testing online voice
  if (event.request.url.includes('translate.google.com')) return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      // Fetch fresh copy in background to update cache (Stale-while-revalidate)
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is for an HTML page, return index or bai1
          if (event.request.headers.get('accept')?.includes('text/html')) {
            if (event.request.url.includes('bai1')) {
              return caches.match('./bai1.html');
            }
            return caches.match('./index.html');
          }
        });

      // Return cached version immediately if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
