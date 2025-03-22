/**
 * Xpat前端部署配置脚本
 * 用于初始化前端与后端的连接配置
 */

// 检测是否在GitHub Pages环境中运行
const isGitHubPages = window.location.hostname.includes('github.io');

// 后端API基础URL
let apiBaseUrl = 'http://localhost:3000/api';

// 如果是在GitHub Pages中运行，尝试从本地存储获取API URL
if (isGitHubPages) {
  const savedApiUrl = localStorage.getItem('xpat_api_url');
  
  if (savedApiUrl) {
    apiBaseUrl = savedApiUrl;
    console.log('从本地存储加载API地址:', apiBaseUrl);
  } else {
    // 第一次访问，提示用户设置API地址
    setTimeout(() => {
      alert('欢迎使用Xpat！\n\n您需要设置后端API地址才能正常使用所有功能。\n\n点击右上角用户菜单中的"API配置"选项进行设置。');
    }, 1000);
  }
}

// 设置全局API基础URL
window.API_BASE_URL = apiBaseUrl;

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
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('API连接正常');
      return true;
    } else {
      console.error('API连接失败:', response.status);
      return false;
    }
  } catch (error) {
    console.error('API连接错误:', error);
    return false;
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
  
  if (!isConnected && isGitHubPages) {
    console.warn('无法连接到API服务器，部分功能可能无法使用');
  }
}); 