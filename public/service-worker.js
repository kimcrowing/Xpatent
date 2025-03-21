// Service Worker 配置
const CACHE_NAME = 'patent-assistant-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/assets/css/main.css',
  '/assets/js/main.js',
  '/assets/js/chunk-vendors.js'
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('正在缓存静态资源...');
        return cache.addAll(CACHE_URLS);
      })
      .catch(error => {
        console.error('缓存静态资源失败:', error);
      })
  );
  // 跳过等待，立即激活
  self.skipWaiting();
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 立即接管页面
  event.waitUntil(clients.claim());
});

// 请求拦截
self.addEventListener('fetch', event => {
  // 只处理GET请求
  if (event.request.method !== 'GET') return;
  
  // 不缓存API请求
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          response => {
            if(!response || response.status !== 200) {
              return response;
            }

            // 克隆响应
            const responseToCache = response.clone();
            
            // 异步缓存响应
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.error('缓存响应失败:', error);
              });

            return response;
          }
        ).catch(() => {
          // 如果请求失败，返回离线页面
          return caches.match('/offline.html');
        });
      })
  );
}); 