document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM完全加载，开始初始化应用');
    // 获取当前时间显示合适的问候语
    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return "早上好";
        if (hour < 18) return "下午好";
        return "晚上好";
    }
    
    // 设置问候语
    const welcomeTitle = document.querySelector('.welcome-message h2');
    if (welcomeTitle) {
        const userName = localStorage.getItem('userName') || 'Kim';
        welcomeTitle.textContent = `${getGreeting()}, ${userName}`;
    }
    
    // 用户菜单交互 - 完全重写
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu = document.getElementById('userMenu');
    
    console.log('用户菜单元素检查:', {
        userMenuBtn: userMenuBtn ? '找到' : '未找到',
        userMenu: userMenu ? '找到' : '未找到',
        userMenuBtnId: userMenuBtn ? userMenuBtn.id : 'N/A',
        userMenuId: userMenu ? userMenu.id : 'N/A'
    });
    
    if (userMenuBtn && userMenu) {
        console.log('正在初始化用户菜单按钮事件处理...');
        
        // 取消所有现有的事件处理器，防止重复绑定
        userMenuBtn.removeEventListener('click', userMenuClickHandler);
        
        // 注册单一点击事件处理器
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            console.log('用户菜单按钮被点击');
            
            // 关闭功能菜单
            const featureMenu = document.getElementById('featureMenu');
            if (featureMenu && featureMenu.classList.contains('active')) {
                featureMenu.classList.remove('active');
            }
            
            // 简单地切换active类
            if (userMenu.classList.contains('active')) {
                userMenu.classList.remove('active');
                console.log('用户菜单状态: 隐藏');
            } else {
                userMenu.classList.add('active');
                console.log('用户菜单状态: 显示');
            }
        });
        
        // 点击外部关闭菜单
        document.addEventListener('click', function(e) {
            if (userMenu.classList.contains('active') && !userMenuBtn.contains(e.target) && !userMenu.contains(e.target)) {
                userMenu.classList.remove('active');
                console.log('用户菜单已通过外部点击关闭');
            }
        });
        
        console.log('用户菜单按钮事件初始化完成');
    } else {
        console.error('找不到用户菜单元素', { 按钮: userMenuBtn, 菜单: userMenu });
    }
    
    // 功能菜单交互
    const featureMenuBtn = document.getElementById('featureMenuBtn');
    const featureMenu = document.getElementById('featureMenu');
    
    if (featureMenuBtn && featureMenu) {
        console.log('功能菜单按钮已注册事件');
        featureMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            featureMenu.classList.toggle('active');
            console.log('功能菜单状态:', featureMenu.classList.contains('active') ? '显示' : '隐藏');
        });
        
        // 点击外部关闭菜单
        document.addEventListener('click', (e) => {
            if (featureMenu.classList.contains('active') && !featureMenuBtn.contains(e.target) && !featureMenu.contains(e.target)) {
                featureMenu.classList.remove('active');
                console.log('功能菜单已关闭');
            }
        });
    } else {
        console.error('找不到功能菜单元素', { 按钮: featureMenuBtn, 菜单: featureMenu });
    }
    
    // 输入框焦点效果
    const userInput = document.getElementById('userInput');
    const inputWrapper = document.querySelector('.input-wrapper');
    
    userInput.addEventListener('focus', () => {
        inputWrapper.classList.add('focus');
    });
    
    userInput.addEventListener('blur', () => {
        inputWrapper.classList.remove('focus');
    });
    
    // 键盘快捷键：按Enter发送消息
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            // 修改为使用sendButton而不是sendBtn
            const sendButton = document.getElementById('sendButton');
            if (sendButton) {
                sendButton.click();
            }
        }
    });
    
    // 根据输入内容启用/禁用发送按钮
    userInput.addEventListener('input', () => {
        const sendBtn = document.getElementById('sendBtn');
        const sendButton = document.getElementById('sendButton');
        
        if (userInput.value.trim()) {
            if (sendBtn) sendBtn.removeAttribute('disabled');
            if (sendButton) sendButton.removeAttribute('disabled');
        } else {
            if (sendBtn) sendBtn.setAttribute('disabled', true);
            if (sendButton) sendButton.setAttribute('disabled', true);
        }
    });
}); 