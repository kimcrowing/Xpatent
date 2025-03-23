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
        { id: 'general', name: '通用对话', systemPrompt: '你是Xpat助手，为用户提供各种问题的回答和帮助。请提供准确、有用的信息。' }
    ];
    
    // 存储用户权限
    let userPermissions = {
        allowedChatModes: ['general']
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
    
    // 获取聊天模式列表，优先使用模拟后端数据，并根据用户权限过滤
    function getChatModes() {
        let modes = [];
        
        // 检查是否有全局提示词模板数据
        if (window.PROMPT_TEMPLATES && window.PROMPT_TEMPLATES.chatModes) {
            modes = window.PROMPT_TEMPLATES.chatModes;
        } else {
            try {
                // 尝试从后端API获取提示词模板并转换为聊天模式格式
                if (window.backendApi && window.backendApi.getAllPrompts) {
                    // 异步获取数据，设置全局变量
                    window.backendApi.getAllPrompts().then(response => {
                        if (response && response.prompts && response.prompts.length > 0) {
                            // 将API返回的提示词模板转换为聊天模式格式
                            const chatModes = response.prompts.map(prompt => ({
                                id: prompt.category,
                                name: prompt.name,
                                systemPrompt: prompt.content
                            }));
                            
                            // 设置全局变量以便后续使用
                            window.PROMPT_TEMPLATES = {
                                chatModes: chatModes
                            };
                            
                            console.log('成功从API加载提示词模板:', chatModes.length);
                            
                            // 重新初始化选择器
                            checkSelectedChatMode();
                        }
                    }).catch(error => {
                        console.error('从API加载提示词模板失败:', error);
                    });
                }
            } catch (error) {
                console.error('处理提示词模板时出错:', error);
            }
            
            console.warn('使用默认聊天模式作为临时解决方案');
            modes = localChatModes;
        }
        
        // 根据用户权限过滤可用模式
        if (userPermissions && userPermissions.allowedChatModes) {
            // 管理员可以访问所有模式
            if (window.backendApi && window.backendApi.isAdmin && window.backendApi.isAdmin()) {
                return modes;
            }
            
            // 普通用户只能访问被允许的模式
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

// 修改初始化函数，添加领域选择器
async function initializeChatModeSelector() {
    const container = document.getElementById('chat-mode-selector');
    if (!container) return;

    // 初始加载提示词类别
    try {
        // 获取所有提示词模板
        const templates = await backendApi.getAllPrompts();
        PROMPT_TEMPLATES = templates;
        
        // 提取不同的类别
        const categories = Array.from(new Set(templates.map(t => t.category)));
        
        // 创建类别选择器
        const categorySelect = document.createElement('select');
        categorySelect.id = 'category-select';
        categorySelect.className = 'form-select';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            
            // 设置显示名称
            let displayName = category;
            switch (category) {
                case 'general':
                    displayName = '通用对话';
                    break;
                case 'patent-search':
                    displayName = '专利查询';
                    break;
                case 'patent-writing':
                    displayName = '专利撰写';
                    break;
                case 'patent-response':
                    displayName = '专利答审';
                    break;
            }
            
            option.textContent = displayName;
            categorySelect.appendChild(option);
        });
        
        // 创建领域选择器（初始隐藏）
        const fieldContainer = document.createElement('div');
        fieldContainer.id = 'field-selector-container';
        fieldContainer.style.display = 'none';
        fieldContainer.className = 'mt-2';
        
        const fieldSelect = document.createElement('select');
        fieldSelect.id = 'field-select';
        fieldSelect.className = 'form-select';
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '选择技术领域（可选）';
        fieldSelect.appendChild(defaultOption);
        
        fieldContainer.appendChild(fieldSelect);
        
        // 添加到容器
        container.innerHTML = '';
        container.appendChild(categorySelect);
        container.appendChild(fieldContainer);
        
        // 类别变更事件
        categorySelect.addEventListener('change', async () => {
            const selectedCategory = categorySelect.value;
            
            // 根据选中的类别更新模板
            updatePromptTemplate(selectedCategory);
            
            // 如果是专利撰写/查询/答审类别，则显示领域选择器并加载领域列表
            if (selectedCategory === 'patent-writing' || 
                selectedCategory === 'patent-search' || 
                selectedCategory === 'patent-response') {
                fieldContainer.style.display = 'block';
                
                try {
                    // 获取该类别下的所有领域
                    const fields = await backendApi.getPromptFields(selectedCategory);
                    
                    // 清空现有选项，保留默认选项
                    while (fieldSelect.options.length > 1) {
                        fieldSelect.remove(1);
                    }
                    
                    // 添加领域选项
                    fields.forEach(field => {
                        const option = document.createElement('option');
                        option.value = field;
                        
                        // 设置显示名称
                        let displayName = field;
                        switch (field) {
                            case 'mechanical':
                                displayName = '机械';
                                break;
                            case 'electrical':
                                displayName = '电子电气';
                                break;
                            case 'software':
                                displayName = '软件';
                                break;
                            case 'chemical':
                                displayName = '化学';
                                break;
                            case 'biomedical':
                                displayName = '生物医药';
                                break;
                            case 'energy':
                                displayName = '能源环保';
                                break;
                        }
                        
                        option.textContent = displayName;
                        fieldSelect.appendChild(option);
                    });
                    
                    // 默认选择为空
                    fieldSelect.value = '';
                } catch (error) {
                    console.error('获取领域列表失败:', error);
                }
            } else {
                fieldContainer.style.display = 'none';
            }
        });
        
        // 领域变更事件
        fieldSelect.addEventListener('change', async () => {
            const selectedCategory = categorySelect.value;
            const selectedField = fieldSelect.value;
            
            if (selectedField) {
                try {
                    // 获取特定领域的提示词模板
                    const fieldTemplates = await backendApi.getPromptsByField(selectedCategory, selectedField);
                    
                    if (fieldTemplates && fieldTemplates.length > 0) {
                        // 更新当前使用的提示词模板
                        currentPrompt = fieldTemplates[0];
                        
                        // 触发自定义事件
                        const event = new CustomEvent('promptTemplateChanged', { detail: currentPrompt });
                        document.dispatchEvent(event);
                    }
                } catch (error) {
                    console.error('获取领域提示词失败:', error);
                }
            } else {
                // 如果未选择领域，则使用该类别的通用模板
                updatePromptTemplate(selectedCategory);
            }
        });
        
        // 初始化时触发类别选择事件
        categorySelect.dispatchEvent(new Event('change'));
        
    } catch (error) {
        console.error('获取提示词模板失败:', error);
        // 设置默认为通用对话
        updatePromptTemplate('general');
    }
}

// 更新提示词模板
function updatePromptTemplate(category) {
    // 从已加载的模板中查找匹配的类别
    const matchingTemplates = PROMPT_TEMPLATES.filter(t => t.category === category && (!t.field || t.field === ''));
    
    if (matchingTemplates.length > 0) {
        currentPrompt = matchingTemplates[0];
        
        // 触发自定义事件
        const event = new CustomEvent('promptTemplateChanged', { detail: currentPrompt });
        document.dispatchEvent(event);
    }
} 