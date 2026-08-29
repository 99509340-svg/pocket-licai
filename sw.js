/* 口袋理财 · Service Worker：离线缓存静态资源 */
const CACHE = "licai-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./fund-api.iife.min.js",
  "./icon-192.png",
  "./icon-512.png",
  "./manifest.webmanifest"
];
self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", e=>{
  const url = new URL(e.request.url);
  // 第三方数据接口（腾讯基金等）不拦截，走网络
  if(url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res=>{
      const copy = res.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copy));
      return res;
    }))
  );
});
