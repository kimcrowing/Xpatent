document.addEventListener('DOMContentLoaded', async function() {
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
    
    // 存储用户选择的聊天模式的本地存储键
    const SELECTED_CHAT_MODE_KEY = 'selected_chat_mode';
    
    // 确保PromptService可用
    if (!window.PromptService) {
        console.error('PromptService未加载，使用默认模式');
    }
    
    // 从服务获取聊天模式列表
    let chatModes = [];
    try {
        // 获取模式列表
        const modeList = await window.PromptService.getModeList();
        
        // 遍历模式列表，获取每个模式的提示词
        for (const mode of modeList) {
            try {
                const promptText = await window.PromptService.getPrompt(mode.id);
                chatModes.push({
                    id: mode.id,
                    name: mode.name,
                    systemPrompt: promptText,
                    category: mode.category
                });
            } catch (error) {
                console.error(`获取模式${mode.id}的提示词失败:`, error);
            }
        }
        
        console.log('已加载聊天模式:', chatModes.length);
    } catch (error) {
        console.error('获取模式列表失败:', error);
        // 使用基础模式作为后备
        chatModes = [
            { id: 'general', name: '通用对话', systemPrompt: '你是Xpat助手，为用户提供各种问题的回答和帮助。请提供准确、有用的信息。' }
        ];
    }
    
    // 动态创建聊天模式下拉菜单
    function createChatModeDropdown() {
        // 检查是否已存在下拉菜单
        let chatModeDropdown = document.getElementById('chatModeDropdown');
        
        if (!chatModeDropdown) {
            chatModeDropdown = document.createElement('div');
            chatModeDropdown.id = 'chatModeDropdown';
            chatModeDropdown.className = 'chat-mode-dropdown';
            
            // 按类别对模式进行分组
            const categories = {};
            chatModes.forEach(mode => {
                const category = mode.category || '其他';
                if (!categories[category]) {
                    categories[category] = [];
                }
                categories[category].push(mode);
            });
            
            // 创建分组列表
            Object.entries(categories).forEach(([category, modes]) => {
                // 添加类别标题
                const categoryTitle = document.createElement('div');
                categoryTitle.className = 'mode-category-title';
                categoryTitle.textContent = category;
                chatModeDropdown.appendChild(categoryTitle);
                
                // 添加该类别下的模式
                const modeList = document.createElement('ul');
                modes.forEach(mode => {
                    const modeItem = document.createElement('li');
                    modeItem.setAttribute('data-mode', mode.id);
                    modeItem.textContent = mode.name;
                    
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
            });
            
            document.body.appendChild(chatModeDropdown);
        }
        
        return chatModeDropdown;
    }
    
    // 获取当前选择的聊天模式ID
    function getCurrentChatModeId() {
        return localStorage.getItem(SELECTED_CHAT_MODE_KEY) || 'general';
    }
    
    // 获取当前选择的聊天模式系统提示词
    async function getCurrentChatModeSystemPrompt() {
        const modeId = getCurrentChatModeId();
        try {
            return await window.PromptService.getPrompt(modeId);
        } catch (error) {
            console.error('获取当前模式提示词失败:', error);
            const mode = chatModes.find(m => m.id === modeId);
            return mode ? mode.systemPrompt : chatModes[0].systemPrompt;
        }
    }
    
    // 检查本地存储中的聊天模式选择
    async function checkSelectedChatMode() {
        const savedModeId = localStorage.getItem(SELECTED_CHAT_MODE_KEY);
        if (savedModeId) {
            try {
                // 查找匹配的模式
                const mode = chatModes.find(m => m.id === savedModeId);
                
                if (mode) {
                    // 更新显示的模式名称
                    currentChatModeText.textContent = mode.name;
                    // 确保系统提示词可用
                    window.CHAT_MODE_SYSTEM_PROMPT = mode.systemPrompt;
                } else {
                    // 如果在本地列表中找不到，从服务获取
                    const promptText = await window.PromptService.getPrompt(savedModeId);
                    window.CHAT_MODE_SYSTEM_PROMPT = promptText;
                    
                    // 查找模式名称
                    const modeList = await window.PromptService.getModeList();
                    const modeInfo = modeList.find(m => m.id === savedModeId);
                    if (modeInfo) {
                        currentChatModeText.textContent = modeInfo.name;
                    } else {
                        currentChatModeText.textContent = savedModeId;
                    }
                }
            } catch (error) {
                console.error('获取所选模式失败:', error);
                // 出错时回退到通用对话
                window.CHAT_MODE_SYSTEM_PROMPT = chatModes[0].systemPrompt;
                currentChatModeText.textContent = chatModes[0].name;
            }
        } else {
            // 默认使用通用对话
            window.CHAT_MODE_SYSTEM_PROMPT = chatModes[0].systemPrompt;
            currentChatModeText.textContent = chatModes[0].name;
        }
    }
    
    // 选择聊天模式
    async function selectChatMode(modeId, modeName, systemPrompt) {
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
                case 'patent-analysis':
                    userInput.placeholder = '请输入想要分析的专利数据或技术领域...';
                    break;
                case 'patent-strategy':
                    userInput.placeholder = '请描述您的业务领域，寻求专利战略建议...';
                    break; 
                case 'patent-translation':
                    userInput.placeholder = '请输入需要翻译的专利文本...';
                    break;
                default:
                    userInput.placeholder = '您想了解什么?';
            }
        }
    }
    
    // 暴露给其他模块的API
    window.getChatModeSystemPrompt = async function() {
        try {
            const promptText = await getCurrentChatModeSystemPrompt();
            return promptText || chatModes[0].systemPrompt;
        } catch (error) {
            console.error('获取系统提示词失败:', error);
            return chatModes[0].systemPrompt;
        }
    };
    
    // 初始化时检查
    await checkSelectedChatMode();
    
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