document.addEventListener('DOMContentLoaded', function() {
    const featureMenuBtn = document.getElementById('featureMenuBtn');
    const featureMenu = document.getElementById('featureMenu');
    
    // 调试代码，帮助排除问题
    console.log('FeatureMenu初始化:', {
        featureMenuBtn: !!featureMenuBtn,
        featureMenu: !!featureMenu
    });
    
    // 检查必要元素是否存在
    if (!featureMenuBtn || !featureMenu) {
        console.error('FeatureMenu: 找不到必要的DOM元素');
        return; // 如果必要元素不存在，退出初始化
    }
    
    const featureOptions = featureMenu.querySelectorAll('li');
    console.log(`找到${featureOptions.length}个功能选项`);
    
    // 点击功能菜单按钮时显示/隐藏下拉菜单
    featureMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('功能菜单按钮点击');
        
        // 切换功能菜单显示状态
        if (featureMenu.classList.contains('active')) {
            featureMenu.classList.remove('active');
            console.log('功能菜单状态: 隐藏');
        } else {
            featureMenu.classList.add('active');
            console.log('功能菜单状态: 显示');
        }
        
        // 如果用户菜单是打开的，关闭它
        const userMenu = document.getElementById('userMenu');
        if (userMenu && userMenu.classList.contains('active')) {
            userMenu.classList.remove('active');
        }
    });
    
    // 选择功能选项
    featureOptions.forEach(option => {
        option.addEventListener('click', function() {
            const selectedFeature = this.getAttribute('data-feature');
            
            // 根据所选功能更新输入框提示和处理方式
            switch(selectedFeature) {
                case 'ai-chat':
                    setFeatureMode('通用对话', '您想了解什么?');
                    break;
                case 'content-creation':
                    setFeatureMode('内容创作', '请描述您需要创作的内容主题或类型...');
                    break;
                case 'document-analysis':
                    setFeatureMode('文档分析', '请输入您要分析的文本内容...');
                    break;
                default:
                    resetFeatureMode();
            }
            
            // 隐藏下拉菜单
            featureMenu.classList.remove('active');
        });
    });
    
    // 点击页面其他地方时隐藏下拉菜单
    document.addEventListener('click', function(e) {
        if (featureMenu && featureMenuBtn && !featureMenuBtn.contains(e.target) && !featureMenu.contains(e.target)) {
            featureMenu.classList.remove('active');
        }
    });
    
    // 设置功能模式
    function setFeatureMode(modeName, placeholder) {
        const userInput = document.getElementById('userInput');
        
        // 更新输入框提示
        if (userInput) {
            userInput.placeholder = placeholder;
        }
        
        // 添加活动功能标记到localStorage
        localStorage.setItem('activeFeature', modeName);
        
        // 添加视觉提示 - 可以添加一个小的功能标签在输入框旁边
        updateFeatureIndicator(modeName);
        
        console.log(`功能模式已设置为: ${modeName}`);
    }
    
    // 重置功能模式
    function resetFeatureMode() {
        const userInput = document.getElementById('userInput');
        if (userInput) {
            userInput.placeholder = '您想了解什么?';
        }
        
        localStorage.removeItem('activeFeature');
        updateFeatureIndicator(null);
        
        console.log('功能模式已重置');
    }
    
    // 更新功能指示器
    function updateFeatureIndicator(featureName) {
        // 检查是否已存在功能指示器
        let indicator = document.querySelector('.feature-indicator');
        const inputArea = document.querySelector('.input-area');
        
        // 如果没有指示器并且指定了功能名称，则创建一个
        if (!indicator && featureName) {
            indicator = document.createElement('div');
            indicator.className = 'feature-indicator';
            if (inputArea) {
                inputArea.appendChild(indicator);
            }
        }
        
        // 更新或移除指示器
        if (indicator) {
            if (featureName) {
                indicator.textContent = featureName;
                indicator.style.display = 'block';
            } else {
                indicator.style.display = 'none';
            }
        }
    }
    
    // 初始化时检查是否有活动的功能模式
    const activeFeature = localStorage.getItem('activeFeature');
    if (activeFeature) {
        updateFeatureIndicator(activeFeature);
        
        // 根据活动功能设置适当的占位符
        const userInput = document.getElementById('userInput');
        if (userInput) {
            switch(activeFeature) {
                case '通用对话':
                    userInput.placeholder = '您想了解什么?';
                    break;
                case '内容创作':
                    userInput.placeholder = '请描述您需要创作的内容主题或类型...';
                    break;
                case '文档分析':
                    userInput.placeholder = '请输入您要分析的文本内容...';
                    break;
            }
        }
    }
}); 