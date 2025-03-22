/**
 * 后端API通信模块
 * 这个模块负责与后端API进行通信，包括用户登录、获取和管理提示词等功能
 */

// API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 本地存储密钥
const TOKEN_KEY = 'xpat_auth_token';
const USER_INFO_KEY = 'xpat_user_info';

/**
 * 从本地存储获取令牌
 */
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 从本地存储获取用户信息
 */
function getUserInfo() {
  const userInfo = localStorage.getItem(USER_INFO_KEY);
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
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
}

/**
 * 清除认证信息
 */
function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
}

// 从本地存储加载API地址
(function() {
    const savedApiUrl = localStorage.getItem('xpat_api_url');
    if (savedApiUrl) {
        window.API_BASE_URL = savedApiUrl;
    }
})();

/**
 * 通用API请求函数
 */
async function apiRequest(endpoint, method = 'GET', data = null, requireAuth = false) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // 如果需要认证，添加JWT token
    if (requireAuth) {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            throw new Error('需要认证，但未找到token');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
        method,
        headers,
        credentials: 'include'
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        
        // 处理401错误 (未授权)
        if (response.status === 401) {
            localStorage.removeItem('jwt_token');
            throw new Error('认证失败或会话已过期');
        }
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || '请求失败');
        }
        
        return result;
    } catch (error) {
        console.error('API请求错误:', error);
        throw error;
    }
}

// 后端API对象
window.backendApi = {
    // 用户认证API
    
    // 登录
    async login(email, password) {
        const response = await apiRequest('/auth/login', 'POST', { email, password });
        
        if (response.token && response.user) {
            setAuth(response.token, response.user);
        }
        
        return response;
    },
    
    // 注册
    async register(username, email, password) {
        return apiRequest('/auth/register', 'POST', { username, email, password });
    },
    
    // 验证token
    async validateToken(token) {
        try {
            const result = await apiRequest('/auth/validate', 'POST', { token });
            return result.valid === true;
        } catch (error) {
            return false;
        }
    },
    
    // 获取用户资料
    async getUserProfile() {
        return apiRequest('/users/profile', 'GET', null, true);
    },
    
    // 更新用户资料
    async updateUserProfile(profileData) {
        return apiRequest('/users/profile', 'PUT', profileData, true);
    },
    
    // 更改密码
    async changePassword(oldPassword, newPassword) {
        return apiRequest('/users/change-password', 'POST', { oldPassword, newPassword }, true);
    },
    
    // API密钥管理
    async getApiKeys() {
        return apiRequest('/users/api-keys', 'GET', null, true);
    },
    
    async createApiKey(name) {
        return apiRequest('/users/api-keys', 'POST', { name }, true);
    },
    
    async deleteApiKey(keyId) {
        return apiRequest(`/users/api-keys/${keyId}`, 'DELETE', null, true);
    },
    
    // 订阅计划API
    
    // 获取所有订阅计划
    async getAllSubscriptionPlans() {
        return apiRequest('/admin/subscription-plans', 'GET', null, true);
    },
    
    // 创建订阅计划 (管理员)
    async createSubscriptionPlan(planData) {
        return apiRequest('/admin/subscription-plans', 'POST', planData, true);
    },
    
    // 更新订阅计划 (管理员)
    async updateSubscriptionPlan(planId, planData) {
        return apiRequest(`/admin/subscription-plans/${planId}`, 'PUT', planData, true);
    },
    
    // 删除订阅计划 (管理员)
    async deleteSubscriptionPlan(planId) {
        return apiRequest(`/admin/subscription-plans/${planId}`, 'DELETE', null, true);
    },
    
    // 用户管理API (管理员)
    
    // 获取所有用户
    async getAllUsers() {
        return apiRequest('/admin/users', 'GET', null, true);
    },
    
    // 获取单个用户详情
    async getUserById(userId) {
        return apiRequest(`/admin/users/${userId}`, 'GET', null, true);
    },
    
    // 创建用户 (管理员)
    async createUser(userData) {
        return apiRequest('/admin/users', 'POST', userData, true);
    },
    
    // 更新用户 (管理员)
    async updateUser(userId, userData) {
        return apiRequest(`/admin/users/${userId}`, 'PUT', userData, true);
    },
    
    // 删除用户 (管理员)
    async deleteUser(userId) {
        return apiRequest(`/admin/users/${userId}`, 'DELETE', null, true);
    },
    
    // 更改用户状态 (管理员)
    async changeUserStatus(userId, status) {
        return apiRequest(`/admin/users/${userId}/status`, 'PUT', { status }, true);
    },
    
    // 重置用户密码 (管理员)
    async resetUserPassword(userId) {
        return apiRequest(`/admin/users/${userId}/reset-password`, 'POST', null, true);
    },
    
    // API使用统计 (管理员)
    
    // 获取系统API使用统计
    async getApiUsageStats() {
        return apiRequest('/admin/api-usage', 'GET', null, true);
    },
    
    // 获取特定用户API使用统计
    async getUserApiUsage(userId) {
        return apiRequest(`/admin/api-usage/users/${userId}`, 'GET', null, true);
    },
    
    // 获取API使用时间趋势
    async getApiUsageTrends(period = 'week') {
        return apiRequest(`/admin/api-usage/trends?period=${period}`, 'GET', null, true);
    },
    
    // 获取模型使用分布
    async getModelUsageDistribution() {
        return apiRequest('/admin/api-usage/models', 'GET', null, true);
    },
    
    // 用户订阅管理 (管理员)
    
    // 获取用户订阅信息
    async getUserSubscriptions() {
        return apiRequest('/admin/subscriptions', 'GET', null, true);
    },
    
    // 为用户分配订阅 (管理员)
    async assignSubscription(userId, planId, duration) {
        return apiRequest('/admin/subscriptions', 'POST', { userId, planId, duration }, true);
    },
    
    // 编辑用户订阅 (管理员)
    async updateUserSubscription(subscriptionId, subscriptionData) {
        return apiRequest(`/admin/subscriptions/${subscriptionId}`, 'PUT', subscriptionData, true);
    },
    
    // 取消用户订阅 (管理员)
    async cancelUserSubscription(subscriptionId) {
        return apiRequest(`/admin/subscriptions/${subscriptionId}`, 'DELETE', null, true);
    },
    
    // 获取订阅统计数据 (管理员)
    async getSubscriptionStats() {
        return apiRequest('/admin/subscription-stats', 'GET', null, true);
    }
};

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
 * 获取API配置 (从后端)
 */
async function getApiConfig() {
  return apiRequest('/admin/config');
}

/**
 * 保存API配置 (到后端)
 */
async function saveApiConfig(config) {
  return apiRequest('/admin/config', 'POST', config);
}

// 导出API函数
window.backendApi = {
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
  getApiConfig,
  saveApiConfig,
  sendOpenRouterRequest
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
      // 如果后端不可用，尝试使用本地配置作为备份
      apiKey = localStorage.getItem('xpat_openrouter_api_key');
      model = options.model || localStorage.getItem('xpat_openrouter_model') || 'deepseek/deepseek-r1:free';
      apiUrl = localStorage.getItem('xpat_openrouter_endpoint') || 'https://openrouter.ai/api/v1/chat/completions';
      referer = localStorage.getItem('xpat_openrouter_referer') || 'http://localhost';
      title = localStorage.getItem('xpat_openrouter_title') || 'AI Chat Test';
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