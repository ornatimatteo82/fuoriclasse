// Fuoriclasse Service Worker v48 — Instant Cache per Curriculum JSON & Assets, Auto-Refresh & Streak Notifications
const SW_VERSION = 'fuoriclasse-v48';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SW_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SW_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'SKIP_WAITING' || event.data.action === 'skipWaiting')) {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'SHOW_STREAK_NOTIFICATION') {
    const title = event.data.title || '🔥 Salva la tua Streak Fuoriclasse!';
    const options = event.data.options || {
      body: 'Non hai ancora giocato oggi! Mancano poche ore a mezzanotte: fai una sfida rapida per salvare la tua serie di vittorie!',
      icon: 'icon.svg',
      badge: 'icon.svg',
      tag: 'streak-warning',
      renotify: true
    };
    self.registration.showNotification(title, options);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('fuoriclasse.cloud') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 1. version.json e HTML principale sempre freschi da rete (per rilevamento deploy istantaneo)
  if (url.pathname.endsWith('version.json') || url.pathname === '/' || url.pathname.endsWith('index.html')) {
    return;
  }

  // 2. Cache-First ultra-veloce per file dati curriculum JSON e asset versionati (?v=...)
  if (url.pathname.includes('/data/') || url.pathname.includes('/assets/') || url.search.includes('v=')) {
    event.respondWith(
      caches.open(SW_VERSION).then((cache) =>
        cache.match(req).then((cachedResp) => {
          if (cachedResp) return cachedResp;
          return fetch(req).then((netResp) => {
            if (netResp && netResp.status === 200) {
              cache.put(req, netResp.clone());
            }
            return netResp;
          });
        })
      )
    );
  }
});
