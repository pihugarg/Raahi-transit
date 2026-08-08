const CACHE = 'raahi-v1';
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(['/','/index.html','/raahi.png','/manifest.webmanifest']);
  })());
  self.skipWaiting();
});
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Only handle same-origin GET
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const cached = await c.match(e.request);
    const fetchAndCache = fetch(e.request).then(res => { c.put(e.request, res.clone()); return res; }).catch(() => cached);
    return cached ? cached : fetchAndCache;
  })());
});
