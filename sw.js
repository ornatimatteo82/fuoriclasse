// Fuoriclasse Service Worker v46 — Auto-Refresh, PWA & Streak Notifications
const SW_VERSION = 'fuoriclasse-v46';

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

self.addEventListener('fetch', () => {
  // Pass-through diretto alla rete: nessuna intercettazione cache
});
