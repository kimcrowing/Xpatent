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
    
    // 用户菜单交互
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu = document.getElementById('userMenu');
    
    console.log('用户菜单元素检查:', {
        userMenuBtn: userMenuBtn ? '找到' : '未找到',
        userMenu: userMenu ? '找到' : '未找到',
        userMenuBtnId: userMenuBtn ? userMenuBtn.id : 'N/A',
        userMenuId: userMenu ? userMenu.id : 'N/A'
    });
    
    if (userMenuBtn && userMenu) {
        console.log('用户菜单按钮已注册事件');
        
        // 检查按钮是否正确设置了样式和内容
        console.log('用户菜单按钮属性:', {
            classes: userMenuBtn.className,
            内容: userMenuBtn.innerHTML,
            可见性: window.getComputedStyle(userMenuBtn).display
        });
        
        // 检查菜单初始状态
        console.log('用户菜单初始样式:', {
            classes: userMenu.className,
            display: window.getComputedStyle(userMenu).display,
            visibility: window.getComputedStyle(userMenu).visibility,
            opacity: window.getComputedStyle(userMenu).opacity,
            position: window.getComputedStyle(userMenu).position
        });
        
        userMenuBtn.addEventListener('click', (e) => {
            console.log('用户菜单按钮被点击', e.target);
            e.stopPropagation();
            // 强制确保其他菜单已关闭
            const featureMenu = document.getElementById('featureMenu');
            if (featureMenu && featureMenu.classList.contains('active')) {
                featureMenu.classList.remove('active');
            }
            
            // 直接设置显示状态，不使用toggle
            if (userMenu.classList.contains('active')) {
                userMenu.classList.remove('active');
                console.log('用户菜单状态: 隐藏');
            } else {
                userMenu.classList.add('active');
                console.log('用户菜单状态: 显示');
                // 强制触发重绘
                userMenu.style.display = 'block';
                setTimeout(() => {
                    userMenu.style.removeProperty('display');
                }, 10);
            }
        });
        
        // 点击外部关闭菜单
        document.addEventListener('click', (e) => {
            if (userMenu.classList.contains('active') && !userMenuBtn.contains(e.target) && !userMenu.contains(e.target)) {
                userMenu.classList.remove('active');
                console.log('用户菜单已关闭');
            }
        });
        
        // 添加菜单修复功能 - 在页面加载后短暂延迟执行
        setTimeout(() => {
            fixUserMenu();
        }, 500);
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

// 用户菜单修复函数
function fixUserMenu() {
    console.log('尝试修复用户菜单显示问题');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu = document.getElementById('userMenu');
    
    if (!userMenuBtn || !userMenu) {
        console.error('修复失败：找不到用户菜单元素');
        return;
    }
    
    // 确保CSS样式正确应用
    const style = document.createElement('style');
    style.textContent = `
        .user-menu {
            display: none !important;
            opacity: 0;
            visibility: hidden;
        }
        .user-menu.active {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
        }
    `;
    document.head.appendChild(style);
    
    // 重新绑定点击事件，确保事件触发时正确显示菜单
    userMenuBtn.removeEventListener('click', userMenuClickHandler);
    userMenuBtn.addEventListener('click', userMenuClickHandler);
    
    console.log('用户菜单修复完成');
}

// 独立的点击处理函数，便于重新绑定
function userMenuClickHandler(e) {
    e.stopPropagation();
    e.preventDefault();
    
    const userMenu = document.getElementById('userMenu');
    if (!userMenu) return;
    
    console.log('用户菜单点击处理器被调用');
    
    // 隐藏其他可能打开的菜单
    const featureMenu = document.getElementById('featureMenu');
    if (featureMenu && featureMenu.classList.contains('active')) {
        featureMenu.classList.remove('active');
    }
    
    // 切换菜单显示状态
    if (userMenu.classList.contains('active')) {
        userMenu.classList.remove('active');
        console.log('用户菜单已隐藏');
    } else {
        userMenu.classList.add('active');
        // 强制设置display属性确保显示，但不在隐藏时设置display:none，让CSS控制
        if (!userMenu.style.display || userMenu.style.display === 'none') {
            userMenu.style.display = 'block';
        }
        console.log('用户菜单已显示');
    }
} 