// Fuoriclasse Service Worker v33 — Multi-Sport (Calcio, F1 Boomer, Basket NBA)
const SW_VERSION = 'fuoriclasse-v33';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', () => {
  // Pass-through diretto alla rete: nessuna intercettazione cache
});
