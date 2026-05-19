// Service Worker for EnglishGo PWA
const CACHE_NAME = "englishgo-v2.0.0";

// Install: 跳过等待立即激活
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate: 清理旧缓存，立即接管所有页面
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: 所有同源请求都缓存，离线时从缓存返回
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理同源请求
  if (url.origin !== location.origin) return;
  // 只处理 GET 请求
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // 有缓存直接返回，同时后台更新
      if (cachedResponse) {
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      // 没缓存则请求网络并存入缓存
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // 离线且无缓存时，document 请求返回首页
        if (request.destination === "document") {
          return caches.match("/index.html");
        }
      });
    })
  );
});
