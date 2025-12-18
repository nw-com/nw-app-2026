// sw.js
// 這是一個最基本的 Service Worker，雖然裡面沒寫什麼快取邏輯，
// 但它是 PWA 被判定為「可安裝」的必要條件之一。

self.addEventListener('install', (event) => {
  console.log('Service Worker 安裝中...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // 這裡可以加入離線瀏覽邏輯，目前保持空白即可
});