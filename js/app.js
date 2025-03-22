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
        updateWelcomeMessage();
    }
    
    // DOM元素
    const appContent = document.getElementById('appContent');
    const loginPage = document.getElementById('loginPage');
    const registerPage = document.getElementById('registerPage');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const getStartedBtn = document.getElementById('getStartedBtn');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminEntry = document.getElementById('admin-entry');
    
    // 检查用户登录状态并更新UI
    function updateUserLoginState() {
        const userInfo = window.backendApi.getUserInfo();
        
        if (userInfo) {
            // 用户已登录
            appContent.style.display = 'block';
            loginPage.style.display = 'none';
            registerPage.style.display = 'none';
            
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'block';
            
            // 更新欢迎信息
            updateWelcomeMessage();
            
            // 如果是管理员，显示管理入口
            if (adminEntry && window.backendApi.isAdmin()) {
                adminEntry.style.display = 'block';
            }
        } else {
            // 用户未登录，显示登录页面
            appContent.style.display = 'none';
            loginPage.style.display = 'flex';
            registerPage.style.display = 'none';
            
            if (loginForm) loginForm.reset();
            if (registerForm) registerForm.reset();
            if (loginError) loginError.textContent = '';
            if (registerError) registerError.textContent = '';
        }
    }
    
    // 更新欢迎信息
    function updateWelcomeMessage() {
        if (!welcomeTitle) return;
        
        const userInfo = window.backendApi.getUserInfo();
        const userName = userInfo ? userInfo.username : (localStorage.getItem('userName') || '访客');
        welcomeTitle.textContent = `${getGreeting()}, ${userName}`;
    }
    
    // 初始检查登录状态
    updateUserLoginState();
    
    // 绑定登录表单提交事件
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            if (!email || !password) {
                loginError.textContent = '请输入邮箱和密码';
                return;
            }
            
            try {
                loginError.textContent = '';
                
                // 调用登录API
                await window.backendApi.login(email, password);
                updateUserLoginState();
            } catch (error) {
                console.error('登录失败:', error);
                loginError.textContent = error.message || '登录失败，请检查邮箱和密码';
            }
        });
    }
    
    // 绑定注册表单提交事件
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('registerUsername').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
            
            // 表单验证
            if (!username || !email || !password) {
                registerError.textContent = '请填写所有必填字段';
                return;
            }
            
            if (password !== passwordConfirm) {
                registerError.textContent = '两次输入的密码不一致';
                return;
            }
            
            try {
                registerError.textContent = '';
                
                // 调用注册API
                await window.backendApi.register(username, email, password);
                
                // 注册成功后自动登录
                await window.backendApi.login(email, password);
                
                // 更新界面
                updateUserLoginState();
            } catch (error) {
                console.error('注册失败:', error);
                registerError.textContent = error.message || '注册失败，请稍后再试';
            }
        });
    }
    
    // 显示登录页面
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginPage.style.display = 'flex';
            registerPage.style.display = 'none';
        });
    }
    
    // 显示注册页面
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginPage.style.display = 'none';
            registerPage.style.display = 'flex';
        });
    }
    
    // 处理"开始免费试用"按钮
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            const userInfo = window.backendApi.getUserInfo();
            if (!userInfo) {
                // 未登录，显示注册页面
                appContent.style.display = 'none';
                loginPage.style.display = 'none';
                registerPage.style.display = 'flex';
            } else {
                // 已登录，直接进入应用
                window.location.href = 'app.html';
            }
        });
    }
    
    // 处理用户菜单中的登录点击事件
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            appContent.style.display = 'none';
            loginPage.style.display = 'flex';
            registerPage.style.display = 'none';
            
            // 关闭菜单
            const userMenu = document.getElementById('userMenu');
            if (userMenu) userMenu.classList.remove('active');
        });
    }
    
    // 处理退出点击事件
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.backendApi.clearAuth();
            updateUserLoginState();
            
            // 关闭菜单
            const userMenu = document.getElementById('userMenu');
            if (userMenu) userMenu.classList.remove('active');
        });
    }
    
    // 用户菜单交互
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu = document.getElementById('userMenu');
    
    if (userMenuBtn && userMenu) {
        userMenuBtn.addEventListener('click', () => {
            userMenu.classList.toggle('active');
        });
        
        // 点击外部区域关闭菜单
        document.addEventListener('click', (e) => {
            if (!userMenuBtn.contains(e.target) && !userMenu.contains(e.target)) {
                userMenu.classList.remove('active');
            }
        });
    }
}); 