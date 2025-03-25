/**
 * 下拉菜单交互实现
 * 替代原有的select元素，提供更友好的用户体验
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('初始化下拉菜单组件...');
  
  // 获取下拉菜单元素
  const chatModeDropdown = document.getElementById('chatModeDropdown');
  const modelDropdown = document.getElementById('modelDropdown');
  
  console.log('菜单元素状态:', {
    chatModeDropdown: chatModeDropdown ? '已找到' : '未找到',
    modelDropdown: modelDropdown ? '已找到' : '未找到'
  });
  
  // 初始化下拉菜单
  if (chatModeDropdown) {
    console.log('初始化聊天模式下拉菜单');
    initDropdown(chatModeDropdown, 'chat-mode');
    
    // 检查菜单项
    const chatModeItems = chatModeDropdown.querySelectorAll('.dropdown-menu-item');
    console.log('聊天模式菜单项数量:', chatModeItems.length);
    chatModeItems.forEach((item, index) => {
      console.log(`聊天模式选项 ${index + 1}:`, item.getAttribute('data-value'));
    });
  } else {
    console.error('找不到聊天模式下拉菜单元素(#chatModeDropdown)');
  }
  
  if (modelDropdown) {
    console.log('初始化模型下拉菜单');
    initDropdown(modelDropdown, 'model');
    
    // 检查菜单项
    const modelItems = modelDropdown.querySelectorAll('.dropdown-menu-item');
    console.log('模型菜单项数量:', modelItems.length);
    modelItems.forEach((item, index) => {
      console.log(`模型选项 ${index + 1}:`, item.getAttribute('data-value'));
    });
  } else {
    console.error('找不到模型下拉菜单元素(#modelDropdown)');
  }
  
  // 测试所有导航栏下拉菜单
  console.log('检查顶部导航栏下拉菜单...');
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userMenu = document.getElementById('userMenu');
  const languageBtn = document.getElementById('languageBtn');
  const languageMenu = document.getElementById('languageMenu');
  
  console.log('导航栏菜单元素状态:', {
    userMenuBtn: userMenuBtn ? '已找到' : '未找到',
    userMenu: userMenu ? '已找到' : '未找到',
    languageBtn: languageBtn ? '已找到' : '未找到',
    languageMenu: languageMenu ? '已找到' : '未找到'
  });
  
  // 点击外部区域关闭所有下拉菜单
  document.addEventListener('click', function(event) {
    console.log('文档点击事件');
    const dropdowns = document.querySelectorAll('.dropdown-menu-container');
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove('active');
        console.log(`关闭下拉菜单: ${dropdown.id || '未命名菜单'}`);
      }
    });
  });
  
  // 初始化当前选择的值
  initSelectedValues();
  
  /**
   * 初始化下拉菜单
   * @param {HTMLElement} dropdown - 下拉菜单容器元素
   * @param {string} type - 下拉菜单类型 ('chat-mode' 或 'model')
   */
  function initDropdown(dropdown, type) {
    console.log(`正在初始化${type}下拉菜单...`);
    const trigger = dropdown.querySelector('.dropdown-menu-trigger');
    const content = dropdown.querySelector('.dropdown-menu-content');
    const items = dropdown.querySelectorAll('.dropdown-menu-item');
    
    console.log(`${type}下拉菜单状态:`, {
      trigger: trigger ? '已找到' : '未找到',
      content: content ? '已找到' : '未找到',
      items: items ? items.length : 0
    });
    
    if (trigger) {
      trigger.addEventListener('click', function(event) {
        console.log(`${type}下拉菜单触发器被点击`);
        event.stopPropagation();
        
        // 关闭其他菜单
        const otherDropdowns = document.querySelectorAll('.dropdown-menu-container');
        otherDropdowns.forEach(d => {
          if (d !== dropdown) {
            d.classList.remove('active');
          }
        });
        
        // 关闭顶部导航栏菜单
        const userMenu = document.getElementById('userMenu');
        if (userMenu) userMenu.classList.remove('active');
        
        const languageMenu = document.getElementById('languageMenu');
        if (languageMenu) languageMenu.classList.remove('active');
        
        // 切换当前菜单
        dropdown.classList.toggle('active');
        const isActive = dropdown.classList.contains('active');
        console.log(`${type}下拉菜单切换后状态:`, isActive ? '已打开' : '已关闭');
        
        // 检查菜单内容是否可见
        if (content) {
          const computedStyle = window.getComputedStyle(content);
          console.log(`${type}菜单内容显示状态:`, {
            display: computedStyle.display,
            opacity: computedStyle.opacity,
            visibility: computedStyle.visibility,
            transform: computedStyle.transform
          });
          
          // 确保菜单内容始终可见
          if (isActive && computedStyle.display === 'none') {
            content.style.display = 'block';
            console.log(`手动设置${type}菜单内容为可见`);
          }
        }
      });
    } else {
      console.error(`${type}下拉菜单触发器元素未找到(.dropdown-menu-trigger)`);
    }
    
    items.forEach((item, index) => {
      item.addEventListener('click', function(event) {
        console.log(`${type}下拉菜单项目${index}被点击:`, this.getAttribute('data-value'));
        event.stopPropagation();
        
        const value = this.getAttribute('data-value');
        const title = this.querySelector('.dropdown-item-title').textContent;
        
        // 更新显示
        const iconClass = this.querySelector('i').className;
        trigger.querySelector('i').className = iconClass;
        trigger.querySelector('.dropdown-selected-text').textContent = title;
        
        // 根据类型保存选择
        if (type === 'chat-mode') {
          selectChatMode(value);
        } else if (type === 'model') {
          selectModel(value);
        }
        
        // 关闭菜单
        dropdown.classList.remove('active');
        console.log(`${type}下拉菜单已关闭，选择了:`, value);
      });
    });
  }
  
  /**
   * 初始化菜单选中值
   */
  function initSelectedValues() {
    console.log('初始化下拉菜单选中值...');
    
    // 获取当前选择的聊天模式和模型
    const currentChatMode = getCurrentChatModeId();
    const currentModel = getCurrentModelId();
    
    console.log('当前值:', {
      chatMode: currentChatMode,
      model: currentModel
    });
    
    // 设置聊天模式显示
    if (chatModeDropdown) {
      const chatModeItem = chatModeDropdown.querySelector(`.dropdown-menu-item[data-value="${currentChatMode}"]`);
      if (chatModeItem) {
        const title = chatModeItem.querySelector('.dropdown-item-title').textContent;
        const iconClass = chatModeItem.querySelector('i').className;
        
        const trigger = chatModeDropdown.querySelector('.dropdown-menu-trigger');
        if (trigger) {
          const iconElement = trigger.querySelector('i:first-child');
          const textElement = trigger.querySelector('.dropdown-selected-text');
          
          if (iconElement) iconElement.className = iconClass;
          if (textElement) textElement.textContent = title;
          
          console.log('聊天模式下拉菜单显示已更新');
        }
      } else {
        console.error(`没有找到值为${currentChatMode}的聊天模式选项`);
      }
    }
    
    // 设置模型显示
    if (modelDropdown) {
      const modelItem = modelDropdown.querySelector(`.dropdown-menu-item[data-value="${currentModel}"]`);
      if (modelItem) {
        const title = modelItem.querySelector('.dropdown-item-title').textContent;
        const iconClass = modelItem.querySelector('i').className;
        
        const trigger = modelDropdown.querySelector('.dropdown-menu-trigger');
        if (trigger) {
          const iconElement = trigger.querySelector('i:first-child');
          const textElement = trigger.querySelector('.dropdown-selected-text');
          
          if (iconElement) iconElement.className = iconClass;
          if (textElement) textElement.textContent = title;
          
          console.log('模型下拉菜单显示已更新');
        }
      } else {
        console.error(`没有找到值为${currentModel}的模型选项`);
      }
    }
  }
  
  /**
   * 选择聊天模式
   * @param {string} modeId - 聊天模式ID
   */
  function selectChatMode(modeId) {
    console.log(`选择聊天模式: ${modeId}`);
    // 兼容原有JavaScript代码，调用现有函数
    if (window.CHAT_MODE && typeof window.CHAT_MODE.select === 'function') {
      window.CHAT_MODE.select(modeId);
      console.log('通过CHAT_MODE.select()设置聊天模式');
    } else {
      // 如果没有找到原有函数，则使用默认实现
      localStorage.setItem('selected_chat_mode', modeId);
      console.log('通过localStorage保存聊天模式');
    }
  }
  
  /**
   * 选择模型
   * @param {string} modelId - 模型ID
   */
  function selectModel(modelId) {
    console.log(`选择模型: ${modelId}`);
    // 更新全局变量
    window.CURRENT_MODEL = modelId;
    
    // 保存到本地存储
    localStorage.setItem('selected_model', modelId);
    
    console.log('模型选择已保存');
  }
  
  /**
   * 获取当前聊天模式ID
   * @returns {string} 聊天模式ID
   */
  function getCurrentChatModeId() {
    let modeId;
    if (window.CHAT_MODE && typeof window.CHAT_MODE.getCurrentId === 'function') {
      modeId = window.CHAT_MODE.getCurrentId();
      console.log('通过CHAT_MODE.getCurrentId()获取聊天模式:', modeId);
    } else {
      modeId = localStorage.getItem('selected_chat_mode') || 'general';
      console.log('通过localStorage获取聊天模式:', modeId);
    }
    return modeId;
  }
  
  /**
   * 获取当前模型ID
   * @returns {string} 模型ID
   */
  function getCurrentModelId() {
    const modelId = localStorage.getItem('selected_model') || 'deepseek/deepseek-r1:free';
    console.log('获取当前模型ID:', modelId);
    return modelId;
  }
  
  console.log('下拉菜单组件初始化完成');
}); 