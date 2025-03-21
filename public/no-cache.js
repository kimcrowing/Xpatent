// 禁用缓存脚本
(function() {
  // 为所有的XHR请求添加时间戳
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    // 添加时间戳参数以防止缓存
    if (url && typeof url === 'string') {
      if (url.indexOf('?') !== -1) {
        url += '&_nocache=' + new Date().getTime();
      } else {
        url += '?_nocache=' + new Date().getTime();
      }
    }
    originalOpen.call(this, method, url, async, user, password);
  };
  
  // 为fetch请求添加时间戳
  const originalFetch = window.fetch;
  window.fetch = function(resource, options) {
    if (typeof resource === 'string') {
      if (resource.indexOf('?') !== -1) {
        resource += '&_nocache=' + new Date().getTime();
      } else {
        resource += '?_nocache=' + new Date().getTime();
      }
    }
    return originalFetch.call(this, resource, options);
  };
  
  // 清除本地存储的缓存
  window.addEventListener('load', function() {
    // 检查应用版本并清除旧版本缓存
    const currentVersion = '1.0.0'; // 每次部署更新这个版本号
    const storedVersion = localStorage.getItem('app_version');
    
    if (storedVersion !== currentVersion) {
      console.log('检测到新版本，清除缓存...');
      localStorage.clear();
      sessionStorage.clear();
      
      // 存储新版本号
      localStorage.setItem('app_version', currentVersion);
      
      // 清除Service Worker缓存
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for (let registration of registrations) {
            registration.unregister();
          }
        });
      }
      
      // 清除缓存API缓存
      if ('caches' in window) {
        caches.keys().then(function(cacheNames) {
          return Promise.all(
            cacheNames.map(function(cacheName) {
              return caches.delete(cacheName);
            })
          );
        });
      }
    }
  });
})(); 