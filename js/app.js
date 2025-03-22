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
    
    // 检查用户登录状态并更新UI
    function updateUserLoginState() {
        const userInfo = window.backendApi.getUserInfo();
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const adminEntry = document.getElementById('admin-entry');
        
        if (userInfo) {
            // 用户已登录
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'list-item';
            
            // 更新欢迎信息
            if (welcomeTitle && userInfo.username) {
                welcomeTitle.textContent = `${getGreeting()}, ${userInfo.username}`;
            }
            
            // 如果是管理员，显示管理入口
            if (adminEntry && window.backendApi.isAdmin()) {
                adminEntry.style.display = 'list-item';
            }
        } else {
            // 用户未登录
            if (loginBtn) loginBtn.style.display = 'list-item';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (adminEntry) adminEntry.style.display = 'none';
        }
    }
    
    // 初始检查登录状态
    updateUserLoginState();
    
    // 处理登录点击事件
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            // 弹出简单的登录表单
            const email = prompt('请输入邮箱地址:', 'admin@example.com');
            if (!email) return;
            
            const password = prompt('请输入密码:', 'admin123');
            if (!password) return;
            
            // 调用登录API
            window.backendApi.login(email, password)
                .then(response => {
                    alert('登录成功！');
                    updateUserLoginState();
                    // 关闭菜单
                    const userMenu = document.getElementById('userMenu');
                    if (userMenu) userMenu.classList.remove('active');
                })
                .catch(error => {
                    alert('登录失败: ' + error.message);
                });
        });
    }
    
    // 处理退出点击事件
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.backendApi.clearAuth();
            alert('已退出登录');
            updateUserLoginState();
            // 关闭菜单
            const userMenu = document.getElementById('userMenu');
            if (userMenu) userMenu.classList.remove('active');
        });
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