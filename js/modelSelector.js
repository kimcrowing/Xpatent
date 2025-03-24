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
            
            item.addEventListener('click', function(e) {
                // 阻止事件冒泡，防止触发dropdown的toggle事件
                e.stopPropagation();
                
                selectModel(modelId, modelName);
                // 强制隐藏下拉菜单
                modelDropdown.classList.remove('show');
                modelDropdown.style.display = 'none';
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
            
            // 计算位置，确保下拉菜单紧贴按钮
            const rect = modelSelector.getBoundingClientRect();
            const dropdownWidth = 180; // 菜单宽度与CSS中保持一致
            
            // 获取下拉菜单的高度（先显示它才能获取高度）
            modelDropdown.style.visibility = 'hidden';
            modelDropdown.style.display = 'block';
            const dropdownHeight = modelDropdown.offsetHeight;
            
            // 设置为固定定位，相对于视口
            modelDropdown.style.position = 'fixed';
            
            // 检查是否会超出底部边界
            const spaceBelow = window.innerHeight - rect.bottom - 5;
            const spaceAbove = rect.top - 5;
            
            // 垂直位置：优先显示在按钮下方，如果下方空间不足则显示在按钮上方
            if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                // 上方显示
                modelDropdown.style.top = `${rect.top - dropdownHeight - 5}px`;
            } else {
                // 下方显示（默认）或者上方空间也不足时强制下方显示
                modelDropdown.style.top = `${rect.bottom + 5}px`;
            }
            
            // 水平位置：优先保持右对齐，但确保不超出左侧边界
            const rightPosition = window.innerWidth - rect.right;
            // 如果右对齐会导致超出左侧边界，则使用左对齐
            if (rect.right - dropdownWidth < 0) {
                modelDropdown.style.left = `${rect.left}px`;
                modelDropdown.style.right = 'auto';
            } else {
                modelDropdown.style.right = `${rightPosition}px`;
                modelDropdown.style.left = 'auto';
            }
            
            // 恢复可见性
            modelDropdown.style.visibility = 'visible';
        }
    });
    
    // 点击页面其他地方时隐藏下拉菜单
    document.addEventListener('click', function(e) {
        if (modelDropdown && modelSelector && !modelSelector.contains(e.target) && !modelDropdown.contains(e.target)) {
            modelDropdown.classList.remove('show');
        }
    });
}); 