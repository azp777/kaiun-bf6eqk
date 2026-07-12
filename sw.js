/* 開運コンパス Service Worker
   リリースごとに CACHE_VERSION を手動でバンプすること(例: kaiun-v1 → kaiun-v2)。
   バンプすると activate 時に旧キャッシュが削除され、更新が確実に反映される。 */
const CACHE_VERSION = 'kaiun-v1';
const CACHE_NAME = CACHE_VERSION;

/* プリキャッシュ対象。JS は index.html の実際の src(クエリ付き)と一致させること。 */
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './uranai-data.js?v=tm1',
  './uranai-plus.js?v=tm1',
  './uranai-luna.js?v=tm1',
  './uranai-main.js?v=tm1',
  './icons/icon-192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // 個別 add で失敗しても install 全体を止めない(1本欠けても致命傷にしない)
    await Promise.all(PRECACHE_URLS.map((u) =>
      cache.add(new Request(u, { cache: 'reload' })).catch(() => {})
    ));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // クロスオリジンは素通し(介入しない)
  if (!sameOrigin) return;

  // ナビゲーション(HTML)は network-first
  const isNavigation = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isNavigation) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone()).catch(() => {});
        return fresh;
      } catch (e) {
        // オフライン時はキャッシュの index.html にフォールバック
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(req)) ||
               (await cache.match('./index.html')) ||
               (await cache.match('./')) ||
               Response.error();
      }
    })());
    return;
  }

  // 同一オリジンのその他(JS/画像/manifest)は cache-first + 裏で更新
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    const network = fetch(req).then((res) => {
      if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
      return res;
    }).catch(() => null);
    return cached || (await network) || Response.error();
  })());
});

/* ===== 通知(ベータ・対応端末のみ) ===== */
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-fortune') {
    event.waitUntil(
      self.registration.showNotification('開運コンパス ✦', {
        body: '今日の運勢とこころのお守りが届いています。タップして確認してみて。',
        icon: './icons/icon-192.png',
        badge: './icons/favicon-32.png',
        tag: 'daily-fortune'
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if ('focus' in c) return c.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow('./');
  })());
});
