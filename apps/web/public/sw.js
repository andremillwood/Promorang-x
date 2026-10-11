// Only public, versioned assets belong in this cache. Auth and live data stay online.
const CACHE_NAME = 'promorang-pwa-shell-v2026-10-10';
const STATIC_ASSETS = ['/offline.html', '/manifest.webmanifest', '/pwa-192.png', '/pwa-512.png', '/pwa-maskable-512.png', '/pwa-apple-touch-icon.png'];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith('promorang-pwa-shell-') && key !== CACHE_NAME).map((key) => caches.delete(key)),
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (event.request.mode === 'navigate') {
    // Never cache personalized HTML, auth callbacks, or stale app entry points.
    event.respondWith(fetch(event.request).catch(async () =>
      (await caches.match('/offline.html').catch(() => undefined)) || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } }),
    ));
    return;
  }
  if (!STATIC_ASSETS.includes(url.pathname) && !url.pathname.startsWith('/assets/')) return;
  event.respondWith((async () => {
    let cache;
    try {
      cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(event.request);
      if (cached) return cached;
    } catch { /* Storage can be unavailable even while the network is healthy. */ }
    try {
      const response = await fetch(event.request);
      if (cache && response.ok && response.type !== 'opaque') {
        try { await cache.put(event.request, response.clone()); } catch { /* A full cache must not break a successful fetch. */ }
      }
      return response;
    } catch { return Response.error(); }
  })());
});
self.addEventListener('push', (event) => {
  let data = { title: 'Promorang', body: '', data: {} };
  try { data = { ...data, ...event.data?.json() }; } catch { data.body = event.data?.text() || ''; }
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body, icon: '/pwa-192.png', badge: '/pwa-192.png', data: data.data || {},
  }));
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  let target = new URL('/today', self.location.origin);
  try {
    const requested = new URL(event.notification.data?.url || '/today', self.location.origin);
    if (requested.origin === self.location.origin) target = requested;
  } catch { /* Fall back to the app for malformed links. */ }
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (windows) => {
    const existing = windows.find((client) => client.url === target.href);
    if (existing) return existing.focus();
    return self.clients.openWindow(target.href);
  }));
});
