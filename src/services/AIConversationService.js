import axios from 'axios';

class AIConversationService {
  constructor() {
    this.baseUrl = 'http://localhost:5000'; // 本地后端API地址
    this.authToken = localStorage.getItem('authToken');
    
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
   * 获取可用的AI模型列表
   * @returns {Promise<Array>} 可用模型列表
   */
  async getAvailableModels() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/models`);
      return response.data.models;
    } catch (error) {
      console.error('获取模型列表失败:', error);
      throw error;
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
      const response = await axios.post(`${this.baseUrl}/api/chat`, {
        messages,
        model,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000
      });
      
      return response.data;
    } catch (error) {
      console.error('发送消息失败:', error);
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
      const response = await axios.post(`${this.baseUrl}/api/ai/test-connection`, {
        config
      });
      
      return response.data;
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