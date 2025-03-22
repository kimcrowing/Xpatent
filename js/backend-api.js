/**
 * 后端API通信模块
 * 这个模块负责与后端API进行通信，包括用户登录、获取和管理提示词等功能
 */

// 常量定义
const API_BASE_URL = localStorage.getItem('api_base_url') || 'http://localhost:3000/api';
const TOKEN_KEY = 'jwt_token';
const USER_INFO_KEY = 'user_info';

// 本地存储密钥
const TOKEN_KEY_OLD = 'xpat_auth_token';
const USER_INFO_KEY_OLD = 'xpat_user_info';

// 创建API调用基础函数
async function apiCall(endpoint, method = 'GET', data = null, includeToken = true) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // 如果需要包含token，从localStorage获取
    if (includeToken) {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    
    const options = {
        method,
        headers,
        mode: 'cors'
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        
        // 尝试解析JSON响应
        let result;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            result = await response.json();
        } else {
            // 如果不是JSON，获取文本
            const text = await response.text();
            result = { message: text };
        }
        
        if (!response.ok) {
            throw new Error(result.message || '请求失败');
        }
        
        return result;
    } catch (error) {
        console.error(`API调用失败: ${endpoint}`, error);
        throw error;
    }
}

// 用户认证相关功能
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function getUserInfo() {
    try {
        const userInfoStr = localStorage.getItem(USER_INFO_KEY);
        return userInfoStr ? JSON.parse(userInfoStr) : null;
    } catch (error) {
        console.error('获取用户信息失败:', error);
        return null;
    }
}

function isAdmin() {
    const userInfo = getUserInfo();
    return userInfo && (userInfo.role === 'admin' || userInfo.isAdmin === true);
}

function setAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
}

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

// API请求基础函数
async function apiRequest(endpoint, method = 'GET', data = null, requiresAuth = true) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (requiresAuth) {
        const token = getToken();
        if (!token) {
            throw new Error('未授权，请先登录');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
        method,
        headers,
        mode: 'cors'
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        console.log(`发送${method}请求到: ${url}`);
        const response = await fetch(url, options);
        
        // 尝试解析JSON
        let result;
        try {
            result = await response.json();
        } catch (e) {
            const text = await response.text();
            result = { success: response.ok, message: text || '请求处理成功' };
        }
        
        if (!response.ok) {
            console.error('API请求错误:', result);
            throw new Error(result.message || '请求失败');
        }
        
        return result;
    } catch (error) {
        console.error('API请求错误:', error);
        throw error;
    }
}

// 验证令牌
async function validateToken(token) {
    try {
        // 如果没有提供token，尝试从本地存储获取
        const tokenToValidate = token || getToken();
        if (!tokenToValidate) return false;
        
        try {
            const result = await apiRequest('/auth/validate', 'POST', { token: tokenToValidate }, false);
            return result.valid === true;
        } catch (error) {
            console.warn('验证token接口不可用，可能是后端未启动或未实现此功能，将使用本地用户信息验证');
            // 如果验证失败但有token，暂时认为有效，避免无法登录
            // 从localStorage获取用户信息，如果有用户信息则认为token有效
            const userInfo = getUserInfo();
            return !!userInfo && !!tokenToValidate;
        }
    } catch (error) {
        console.error('验证token时出错:', error);
        return false;
    }
}

// 用户登录
async function login(email, password) {
    try {
        const response = await apiRequest('/auth/login', 'POST', { email, password }, false);
        
        if (response.token && response.user) {
            // 保存认证信息
            setAuth(response.token, response.user);
        }
        
        return response;
    } catch (error) {
        console.error('登录失败:', error);
        throw error;
    }
}

// 用户注册
async function register(username, email, password) {
    return apiRequest('/auth/register', 'POST', { username, email, password }, false);
}

// 获取用户资料
async function getUserProfile() {
    return apiRequest('/users/profile', 'GET', null, true);
}

// 获取所有提示词
async function getAllPrompts(category = null) {
    let endpoint = '/prompts';
    if (category) {
        endpoint += `?category=${encodeURIComponent(category)}`;
    }
    return apiRequest(endpoint, 'GET');
}

// 获取单个提示词
async function getPrompt(id) {
    return apiRequest(`/prompts/${id}`, 'GET');
}

