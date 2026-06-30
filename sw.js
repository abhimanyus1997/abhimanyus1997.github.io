const CACHE_NAME = 'as-portfolio-v2';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './interactive.css',
  './script.js',
  './manifest.json',
  './static/images/logo.svg',
  './static/images/profile_ghibli.png',
  './static/images/pilot_sync.png',
  './static/images/pilot_sync.svg',
  './static/vendor/three-legacy.min.js',
  './static/vendor/GLTFLoader-legacy.js',
  './static/models/hovercar.glb'
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
  
  // Skip caching ESM imports or external CDN models (like WebLLM model files which are large)
  if (e.request.url.includes('esm.run') || e.request.url.includes('huggingface.co')) {
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
