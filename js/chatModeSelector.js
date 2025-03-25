document.addEventListener('DOMContentLoaded', function() {
    console.log('开始初始化聊天模式选择器...');
    const chatModeSelector = document.getElementById('chatModeSelector');
    
    // 调试代码，帮助排除问题
    console.log('ChatModeSelector初始化:', {
        chatModeSelector: chatModeSelector ? true : false,
        options: chatModeSelector ? chatModeSelector.options.length : 0
    });
    
    // 检查必要元素是否存在
    if (!chatModeSelector) {
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
    function selectChatMode(modeId) {
        const mode = chatModes.find(m => m.id === modeId) || chatModes[0];
        
        // 更新系统提示词
        window.CHAT_MODE_SYSTEM_PROMPT = mode.systemPrompt;
        
        // 保存到本地存储
        localStorage.setItem(SELECTED_CHAT_MODE_KEY, modeId);
        
        // 根据模式更新输入框占位符
        const userInput = document.getElementById('userInput');
        if (userInput && mode.placeholder) {
            userInput.placeholder = mode.placeholder;
        }
        
        console.log(`聊天模式已切换为: ${mode.name}`);
    }
    
    // 初始化聊天模式
    function initChatMode() {
        try {
            const modeId = getCurrentChatModeId();
            
            // 确认选择器有效
            if (chatModeSelector && chatModeSelector.options.length > 0) {
                // 设置select元素的选中值
                chatModeSelector.value = modeId;
                
                // 应用选中的模式
                selectChatMode(modeId);
                
                console.log('聊天模式选择器初始化完成:', {
                    modeId: modeId,
                    options: chatModeSelector.options.length
                });
            } else {
                console.warn('聊天模式选择器不存在或没有选项');
            }
        } catch (err) {
            console.error('初始化聊天模式选择器时出错:', err);
        }
    }
    
    // 监听select元素的change事件
    chatModeSelector.addEventListener('change', function(e) {
        const selectedModeId = this.value;
        selectChatMode(selectedModeId);
    });
    
    // 初始化
    initChatMode();
    
    // 暴露给其他模块的API
    window.CHAT_MODE = {
        getSystemPrompt: function() {
            return window.CHAT_MODE_SYSTEM_PROMPT;
        },
        getCurrentId: getCurrentChatModeId,
        select: selectChatMode
    };
    
    console.log('聊天模式选择器脚本加载完成');
}); 