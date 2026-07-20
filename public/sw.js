/* 最小可安装 Service Worker：缓存静态资源 + 导航回退，离线也能打开。
   只缓存 GET，不拦截 Supabase 等接口域名；版本号变更即整体失效。 */
const CACHE = "dopahub-v1";
const ASSETS = ["./", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // 接口与跨域不缓存，只管本站静态
  if (url.origin !== self.location.origin) return;

  // 导航请求：网络优先，失败回退缓存，再失败回退首页
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("./"))),
    );
    return;
  }

  // 静态资源：缓存优先
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached),
    ),
  );
});
