// Tombstone service worker — unregisters any previously installed Angular SW
// and clears its caches, then exits. Keeps users from being stuck on stale builds.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch (_) { /* ignore */ }
    try { await self.registration.unregister(); } catch (_) { /* ignore */ }
    try {
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((c) => c.navigate(c.url));
    } catch (_) { /* ignore */ }
  })());
});
self.addEventListener('fetch', () => undefined);
