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
            // 显示登录模态窗口
            const loginModalContainer = document.getElementById('loginModalContainer');
            loginModalContainer.style.display = 'flex';
            
            // 清空表单内容和错误信息
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
            document.getElementById('loginError').style.display = 'none';
            
            // 关闭用户菜单
            const userMenu = document.getElementById('userMenu');
            if (userMenu) userMenu.classList.remove('active');
        });
    }
    
    // 处理退出点击事件
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.backendApi.clearAuth();
            // 更新状态
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
    
    // 添加登录模态窗口相关事件处理
    const loginModalContainer = document.getElementById('loginModalContainer');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const cancelLogin = document.getElementById('cancelLogin');
    const confirmLogin = document.getElementById('confirmLogin');
    const loginModalForm = document.getElementById('loginModalForm');
    const loginError = document.getElementById('loginError');
    
    // 关闭登录模态窗口函数
    function closeLoginModalWindow() {
        loginModalContainer.style.display = 'none';
    }
    
    // 关闭按钮点击事件
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', closeLoginModalWindow);
    }
    
    // 取消按钮点击事件
    if (cancelLogin) {
        cancelLogin.addEventListener('click', closeLoginModalWindow);
    }
    
    // 点击模态窗口外部关闭
    if (loginModalContainer) {
        loginModalContainer.querySelector('.modal-overlay').addEventListener('click', closeLoginModalWindow);
    }
    
    // 登录确认按钮点击事件
    if (confirmLogin) {
        confirmLogin.addEventListener('click', handleLogin);
    }
    
    // 表单回车提交
    if (loginModalForm) {
        loginModalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // 处理登录逻辑
    function handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            loginError.textContent = '请输入邮箱和密码';
            loginError.style.display = 'block';
            return;
        }
        
        try {
            window.backendApi.login(email, password)
                .then(() => {
                    closeLoginModalWindow();
                    updateUserLoginState();
                    // 登录成功后刷新页面，以初始化聊天界面
                    window.location.reload();
                })
                .catch(error => {
                    loginError.textContent = '登录失败: ' + (error.message || '请检查邮箱和密码');
                    loginError.style.display = 'block';
                });
        } catch (error) {
            console.error('登录处理错误:', error);
        }
    }
    
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
    
    // Pro订阅按钮交互
    const proSubscriptionBtn = document.getElementById('proSubscriptionBtn');
    
    if (proSubscriptionBtn) {
        console.log('Pro订阅按钮已注册事件');
        proSubscriptionBtn.addEventListener('click', () => {
            window.location.href = 'subscriptions.html';
            console.log('跳转到订阅页面');
        });
    } else {
        console.error('找不到Pro订阅按钮');
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