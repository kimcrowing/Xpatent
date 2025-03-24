/**
 * 后端API通信模块
 * 这个模块负责与后端API进行通信，包括用户登录、获取和管理提示词等功能
 * 默认管理员账号: kimcrowing@hotmail.com
 * 默认管理员密码: www
 */

// 后端API基础URL - 可以动态修改，以支持GitHub Pages环境
window.API_BASE_URL = 'https://4df8-2408-8262-1871-4903-4d7-3ec-d97-db30.ngrok-free.app/api';

// 本地存储密钥 - 使用window避免重复声明冲突
window.TOKEN_KEY = window.TOKEN_KEY || 'xpat_auth_token';
window.USER_INFO_KEY = window.USER_INFO_KEY || 'xpat_user_info';

/**
 * 从本地存储获取令牌
 */
function getToken() {
  return localStorage.getItem(window.TOKEN_KEY);
}

/**
 * 从本地存储获取用户信息
 */
function getUserInfo() {
  const userInfo = localStorage.getItem(window.USER_INFO_KEY);
  return userInfo ? JSON.parse(userInfo) : null;
}

/**
 * 检查用户是否是管理员
 */
function isAdmin() {
  const userInfo = getUserInfo();
  return userInfo && userInfo.role === 'admin';
}

/**
 * 设置认证信息到本地存储
 */
function setAuth(token, user) {
  localStorage.setItem(window.TOKEN_KEY, token);
  localStorage.setItem(window.USER_INFO_KEY, JSON.stringify(user));
}

/**
 * 清除认证信息
 */
function clearAuth() {
  localStorage.removeItem(window.TOKEN_KEY);
  localStorage.removeItem(window.USER_INFO_KEY);
}

/**
 * 通用API请求函数
 */
