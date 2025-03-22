document.addEventListener('DOMContentLoaded', function() {
    // 初始化UI元素引用
    const loginPage = document.getElementById('loginPage');
    const registerPage = document.getElementById('registerPage');
    const appContent = document.getElementById('appContent');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const featureMenuBtn = document.getElementById('featureMenuBtn');
    const userMenu = document.getElementById('userMenu');
    const logoutBtn = document.getElementById('logoutBtn');

    // 初始化应用状态
    let currentUser = null;
    
    // 检查用户登录状态
    function checkAuthStatus() {
        const token = localStorage.getItem(TOKEN_KEY); // 使用backend-api.js中定义的常量
        
        if (token) {
            try {
                // 验证token有效性
                if (window.backendApi && typeof window.backendApi.validateToken === 'function') {
                    window.backendApi.validateToken(token)
                        .then(isValid => {
                            if (isValid) {
                                loadUserProfile();
                                showAppContent();
                            } else {
                                // Token无效，清除并显示登录页面
                                window.backendApi.clearAuth();
                                showLoginPage();
                            }
                        })
                        .catch(err => {
                            console.error('验证token时出错:', err);
                            showLoginPage();
                        });
                } else {
                    // 如果validateToken函数不可用，尝试使用用户信息判断
                    const userInfo = window.backendApi.getUserInfo();
                    if (userInfo) {
                        currentUser = userInfo;
                        updateUserUI(userInfo);
                        showAppContent();
                    } else {
                        showLoginPage();
                    }
                }
            } catch (error) {
                console.error('检查认证状态时出错:', error);
                showLoginPage();
            }
        } else {
            // 无token，显示登录页面
            showLoginPage();
        }
    }
    
    // 加载用户个人资料
    function loadUserProfile() {
        try {
            // 从本地存储获取用户信息
            const userInfo = window.backendApi.getUserInfo();
            if (userInfo) {
                currentUser = userInfo;
                updateUserUI(userInfo);
                
                // 如果是管理员，显示管理后台入口
                if (window.backendApi.isAdmin()) {
                    // 管理后台入口逻辑
                    const adminEntry = document.getElementById('admin-entry');
                    if (adminEntry) {
                        adminEntry.style.display = 'block';
                    }
                }
            }
        } catch (error) {
            console.error('加载用户资料时出错:', error);
        }
    }
    
    // 更新用户界面元素
    function updateUserUI(profile) {
        // 设置用户头像显示
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar && profile.username) {
            const initials = profile.username
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
            userAvatar.textContent = initials;
        }
    }
    
    // 显示登录页面
    function showLoginPage() {
        if (loginPage) loginPage.style.display = 'flex';
        if (registerPage) registerPage.style.display = 'none';
        if (appContent) appContent.style.display = 'none';
    }
    
    // 显示注册页面
    function showRegisterPage() {
        if (loginPage) loginPage.style.display = 'none';
        if (registerPage) registerPage.style.display = 'flex';
        if (appContent) appContent.style.display = 'none';
    }
    
    // 显示主应用内容
    function showAppContent() {
        if (loginPage) loginPage.style.display = 'none';
        if (registerPage) registerPage.style.display = 'none';
        if (appContent) appContent.style.display = 'flex';
    }
    
    // 处理登录
    function handleLogin(email, password) {
        if (loginError) loginError.textContent = '';
        
        // 检查backendApi对象是否存在且有login方法
        if (window.backendApi && typeof window.backendApi.login === 'function') {
            window.backendApi.login(email, password)
                .then(result => {
                    if (result.token || result.success) {
                        loadUserProfile();
                        showAppContent();
                    } else {
                        if (loginError) loginError.textContent = '登录失败：' + (result.message || '未知错误');
                    }
                })
                .catch(err => {
                    if (loginError) loginError.textContent = '登录失败：' + (err.message || '服务器错误');
                });
        } else {
            if (loginError) loginError.textContent = '登录功能不可用，请联系管理员';
        }
    }
    
    // 处理注册
    function handleRegister(username, email, password) {
        if (registerError) registerError.textContent = '';
        
        const confirmPassword = document.getElementById('registerPasswordConfirm')?.value;
        if (password !== confirmPassword) {
            if (registerError) registerError.textContent = '两次密码输入不一致';
            return;
        }
        
        // 检查backendApi对象是否存在且有register方法
        if (window.backendApi && typeof window.backendApi.register === 'function') {
            window.backendApi.register(username, email, password)
                .then(result => {
                    if (result.success) {
                        // 注册成功后自动登录
                        handleLogin(email, password);
                    } else {
                        if (registerError) registerError.textContent = '注册失败：' + (result.message || '未知错误');
                    }
                })
                .catch(err => {
                    if (registerError) registerError.textContent = '注册失败：' + (err.message || '服务器错误');
                });
        } else {
            if (registerError) registerError.textContent = '注册功能不可用，请联系管理员';
        }
    }
    
    // 处理退出登录
    function handleLogout() {
        if (window.backendApi && typeof window.backendApi.clearAuth === 'function') {
            window.backendApi.clearAuth();
        } else {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_INFO_KEY);
        }
        currentUser = null;
        showLoginPage();
    }
    
    // 绑定事件监听器
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail')?.value || '';
            const password = document.getElementById('loginPassword')?.value || '';
            handleLogin(email, password);
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('registerUsername')?.value || '';
            const email = document.getElementById('registerEmail')?.value || '';
            const password = document.getElementById('registerPassword')?.value || '';
            handleRegister(username, email, password);
        });
    }
    
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showRegisterPage();
        });
    }
    
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginPage();
        });
    }
    
    // 添加用户菜单点击事件处理
    if (userMenuBtn && userMenu) {
        userMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // 切换用户菜单显示状态
            if (userMenu.style.display === 'block') {
                userMenu.style.display = 'none';
            } else {
                userMenu.style.display = 'block';
            }
        });
        
        // 点击页面其他区域关闭菜单
        document.addEventListener('click', function(e) {
            if (!userMenuBtn.contains(e.target) && !userMenu.contains(e.target)) {
                userMenu.style.display = 'none';
            }
        });
    }
    
    // 绑定退出登录按钮
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            handleLogout();
            // 关闭用户菜单
            if (userMenu) userMenu.style.display = 'none';
        });
    }
    
    // 需要确保backend-api.js已加载完毕
    if (window.backendApi) {
        // 初始化应用
        checkAuthStatus();
    } else {
        // 如果backend-api.js尚未加载完毕，等待一段时间后重试
        console.log('等待backendApi初始化...');
        setTimeout(() => {
            if (window.backendApi) {
                checkAuthStatus();
            } else {
                console.error('backendApi未加载，默认显示登录页面');
                showLoginPage();
            }
        }, 500);
    }
}); 