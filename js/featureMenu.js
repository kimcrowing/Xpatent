document.addEventListener('DOMContentLoaded', function() {
    const featureMenuBtn = document.getElementById('featureMenuBtn');
    const featureMenu = document.getElementById('featureMenu');
    const featureOptions = document.querySelectorAll('#featureMenu li');
    
    // 点击功能菜单按钮时显示/隐藏下拉菜单
    featureMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        featureMenu.classList.toggle('active');
        
        // 如果用户菜单是打开的，关闭它
        const userMenu = document.getElementById('userMenu');
        if (userMenu.classList.contains('active')) {
            userMenu.classList.remove('active');
        }
    });
    
    // 选择功能选项
    featureOptions.forEach(option => {
        option.addEventListener('click', function() {
            const selectedFeature = this.getAttribute('data-feature');
            
            // 根据所选功能更新输入框提示和处理方式
            switch(selectedFeature) {
                case 'patent-search':
                    setFeatureMode('专利查新', '请输入您想查询的技术领域或关键词...');
                    break;
                case 'patent-writing':
                    setFeatureMode('专利撰写', '请描述您的发明创造，我将帮助撰写专利...');
                    break;
                case 'patent-response':
                    setFeatureMode('专利答审', '请粘贴审查意见通知书内容，我将协助回复...');
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
        if (!featureMenuBtn.contains(e.target) && !featureMenu.contains(e.target)) {
            featureMenu.classList.remove('active');
        }
    });
    
    // 设置功能模式
    function setFeatureMode(modeName, placeholder) {
        const userInput = document.getElementById('userInput');
        
        // 更新输入框提示
        userInput.placeholder = placeholder;
        
        // 添加活动功能标记到localStorage
        localStorage.setItem('activeFeature', modeName);
        
        // 添加视觉提示 - 可以添加一个小的功能标签在输入框旁边
        updateFeatureIndicator(modeName);
    }
    
    // 重置功能模式
    function resetFeatureMode() {
        const userInput = document.getElementById('userInput');
        userInput.placeholder = '您想了解什么?';
        localStorage.removeItem('activeFeature');
        updateFeatureIndicator(null);
    }
    
    // 更新功能指示器
    function updateFeatureIndicator(featureName) {
        // 检查是否已存在功能指示器
        let indicator = document.querySelector('.feature-indicator');
        
        // 如果没有指示器并且指定了功能名称，则创建一个
        if (!indicator && featureName) {
            indicator = document.createElement('div');
            indicator.className = 'feature-indicator';
            document.querySelector('.input-wrapper').appendChild(indicator);
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
        switch(activeFeature) {
            case '专利查新':
                document.getElementById('userInput').placeholder = '请输入您想查询的技术领域或关键词...';
                break;
            case '专利撰写':
                document.getElementById('userInput').placeholder = '请描述您的发明创造，我将帮助撰写专利...';
                break;
            case '专利答审':
                document.getElementById('userInput').placeholder = '请粘贴审查意见通知书内容，我将协助回复...';
                break;
        }
    }
}); 