document.addEventListener('DOMContentLoaded', function() {
    // 使用订阅按钮替代原来的功能菜单按钮
    const proSubscriptionBtn = document.getElementById('proSubscriptionBtn');
    
    // 调试代码，帮助排除问题
    console.log('功能/订阅按钮初始化:', {
        proSubscriptionBtn: !!proSubscriptionBtn
    });
    
    // 检查订阅按钮是否存在
    if (!proSubscriptionBtn) {
        console.warn('订阅按钮未找到，可能界面已更新');
        return; // 如果订阅按钮不存在，退出初始化
    }
    
    // 给订阅按钮添加点击事件
    proSubscriptionBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        console.log('订阅按钮点击');
        
        // 关闭用户菜单
        const userMenu = document.getElementById('userMenu');
        if (userMenu && userMenu.classList.contains('active')) {
            userMenu.classList.remove('active');
        }
        
        // 重定向到订阅页面
        window.location.href = 'subscriptions.html';
    });
    
    // 保留一些原有功能，如果需要的话
    const userInput = document.getElementById('userInput');
    if (userInput) {
        // 默认设置输入框提示为通用对话
        setDefaultPlaceholder();
    }
    
    // 设置默认输入框提示
    function setDefaultPlaceholder() {
        if (userInput) {
            userInput.placeholder = '您想了解什么?';
        }
    }
    
    // 从本地存储恢复之前的活动模式
    const activeFeature = localStorage.getItem('activeFeature');
    if (activeFeature && userInput) {
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
        
        // 显示活动功能指示器
        updateFeatureIndicator(activeFeature);
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
}); 