import CryptoJS from 'crypto-js';

class AIOptimizerService {
  constructor() {
    this.initialized = false;
    this.optimizationRules = null;
    this.baseURL = 'http://localhost:5000'; // 添加基础URL
  }
  
  // 初始化服务
  async initialize() {
    if (this.initialized) return true;
    
    try {
      // 从服务器获取优化规则
      const response = await fetch(`${this.baseURL}/api/client/optimization-rules`, {
        headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
      });
      
      if (!response.ok) throw new Error('无法获取优化规则');
      this.optimizationRules = await response.json();
      this.initialized = true;
      
      console.log('AI优化服务初始化完成');
      return true;
    } catch (error) {
      console.error('初始化AI优化服务失败:', error);
      return false;
    }
  }
  
  // 获取JWT令牌
  getAuthToken() {
    return localStorage.getItem('token') || '';
  }
  
  // 优化文本内容
  async optimizeContent(section, content) {
    if (!this.initialized) await this.initialize();
    if (!content || content.trim() === '') return '';
    
    // 获取优化许可
    const approval = await this.getOptimizationApproval(section, content.length);
    
    try {
      console.log(`开始使用AI模型优化 ${section} 部分内容`);
      
      // 直接调用AI模型进行优化
      const optimizedContent = await this.callAIDirectly(section, content, approval.token);
      
      // 报告完成
      await this.reportOptimizationComplete(approval.token, {
        success: true,
        contentLength: optimizedContent.length
      });
      
      return optimizedContent;
    } catch (error) {
      console.error('优化内容失败:', error);
      
      // 报告优化失败
      await this.reportOptimizationComplete(approval.token, {
        success: false,
        error: error.message
      });
      
      throw error;
    }
  }
  
