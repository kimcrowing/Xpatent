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

    // 初始化应用状态
    let currentUser = null;
    
    // 检查用户登录状态
    function checkAuthStatus() {
        const token = localStorage.getItem('jwt_token');
        
        if (token) {
            // 验证token有效性
            backendApi.validateToken(token)
                .then(isValid => {
                    if (isValid) {
                        loadUserProfile();
                        showAppContent();
                    } else {
                        // Token无效，清除并显示登录页面
                        localStorage.removeItem('jwt_token');
                        showLoginPage();
                    }
                })
                .catch(err => {
                    console.error('验证token时出错:', err);
                    showLoginPage();
                });
        } else {
            // 无token，显示登录页面
            showLoginPage();
        }
    }
    
    // 加载用户个人资料
    function loadUserProfile() {
        const token = localStorage.getItem('jwt_token');
        
        if (token) {
            backendApi.getUserProfile()
                .then(profile => {
                    currentUser = profile;
                    updateUserUI(profile);
                    
                    // 如果是管理员，显示管理后台入口
                    if (profile.isAdmin) {
                        // 管理后台入口逻辑
                    }
                })
                .catch(err => {
                    console.error('加载用户资料时出错:', err);
                });
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
        loginPage.style.display = 'flex';
        registerPage.style.display = 'none';
        appContent.style.display = 'none';
    }
    
    // 显示注册页面
    function showRegisterPage() {
        loginPage.style.display = 'none';
        registerPage.style.display = 'flex';
        appContent.style.display = 'none';
    }
    
    // 显示主应用内容
    function showAppContent() {
        loginPage.style.display = 'none';
        registerPage.style.display = 'none';
        appContent.style.display = 'flex';
    }
    
    // 处理登录
    function handleLogin(email, password) {
        loginError.textContent = '';
        
        backendApi.login(email, password)
            .then(result => {
                if (result.token) {
                    localStorage.setItem('jwt_token', result.token);
                    loadUserProfile();
                    showAppContent();
                } else {
                    loginError.textContent = '登录失败：' + (result.message || '未知错误');
                }
            })
            .catch(err => {
                loginError.textContent = '登录失败：' + (err.message || '服务器错误');
            });
    }
    
    // 处理注册
    function handleRegister(username, email, password) {
        registerError.textContent = '';
        
        if (password !== document.getElementById('registerPasswordConfirm').value) {
            registerError.textContent = '两次密码输入不一致';
            return;
        }
        
        backendApi.register(username, email, password)
            .then(result => {
                if (result.success) {
                    // 注册成功后自动登录
                    handleLogin(email, password);
                } else {
                    registerError.textContent = '注册失败：' + (result.message || '未知错误');
                }
            })
            .catch(err => {
                registerError.textContent = '注册失败：' + (err.message || '服务器错误');
            });
    }
    
    // 处理退出登录
    function handleLogout() {
        localStorage.removeItem('jwt_token');
        currentUser = null;
        showLoginPage();
    }
    
    // 绑定事件监听器
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            handleLogin(email, password);
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
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
    
    // 初始化应用
    checkAuthStatus();
}); 