async function apiRequest(endpoint, method = 'GET', data = null, requireAuth = true) {
  const url = `${window.API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '1'
  };
  
  if (requireAuth) {
    const token = getToken();
    if (!token) {
      throw new Error('未登录，请先登录');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
    mode: 'cors'
  };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error?.message || '请求失败');
    }
    
    return responseData;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
}

/**
 * 用户登录
 */
async function login(email, password) {
  const response = await apiRequest('/auth/login', 'POST', { email, password }, false);
  
  if (response.token && response.user) {
    setAuth(response.token, response.user);
  }
  
  return response;
}

/**
 * 用户注册
 */
async function register(username, email, password) {
  return apiRequest('/auth/register', 'POST', { username, email, password }, false);
}

/**
 * 获取用户资料
 */
async function getUserProfile() {
  return apiRequest('/users/profile');
}

/**
 * 获取所有提示词模板
 */
async function getAllPrompts(category = null) {
  let endpoint = '/prompts';
  if (category) {
    endpoint += `?category=${encodeURIComponent(category)}`;
  }
  return apiRequest(endpoint);
}

/**
 * 获取单个提示词模板
 */
async function getPrompt(id) {
  return apiRequest(`/prompts/${id}`);
}

/**
 * 创建新的提示词模板
 */
async function createPrompt(name, category, content, isPublic = false) {
  return apiRequest('/prompts', 'POST', { name, category, content, isPublic });
}

/**
 * 更新提示词模板
 */
async function updatePrompt(id, data) {
  return apiRequest(`/prompts/${id}`, 'PUT', data);
}

/**
 * 删除提示词模板
 */
async function deletePrompt(id) {
  return apiRequest(`/prompts/${id}`, 'DELETE');
}

/**
 * 获取订阅计划
 */
async function getSubscriptionPlans() {
  return apiRequest('/subscriptions');
}

/**
 * 获取API使用情况
 */
async function getApiUsage() {
  return apiRequest('/usage/status');
}

/**
 * 获取所有用户列表 (仅管理员)
 */
async function getAllUsers(page = 1, limit = 10) {
  return apiRequest(`/users?page=${page}&limit=${limit}`);
}

/**
 * 更新用户角色 (仅管理员)
 */
async function updateUserRole(userId, role) {
  return apiRequest(`/users/${userId}/role`, 'PUT', { role });
}

/**
 * 重置用户API配额 (仅管理员)
 */
async function resetUserApiQuota(userId, quota) {
  return apiRequest(`/admin/users/${userId}/quota`, 'PUT', { quota });
}

/**
 * 获取所有订阅计划 (仅管理员)
 */
async function getAllSubscriptionPlans() {
  return apiRequest('/subscriptions');
}

/**
 * 创建订阅计划 (仅管理员)
 */
async function createSubscriptionPlan(name, price, duration, apiQuota, features) {
  return apiRequest('/admin/subscriptions', 'POST', {
    name, price, duration, apiQuota, features
  });
}

/**
 * 更新订阅计划 (仅管理员)
 */
async function updateSubscriptionPlan(id, data) {
  return apiRequest(`/admin/subscriptions/${id}`, 'PUT', data);
}

/**
 * 删除订阅计划 (仅管理员)
 */
async function deleteSubscriptionPlan(id) {
  return apiRequest(`/admin/subscriptions/${id}`, 'DELETE');
}

/**
 * 获取所有用户的API使用统计 (仅管理员)
 */
async function getApiUsageStats() {
  return apiRequest('/admin/usage/stats');
}

/**
 * 获取用户订阅统计 (仅管理员)
 */
async function getSubscriptionStats() {
  return apiRequest('/admin/subscriptions/stats');
}

/**
 * 获取API配置 (从后端)
 */
async function getApiConfig() {
  return apiRequest('/chat/config');
}

/**
 * 保存API配置 (到后端)
 */
async function saveApiConfig(config) {
  return apiRequest('/admin/config', 'POST', config);
}

/**
 * 创建新用户
 */
async function createUser(username, email, password, role, apiQuota) {
  return apiRequest('/admin/users', 'POST', { 
    username, 
    email, 
    password, 
    role, 
    api_quota: apiQuota 
  });
}

/**
 * 删除用户
 */
async function deleteUser(userId) {
  return apiRequest(`/admin/users/${userId}`, 'DELETE');
}

/**
 * 获取用户的权限配置
 */
async function getUserPermissions() {
  try {
    return await apiRequest('/users/permissions');
  } catch (error) {
    console.error('获取用户权限失败:', error);
    // 出错时返回默认权限
    return {
      allowedChatModes: ['general'],
      allowedModels: ['deepseek/deepseek-r1:free']
    };
  }
}

/**
 * 获取指定用户的权限配置（管理员用）
 */
async function getUserPermissionsByAdmin(userId) {
  return apiRequest(`/admin/users/${userId}/permissions`);
}

/**
 * 设置用户权限（管理员用）
 */
async function setUserPermissions(userId, permissions) {
  return apiRequest(`/admin/users/${userId}/permissions`, 'PUT', permissions);
}

/**
 * 获取用户的API密钥 (仅管理员)
 */
async function getUserApiKeys(userId) {
  return apiRequest(`/admin/apikeys/user/${userId}`);
}

/**
 * 为用户添加API密钥 (仅管理员)
 */
async function addUserApiKey(userId, data) {
  return apiRequest(`/admin/apikeys/user/${userId}`, 'POST', data);
}

/**
 * 切换用户API密钥状态 (仅管理员)
 */
async function toggleUserApiKey(keyId, isActive) {
  return apiRequest(`/admin/apikeys/${keyId}/toggle`, 'PATCH', { is_active: isActive });
}

/**
 * 删除用户API密钥 (仅管理员)
 */
async function deleteUserApiKey(keyId) {
  return apiRequest(`/admin/apikeys/${keyId}`, 'DELETE');
}

/**
 * 获取管理员审计日志
 * @param {string} queryParams - URL查询参数
 * @returns {Promise<Object>} 审计日志列表和分页信息
 */
async function getAdminAuditLogs(queryParams = '') {
  return apiRequest(`/admin/audit-logs${queryParams ? '?' + queryParams : ''}`);
}

/**
 * 验证管理员密码（用于敏感操作确认）
 * @param {string} password - 管理员密码
 * @returns {Promise<boolean>} 密码是否正确
 */
async function verifyAdminPassword(password) {
  const result = await apiRequest('/admin/verify-password', 'POST', { password });
  return result.verified === true;
}

// 检测是否在GitHub Pages环境，并尝试设置API地址
(function detectEnvironment() {
  // 尝试从本地存储获取之前保存的API地址
  const savedApiUrl = localStorage.getItem('xpat_api_url');
  
  if (savedApiUrl && savedApiUrl.trim() !== '') {
    window.API_BASE_URL = savedApiUrl;
    console.log('从本地存储加载API地址:', window.API_BASE_URL);
  } else {
    // 确保API地址不为空
    if (!window.API_BASE_URL || window.API_BASE_URL.trim() === '') {
      window.API_BASE_URL = 'https://4df8-2408-8262-1871-4903-4d7-3ec-d97-db30.ngrok-free.app/api';
      console.log('API地址为空，设置为默认值:', window.API_BASE_URL);
    }
    
    // 保存当前API地址到本地存储
    localStorage.setItem('xpat_api_url', window.API_BASE_URL);
    console.log('初始化API地址:', window.API_BASE_URL);
  }
})();

// 导出API函数
window.backendApi = {
  // 添加API配置接口
  apiConfig: {
    getApiUrl: () => window.API_BASE_URL,
    setApiUrl: (url) => {
      if (url && url.trim() !== '') {
        window.API_BASE_URL = url.trim();
        localStorage.setItem('xpat_api_url', window.API_BASE_URL);
        console.log('API地址已更新:', window.API_BASE_URL);
        return true;
      }
      return false;
    },
    checkConnection: async () => {
      try {
        const response = await fetch(`${window.API_BASE_URL}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': '1'
          },
          mode: 'no-cors'
        });
        return response.type === 'opaque' || response.ok;
      } catch (error) {
        console.error('API连接检查错误:', error);
        return false;
      }
    }
  },
  login,
  register,
  getUserProfile,
  getAllPrompts,
  getPrompt,
  createPrompt,
  updatePrompt,
  deletePrompt,
  getSubscriptionPlans,
  getApiUsage,
  isAdmin,
  clearAuth,
  getUserInfo,
  getAllUsers,
  updateUserRole,
  resetUserApiQuota,
  getAllSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getApiUsageStats,
  getSubscriptionStats,
  getApiConfig,
  saveApiConfig,
  sendOpenRouterRequest,
  createUser,
  deleteUser,
  getUserPermissions,
  getUserPermissionsByAdmin,
  setUserPermissions,
  getUserApiKeys,
  addUserApiKey,
  toggleUserApiKey,
  deleteUserApiKey,
  getAdminAuditLogs,
  verifyAdminPassword
};