  // 直接调用AI模型
  async callAIDirectly(section, content, approvalToken) {
    try {
      // 报告进度 - 发送请求
      await this.reportOptimizationProgress(approvalToken, {
        stage: 'ai_optimization',
        progress: 30,
        status: 'sending_request'
      });
      
      // 通过后端代理调用AI API
      const response = await fetch(`${this.baseURL}/api/proxy/ai-optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          section,
          content,
          approvalToken
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText || '未知错误';
        console.error('API响应错误:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`AI调用失败: ${errorMessage}`);
      }
      
      // 报告进度 - 处理响应
      await this.reportOptimizationProgress(approvalToken, {
        stage: 'ai_optimization',
        progress: 90,
        status: 'processing_response'
      });
      
      const result = await response.json();
      
      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        console.error('无效的API响应:', result);
        throw new Error('API返回了无效的响应格式');
      }
      
      const optimizedContent = result.choices[0].message.content;
      
      return optimizedContent;
    } catch (error) {
      console.error('AI直接调用失败:', error);
      if (error instanceof TypeError) {
        throw new Error(`API调用出错: ${error.message}\n请检查API密钥和配置是否正确`);
      }
      throw error;
    }
  }
  
  // 获取优化许可
  async getOptimizationApproval(section, contentLength) {
    try {
      const response = await fetch(`${this.baseURL}/api/client/request-optimization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          section,
          contentLength,
          clientInfo: {
            userAgent: navigator.userAgent,
            timestamp: Date.now()
          }
        })
      });
      
      if (!response.ok) throw new Error('服务器拒绝优化请求');
      return await response.json();
    } catch (error) {
      console.error('获取优化许可失败:', error);
      throw error;
    }
  }
  
  // 本地优化内容
  async optimizeLocally(section, content, approvalToken) {
    try {
      // 报告开始优化
      await this.reportOptimizationProgress(approvalToken, {
        stage: 'local_optimization',
        progress: 0,
        status: 'starting'
      });
      
      // 分割内容
      const paragraphs = content.split(/\n+/).filter(p => p.trim() !== '');
      let optimizedContent = [];
      
      // 处理每个段落
      for (let i = 0; i < paragraphs.length; i++) {
        // 报告进度
        if (i % 5 === 0) {
          await this.reportOptimizationProgress(approvalToken, {
            stage: 'local_optimization',
            progress: (i / paragraphs.length) * 100,
            processedParagraphs: i,
            totalParagraphs: paragraphs.length
          });
        }
        
        // 应用优化规则
        const optimizedParagraph = this.applyOptimizationRules(section, paragraphs[i]);
        optimizedContent.push(optimizedParagraph);
      }
      
      // 拼接结果
      const result = optimizedContent.join('\n\n');
      
      // 报告完成
      await this.reportOptimizationComplete(approvalToken, {
        success: true,
        contentLength: result.length
      });
      
      return result;
    } catch (error) {
      console.error('本地优化内容失败:', error);
      throw error;
    }
  }
  
  // 应用优化规则
  applyOptimizationRules(section, paragraph) {
    // 获取当前部分的规则
    const rules = this.optimizationRules.sections[section] || this.optimizationRules.defaultRules;
    
    // 应用每条规则
    let optimized = paragraph;
    for (const rule of rules) {
      if (rule.type === 'replace') {
        // 替换规则
        const regex = new RegExp(rule.pattern, rule.flags || 'g');
        optimized = optimized.replace(regex, rule.replacement);
      } else if (rule.type === 'insert') {
        // 插入规则 - 仅在段落开头或结尾
        if (rule.position === 'start' && !optimized.match(new RegExp('^' + rule.avoid))) {
          optimized = rule.text + optimized;
        } else if (rule.position === 'end' && !optimized.match(new RegExp(rule.avoid + '$'))) {
          optimized = optimized + rule.text;
        }
      }
    }
    
    return optimized;
  }
  
  // 请求服务器优化（用于大型内容）
  async requestServerOptimization(section, content, approvalToken) {
    try {
      // 加密内容
      const encryptedContent = this.encryptContent(content);
      
      // 报告进度
      await this.reportOptimizationProgress(approvalToken, {
        stage: 'server_optimization',
        progress: 30,
        status: 'sending_request'
      });
      
      // 发送请求
      const response = await fetch(`${this.baseURL}/api/client/remote-optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          section,
          encryptedContent: encryptedContent.data,
          keyHash: encryptedContent.keyHash,
          approvalToken
        })
      });
      
      if (!response.ok) throw new Error('服务器优化失败');
      
      // 报告进度
      await this.reportOptimizationProgress(approvalToken, {
        stage: 'server_optimization',
        progress: 80,
        status: 'processing_response'
      });
      
      const result = await response.json();
      
      // 解密结果（如果加密）
      let optimizedContent = result.optimizedContent;
      if (result.isEncrypted && result.encryptedResult) {
        optimizedContent = this.decryptContent(
          result.encryptedResult,
          encryptedContent.keyId
        );
      }
      
      // 报告完成
      await this.reportOptimizationComplete(approvalToken, {
        success: true,
        contentLength: optimizedContent.length
      });
      
      return optimizedContent;
    } catch (error) {
      console.error('请求服务器优化失败:', error);
      throw error;
    }
  }
  
  // 加密内容
  encryptContent(content) {
    // 生成随机密钥
    const key = CryptoJS.lib.WordArray.random(16).toString();
    const iv = CryptoJS.lib.WordArray.random(16).toString();
    
    // 使用AES加密
    const encrypted = CryptoJS.AES.encrypt(content, key, {
      iv: CryptoJS.enc.Hex.parse(iv)
    }).toString();
    
    // 保存密钥到会话存储
    const keyId = `opt_key_${Date.now()}`;
    sessionStorage.setItem(keyId, JSON.stringify({ key, iv }));
    
    return {
      data: encrypted,
      keyId,
      keyHash: CryptoJS.SHA256(key).toString().substring(0, 16)
    };
  }
  
  // 解密内容
  decryptContent(encryptedData, keyId) {
    const keyData = JSON.parse(sessionStorage.getItem(keyId));
    
    if (!keyData) throw new Error('找不到解密密钥');
    
    // 解密内容
    const decrypted = CryptoJS.AES.decrypt(encryptedData, keyData.key, {
      iv: CryptoJS.enc.Hex.parse(keyData.iv)
    }).toString(CryptoJS.enc.Utf8);
    
    return decrypted;
  }
  
  // 报告优化进度
  async reportOptimizationProgress(approvalToken, progressData) {
    try {
      await fetch(`${this.baseURL}/api/client/optimization-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          approvalToken,
          timestamp: Date.now(),
          ...progressData
        })
      });
    } catch (error) {
      console.warn('报告优化进度失败:', error);
      // 继续处理，不中断
    }
  }
  
  // 报告优化完成
  async reportOptimizationComplete(approvalToken, resultData) {
    try {
      await fetch(`${this.baseURL}/api/client/optimization-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          approvalToken,
          completionTime: Date.now(),
          ...resultData
        })
      });
    } catch (error) {
      console.warn('报告优化完成失败:', error);
    }
  }
}

export default new AIOptimizerService(); 