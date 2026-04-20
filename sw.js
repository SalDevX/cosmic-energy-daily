/* ═══════════════════════════════════════════
   COSMIC ENERGY DAILY — Service Worker
   Save to: sw.js (repo root)
   ═══════════════════════════════════════════ */

const CACHE = 'cosmic-v1';
const PRECACHE = [
  '/',
  '/index.html',
  '/privacy.html',
  '/assets/css/main.css',
  '/assets/css/app.css',
  '/assets/js/data.js',
  '/assets/js/stars.js',
  '/assets/js/app-ui.js',
  '/assets/site.webmanifest',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network-first for data.js (updated daily by your pipeline)
  if (e.request.url.includes('data.js')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  // Cache-first for everything else
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res.ok && e.request.method === 'GET') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }))
  );
});
