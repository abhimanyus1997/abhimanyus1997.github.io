const CACHE_NAME = 'as-portfolio-v8';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './interactive.css',
  './script.js',
  './manifest.json',
  './static/images/logo.svg',
  './static/images/icon-192.png',
  './static/images/icon-512.png',
  './static/images/profile_ghibli.png',
  './static/images/pilot_sync.png',
  './static/images/pilot_sync.svg',
  './static/vendor/three-legacy.min.js',
  './static/vendor/GLTFLoader-legacy.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  
  const isRange = e.request.headers.has('range');
  const isGlb = e.request.url.endsWith('.glb');
  
  // Skip caching ESM imports, external CDN models, and large binary models/range requests
  if (e.request.url.includes('esm.run') || e.request.url.includes('huggingface.co') || isRange || isGlb) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) {
        // Fetch background update
        fetch(e.request).then(networkResponse => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(e.request);
    })
  );
});
