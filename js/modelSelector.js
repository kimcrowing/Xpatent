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
    const models = [
        { id: 'deepseek/deepseek-r1:free', name: 'Deepseek' },
        { id: 'anthropic/claude-3-opus:beta', name: 'Claude 3 Opus' },
        { id: 'anthropic/claude-3-sonnet:beta', name: 'Claude 3 Sonnet' },
        { id: 'anthropic/claude-3-haiku:beta', name: 'Claude 3 Haiku' },
        { id: 'google/gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro' },
        { id: 'google/gemini-2.0-flash-thinking-exp:free', name: 'Gemini 2.0 Flash' },
        { id: 'meta-llama/llama-3-70b-instruct:free', name: 'Llama 3 70B' },
        { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B' }
    ];
    
    // 存储用户选择的模型的本地存储键
    const SELECTED_MODEL_KEY = 'selected_model';
    
    // 动态创建模型下拉菜单
    function createModelDropdown() {
        // 检查是否已存在下拉菜单
        let modelDropdown = document.getElementById('modelDropdown');
        
        if (!modelDropdown) {
            modelDropdown = document.createElement('div');
            modelDropdown.id = 'modelDropdown';
            modelDropdown.className = 'model-dropdown';
            
            const modelList = document.createElement('ul');
            
            models.forEach(model => {
                const modelItem = document.createElement('li');
                modelItem.setAttribute('data-model', model.id);
                modelItem.textContent = model.name;
                
                // 如果是当前选择的模型，添加active类
                if (window.CURRENT_MODEL === model.id) {
                    modelItem.classList.add('active');
                }
                
                modelItem.addEventListener('click', function() {
                    selectModel(model.id, model.name);
                    modelDropdown.classList.remove('show');
                });
                
                modelList.appendChild(modelItem);
            });
            
            modelDropdown.appendChild(modelList);
            document.body.appendChild(modelDropdown);
        }
        
        return modelDropdown;
    }
    
    // 检查本地存储中的模型选择
    function checkSelectedModel() {
        const savedModel = localStorage.getItem(SELECTED_MODEL_KEY);
        if (savedModel) {
            // 查找匹配的模型
            const model = models.find(m => m.id === savedModel);
            
            if (model) {
                // 更新显示的模型名称
                currentModelText.textContent = model.name;
                // 更新API中使用的模型
                window.CURRENT_MODEL = savedModel;
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
    
    // 初始化时检查
    checkSelectedModel();
    
    // 点击模型选择器按钮时显示/隐藏下拉菜单
    modelSelector.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const modelDropdown = createModelDropdown();
        
        // 计算下拉菜单位置
        const rect = modelSelector.getBoundingClientRect();
        modelDropdown.style.bottom = `${window.innerHeight - rect.top + 10}px`;
        modelDropdown.style.right = `${window.innerWidth - rect.right}px`;
        
        modelDropdown.classList.toggle('show');
    });
    
    // 点击页面其他地方时隐藏下拉菜单
    document.addEventListener('click', function(e) {
        const modelDropdown = document.getElementById('modelDropdown');
        if (modelDropdown && modelSelector && !modelSelector.contains(e.target) && !modelDropdown.contains(e.target)) {
            modelDropdown.classList.remove('show');
        }
    });
}); 