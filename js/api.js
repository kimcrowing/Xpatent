/**
 * 通用的API调用方法
 */
// ... existing code ...

(function() {
    // 定义API基础URL
    const API_BASE_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000' 
        : '';
    
    // 获取存储的令牌
    const getToken = () => {
        return localStorage.getItem('authToken');
    };
    
    // 通用API客户端
    const api = {
        /**
         * 发送GET请求
         * @param {string} url - API端点
         * @param {Object} params - 查询参数
         * @returns {Promise<Object>} - 响应数据
         */
        get: async (url, params = {}) => {
            try {
                const queryParams = new URLSearchParams();
                for (const key in params) {
                    if (params[key] !== undefined && params[key] !== null) {
                        queryParams.append(key, params[key]);
                    }
                }
                
                const queryString = queryParams.toString();
                const fullUrl = `${API_BASE_URL}${url}${queryString ? `?${queryString}` : ''}`;
                
                const response = await fetch(fullUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    }
                });
                
                return handleResponse(response);
            } catch (error) {
                console.error('API GET请求失败:', error);
                throw new Error('网络请求失败，请检查您的网络连接');
            }
        },
        
        /**
         * 发送POST请求
         * @param {string} url - API端点
         * @param {Object} data - 请求体数据
         * @returns {Promise<Object>} - 响应数据
         */
        post: async (url, data = {}) => {
            try {
                const response = await fetch(`${API_BASE_URL}${url}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(data)
                });
                
                return handleResponse(response);
            } catch (error) {
                console.error('API POST请求失败:', error);
                throw new Error('网络请求失败，请检查您的网络连接');
            }
        },
        
        /**
         * 发送PUT请求
         * @param {string} url - API端点
         * @param {Object} data - 请求体数据
         * @returns {Promise<Object>} - 响应数据
         */
        put: async (url, data = {}) => {
            try {
                const response = await fetch(`${API_BASE_URL}${url}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(data)
                });
                
                return handleResponse(response);
            } catch (error) {
                console.error('API PUT请求失败:', error);
                throw new Error('网络请求失败，请检查您的网络连接');
            }
        },
        
        /**
         * 发送DELETE请求
         * @param {string} url - API端点
         * @returns {Promise<Object>} - 响应数据
         */
        delete: async (url) => {
            try {
                const response = await fetch(`${API_BASE_URL}${url}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    }
                });
                
                return handleResponse(response);
            } catch (error) {
                console.error('API DELETE请求失败:', error);
                throw new Error('网络请求失败，请检查您的网络连接');
            }
        }
    };
    
    /**
     * 处理响应
     * @param {Response} response - Fetch响应对象
     * @returns {Promise<Object>} - 解析后的响应数据
     */
    async function handleResponse(response) {
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        
        const data = isJson ? await response.json() : await response.text();
        
        if (!response.ok) {
            const error = (data && data.message) || response.statusText;
            throw new Error(error);
        }
        
        return data;
    }
    
    // 导出API客户端
    window.backendApi = {
        get: async (url, params = {}) => {
            return await api.get(url, params);
        },
        post: async (url, data = {}) => {
            return await api.post(url, data);
        },
        put: async (url, data = {}) => {
            return await api.put(url, data);
        },
        delete: async (url) => {
            return await api.delete(url);
        },
        login: async (email, password) => {
            return await api.post('/api/auth/login', { email, password });
        },
        register: async (username, email, password) => {
            return await api.post('/api/auth/register', { username, email, password });
        },
        refreshToken: async () => {
            return await api.post('/api/auth/refresh');
        },
        getUserInfo: async () => {
            return await api.get('/api/users/me');
        },
        getPrompts: async (category) => {
            const params = category ? { category } : {};
            return await api.get('/api/prompts', params);
        },
        getPrompt: async (id) => {
            return await api.get(`/api/prompts/${id}`);
        },
        createPrompt: async (data) => {
            return await api.post('/api/prompts', data);
        },
        updatePrompt: async (id, data) => {
            return await api.put(`/api/prompts/${id}`, data);
        },
        deletePrompt: async (id) => {
            return await api.delete(`/api/prompts/${id}`);
        },
        getDomainTemplate: async (domain, mode) => {
            return await api.get('/api/prompts/domain', { domain, mode });
        },
        getDomainTemplates: async () => {
            return await api.get('/api/prompts/domain-templates');
        },
        createDomainTemplate: async (data) => {
            return await api.post('/api/prompts/domain-template', data);
        },
        deleteDomainTemplate: async (id) => {
            return await api.delete(`/api/prompts/domain-template/${id}`);
        },
        getDomains: async () => {
            return await api.get('/api/prompts/domains');
        },
        getModes: async () => {
            return await api.get('/api/prompts/modes');
        },
        // ... more API methods
    };
})(); 