/**
 * 使用OpenRouter API发送请求
 */
async function sendOpenRouterRequest(input, options = {}) {
  try {
    // 尝试从后端获取API配置
    let apiKey, model, apiUrl, referer, title;
    
    try {
      // 获取后端下发的API配置
      const config = await getApiConfig();
      apiKey = config.openrouter?.apiKey;
      model = options.model || config.openrouter?.model || 'deepseek/deepseek-r1:free';
      apiUrl = config.openrouter?.endpoint || 'https://openrouter.ai/api/v1/chat/completions';
      referer = config.openrouter?.referer || 'http://localhost';
      title = config.openrouter?.title || 'AI Chat Test';
    } catch (error) {
      console.warn('无法从后端获取API配置，尝试使用本地配置:', error);
      // 不从本地存储读取API密钥，避免密钥泄露
      // 告知用户需要联系管理员或重新配置
      throw new Error('无法获取API配置，请联系管理员');
    }
    
    if (!apiKey) {
      throw new Error('未配置API密钥，请联系管理员');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': referer,
        'X-Title': title
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: input }],
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || '请求OpenRouter API失败');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API请求错误:', error);
    throw error;
  }
}

// 将新函数添加到导出对象中
window.backendApi.sendOpenRouterRequest = sendOpenRouterRequest; 

