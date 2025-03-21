import axios from 'axios';

class AIConversationService {
  constructor() {
    this.baseUrl = 'http://localhost:5000'; // 本地后端API地址
    this.authToken = localStorage.getItem('authToken');
    
    // OpenRouter API设置
    this.openRouterConfig = {
      apiKey: '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',
      baseUrl: 'https://openrouter.ai/api/v1/chat/completions'
    };
    
    // 初始化请求拦截器
    this._initInterceptors();
  }
  
  _initInterceptors() {
    // 请求拦截器：添加认证信息
    axios.interceptors.request.use(config => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });
  }
  
  /**
   * 更新认证令牌
   * @param {string} token 新的认证令牌
   */
  updateAuthToken(token) {
    this.authToken = token;
    localStorage.setItem('authToken', token);
  }
  
  /**
   * 设置OpenRouter API配置
   * @param {Object} config 包含apiKey和baseUrl的配置对象
   */
  setOpenRouterConfig(config) {
    if (config.apiKey) {
      this.openRouterConfig.apiKey = config.apiKey;
    }
    if (config.baseUrl) {
      this.openRouterConfig.baseUrl = config.baseUrl;
    }
    // 保存到localStorage
    localStorage.setItem('openRouterConfig', JSON.stringify(this.openRouterConfig));
  }
  
  /**
   * 获取OpenRouter API配置
   * @returns {Object} OpenRouter配置
   */
  getOpenRouterConfig() {
    const saved = localStorage.getItem('openRouterConfig');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        this.openRouterConfig = config;
      } catch (error) {
        console.error('解析OpenRouter配置失败:', error);
      }
    }
    return this.openRouterConfig;
  }
  
  /**
   * 获取可用的AI模型列表
   * @returns {Promise<Array>} 可用模型列表
   */
  async getAvailableModels() {
    try {
      // 尝试从OpenRouter获取模型列表
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.openRouterConfig.apiKey}`,
          'HTTP-Referer': window.location.origin
        }
      });
      
      if (!response.ok) {
        throw new Error(`获取模型列表失败: ${response.status}`);
      }
      
      const data = await response.json();
      // 转换为我们需要的格式
      return data.data.map(model => ({
        id: model.id,
        name: model.name || model.id,
        description: model.description || '',
        pricing: model.pricing || {}
      }));
    } catch (error) {
      console.error('获取模型列表失败:', error);
      // 返回默认模型列表
      return [
        { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek (免费)' },
        { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
        { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku' },
        { id: 'meta-llama/llama-3-8b-instruct', name: 'Llama 3 (8B)' },
        { id: 'google/gemma-7b-it', name: 'Gemma (7B)' }
      ];
    }
  }
  
  /**
   * 发送对话消息给AI
   * @param {Array} messages 消息历史记录
   * @param {string} model 使用的模型ID
   * @param {Object} options 附加选项
   * @returns {Promise<Object>} AI响应
   */
  async sendMessage(messages, model, options = {}) {
    try {
      // 首先尝试直接调用OpenRouter API
      return await this.callOpenRouterDirectly(messages, model, options);
    } catch (error) {
      console.warn('直接调用OpenRouter失败，尝试通过后端代理:', error);
      // 如果直接调用失败，再尝试通过后端代理
      const response = await axios.post(`${this.baseUrl}/api/chat`, {
        messages,
        model,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000
      });
      
      return response.data;
    }
  }
  
  /**
   * 直接调用OpenRouter API，不经过后端代理
   * @param {Array} messages 消息历史记录
   * @param {string} model 使用的模型ID
   * @param {Object} options 附加选项
   * @returns {Promise<Object>} AI响应
   */
  async callOpenRouterDirectly(messages, model, options = {}) {
    // 获取最新配置
    const config = this.getOpenRouterConfig();
    
    try {
      const response = await fetch(config.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'OpenRouter-Bypass-Cache': 'true'
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 2000,
          stream: false
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `请求失败：${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('OpenRouter API调用失败:', error);
      throw error;
    }
  }
  
  /**
   * 处理文件上传和分析
   * @param {File} file 要上传的文件
   * @returns {Promise<Object>} 文件处理结果
   */
  async processFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(
        `${this.baseUrl}/api/process-file`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('处理文件失败:', error);
      throw error;
    }
  }
  
  /**
   * 测试API连接
   * @param {Object} config 连接配置（api_key, api_base_url等）
   * @returns {Promise<Object>} 测试结果
   */
  async testConnection(config) {
    try {
      // 直接测试OpenRouter连接
      if (config.type === 'openrouter') {
        const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'HTTP-Referer': window.location.origin
          }
        });
        
        if (!response.ok) {
          throw new Error(`测试连接失败: ${response.status}`);
        }
        
        const data = await response.json();
        // 保存成功的配置
        this.setOpenRouterConfig({
          apiKey: config.apiKey,
          baseUrl: config.baseUrl || 'https://openrouter.ai/api/v1/chat/completions'
        });
        
        return {
          success: true,
          data: data
        };
      } else {
        // 通过后端测试其他API连接
        const response = await axios.post(`${this.baseUrl}/api/ai/test-connection`, {
          config
        });
        
        return response.data;
      }
    } catch (error) {
      console.error('测试连接失败:', error);
      throw error;
    }
  }
  
  /**
   * 优化专利文档内容
   * @param {string} section 要优化的章节（background, summary等）
   * @param {string} content 要优化的内容
   * @returns {Promise<Object>} 优化结果
   */
  async optimizeContent(section, content) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/proxy/ai-optimize`, {
        section,
        content
      });
      
      return response.data;
    } catch (error) {
      console.error('优化内容失败:', error);
      throw error;
    }
  }
  
  /**
   * 保存对话历史到本地存储
   * @param {string} conversationId 对话ID
   * @param {Array} messages 对话消息记录
   */
  saveConversation(conversationId, messages) {
    try {
      const conversations = this.getConversations();
      conversations[conversationId] = {
        id: conversationId,
        updatedAt: new Date().toISOString(),
        messages
      };
      
      localStorage.setItem('conversations', JSON.stringify(conversations));
    } catch (error) {
      console.error('保存对话历史失败:', error);
    }
  }
  
  /**
   * 获取所有对话历史
   * @returns {Object} 所有对话历史
   */
  getConversations() {
    try {
      const conversations = localStorage.getItem('conversations');
      return conversations ? JSON.parse(conversations) : {};
    } catch (error) {
      console.error('获取对话历史失败:', error);
      return {};
    }
  }
  
  /**
   * 获取单个对话
   * @param {string} conversationId 对话ID
   * @returns {Object|null} 对话信息或null
   */
  getConversation(conversationId) {
    const conversations = this.getConversations();
    return conversations[conversationId] || null;
  }
  
  /**
   * 删除对话历史
   * @param {string} conversationId 要删除的对话ID
   */
  deleteConversation(conversationId) {
    try {
      const conversations = this.getConversations();
      if (conversations[conversationId]) {
        delete conversations[conversationId];
        localStorage.setItem('conversations', JSON.stringify(conversations));
      }
    } catch (error) {
      console.error('删除对话历史失败:', error);
    }
  }
}

// 创建一个服务单例
const aiConversationService = new AIConversationService();

export default aiConversationService; 