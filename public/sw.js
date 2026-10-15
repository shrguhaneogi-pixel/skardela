// ASD-STE100 Simplified Technical English comments.
// This service worker provides offline caching for the Skardela app shell and static assets.

const CACHE_VERSION = "skardela-v1";
const STATIC_ASSETS = ["/", "/index.html", "/manifest.webmanifest", "/favicon.svg"];

// Cache the core application shell during service worker installation.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      }),
  );
});

// Remove old caches when a new service worker version activates.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)),
        );
      })
      .then(() => {
        return self.clients.claim();
      }),
  );
});

// Serve cached assets offline with network fallback.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // If request is from external origin, let the browser handle it.
  if (url.origin !== self.location.origin) return;

  // SPA navigation requests: network first with fallback to /index.html.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match("/index.html").then((response) => {
          return response || new Response("Offline", { status: 503, statusText: "Offline" });
        });
      }),
    );
    return;
  }

  // Static assets: cache first, fall back to network, and update cache.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== "basic"
        ) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_VERSION).then((cache) => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      });
    }),
  );
});
