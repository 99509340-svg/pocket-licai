/* 口袋理财 · Service Worker：页面网络优先，静态资源缓存 */
const CACHE = "licai-v5";
const ASSETS = [
  "./",
  "./index.html",
  "./fund-api.iife.min.js",
  "./jszip.min.js",
  "./xlsx.mini.min.js",
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
  if(url.origin !== location.origin) return;
  // 页面 / 清单：网络优先（保证每次都是最新版）
  if(e.request.mode==="navigate" || url.pathname.endsWith("index.html") || url.pathname.endsWith("manifest.webmanifest")){
    e.respondWith(
      fetch(e.request).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=>c.put(e.request, copy));
        return res;
      }).catch(()=>caches.match(e.request))
    );
    return;
  }
  // 静态资源：缓存优先，离线可用
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res=>{
      const copy = res.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copy));
      return res;
    }))
  );
});
