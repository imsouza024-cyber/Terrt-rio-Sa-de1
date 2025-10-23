// service-worker.js

const CACHE_NAME = 'mapa-saude-valenca-v1'; // Change 'v1' if you update files later
const FILES_TO_CACHE = [
  './', // Caches the root URL (often index.html)
  './index.html', // Make sure this matches your HTML file name
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  // URLs for Leaflet library files (important!)
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', // Default marker icon
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', // Marker shadow
  // URLs for Leaflet.draw library files
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js',
  // Add any other essential local files (like specific CSS or JS files if you split them)
];

// 1. Install Event: Cache files when the service worker is installed
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(FILES_TO_CACHE);
      })
      .catch((error) => {
        console.error('[ServiceWorker] Failed to cache app shell:', error);
      })
  );
});

// service-worker.js

const CACHE_NAME = 'mapa-saude-valenca-refeito-v1'; // << NOVA VERSÃO
const FILES_TO_CACHE = [
  './',
  './index.html', // Ou o nome exato do seu HTML
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  // URLs externas
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(FILES_TO_CACHE);
    }).catch(err => console.error('[SW] Cache addAll failed:', err))
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
      return;
  }
  event.respondWith(
    caches.match(event.request).then((response) => {
        // Cache hit - return response
        if (response) { return response; }
        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        var fetchRequest = event.request.clone();
        return fetch(fetchRequest).then((networkResponse) => {
            // Check if we received a valid response
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
            }
            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
            });
            return networkResponse;
        }).catch(err => console.error("[SW] Fetch failed:", err)); // Tratamento básico de erro de rede
    })
  );
});