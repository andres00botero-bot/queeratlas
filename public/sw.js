const CACHE_VERSION = "qa-v3";
const SHELL_CACHE = `qa-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `qa-runtime-${CACHE_VERSION}`;
const OFFLINE_FALLBACK_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll([OFFLINE_FALLBACK_URL]))
  );
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("qa-") && key !== SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(SHELL_CACHE);
        return cache.match(OFFLINE_FALLBACK_URL);
      })
    );
    return;
  }

  if (!isSameOrigin) return;

  const isNextStaticChunk = requestUrl.pathname.startsWith("/_next/static/");
  const isScriptOrStyle =
    request.destination === "script" || request.destination === "style";

  // Always fetch fresh JS/CSS chunks so deploys don't break with stale module factories.
  if (isNextStaticChunk || isScriptOrStyle) {
    event.respondWith(fetch(request));
    return;
  }

  const isRuntimeCacheAsset =
    request.destination === "font" ||
    request.destination === "image";

  if (isRuntimeCacheAsset) {
    event.respondWith(
      caches.match(request).then(async (cached) => {
        if (cached) return cached;
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, response.clone());
        }
        return response;
      })
    );
  }
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "You have a plan coming up." };
  }
  const title = String(payload.title || "QueerAtlas reminder");
  const options = {
    body: String(payload.body || "You have a plan coming up."),
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: String(payload.tag || "qa-calendar-reminder"),
    renotify: false,
    data: { url: String(payload.url || "/favorites?tab=calendar") },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification?.data?.url || "/favorites?tab=calendar", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clients) => {
      const existing = clients.find((client) => client.url.startsWith(self.location.origin));
      if (existing) {
        await existing.focus();
        if ("navigate" in existing) await existing.navigate(targetUrl);
        return;
      }
      await self.clients.openWindow(targetUrl);
    })
  );
});
