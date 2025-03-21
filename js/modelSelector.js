document.addEventListener('DOMContentLoaded', function() {
    const modelSelectorBtn = document.getElementById('modelSelectorBtn');
    const modelDropdown = document.getElementById('modelDropdown');
    const currentModelText = document.getElementById('currentModel');
    const modelOptions = document.querySelectorAll('#modelDropdown li');
    
    // 存储用户选择的模型的本地存储键
    const SELECTED_MODEL_KEY = 'selected_model';
    
    // 检查本地存储中的模型选择
    function checkSelectedModel() {
        const savedModel = localStorage.getItem(SELECTED_MODEL_KEY);
        if (savedModel) {
            // 查找匹配的模型选项
            const modelOption = Array.from(modelOptions).find(option => 
                option.getAttribute('data-model') === savedModel
            );
            
            if (modelOption) {
                // 移除之前的活动状态
                modelOptions.forEach(option => option.classList.remove('active'));
                // 设置新的活动状态
                modelOption.classList.add('active');
                // 更新显示的模型名称
                currentModelText.textContent = modelOption.textContent;
                // 更新API中使用的模型
                window.CURRENT_MODEL = savedModel;
            }
        }
    }
    
    // 初始化时检查
    checkSelectedModel();
    
    // 点击模型选择器按钮时显示/隐藏下拉菜单
    modelSelectorBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        modelDropdown.classList.toggle('show');
    });
    
    // 选择模型选项
    modelOptions.forEach(option => {
        option.addEventListener('click', function() {
            const selectedModel = this.getAttribute('data-model');
            const modelName = this.textContent;
            
            // 移除之前的活动状态
            modelOptions.forEach(opt => opt.classList.remove('active'));
            // 设置新的活动状态
            this.classList.add('active');
            
            // 更新显示的模型名称
            currentModelText.textContent = modelName;
            
            // 更新API中使用的模型
            window.CURRENT_MODEL = selectedModel;
            
            // 保存到本地存储
            localStorage.setItem(SELECTED_MODEL_KEY, selectedModel);
            
            // 隐藏下拉菜单
            modelDropdown.classList.remove('show');
        });
    });
    
    // 点击页面其他地方时隐藏下拉菜单
    document.addEventListener('click', function(e) {
        if (!modelSelectorBtn.contains(e.target) && !modelDropdown.contains(e.target)) {
            modelDropdown.classList.remove('show');
        }
    });
}); 