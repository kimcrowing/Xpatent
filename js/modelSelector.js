document.addEventListener('DOMContentLoaded', function() {
    console.log('开始初始化模型选择器...');
    const modelSelector = document.getElementById('modelSelector');
    
    // 调试代码，帮助排除问题
    console.log('ModelSelector初始化:', {
        modelSelector: modelSelector ? true : false,
        options: modelSelector ? modelSelector.options.length : 0
    });
    
    // 检查元素是否存在
    if (!modelSelector) {
        console.error('ModelSelector: 找不到必要的DOM元素');
        return; // 如果必要元素不存在，退出初始化
    }
    
    // 模型列表
    const allModels = [
        { id: 'deepseek/deepseek-r1:free', name: 'Deepseek' },
        { id: 'anthropic/claude-3-opus:beta', name: 'Claude 3 Opus' },
        { id: 'anthropic/claude-3-sonnet:beta', name: 'Claude 3 Sonnet' },
        { id: 'anthropic/claude-3-haiku:beta', name: 'Claude 3 Haiku' },
        { id: 'google/gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro' },
        { id: 'google/gemini-2.0-flash-thinking-exp:free', name: 'Gemini 2.0 Flash' },
        { id: 'meta-llama/llama-3-70b-instruct:free', name: 'Llama 3 70B' },
        { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B' }
    ];
    
    // 存储用户权限
    let userPermissions = {
        allowedModels: ['deepseek/deepseek-r1:free']
    };
    
    // 存储用户选择的模型的本地存储键
    const SELECTED_MODEL_KEY = 'selected_model';
    
    // 获取当前选择的模型ID
    function getCurrentModelId() {
        return localStorage.getItem(SELECTED_MODEL_KEY) || 'deepseek/deepseek-r1:free';
    }
    
    // 选择模型
    function selectModel(modelId) {
        // 获取模型信息
        const model = allModels.find(m => m.id === modelId) || allModels[0];
        
        // 更新select元素的值
        modelSelector.value = modelId;
        
        // 更新API中使用的模型
        window.CURRENT_MODEL = modelId;
        
        // 保存到本地存储
        localStorage.setItem(SELECTED_MODEL_KEY, modelId);
        
        console.log(`模型已切换为: ${model.name} (${modelId})`);
    }
    
    // 初始化模型选择
    function initModelSelector() {
        try {
            const modelId = getCurrentModelId();
            
            // 确认模型选择器有效
            if (modelSelector && modelSelector.options.length > 0) {
                // 设置选中值
                modelSelector.value = modelId;
                
                // 应用选中的模型
                selectModel(modelId);
                
                console.log('模型选择器初始化完成:', {
                    modelId: modelId,
                    options: modelSelector.options.length
                });
            } else {
                console.warn('模型选择器不存在或没有选项');
            }
        } catch (err) {
            console.error('初始化模型选择器时出错:', err);
        }
    }
    
    // 监听select元素的change事件
    modelSelector.addEventListener('change', function(e) {
        const selectedModelId = this.value;
        selectModel(selectedModelId);
    });
    
    // 初始化
    initModelSelector();
    
    // 获取用户权限 - 可以在需要时禁用某些选项
    async function loadUserPermissions() {
        try {
            if (window.backendApi && window.backendApi.getUserPermissions) {
                userPermissions = await window.backendApi.getUserPermissions();
                console.log('已加载用户权限:', userPermissions);
                
                // 禁用不允许的模型选项
                for (let i = 0; i < modelSelector.options.length; i++) {
                    const option = modelSelector.options[i];
                    const isAllowed = userPermissions.allowedModels.includes(option.value) || 
                                     option.value.includes(':free') ||
                                     (window.backendApi.isAdmin && window.backendApi.isAdmin());
                    
                    option.disabled = !isAllowed;
                }
                
                // 如果当前选中的模型不被允许，切换到第一个允许的模型
                if (!userPermissions.allowedModels.includes(modelSelector.value) && 
                    !modelSelector.value.includes(':free') &&
                    !(window.backendApi.isAdmin && window.backendApi.isAdmin())) {
                    
                    const firstAllowedOption = Array.from(modelSelector.options)
                        .find(opt => !opt.disabled);
                    
                    if (firstAllowedOption) {
                        selectModel(firstAllowedOption.value);
                    }
                }
            }
        } catch (error) {
            console.error('加载用户权限失败:', error);
        }
    }
    
    // 在初始化后加载用户权限
    setTimeout(loadUserPermissions, 500);
    
    console.log('模型选择器脚本加载完成');
}); 