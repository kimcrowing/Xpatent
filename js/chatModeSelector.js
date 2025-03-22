document.addEventListener('DOMContentLoaded', function() {
    const chatModeSelector = document.getElementById('chatModeSelector');
    const currentChatModeText = document.getElementById('currentChatMode');
    
    // 调试代码，帮助排除问题
    console.log('ChatModeSelector初始化:', {
        chatModeSelector: !!chatModeSelector,
        currentChatModeText: !!currentChatModeText
    });
    
    // 检查元素是否存在
    if (!chatModeSelector || !currentChatModeText) {
        console.error('ChatModeSelector: 找不到必要的DOM元素');
        return; // 如果必要元素不存在，退出初始化
    }
    
    // 本地备用的聊天模式列表（如果无法从模拟后端获取）
    const localChatModes = [
        { id: 'general', name: '通用对话', systemPrompt: '你是Xpat助手，为用户提供各种问题的回答和帮助。请提供准确、有用的信息。' },
        { id: 'patent-search', name: '专利查询', systemPrompt: '你是Xpat专利查询助手，专注于帮助用户检索、理解和分析专利信息。请解释专利概念、提供检索策略，并分析相关专利文献。' },
        { id: 'patent-writing', name: '专利撰写', systemPrompt: '你是Xpat专利撰写助手，专注于帮助用户撰写高质量的专利申请文件。请根据用户的技术描述，提供专利申请书的结构、权利要求书的写法、说明书的组织等方面的建议。' },
        { id: 'patent-response', name: '专利答审', systemPrompt: '你是Xpat专利答审助手，专注于帮助用户应对专利审查意见。请分析审查意见书内容，提供修改建议，解释如何针对审查员的不同意见进行有效答复。' }
    ];
    
    // 获取聊天模式列表，优先使用模拟后端数据
    function getChatModes() {
        return window.PROMPT_TEMPLATES && window.PROMPT_TEMPLATES.chatModes 
            ? window.PROMPT_TEMPLATES.chatModes 
            : localChatModes;
    }
    
    // 存储用户选择的聊天模式的本地存储键
    const SELECTED_CHAT_MODE_KEY = 'selected_chat_mode';
    
    // 动态创建聊天模式下拉菜单
    function createChatModeDropdown() {
        // 检查是否已存在下拉菜单
        let chatModeDropdown = document.getElementById('chatModeDropdown');
        
        if (!chatModeDropdown) {
            chatModeDropdown = document.createElement('div');
            chatModeDropdown.id = 'chatModeDropdown';
            chatModeDropdown.className = 'chat-mode-dropdown';
            
            const modeList = document.createElement('ul');
            
            // 获取最新的聊天模式列表
            const chatModes = getChatModes();
            
            chatModes.forEach(mode => {
                const modeItem = document.createElement('li');
                modeItem.setAttribute('data-mode', mode.id);
                modeItem.textContent = mode.name;
                
                // 如果是当前选择的模式，添加active类
                if (getCurrentChatModeId() === mode.id) {
                    modeItem.classList.add('active');
                }
                
                modeItem.addEventListener('click', function() {
                    selectChatMode(mode.id, mode.name, mode.systemPrompt);
                    chatModeDropdown.classList.remove('show');
                });
                
                modeList.appendChild(modeItem);
            });
            
            chatModeDropdown.appendChild(modeList);
            document.body.appendChild(chatModeDropdown);
        }
        
        return chatModeDropdown;
    }
    
    // 获取当前选择的聊天模式ID
    function getCurrentChatModeId() {
        return localStorage.getItem(SELECTED_CHAT_MODE_KEY) || 'general';
    }
    
    // 获取当前选择的聊天模式系统提示词
    function getCurrentChatModeSystemPrompt() {
        const modeId = getCurrentChatModeId();
        const mode = getChatModes().find(m => m.id === modeId);
        return mode ? mode.systemPrompt : getChatModes()[0].systemPrompt;
    }
    
    // 检查本地存储中的聊天模式选择
    function checkSelectedChatMode() {
        const savedModeId = localStorage.getItem(SELECTED_CHAT_MODE_KEY);
        if (savedModeId) {
            // 查找匹配的模式
            const mode = getChatModes().find(m => m.id === savedModeId);
            
            if (mode) {
                // 更新显示的模式名称
                currentChatModeText.textContent = mode.name;
                // 确保系统提示词可用
                window.CHAT_MODE_SYSTEM_PROMPT = mode.systemPrompt;
            }
        } else {
            // 默认使用通用对话
            window.CHAT_MODE_SYSTEM_PROMPT = getChatModes()[0].systemPrompt;
        }
    }
    
    // 选择聊天模式
    function selectChatMode(modeId, modeName, systemPrompt) {
        // 更新显示的模式名称
        currentChatModeText.textContent = modeName;
        
        // 更新系统提示词
        window.CHAT_MODE_SYSTEM_PROMPT = systemPrompt;
        
        // 保存到本地存储
        localStorage.setItem(SELECTED_CHAT_MODE_KEY, modeId);
        
        // 根据模式更新输入框占位符
        updatePlaceholderByMode(modeId);
        
        console.log(`聊天模式已切换为: ${modeName}`);
    }
    
    // 根据模式更新输入框占位符
    function updatePlaceholderByMode(modeId) {
        const userInput = document.getElementById('userInput');
        if (userInput) {
            switch(modeId) {
                case 'patent-search':
                    userInput.placeholder = '请输入您想查询的专利技术或概念...';
                    break;
                case 'patent-writing':
                    userInput.placeholder = '请描述您的发明技术，或询问专利撰写问题...';
                    break;
                case 'patent-response':
                    userInput.placeholder = '请输入审查意见或提出答审问题...';
                    break;
                default:
                    userInput.placeholder = '您想了解什么?';
            }
        }
    }
    
    // 暴露给其他模块的API
    window.getChatModeSystemPrompt = function() {
        return window.CHAT_MODE_SYSTEM_PROMPT || getChatModes()[0].systemPrompt;
    };
    
    // 初始化时检查
    checkSelectedChatMode();
    
    // 根据当前模式设置占位符
    updatePlaceholderByMode(getCurrentChatModeId());
    
    // 点击聊天模式选择器按钮时显示/隐藏下拉菜单
    chatModeSelector.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const chatModeDropdown = createChatModeDropdown();
        
        // 计算下拉菜单位置
        const rect = chatModeSelector.getBoundingClientRect();
        chatModeDropdown.style.bottom = `${window.innerHeight - rect.top + 10}px`;
        chatModeDropdown.style.right = `${window.innerWidth - rect.right + 100}px`; // 偏移以防止和模型选择器重叠
        
        chatModeDropdown.classList.toggle('show');
    });
    
    // 点击页面其他地方时隐藏下拉菜单
    document.addEventListener('click', function(e) {
        const chatModeDropdown = document.getElementById('chatModeDropdown');
        if (chatModeDropdown && chatModeSelector && !chatModeSelector.contains(e.target) && !chatModeDropdown.contains(e.target)) {
            chatModeDropdown.classList.remove('show');
        }
    });
}); 