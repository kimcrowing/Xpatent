document.addEventListener('DOMContentLoaded', function() {
    const chatModeSelector = document.getElementById('chatModeSelector');
    const currentChatModeText = document.getElementById('currentChatMode');
    const chatModeDropdown = document.getElementById('chatModeDropdown');
    
    // 调试代码，帮助排除问题
    console.log('ChatModeSelector初始化:', {
        chatModeSelector: !!chatModeSelector,
        currentChatModeText: !!currentChatModeText,
        chatModeDropdown: !!chatModeDropdown
    });
    
    // 检查必要元素是否存在
    if (!chatModeSelector || !currentChatModeText || !chatModeDropdown) {
        console.error('ChatModeSelector: 找不到必要的DOM元素');
        return; // 如果必要元素不存在，退出初始化
    }
    
    // 定义聊天模式
    const chatModes = [
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
    ];
    
    // 存储用户选择的聊天模式的本地存储键
    const SELECTED_CHAT_MODE_KEY = 'selected_chat_mode';
    
    // 获取当前选择的聊天模式ID
    function getCurrentChatModeId() {
        return localStorage.getItem(SELECTED_CHAT_MODE_KEY) || 'general';
    }
    
    // 选择聊天模式
    function selectChatMode(modeId, modeName, systemPrompt) {
        // 更新显示的模式名称
        currentChatModeText.textContent = modeName;
        
        // 更新系统提示词
        window.CHAT_MODE_SYSTEM_PROMPT = systemPrompt;
        
        // 保存到本地存储
        localStorage.setItem(SELECTED_CHAT_MODE_KEY, modeId);
        
        // 更新活动状态
        document.querySelectorAll('#chatModeDropdown li').forEach(item => {
            if (item.getAttribute('data-mode') === modeId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // 根据模式更新输入框占位符
        const userInput = document.getElementById('userInput');
        if (userInput) {
            const mode = chatModes.find(m => m.id === modeId);
            if (mode && mode.placeholder) {
                userInput.placeholder = mode.placeholder;
            }
        }
        
        console.log(`聊天模式已切换为: ${modeName}`);
    }
    
    // 初始化聊天模式
    function initChatMode() {
        const modeId = getCurrentChatModeId();
        const mode = chatModes.find(m => m.id === modeId) || chatModes[0];
        
        // 设置当前模式
        selectChatMode(mode.id, mode.name, mode.systemPrompt);
        
        // 添加点击事件到菜单项
        document.querySelectorAll('#chatModeDropdown li').forEach(item => {
            const itemModeId = item.getAttribute('data-mode');
            const itemMode = chatModes.find(m => m.id === itemModeId);
            
            if (itemMode) {
                item.addEventListener('click', function(e) {
                    // 阻止事件冒泡，防止触发dropdown的toggle事件
                    e.stopPropagation();
                    
                    selectChatMode(itemMode.id, itemMode.name, itemMode.systemPrompt);
                    // 强制隐藏下拉菜单
                    chatModeDropdown.classList.remove('show');
                    chatModeDropdown.style.display = 'none';
                });
                
                // 标记当前选中的项
                if (modeId === itemModeId) {
                    item.classList.add('active');
                }
            }
        });
    }
    
    // 初始化
    initChatMode();
    
    // 点击聊天模式选择器按钮时显示/隐藏下拉菜单
    chatModeSelector.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // 使用已有的菜单元素，不再动态创建
        if (chatModeDropdown) {
            chatModeDropdown.classList.toggle('show');
            
            // 计算位置，确保下拉菜单紧贴按钮
            const rect = chatModeSelector.getBoundingClientRect();
            const dropdownWidth = 180; // 菜单宽度与CSS中保持一致
            
            // 获取下拉菜单的高度（先显示它才能获取高度）
            chatModeDropdown.style.visibility = 'hidden';
            chatModeDropdown.style.display = 'block';
            const dropdownHeight = chatModeDropdown.offsetHeight;
            
            // 设置为固定定位，相对于视口
            chatModeDropdown.style.position = 'fixed';
            
            // 检查是否会超出底部边界
            const spaceBelow = window.innerHeight - rect.bottom - 5;
            const spaceAbove = rect.top - 5;
            
            // 垂直位置：优先显示在按钮下方，如果下方空间不足则显示在按钮上方
            if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                // 上方显示
                chatModeDropdown.style.top = `${rect.top - dropdownHeight - 5}px`;
            } else {
                // 下方显示（默认）或者上方空间也不足时强制下方显示
                chatModeDropdown.style.top = `${rect.bottom + 5}px`;
            }
            
            // 水平位置：优先保持右对齐，但确保不超出左侧边界
            const rightPosition = window.innerWidth - rect.right;
            // 如果右对齐会导致超出左侧边界，则使用左对齐
            if (rect.right - dropdownWidth < 0) {
                chatModeDropdown.style.left = `${rect.left}px`;
                chatModeDropdown.style.right = 'auto';
            } else {
                chatModeDropdown.style.right = `${rightPosition}px`;
                chatModeDropdown.style.left = 'auto';
            }
            
            // 恢复可见性
            chatModeDropdown.style.visibility = 'visible';
        }
    });
    
    // 点击页面其他地方时隐藏下拉菜单
    document.addEventListener('click', function(e) {
        if (!chatModeSelector.contains(e.target) && !chatModeDropdown.contains(e.target)) {
            chatModeDropdown.classList.remove('show');
        }
    });
    
    // 暴露给其他模块的API
    window.CHAT_MODE = {
        getSystemPrompt: function() {
            return window.CHAT_MODE_SYSTEM_PROMPT;
        },
        getCurrentId: getCurrentChatModeId,
        select: selectChatMode
    };
}); 