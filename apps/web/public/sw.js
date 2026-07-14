// Cleanup worker: Promorang intentionally disables offline interception.
// Existing installations receive this update, remove all old app-shell caches,
// relinquish control, and then reload open tabs from the network.
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
      self.registration.unregister(),
    ]).then(async () => {
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      await Promise.all(clients.map((client) => client.navigate(client.url)));
    }),
  );
});

self.addEventListener("fetch", () => {
  // Deliberately do not call respondWith: every request uses the network.
});
