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
    
    // 获取用户菜单元素，在整个DOM加载函数中复用
    const userMenu = document.getElementById('userMenu');
    const userMenuBtn = document.getElementById('userMenuBtn');
    
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
    
    // 通知按钮点击事件
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            // 如果uiHelper已加载，调用显示通知面板方法
            if (window.uiHelper && typeof window.uiHelper.showNotificationPanel === 'function') {
                window.uiHelper.showNotificationPanel();
            } else {
                console.error('UI辅助模块未加载，无法显示通知面板');
            }
        });
    }
    
    // 模拟添加一些测试通知（仅供开发测试，实际使用时应删除）
    setTimeout(() => {
        if (window.uiHelper) {
            window.uiHelper.showNotification('欢迎使用Xpat智能助手，这是一条测试通知', 'info');
            
            // 更新计数器
            window.uiHelper.updateNotificationCounter();
        }
    }, 1000);
    
    // 用户菜单项点击事件处理
    if (userMenu) {
        // 设置菜单项
        const settingsItem = document.querySelector('#userMenu ul li:nth-child(3)');
        if (settingsItem) {
            settingsItem.addEventListener('click', function() {
                // 关闭用户菜单
                userMenu.classList.remove('active');
                
                // 显示设置模态窗口
                const settingsModal = document.getElementById('settingsModalContainer');
                if (settingsModal) {
                    // 加载用户设置
                    loadUserSettings();
                    
                    // 显示模态窗口
                    settingsModal.style.display = 'flex';
                }
            });
        }
        
        // 帮助与反馈菜单项
        const helpItem = document.querySelector('#userMenu ul li:nth-child(4)');
        if (helpItem) {
            helpItem.addEventListener('click', function() {
                // 关闭用户菜单
                userMenu.classList.remove('active');
                
                // 显示帮助模态窗口
                const helpModal = document.getElementById('helpModalContainer');
                if (helpModal) {
                    helpModal.style.display = 'flex';
                }
            });
        }
    }
    
    // 设置模态窗口相关事件处理
    const settingsModal = document.getElementById('settingsModalContainer');
    const closeSettingsModal = document.getElementById('closeSettingsModal');
    const saveSettings = document.getElementById('saveSettings');
    const resetSettings = document.getElementById('resetSettings');
    
    if (closeSettingsModal) {
        closeSettingsModal.addEventListener('click', function() {
            settingsModal.style.display = 'none';
        });
    }
    
    if (settingsModal) {
        // 点击模态窗口外部关闭
        settingsModal.querySelector('.modal-overlay').addEventListener('click', function() {
            settingsModal.style.display = 'none';
        });
    }
    
    if (saveSettings) {
        saveSettings.addEventListener('click', function() {
            // 保存设置
            saveUserSettings();
            
            // 关闭模态窗口
            settingsModal.style.display = 'none';
            
            // 显示保存成功提示
            if (window.uiHelper) {
                window.uiHelper.showNotification('设置已保存', 'success');
            }
        });
    }
    
    if (resetSettings) {
        resetSettings.addEventListener('click', function() {
            if (confirm('确定要恢复默认设置吗？')) {
                // 恢复默认设置
                resetUserSettings();
                
                // 更新表单
                loadUserSettings();
                
                // 显示提示
                if (window.uiHelper) {
                    window.uiHelper.showNotification('已恢复默认设置', 'info');
                }
            }
        });
    }
    
    // 帮助模态窗口相关事件处理
    const helpModal = document.getElementById('helpModalContainer');
    const closeHelpModal = document.getElementById('closeHelpModal');
    
    if (closeHelpModal) {
        closeHelpModal.addEventListener('click', function() {
            helpModal.style.display = 'none';
        });
    }
    
    if (helpModal) {
        // 点击模态窗口外部关闭
        helpModal.querySelector('.modal-overlay').addEventListener('click', function() {
            helpModal.style.display = 'none';
        });
        
        // 绑定标签页切换事件
        const tabBtns = helpModal.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // 移除所有标签页按钮的active类
                tabBtns.forEach(b => b.classList.remove('active'));
                
                // 添加当前按钮的active类
                this.classList.add('active');
                
                // 获取目标标签页
                const targetTabId = this.getAttribute('data-tab');
                const tabPanes = helpModal.querySelectorAll('.tab-pane');
                
                // 隐藏所有标签页内容
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                // 显示目标标签页内容
                const targetPane = document.getElementById(targetTabId);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
        
        // 绑定反馈表单提交事件
        const feedbackForm = document.getElementById('feedbackForm');
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // 获取表单数据
                const feedbackType = document.getElementById('feedbackType').value;
                const feedbackContent = document.getElementById('feedbackContent').value;
                const contactEmail = document.getElementById('contactEmail').value;
                
                if (!feedbackContent.trim()) {
                    alert('请输入反馈内容');
                    return;
                }
                
                // 模拟提交反馈
                console.log('提交反馈:', { feedbackType, feedbackContent, contactEmail });
                
                // 显示提交成功提示
                if (window.uiHelper) {
                    window.uiHelper.showNotification('感谢您的反馈！我们会认真考虑您的建议', 'success');
                }
                
                // 重置表单
                feedbackForm.reset();
                
                // 关闭模态窗口
                helpModal.style.display = 'none';
            });
        }
    }
    
    // 加载用户设置
    function loadUserSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('xpat_user_settings') || '{}');
            
            // 设置各表单控件的值
            const userInfo = window.backendApi.getUserInfo() || {};
            
            // 用户昵称
            const nicknameInput = document.getElementById('userNickname');
            if (nicknameInput) {
                nicknameInput.value = settings.nickname || userInfo.username || '';
            }
            
            // 用户邮箱
            const emailInput = document.getElementById('userEmail');
            if (emailInput) {
                emailInput.value = userInfo.email || '';
            }
            
            // 界面语言
            const languageSelect = document.getElementById('language');
            if (languageSelect) {
                languageSelect.value = settings.language || 'zh-CN';
            }
            
            // 自动保存会话历史
            const autoSaveCheck = document.getElementById('autoSaveHistory');
            if (autoSaveCheck) {
                autoSaveCheck.checked = settings.autoSaveHistory !== false;
            }
            
            // 允许发送使用统计
            const allowMetricsCheck = document.getElementById('allowMetrics');
            if (allowMetricsCheck) {
                allowMetricsCheck.checked = settings.allowMetrics !== false;
            }
            
            // 默认模型
            const defaultModelSelect = document.getElementById('defaultModel');
            if (defaultModelSelect) {
                defaultModelSelect.value = settings.defaultModel || 'deepseek/deepseek-r1:free';
            }
            
            // 默认聊天模式
            const defaultChatModeSelect = document.getElementById('defaultChatMode');
            if (defaultChatModeSelect) {
                defaultChatModeSelect.value = settings.defaultChatMode || 'general';
            }
        } catch (error) {
            console.error('加载用户设置失败:', error);
        }
    }
    
    // 保存用户设置
    function saveUserSettings() {
        try {
            const settings = {
                nickname: document.getElementById('userNickname').value,
                language: document.getElementById('language').value,
                autoSaveHistory: document.getElementById('autoSaveHistory').checked,
                allowMetrics: document.getElementById('allowMetrics').checked,
                defaultModel: document.getElementById('defaultModel').value,
                defaultChatMode: document.getElementById('defaultChatMode').value,
                lastUpdated: new Date().toISOString()
            };
            
            // 保存到本地存储
            localStorage.setItem('xpat_user_settings', JSON.stringify(settings));
            
            // 应用部分设置
            if (window.modelSelector && settings.defaultModel) {
                const modelOption = Array.from(document.getElementById('defaultModel').options)
                    .find(option => option.value === settings.defaultModel);
                
                if (modelOption && typeof window.selectModel === 'function') {
                    window.selectModel(settings.defaultModel, modelOption.textContent);
                }
            }
            
            if (window.chatModeSelector && settings.defaultChatMode) {
                const chatModeOption = Array.from(document.getElementById('defaultChatMode').options)
                    .find(option => option.value === settings.defaultChatMode);
                
                if (chatModeOption && typeof window.selectChatMode === 'function') {
                    const modes = window.getChatModes ? window.getChatModes() : [];
                    const mode = modes.find(m => m.id === settings.defaultChatMode);
                    
                    if (mode) {
                        window.selectChatMode(mode.id, mode.name, mode.systemPrompt);
                    }
                }
            }
        } catch (error) {
            console.error('保存用户设置失败:', error);
            if (window.uiHelper) {
                window.uiHelper.showNotification('保存设置失败', 'error');
            }
        }
    }
    
    // 重置用户设置
    function resetUserSettings() {
        try {
            localStorage.removeItem('xpat_user_settings');
        } catch (error) {
            console.error('重置用户设置失败:', error);
        }
    }
}); 