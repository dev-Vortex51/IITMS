const VERSION = "v2";
const SHELL_CACHE = `itms-shell-${VERSION}`;
const RUNTIME_CACHE = `itms-runtime-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const RUNTIME_MAX_ENTRIES = 120;

const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  OFFLINE_URL,
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

const pruneRuntimeCache = async () => {
  const cache = await caches.open(RUNTIME_CACHE);
  const keys = await cache.keys();
  if (keys.length <= RUNTIME_MAX_ENTRIES) {
    return;
  }

  const overflow = keys.length - RUNTIME_MAX_ENTRIES;
  await Promise.all(keys.slice(0, overflow).map((key) => cache.delete(key)));
};

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // Do not cache non-GET API/auth flows.
  if (requestUrl.pathname.startsWith("/api/") || requestUrl.pathname.includes("/auth/")) {
    return;
  }

  // Navigation requests: network-first + offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, cloned).then(() => pruneRuntimeCache());
            });
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(OFFLINE_URL);
        }),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  const destination = request.destination;
  const cacheableDestinations = new Set(["script", "style", "image", "font"]);
  if (!cacheableDestinations.has(destination)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const cloned = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, cloned).then(() => pruneRuntimeCache());
            });
          }
          return networkResponse;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    }),
  );
});
