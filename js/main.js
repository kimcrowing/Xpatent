// 全局变量
window.CHAT_MODE_SYSTEM_PROMPT = '你是一个全能助手，请帮助用户解答各种问题。';
window.CURRENT_MODEL = 'deepseek/deepseek-r1:free';

// 当文档加载完成时初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('初始化主程序...');
    
    // 初始化聊天模式
    window.CHAT_MODE = {
        getSystemPrompt: function() {
            return window.CHAT_MODE_SYSTEM_PROMPT;
        },
        getCurrentId: function() {
            return localStorage.getItem('selected_chat_mode') || 'general';
        },
        select: function(modeId) {
            const prompts = {
                'general': '你是一个全能助手，请帮助用户解答各种问题。',
                'patent-search': '你是一个专利检索专家，请帮助用户查找相关专利信息。',
                'patent-writing': '你是一个专利撰写专家，请帮助用户撰写高质量的专利申请文档。',
                'patent-analysis': '你是一个专利答审专家，专注于帮助用户分析和回复专利审查意见通知书。'
            };
            
            window.CHAT_MODE_SYSTEM_PROMPT = prompts[modeId] || prompts['general'];
            localStorage.setItem('selected_chat_mode', modeId);
            console.log('已切换聊天模式:', modeId);
        }
    };
    
    // 初始化模型选择
    window.MODEL_SELECTOR = {
        getCurrentId: function() {
            return localStorage.getItem('selected_model') || 'deepseek/deepseek-r1:free';
        },
        select: function(modelId) {
            window.CURRENT_MODEL = modelId;
            localStorage.setItem('selected_model', modelId);
            console.log('已切换模型:', modelId);
        }
    };
    
    // 订阅管理
    window.subscriptionManager = {
        checkExpirationStatus: function() {
            // 检查订阅状态的逻辑
            console.log('检查订阅状态');
        }
    };
    
    // 当用户登录后，检查订阅状态
    document.addEventListener('userLoggedIn', () => {
        window.subscriptionManager.checkExpirationStatus();
    });
    
    console.log('主程序初始化完成');
}); 