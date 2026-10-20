const CACHE_NAME = 'fuoriclasse-argon-v4';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './mobile.css',
  './dark-theme.css',
  './app.js',
  './icon.svg',
  './mascot.svg',
  './assets/mascot-coach.jpg',
  './assets/stadium-hero.jpg',
  './assets/chest-gold.jpg',
  './assets/trophy-fuoriclasse.jpg',
  './manifest.webmanifest',
  './data/curriculum.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => caches.match('./index.html'));
    })
  );
});
