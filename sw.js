// Офлайн-кэш. Оболочка — из кэша, данные и ключи — сначала из сети (чтобы обновления доходили), без сети — из кэша.
const VERSION = "mvtwwc0w";
const CACHE = "baza-" + VERSION;
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon.svg"];
const FRESH = ["data.enc", "keys.json"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([...SHELL, ...FRESH])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("baza-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  const name = url.pathname.split("/").pop();
  if (FRESH.includes(name)) {
    e.respondWith(fetch(e.request, { cache: "no-cache" }).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; })));
});
