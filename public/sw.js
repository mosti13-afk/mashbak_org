// Mashbak service worker: cache-first for static assets, network-first for pages with an offline fallback.
const VERSION = "mashbak-v1";
const STATIC = `${VERSION}-static`;
const PRECACHE = ["/offline.html", "/icons/icon-192.png", "/logo_color.png", "/fonts/OoredooArabic-Regular.ttf", "/fonts/OoredooArabic-Heavy.ttf"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Pages: always try the network (content is personal and changes often); fall back to the offline page.
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("/offline.html")));
    return;
  }

  // Build assets, fonts, icons and images: cache first.
  if (url.pathname.startsWith("/_next/static/") || /\.(?:woff2?|ttf|png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(STATIC).then((c) => c.put(req, copy)); }
        return res;
      })),
    );
  }
});