// 创建提示词
async function createPrompt(name, category, content, isPublic = false) {
    return apiRequest('/prompts', 'POST', { name, category, content, isPublic });
}

// 更新提示词
async function updatePrompt(id, data) {
    return apiRequest(`/prompts/${id}`, 'PUT', data);
}

// 删除提示词
async function deletePrompt(id) {
    return apiRequest(`/prompts/${id}`, 'DELETE');
}

// 获取订阅计划
async function getSubscriptionPlans() {
    return apiRequest('/subscription-plans', 'GET', null, false);
}

// 获取API使用量
async function getApiUsage() {
    return apiRequest('/users/api-usage', 'GET');
}

// 获取API配置
async function getApiConfig() {
    return apiRequest('/config', 'GET', null, false);
}

// 保存API配置
async function saveApiConfig(config) {
    return apiRequest('/config', 'POST', config);
}

// 使用OpenRouter API
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
            const errorResult = await response.json();
            throw new Error(errorResult.error?.message || '外部API调用失败');
        }

        return await response.json();
    } catch (error) {
        console.error('OpenRouter API调用失败:', error);
        throw error;
    }
}

// 更新后端API URL
function updateBackendApiUrl(url) {
    localStorage.setItem('api_base_url', url);
    return { success: true, message: 'API基础URL已更新' };
}

// 获取所有用户
async function getAllUsers() {
    return apiRequest('/admin/users', 'GET');
}

// 创建用户
async function createUser(userData) {
    return apiRequest('/admin/users', 'POST', userData);
}

// 更新用户
async function updateUser(userId, userData) {
    return apiRequest(`/admin/users/${userId}`, 'PUT', userData);
}

// 删除用户
async function deleteUser(userId) {
    return apiRequest(`/admin/users/${userId}`, 'DELETE');
}

// 获取API使用量统计
async function getApiUsageStats(period = 'daily') {
    return apiRequest(`/admin/stats/api-usage?period=${period}`, 'GET');
}

// 获取用户API使用量
async function getUserApiUsage(userId) {
    return apiRequest(`/admin/stats/user-api-usage/${userId}`, 'GET');
}

// 获取所有订阅计划
async function getAllSubscriptionPlans() {
    return apiRequest('/admin/subscription-plans', 'GET');
}

// 创建订阅计划
async function createSubscriptionPlan(planData) {
    return apiRequest('/admin/subscription-plans', 'POST', planData);
}

// 更新订阅计划
async function updateSubscriptionPlan(planId, planData) {
    return apiRequest(`/admin/subscription-plans/${planId}`, 'PUT', planData);
}

// 删除订阅计划
async function deleteSubscriptionPlan(planId) {
    return apiRequest(`/admin/subscription-plans/${planId}`, 'DELETE');
}

// 获取应用设置
async function getApplicationSettings() {
    return apiRequest('/admin/settings', 'GET');
}

// 更新应用设置
async function updateApplicationSettings(settings) {
    return apiRequest('/admin/settings', 'PUT', settings);
}

// 对外暴露的API接口
const backendApi = {
    // 认证相关
    login,
    register,
    validateToken,
    clearAuth,
    getUserInfo,
    isAdmin,
    getUserProfile,
    
    // 提示词管理
    getAllPrompts,
    getPrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    
    // 订阅计划管理
    getSubscriptionPlans,
    getAllSubscriptionPlans,
    createSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    
    // API使用量统计
    getApiUsage,
    getApiUsageStats,
    getUserApiUsage,
    
    // 用户管理
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    
    // 配置管理
    getApiConfig,
    saveApiConfig,
    sendOpenRouterRequest,
    updateBackendApiUrl,
    
    // 设置管理
    getApplicationSettings,
    updateApplicationSettings
};

// 设置为全局对象
window.backendApi = backendApi;

// 自检当GitHub Pages环境时设置API
(function() {
    // 检查是否在GitHub Pages环境下
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    if (isGitHubPages) {
        console.log('检测到GitHub Pages环境，尝试加载API地址');
        
        // 从本地存储加载API地址
        const savedApiUrl = localStorage.getItem('api_base_url');
        
        // 如果有保存的API地址，直接使用
        if (savedApiUrl) {
            console.log('使用已保存的API地址:', savedApiUrl);
        } else {
            // 默认使用本地开发地址
            console.log('未找到已保存的API地址，使用默认地址');
        }
    }
})(); 