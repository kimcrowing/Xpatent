/**
 * 提示词服务 - 前端模拟后端API服务
 * 用于管理各种AI对话模式的系统提示词
 */

const PromptService = {
  // 存储提示词的本地变量（模拟数据库）
  _prompts: {
    // 基础模式
    'general': '你是Xpat助手，为用户提供各种问题的回答和帮助。请提供准确、有用的信息。',
    'patent-search': '你是Xpat专利查询助手，专注于帮助用户检索、理解和分析专利信息。请解释专利概念、提供检索策略，并分析相关专利文献。',
    'patent-writing': '你是Xpat专利撰写助手，专注于帮助用户撰写高质量的专利申请文件。请根据用户的技术描述，提供专利申请书的结构、权利要求书的写法、说明书的组织等方面的建议。',
    'patent-response': '你是Xpat专利答审助手，专注于帮助用户应对专利审查意见。请分析审查意见书内容，提供修改建议，解释如何针对审查员的不同意见进行有效答复。',
    
    // 专业模式
    'patent-analysis': '你是Xpat专利分析师，精通专利数据挖掘和分析。请帮助用户分析专利布局、技术发展趋势、竞争对手专利战略，提供专业的专利数据分析和可视化解读。',
    'patent-strategy': '你是Xpat专利战略顾问，擅长专利布局和知识产权保护策略。请基于用户的业务领域，提供专利组合构建、防御策略、许可策略等方面的建议。',
    'patent-translation': '你是Xpat专利翻译专家，精通多语言专利文献翻译。请准确翻译用户提供的专利内容，保持专业术语的精确性和法律文件的严谨性。',
    
    // 行业专用模式
    'biotech-patent': '你是Xpat生物技术专利专家，精通生物医药、基因工程、生物材料等领域的专利知识。请针对生物技术领域的特殊性，提供专利保护建议和分析。',
    'software-patent': '你是Xpat软件专利专家，精通计算机软件、人工智能、区块链等领域的专利知识。请帮助用户解决软件专利的可专利性问题，提供算法保护和实现方案的专利撰写建议。',
    'mechanical-patent': '你是Xpat机械专利专家，精通机械设计、制造工艺、自动化系统等领域的专利知识。请帮助用户解析机械专利中的技术方案，提供机械发明的专利保护建议。'
  },
  
  // 获取所有提示词
  getAllPrompts: function() {
    return new Promise((resolve) => {
      // 模拟API延迟
      setTimeout(() => {
        resolve({...this._prompts});
      }, 200);
    });
  },
  
  // 获取所有模式ID和名称（用于下拉菜单）
  getModeList: function() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const modeList = [
          { id: 'general', name: '通用对话', category: '基础' },
          { id: 'patent-search', name: '专利查询', category: '基础' },
          { id: 'patent-writing', name: '专利撰写', category: '基础' },
          { id: 'patent-response', name: '专利答审', category: '基础' },
          { id: 'patent-analysis', name: '专利分析', category: '专业' },
          { id: 'patent-strategy', name: '专利战略', category: '专业' },
          { id: 'patent-translation', name: '专利翻译', category: '专业' },
          { id: 'biotech-patent', name: '生物技术专利', category: '行业专用' },
          { id: 'software-patent', name: '软件专利', category: '行业专用' },
          { id: 'mechanical-patent', name: '机械专利', category: '行业专用' }
        ];
        resolve(modeList);
      }, 150);
    });
  },
  
  // 获取特定模式的提示词
  getPrompt: function(modeId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this._prompts[modeId]) {
          resolve(this._prompts[modeId]);
        } else {
          reject(new Error(`未找到模式ID: ${modeId}的提示词`));
        }
      }, 100);
    });
  },
  
  // 更新提示词
  updatePrompt: function(modeId, promptText) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (modeId) {
          this._prompts[modeId] = promptText;
          // 模拟持久化存储
          localStorage.setItem('xpatent_prompt_' + modeId, promptText);
          resolve({success: true, message: '提示词更新成功'});
        } else {
          reject(new Error('无效的模式ID'));
        }
      }, 200);
    });
  },
  
  // 创建新的对话模式
  createMode: function(modeId, modeName, promptText, category = '自定义') {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!modeId || !modeName || !promptText) {
          reject(new Error('缺少必要参数'));
          return;
        }
        
        if (this._prompts[modeId]) {
          reject(new Error(`模式ID: ${modeId}已存在`));
          return;
        }
        
        // 添加新模式
        this._prompts[modeId] = promptText;
        // 模拟持久化存储
        localStorage.setItem('xpatent_prompt_' + modeId, promptText);
        localStorage.setItem('xpatent_mode_' + modeId, JSON.stringify({
          id: modeId,
          name: modeName,
          category: category
        }));
        
        resolve({
          success: true, 
          message: '创建成功',
          mode: {
            id: modeId,
            name: modeName,
            systemPrompt: promptText,
            category: category
          }
        });
      }, 300);
    });
  },
  
  // 删除对话模式
  deleteMode: function(modeId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!modeId) {
          reject(new Error('缺少模式ID'));
          return;
        }
        
        if (!this._prompts[modeId]) {
          reject(new Error(`模式ID: ${modeId}不存在`));
          return;
        }
        
        // 检查是否为系统预设模式（不允许删除）
        const systemModes = ['general', 'patent-search', 'patent-writing', 'patent-response'];
        if (systemModes.includes(modeId)) {
          reject(new Error('系统预设模式不允许删除'));
          return;
        }
        
        // 删除模式
        delete this._prompts[modeId];
        // 清除本地存储
        localStorage.removeItem('xpatent_prompt_' + modeId);
        localStorage.removeItem('xpatent_mode_' + modeId);
        
        resolve({success: true, message: '删除成功'});
      }, 200);
    });
  },
  
  // 重置所有提示词到默认值
  resetAllPrompts: function() {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 清除所有自定义设置
        Object.keys(this._prompts).forEach(key => {
          localStorage.removeItem('xpatent_prompt_' + key);
          localStorage.removeItem('xpatent_mode_' + key);
        });
        
        // 重新加载默认提示词
        this._loadDefaultPrompts();
        
        resolve({success: true, message: '所有提示词已重置为默认值'});
      }, 500);
    });
  },
  
  // 加载默认提示词（私有方法）
  _loadDefaultPrompts: function() {
    // 重置为初始默认值的逻辑
    this._prompts = {
      'general': '你是Xpat助手，为用户提供各种问题的回答和帮助。请提供准确、有用的信息。',
      'patent-search': '你是Xpat专利查询助手，专注于帮助用户检索、理解和分析专利信息。请解释专利概念、提供检索策略，并分析相关专利文献。',
      'patent-writing': '你是Xpat专利撰写助手，专注于帮助用户撰写高质量的专利申请文件。请根据用户的技术描述，提供专利申请书的结构、权利要求书的写法、说明书的组织等方面的建议。',
      'patent-response': '你是Xpat专利答审助手，专注于帮助用户应对专利审查意见。请分析审查意见书内容，提供修改建议，解释如何针对审查员的不同意见进行有效答复。'
    };
  },
  
  // 初始化方法 - 从本地存储加载自定义设置
  init: function() {
    console.log('初始化提示词服务...');
    // 尝试从本地存储中恢复自定义设置
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('xpatent_prompt_')) {
        const modeId = key.replace('xpatent_prompt_', '');
        this._prompts[modeId] = localStorage.getItem(key);
      }
    }
    console.log('提示词服务初始化完成');
    return this;
  }
};

// 初始化服务
window.PromptService = PromptService.init();

console.log('提示词服务已加载'); 