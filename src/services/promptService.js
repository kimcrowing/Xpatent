import axios from 'axios';

/**
 * 提示词服务类
 * 负责从服务器获取加密的提示词模板，并安全传递给AI处理组件
 */
class PromptService {
  /**
   * 获取加密的提示词模板
   * 
   * @param {string} promptId - 提示词模板ID
   * @param {string} subType - 子类型（可选）
   * @param {object} templateVars - 模板变量
   * @returns {Promise<string|object>} 加密后的提示词
   */
  async getEncryptedPrompt(promptId, subType = null, templateVars = {}) {
    try {
      // 构建请求URL和参数
      let url = `/api/prompts/${promptId}`;
      let params = { ...templateVars };
      
      if (subType) {
        params.subType = subType;
      }
      
      // 发送请求获取加密提示词
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      console.error('获取提示词失败:', error);
      throw new Error('无法获取提示词模板');
    }
  }
  
  /**
   * 使用提示词发送AI请求
   * 该方法自动处理加密提示词，客户端无需知道实际提示词内容
   * 
   * @param {string} promptId - 提示词模板ID
   * @param {string} subType - 子类型（可选）
   * @param {object} templateVars - 模板变量
   * @param {object} userInput - 用户输入
   * @param {object} aiConfig - AI配置
   * @returns {Promise<object>} AI响应结果
   */
  async sendAIRequest(promptId, subType, templateVars, userInput, aiConfig) {
    try {
      // 获取加密的提示词
      const encryptedPrompt = await this.getEncryptedPrompt(
        promptId,
        subType,
        templateVars
      );
      
      // 构建请求负载
      // 注意：这里我们并不解密提示词，而是将加密的提示词传递给AI处理服务
      const payload = {
        encryptedPrompt, // 加密的提示词
        userInput,       // 用户输入
        config: aiConfig // AI配置
      };
      
      // 发送到AI处理服务
      // 实际实现可能会有所不同，取决于处理逻辑
      const response = await axios.post('/api/ai/process', payload);
      return response.data;
    } catch (error) {
      console.error('AI请求失败:', error);
      throw new Error('处理AI请求时发生错误');
    }
  }
}

// 创建单例实例
const promptService = new PromptService();
export default promptService; 