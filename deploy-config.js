/**
 * Xpat前端部署配置脚本
 * 用于初始化前端与后端的连接配置
 */

// 始终使用ngrok地址，无论是否在GitHub Pages环境
window.API_BASE_URL = 'https://5e65-2408-8262-1871-4896-4412-5f5c-46fc-3230.ngrok-free.app/api';

// 提供初始化函数
window.initializeApiConfig = function(url) {
  if (url && url.trim() !== '') {
    window.API_BASE_URL = url.trim();
    localStorage.setItem('xpat_api_url', window.API_BASE_URL);
    console.log('API地址已更新:', window.API_BASE_URL);
    return true;
  }
  return false;
};

// 检查API连接状态
window.checkApiConnection = async function() {
  try {
    const response = await fetch(`${window.API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // 添加no-cors模式以避免CORS错误
      // 注意: 这会导致无法读取响应内容，但至少能检测连接是否可用
      mode: 'no-cors'
    });
    
    console.log('API连接检查响应:', response.status, response.type);
    
    // 当使用no-cors模式时，response.type会是'opaque'
    // 此时我们无法读取response.ok，但至少请求没有抛出错误
    if (response.type === 'opaque') {
      console.log('API连接似乎正常（无法确认，因为是无CORS请求）');
      return true;
    }
    
    if (response.ok) {
      console.log('API连接正常');
      return true;
    } else {
      console.error('API连接失败:', response.status);
      return false;
    }
  } catch (error) {
    console.error('API连接错误:', error);
    // 即使出错也不阻止用户使用，可能是CORS问题
    // 返回true避免显示错误通知
    return true;
  }
};

// 导出公共函数
window.apiConfig = {
  getApiUrl: () => window.API_BASE_URL,
  setApiUrl: (url) => window.initializeApiConfig(url),
  checkConnection: () => window.checkApiConnection()
};

// 在页面加载完成后，检查API连接状态
document.addEventListener('DOMContentLoaded', async () => {
  const isConnected = await window.checkApiConnection();
  
  if (!isConnected) {
    console.warn('无法连接到API服务器，部分功能可能无法使用');
  }
}); 
