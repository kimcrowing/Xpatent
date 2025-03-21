// Xpatent应用的Service Worker

// 缓存版本号
const CACHE_VERSION = 'v1';
const CACHE_NAME = `xpatent-cache-${CACHE_VERSION}`;

// 需要缓存的资源
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index-434a4899.css',
  '/assets/utils-cff1a326.js',
  '/assets/framework-ec928170.js',
  '/assets/index-eb2fc5e7.js',
  '/assets/vendor-53aa3a9e.js'
];

// 安装事件 - 预缓存资源
self.addEventListener('install', event => {
  console.log('[Service Worker] 安装中');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] 缓存资源');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] 跳过等待');
        return self.skipWaiting();
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  console.log('[Service Worker] 激活中');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] 声明控制权');
      return self.clients.claim();
    })
  );
});

// 网络请求拦截
self.addEventListener('fetch', event => {
  // 排除API请求，只缓存静态资源
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('openrouter.ai')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果找到了缓存响应，则返回缓存
        if (response) {
          return response;
        }
        
        // 否则，发送网络请求
        return fetch(event.request).then(
          response => {
            // 检查是否为有效响应
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 克隆响应，因为响应是流，只能消费一次
            const responseToCache = response.clone();

            // 将响应添加到缓存
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(error => {
        console.error('[Service Worker] Fetch失败:', error);
        // 如果网络和缓存都失败，可以返回一个离线页面
        // return caches.match('/offline.html');
      })
  );
}); 