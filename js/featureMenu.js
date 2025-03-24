document.addEventListener('DOMContentLoaded', function() {
    // 使用订阅菜单项替代不存在的订阅按钮
    const subscriptionMenuItem = document.getElementById('subscription-menu-item');
    
    // 调试代码，帮助排除问题
    console.log('功能/订阅按钮初始化:', {
        subscriptionMenuItem: !!subscriptionMenuItem
    });
    
    // 检查订阅菜单项是否存在
    if (!subscriptionMenuItem) {
        console.warn('订阅菜单项未找到，可能界面已更新');
        // 不需要立即退出，因为其他功能还可以继续执行
        // 只是订阅相关功能无法使用
    } else {
        // 给订阅菜单项添加点击事件（如果需要额外处理）
        // 注意：菜单项内部已经有链接，可能不需要再添加点击事件
        // 但如果需要额外的处理逻辑，可以添加
        subscriptionMenuItem.addEventListener('click', function(e) {
            console.log('订阅菜单项点击');
            // 这里不需要阻止事件传播，因为我们希望链接正常工作
            // 不需要重定向，因为a标签已经有链接
        });
    }
    
    // 保留原有功能
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