// 全局服务初始化
import axios from 'axios'

// Axios配置
function initAxios() {
  // 设置基础URL，可以根据环境变量调整
  axios.defaults.baseURL = 'http://localhost:5000'
  
  console.log('Axios基础URL设置为:', axios.defaults.baseURL)
  
  // 请求拦截器
  axios.interceptors.request.use(
    (config) => {
      // 从本地存储获取令牌
      const token = localStorage.getItem('token')
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
      console.log('Axios请求配置:', config.url, config.method)
      return config
    },
    (error) => {
      console.error('Axios请求拦截器错误:', error)
      return Promise.reject(error)
    }
  )
  
  // 响应拦截器
  axios.interceptors.response.use(
    (response) => {
      console.log('Axios响应成功:', response.status, response.config.url)
      return response
    },
    (error) => {
      console.error('Axios响应错误:', error.message, error.response?.status, error.config?.url)
      
      // 处理401未授权错误
      if (error.response && error.response.status === 401) {
        // 清除本地存储的令牌
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        // 重定向到登录页面
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
      
      return Promise.reject(error)
    }
  )
}

// Web Worker初始化
function initWorkers() {
  // 确保Web Worker可用
  if (typeof Worker === 'undefined') {
    console.warn('浏览器不支持Web Worker，部分功能可能无法使用')
    return
  }
  
  // 预加载Web Worker
  try {
    // 创建一个临时Worker并立即终止，这样后续使用时会更快
    const tempWorker = new Worker('/src/workers/document-processor.worker.js')
    tempWorker.terminate()
  } catch (error) {
    console.warn('Web Worker预加载失败:', error)
  }
}

// 应用初始化
export function initServices() {
  // 初始化Axios
  initAxios()
  
  // 初始化Web Worker
  initWorkers()
  
  // 初始化离线支持
  initOfflineSupport()
  
  console.log('应用服务初始化完成')
}

// 离线支持初始化
function initOfflineSupport() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker 注册成功，作用域:', registration.scope);
          
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('发现新的 Service Worker');
            
            newWorker.addEventListener('statechange', () => {
              console.log('Service Worker 状态:', newWorker.state);
            });
          });
        })
        .catch(error => {
          console.error('Service Worker 注册失败:', error);
        });
        
      // 检查更新
      navigator.serviceWorker.ready.then(registration => {
        registration.update();
      });
    });
    
    // 监听控制权变化
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker 已接管页面');
    });
  }
  
  // 监听在线状态变化
  window.addEventListener('online', () => {
    console.log('网络已恢复');
    // 执行在线恢复操作
  });
  
  window.addEventListener('offline', () => {
    console.log('网络已断开');
    // 执行离线模式操作
  });
} 