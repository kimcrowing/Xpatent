document.addEventListener('DOMContentLoaded', function() {
    const chatModeSelector = document.getElementById('chatModeSelector');
    const currentChatModeText = document.getElementById('currentChatMode');
    
    // 调试代码，帮助排除问题
    console.log('ChatModeSelector初始化:', {
        chatModeSelector: !!chatModeSelector,
        currentChatModeText: !!currentChatModeText
    });
    
    // 检查必要元素是否存在
    if (!chatModeSelector || !currentChatModeText) {
        console.error('ChatModeSelector: 找不到必要的DOM元素');
        return; // 如果必要元素不存在，退出初始化
    }
    
    // 添加默认的提示词模板数据
    window.PROMPT_TEMPLATES = {
        chatModes: [
            {
                id: 'general',
                name: '通用对话',
                systemPrompt: '你是一个全能助手，请帮助用户解答各种问题。',
                placeholder: '您想了解什么?'
            },
            {
                id: 'patent-search',
                name: '专利检索',
                systemPrompt: '你是一个专利检索专家，请帮助用户查找相关专利信息。',
                placeholder: '请输入您想检索的专利关键词或技术领域...'
            },
            {
                id: 'patent-writing',
                name: '专利撰写',
                systemPrompt: '你是一个专利撰写专家，请帮助用户撰写高质量的专利申请文档。',
                placeholder: '请描述您的发明或者您需要什么样的专利撰写帮助...'
            },
            {
                id: 'patent-analysis',
                name: '专利答审',
                systemPrompt: '你是一个专利答审专家，专注于帮助用户分析和回复专利审查意见通知书。请根据用户提供的审查意见，协助起草答复意见，提供修改建议，并解释如何克服审查员提出的新颖性、创造性、支持性等问题。',
                placeholder: '请输入您需要答复的审查意见或专利问题...'
            }
        ]
    };
    
    // 默认本地聊天模式数据 (备用)
    const localChatModes = [
        {
            id: 'general',
            name: '通用对话',
            systemPrompt: '你是一个全能助手，请帮助用户解答各种问题。',
            placeholder: '您想了解什么?'
        }
    ];
    
    // 存储用户权限
    let userPermissions = {
        allowedChatModes: ['general', 'patent-search', 'patent-writing', 'patent-analysis']
    };
    
    // 获取用户权限
    async function loadUserPermissions() {
        try {
            if (window.backendApi && window.backendApi.getUserPermissions) {
                userPermissions = await window.backendApi.getUserPermissions();
                console.log('已加载用户权限:', userPermissions);
                
                // 重新初始化选择器
                checkSelectedChatMode();
            }
        } catch (error) {
            console.error('加载用户权限失败:', error);
        }
    }
    
    // 检查当前用户是否为管理员
    function checkIsAdmin() {
        // 直接从localStorage获取用户信息检查角色
        try {
            const userInfoStr = localStorage.getItem('xpat_user_info');
            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);
                console.log('用户信息:', userInfo);
                return userInfo && userInfo.role === 'admin';
            }
        } catch (error) {
            console.error('检查管理员状态时出错:', error);
        }
        
        // 如果window.backendApi存在，也尝试使用它
        if (window.backendApi && typeof window.backendApi.isAdmin === 'function') {
            const isAdminResult = window.backendApi.isAdmin();
            console.log('backendApi.isAdmin()返回:', isAdminResult);
            return isAdminResult;
        }
        
        return false;
    }
    
    // 获取聊天模式列表，优先使用模拟后端数据，并根据用户权限过滤
    function getChatModes() {
        let modes = [];
        
        if (window.PROMPT_TEMPLATES && window.PROMPT_TEMPLATES.chatModes) {
            modes = window.PROMPT_TEMPLATES.chatModes;
        } else {
            console.warn('无法从服务器获取提示词模板，只使用通用对话模式');
            modes = localChatModes;
        }
        
        // 检查用户是否为管理员
        const isAdmin = checkIsAdmin();
        console.log('当前用户是否为管理员:', isAdmin);
        
        // 管理员可以访问所有模式
        if (isAdmin) {
            console.log('管理员用户，显示所有聊天模式');
            return modes;
        }
        
        // 根据用户权限过滤可用模式
        if (userPermissions && userPermissions.allowedChatModes) {
            console.log('根据用户权限过滤聊天模式:', userPermissions.allowedChatModes);
            return modes.filter(mode => userPermissions.allowedChatModes.includes(mode.id));
        }
        
        return modes;
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
    
    // 暴露getCurrentChatModeId函数给全局作用域
    window.getCurrentChatModeId = getCurrentChatModeId;
    
    // 暴露selectChatMode函数给全局作用域
    window.selectChatMode = selectChatMode;
    
    // 初始化时加载用户权限
    loadUserPermissions();
    
    // 初始化时检查
    checkSelectedChatMode();
    
    // 根据当前模式设置占位符
    updatePlaceholderByMode(getCurrentChatModeId());
    
    // 点击聊天模式选择器按钮时显示/隐藏下拉菜单
    chatModeSelector.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const chatModeDropdown = createChatModeDropdown();
        
        // 计算下拉菜单位置 - 改用fixed定位和top属性
        const rect = chatModeSelector.getBoundingClientRect();
        chatModeDropdown.style.position = 'fixed';
        chatModeDropdown.style.top = `${rect.bottom + 5}px`;
        chatModeDropdown.style.right = `${window.innerWidth - rect.right}px`;
        chatModeDropdown.style.zIndex = '9999';
        
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