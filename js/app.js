document.addEventListener('DOMContentLoaded', () => {
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
    
    // 用户菜单交互
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu = document.getElementById('userMenu');
    
    if (userMenuBtn && userMenu) {
        console.log('用户菜单按钮已注册事件');
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('active');
            console.log('用户菜单状态:', userMenu.classList.contains('active') ? '显示' : '隐藏');
        });
        
        // 点击外部关闭菜单
        document.addEventListener('click', (e) => {
            if (userMenu.classList.contains('active') && !userMenuBtn.contains(e.target) && !userMenu.contains(e.target)) {
                userMenu.classList.remove('active');
                console.log('用户菜单已关闭');
            }
        });
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