document.addEventListener('DOMContentLoaded', function() {
    const modelSelector = document.getElementById('modelSelector');
    const currentModelText = document.getElementById('currentModel');
    
    // 调试代码，帮助排除问题
    console.log('ModelSelector初始化:', {
        modelSelector: !!modelSelector,
        currentModelText: !!currentModelText
    });
    
    // 检查元素是否存在
    if (!modelSelector || !currentModelText) {
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
    
    // 获取用户权限
    async function loadUserPermissions() {
        try {
            if (window.backendApi && window.backendApi.getUserPermissions) {
                userPermissions = await window.backendApi.getUserPermissions();
                console.log('已加载用户权限:', userPermissions);
                
                // 重新初始化选择器
                checkSelectedModel();
            }
        } catch (error) {
            console.error('加载用户权限失败:', error);
        }
    }
    
    // 获取可用模型，根据用户权限过滤
    function getAvailableModels() {
        // 管理员可以访问所有模型
        if (window.backendApi && window.backendApi.isAdmin && window.backendApi.isAdmin()) {
            return allModels;
        }
        
        // 普通用户只能访问被允许的模型
        if (userPermissions && userPermissions.allowedModels) {
            return allModels.filter(model => userPermissions.allowedModels.includes(model.id));
        }
        
        // 默认只返回免费模型
        return allModels.filter(model => model.id.includes(':free'));
    }
    
    // 存储用户选择的模型的本地存储键
    const SELECTED_MODEL_KEY = 'selected_model';
    
    // 检查本地存储中的模型选择
    function checkSelectedModel() {
        const savedModel = localStorage.getItem(SELECTED_MODEL_KEY);
        if (savedModel) {
            // 获取可用模型
            const availableModels = getAvailableModels();
            
            // 查找匹配的模型
            const model = availableModels.find(m => m.id === savedModel);
            
            if (model) {
                // 更新显示的模型名称
                currentModelText.textContent = model.name;
                // 更新API中使用的模型
                window.CURRENT_MODEL = savedModel;
            } else {
                // 如果保存的模型不在可用列表中，使用第一个可用模型
                if (availableModels.length > 0) {
                    selectModel(availableModels[0].id, availableModels[0].name);
                }
            }
        } else {
            // 未保存过模型，使用第一个可用模型
            const availableModels = getAvailableModels();
            if (availableModels.length > 0) {
                selectModel(availableModels[0].id, availableModels[0].name);
            }
        }
    }
    
    // 选择模型
    function selectModel(modelId, modelName) {
        // 更新显示的模型名称
        currentModelText.textContent = modelName;
        
        // 更新API中使用的模型
        window.CURRENT_MODEL = modelId;
        
        // 保存到本地存储
        localStorage.setItem(SELECTED_MODEL_KEY, modelId);
        
        console.log(`模型已切换为: ${modelName} (${modelId})`);
    }
    
    // 初始化时加载用户权限
    loadUserPermissions();
    
    // 获取预先创建的下拉菜单
    const modelDropdown = document.getElementById('modelDropdown');
    
    // 添加点击事件到预先创建的菜单项
    if (modelDropdown) {
        const items = modelDropdown.querySelectorAll('li');
        items.forEach(item => {
            const modelId = item.getAttribute('data-model');
            const modelName = item.textContent;
            
            item.addEventListener('click', function() {
                selectModel(modelId, modelName);
                modelDropdown.classList.remove('show');
            });
            
            // 标记当前选中的模型
            if (localStorage.getItem(SELECTED_MODEL_KEY) === modelId) {
                item.classList.add('active');
            }
        });
    }
    
    // 点击模型选择器按钮时显示/隐藏下拉菜单
    modelSelector.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // 使用已有的菜单元素，不再动态创建
        if (modelDropdown) {
            modelDropdown.classList.toggle('show');
        }
    });
    
    // 点击页面其他地方时隐藏下拉菜单
    document.addEventListener('click', function(e) {
        if (modelDropdown && modelSelector && !modelSelector.contains(e.target) && !modelDropdown.contains(e.target)) {
            modelDropdown.classList.remove('show');
        }
    });
}); 