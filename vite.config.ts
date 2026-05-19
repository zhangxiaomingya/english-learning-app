import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// 构建完成后自动生成包含所有资源的 SW 文件
function injectSwPrecache() {
  return {
    name: 'inject-sw-precache',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist')
      const swPath = path.resolve(distDir, 'sw.js')

      // 收集所有需要预缓存的文件
      const files: string[] = ['/']
      function walk(dir: string, base: string) {
        for (const f of fs.readdirSync(dir)) {
          const full = path.join(dir, f)
          const rel = '/' + path.relative(distDir, full).replace(/\\/g, '/')
          if (fs.statSync(full).isDirectory()) {
            walk(full, base)
          } else {
            files.push(rel)
          }
        }
      }
      walk(distDir, distDir)

      const swContent = `// Service Worker for EnglishGo PWA - Auto Generated
const CACHE_NAME = "englishgo-v${Date.now()}";
const PRECACHE_URLS = ${JSON.stringify(files, null, 2)};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        PRECACHE_URLS.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) return networkResponse;
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        return networkResponse;
      }).catch(() => {
        if (request.destination === "document") return caches.match("/index.html");
      });
    })
  );
});
`
      fs.writeFileSync(swPath, swContent)
      console.log(`✅ SW precache generated with ${files.length} files`)
    }
  }
}

export default defineConfig({
  base: '/english-learning-app/',
  plugins: [react(), injectSwPrecache()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
