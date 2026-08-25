/**
 * Smart PWA Service Worker for LangJP
 * - Network-First for Code & Data (.html, .js, .json) -> Always latest version, no stale bugs
 * - Cache-First for Heavy Media (Audio .mp3, Fonts, CDN) -> 0ms instant playback & offline support
 * - Immediate SkipWaiting & ClientsClaim -> Hot-updates across all active tabs
 */

const CACHE_NAME = 'langjp-pwa-v18';

// Core local files pre-cached for 100% offline capability
const PRECACHE_CORE = [
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

// External assets pre-cached
const PRECACHE_EXTERNAL = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Zen+Maru+Gothic:wght@500;700;900&display=swap'
];

// Install: Pre-cache resiliently and take over immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const corePromises = PRECACHE_CORE.map((url) => {
        return fetch(new Request(url, { cache: 'reload' }))
          .then((res) => { if (res.ok) return cache.put(url, res); })
          .catch((err) => console.warn('Precache core error:', url, err));
      });

      const extPromises = PRECACHE_EXTERNAL.map((url) => {
        return fetch(new Request(url, { mode: 'no-cors' }))
          .then((res) => cache.put(url, res))
          .catch((err) => console.warn('Precache ext error:', url, err));
      });

      await Promise.allSettled([...corePromises, ...extPromises]);
    })
  );
});

// Activate: Delete old caches & claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Deleted old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy Routing
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bypass Google TTS stream if user is playing dynamic speech online
  if (url.hostname.includes('translate.google.com')) return;

  // 1. CACHE-FIRST: Heavy Static Media (Audio .mp3, Fonts, Tailwind, Lucide)
  const isAudioOrStatic = 
    url.pathname.endsWith('.mp3') || 
    url.hostname.includes('fonts.gstatic.com') || 
    url.hostname.includes('cdn.tailwindcss.com') ||
    url.hostname.includes('unpkg.com');

  if (isAudioOrStatic) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((networkRes) => {
          if (networkRes && (networkRes.status === 200 || networkRes.type === 'opaque')) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkRes;
        }).catch(() => cached);
      })
    );
    return;
  }

  // 2. NETWORK-FIRST: Application Code & Data (.html, .js, .json)
  // Always fetches fresh copy from network so user gets updates immediately.
  // Seamlessly falls back to Cache when offline.
  event.respondWith(
    fetch(new Request(event.request, { cache: 'no-cache' }))
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
        // Fallback to cache when offline
        return caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;

          // If navigation to an HTML page while offline
          if (event.request.headers.get('accept')?.includes('text/html')) {
            if (event.request.url.includes('bai1')) {
              return caches.match('./bai1.html');
            }
            return caches.match('./index.html');
          }
        });
      })
  );
});
