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
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu = document.getElementById('userMenu');
    const historyBtn = document.getElementById('historyBtn');
    const historyPanel = document.getElementById('historyPanel');
    const languageBtn = document.getElementById('languageBtn');
    const languageMenu = document.getElementById('languageMenu');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const newConversationBtn = document.getElementById('newConversationBtn');
    
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
            
            // 使用style.display切换菜单显示状态
            if (userMenu.style.display === 'block') {
                userMenu.style.display = 'none';
                console.log('用户菜单状态: 隐藏');
            } else {
                userMenu.style.display = 'block';
                console.log('用户菜单状态: 显示');
                
                // 关闭历史对话面板
                if (historyPanel) {
                    historyPanel.style.display = 'none';
                }
            }
        });
        
        // 点击外部关闭菜单
        document.addEventListener('click', function(e) {
            if (userMenu.style.display === 'block' && !userMenuBtn.contains(e.target) && !userMenu.contains(e.target)) {
                userMenu.style.display = 'none';
                console.log('用户菜单已通过外部点击关闭');
            }
        });
        
        console.log('用户菜单按钮事件初始化完成');
    } else {
        console.error('找不到用户菜单元素', { 按钮: userMenuBtn, 菜单: userMenu });
    }
    
    // 通知菜单项点击事件
    const notificationMenuItem = document.getElementById('notification-menu-item');
    if (notificationMenuItem) {
        notificationMenuItem.addEventListener('click', function() {
            // 关闭用户菜单
            if (userMenu) {
                userMenu.style.display = 'none';
            }
            
            // 显示通知面板
            if (window.uiHelper && typeof window.uiHelper.showNotificationPanel === 'function') {
                window.uiHelper.showNotificationPanel();
            } else {
                console.error('UI辅助模块未加载，无法显示通知面板');
            }
        });
    }
    
    // 订阅菜单项点击事件已经通过a标签链接实现，无需额外处理
    
    // Pro订阅按钮交互 - 可以移除，因为现在订阅按钮已移至用户菜单
    const proSubscriptionBtn = document.getElementById('proSubscriptionBtn');
    
    if (proSubscriptionBtn) {
        console.log('Pro订阅按钮已注册事件');
        proSubscriptionBtn.addEventListener('click', () => {
            window.location.href = 'subscriptions.html';
            console.log('跳转到订阅页面');
        });
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
    
    // 历史对话按钮点击事件
    if (historyBtn && historyPanel) {
        historyBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // 加载历史会话
            loadHistorySessions();
            
            // 显示历史对话面板
            historyPanel.style.display = historyPanel.style.display === 'block' ? 'none' : 'block';
            
            // 如果用户菜单是打开的，则关闭它
            if (userMenu) userMenu.style.display = 'none';
            
            // 如果语言菜单是打开的，则关闭它
            if (languageMenu) languageMenu.style.display = 'none';
        });
    }
    
    // 关闭历史面板按钮
    if (closeHistoryBtn && historyPanel) {
        closeHistoryBtn.addEventListener('click', function() {
            historyPanel.style.display = 'none';
        });
    }
    
    // 新建对话按钮
    if (newConversationBtn) {
        newConversationBtn.addEventListener('click', function() {
            // 使用现有的创建新会话功能
            if (window.chatManager && typeof window.chatManager.createNewSession === 'function') {
                window.chatManager.createNewSession();
                
                // 更新历史会话列表
                loadHistorySessions();
            }
        });
    }
    
    // 点击页面其他区域关闭历史面板
    document.addEventListener('click', function(e) {
        if (historyPanel && 
            historyPanel.style.display === 'block' && 
            !historyPanel.contains(e.target) && 
            !historyBtn.contains(e.target)) {
            historyPanel.style.display = 'none';
        }
    });
    
    // 加载历史会话列表
    function loadHistorySessions() {
        const historySessionList = document.getElementById('historySessionList');
        
        if (!historySessionList) return;
        
        // 获取当前语言
        const currentLang = localStorage.getItem('interface_language') || 'zh-CN';
        const text = translations[currentLang];
        
        // 获取会话列表
        const sessions = window.chatManager ? window.chatManager.getSessions() : [];
        
        if (sessions.length === 0) {
            // 没有历史会话
            historySessionList.innerHTML = `
                <div class="empty-sessions">
                    <p>${text.emptySessionsText}</p>
                    <button class="btn" id="createFirstSession">${text.createFirstSession}</button>
                </div>
            `;
            
            // 绑定创建第一个会话的按钮事件
            const createFirstSessionBtn = document.getElementById('createFirstSession');
            if (createFirstSessionBtn) {
                createFirstSessionBtn.addEventListener('click', function() {
                    if (window.chatManager && typeof window.chatManager.createNewSession === 'function') {
                        window.chatManager.createNewSession();
                    }
                    historyPanel.style.display = 'none';
                });
            }
        } else {
            // 有历史会话，渲染列表
            historySessionList.innerHTML = '';
            
            sessions.forEach(session => {
                const sessionItem = document.createElement('div');
                sessionItem.className = `session-item ${session.id === window.chatManager.getCurrentSessionId() ? 'active' : ''}`;
                
                // 格式化日期显示
                const sessionDate = new Date(session.lastUpdated || session.created);
                const formattedDate = formatDate(sessionDate, currentLang);
                
                sessionItem.innerHTML = `
                    <div class="session-info" data-id="${session.id}">
                        <div class="session-title">${session.title || (currentLang === 'zh-CN' ? '新对话' : 'New Conversation')}</div>
                        <div class="session-date">${formattedDate}</div>
                    </div>
                    <div class="session-actions">
                        <button class="session-action-btn delete-session" title="${currentLang === 'zh-CN' ? '删除' : 'Delete'}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                `;
                
                // 点击会话切换到对应会话
                const sessionInfo = sessionItem.querySelector('.session-info');
                sessionInfo.addEventListener('click', function() {
                    const sessionId = this.dataset.id;
                    
                    if (window.chatManager && typeof window.chatManager.switchToSession === 'function') {
                        window.chatManager.switchToSession(sessionId);
                        
                        // 更新活跃状态
                        const sessionItems = historySessionList.querySelectorAll('.session-item');
                        sessionItems.forEach(item => item.classList.remove('active'));
                        sessionItem.classList.add('active');
                        
                        // 关闭历史面板
                        historyPanel.style.display = 'none';
                    }
                });
                
                // 删除会话按钮点击事件
                const deleteBtn = sessionItem.querySelector('.delete-session');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        
                        if (window.chatManager && typeof window.chatManager.deleteSession === 'function') {
                            if (confirm(currentLang === 'zh-CN' ? '确定要删除这个会话吗？' : 'Are you sure you want to delete this conversation?')) {
                                window.chatManager.deleteSession(session.id);
                                sessionItem.remove();
                                
                                // 如果删除后没有会话了，显示空状态
                                if (historySessionList.children.length === 0) {
                                    loadHistorySessions();
                                }
                            }
                        }
                    });
                }
                
                historySessionList.appendChild(sessionItem);
            });
        }
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
    
    // 初始化菜单项点击事件
    function initializeMenuItems() {
        // 语言切换按钮点击事件
        if (languageBtn) {
            languageBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                languageMenu.style.display = languageMenu.style.display === 'block' ? 'none' : 'block';
                // 关闭其他菜单
                if (userMenu) userMenu.style.display = 'none';
                if (historyPanel) historyPanel.style.display = 'none';
            });
        }
        
        // 语言选项点击事件
        const languageItems = document.querySelectorAll('.language-item');
        languageItems.forEach(item => {
            item.addEventListener('click', function() {
                const lang = this.getAttribute('data-lang');
                setLanguage(lang);
                
                // 更新选中状态
                languageItems.forEach(li => li.classList.remove('active'));
                this.classList.add('active');
                
                // 关闭语言菜单
                if (languageMenu) languageMenu.style.display = 'none';
            });
        });
    }
    
    // 设置语言
    function setLanguage(lang) {
        localStorage.setItem('interface_language', lang);
        applyLanguage(lang);
        
        // 更新语言选择菜单中的选中状态
        const languageItems = document.querySelectorAll('.language-option');
        languageItems.forEach(item => {
            const itemLang = item.getAttribute('data-lang');
            const checkIcon = item.querySelector('.check-icon');
            
            if (checkIcon) {
                if (itemLang === lang) {
                    checkIcon.style.display = 'inline-block';
                } else {
                    checkIcon.style.display = 'none';
                }
            }
        });
    }
    
    // 语言资源
    const translations = {
        'zh-CN': {
            welcomeTitle: '你好，欢迎使用AI助手',
            welcomeText: '我是您的AI助手，可以回答问题、提供信息和帮助您完成各种任务。请输入您的问题开始对话。',
            userInput: '输入您的问题...',
            sendBtn: '发送',
            attachBtn: '上传附件',
            historyBtn: '历史对话',
            languageBtn: '语言选择',
            userBtn: '用户设置',
            notificationMenuItem: '通知',
            subscriptionMenuItem: '订阅Pro版',
            themeToggle: '切换主题',
            adminEntry: '管理中心',
            settingsMenuItem: '设置',
            helpMenuItem: '帮助与反馈',
            homeMenuItem: '首页',
            loginBtn: '登录',
            logoutBtn: '退出',
            historyTitle: '历史对话',
            newConversationBtn: '新对话',
            emptySessionsText: '暂无历史对话',
            createFirstSession: '开始新对话',
            morningGreeting: '早上好',
            afternoonGreeting: '下午好',
            eveningGreeting: '晚上好',
            generalChatMode: '通用对话'
        },
        'en-US': {
            welcomeTitle: 'Hello, welcome to AI Assistant',
            welcomeText: 'I am your AI assistant, ready to answer questions, provide information, and help you with various tasks. Type your question to begin.',
            userInput: 'Enter your question...',
            sendBtn: 'Send',
            attachBtn: 'Upload attachment',
            historyBtn: 'History',
            languageBtn: 'Language',
            userBtn: 'User settings',
            notificationMenuItem: 'Notifications',
            subscriptionMenuItem: 'Subscribe Pro',
            themeToggle: 'Toggle theme',
            adminEntry: 'Admin center',
            settingsMenuItem: 'Settings',
            helpMenuItem: 'Help & feedback',
            homeMenuItem: 'Home',
            loginBtn: 'Login',
            logoutBtn: 'Logout',
            historyTitle: 'Conversation History',
            newConversationBtn: 'New conversation',
            emptySessionsText: 'No history yet',
            createFirstSession: 'Start a new conversation',
            morningGreeting: 'Good morning',
            afternoonGreeting: 'Good afternoon',
            eveningGreeting: 'Good evening',
            generalChatMode: 'General conversation'
        }
    };

    // 应用语言设置
    function applyLanguage(lang) {
        if (!translations[lang]) {
            console.error(`未找到语言资源: ${lang}`);
            return;
        }
        
        const text = translations[lang];
        
        // 更新欢迎消息
        const welcomeTitle = document.querySelector('.welcome-message h2');
        const welcomeText = document.querySelector('.welcome-message p');
        if (welcomeTitle) welcomeTitle.textContent = text.welcomeTitle;
        if (welcomeText) welcomeText.textContent = text.welcomeText;
        
        // 更新输入框占位符
        const userInput = document.getElementById('userInput');
        if (userInput) userInput.placeholder = text.userInput;
        
        // 更新按钮提示文本
        document.getElementById('sendButton')?.setAttribute('title', text.sendBtn);
        document.getElementById('attachButton')?.setAttribute('title', text.attachBtn);
        document.getElementById('historyBtn')?.setAttribute('title', text.historyBtn);
        document.getElementById('languageBtn')?.setAttribute('title', text.languageBtn);
        document.getElementById('userMenuBtn')?.setAttribute('title', text.userBtn);
        
        // 更新历史对话面板
        const historyHeader = document.querySelector('.history-header h3');
        if (historyHeader) historyHeader.textContent = text.historyTitle;
        
        // 更新关闭按钮的title
        const closeHistoryBtn = document.getElementById('closeHistoryBtn');
        if (closeHistoryBtn) {
            closeHistoryBtn.setAttribute('title', lang === 'zh-CN' ? '关闭' : 'Close');
        }
        
        const newConversationBtn = document.getElementById('newConversationBtn');
        if (newConversationBtn) {
            // 更新按钮中的文本节点
            const btnText = newConversationBtn.childNodes[newConversationBtn.childNodes.length - 1];
            if (btnText && btnText.nodeType === 3) { // 文本节点
                btnText.nodeValue = text.newConversationBtn;
            }
        }
        
        // 更新用户菜单项
        document.getElementById('notification-menu-item')?.setAttribute('title', text.notificationMenuItem);
        document.getElementById('subscription-menu-item')?.setAttribute('title', text.subscriptionMenuItem);
        document.getElementById('themeToggle')?.setAttribute('title', text.themeToggle);
        document.getElementById('admin-entry')?.setAttribute('title', text.adminEntry);
        document.getElementById('settings-menu-item')?.setAttribute('title', text.settingsMenuItem);
        document.getElementById('help-menu-item')?.setAttribute('title', text.helpMenuItem);
        document.getElementById('home-menu-item')?.setAttribute('title', text.homeMenuItem);
        
        // 更新登录/退出按钮
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        if (loginBtn) loginBtn.textContent = text.loginBtn;
        if (logoutBtn) logoutBtn.textContent = text.logoutBtn;
        
        // 更新空历史会话提示
        updateEmptySessionsText();
        
        // 更新当前聊天模式文本
        const currentChatMode = document.getElementById('currentChatMode');
        if (currentChatMode && currentChatMode.textContent.trim() === '通用对话') {
            currentChatMode.textContent = text.generalChatMode;
        }
        
        // 设置页面语言属性
        document.documentElement.setAttribute('lang', lang);
        
        // 更新问候语
        updateGreeting(lang);
        
        console.log(`语言已切换为: ${lang}`);
    }

    // 更新空会话列表文本
    function updateEmptySessionsText() {
        const currentLang = localStorage.getItem('interface_language') || 'zh-CN';
        const text = translations[currentLang];
        
        const emptySessionsContainer = document.querySelector('.empty-sessions');
        if (emptySessionsContainer) {
            const emptyText = emptySessionsContainer.querySelector('p');
            const createBtn = emptySessionsContainer.querySelector('button');
            
            if (emptyText) emptyText.textContent = text.emptySessionsText;
            if (createBtn) createBtn.textContent = text.createFirstSession;
        }
    }

    // 根据语言更新问候语
    function updateGreeting(lang) {
        const hour = new Date().getHours();
        let greeting;
        
        if (lang === 'zh-CN') {
            if (hour < 12) greeting = translations['zh-CN'].morningGreeting;
            else if (hour < 18) greeting = translations['zh-CN'].afternoonGreeting;
            else greeting = translations['zh-CN'].eveningGreeting;
        } else {
            if (hour < 12) greeting = translations['en-US'].morningGreeting;
            else if (hour < 18) greeting = translations['en-US'].afternoonGreeting;
            else greeting = translations['en-US'].eveningGreeting;
        }
        
        const welcomeTitle = document.querySelector('.welcome-message h2');
        if (welcomeTitle) {
            const userName = localStorage.getItem('userName') || 'Kim';
            welcomeTitle.textContent = `${greeting}, ${userName}`;
        }
    }

    // 格式化日期显示，根据语言选择不同格式
    function formatDate(date, lang) {
        if (lang === 'zh-CN') {
            return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        } else {
            const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return date.toLocaleDateString('en-US', options);
        }
    }

    // 初始化语言设置
    function initLanguage() {
        // 从本地存储获取语言设置，默认为中文
        const currentLang = localStorage.getItem('interface_language') || 'zh-CN';
        
        // 更新选中状态
        const languageItems = document.querySelectorAll('.language-item');
        languageItems.forEach(item => {
            if (item.getAttribute('data-lang') === currentLang) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // 应用语言设置
        applyLanguage(currentLang);
    }
    
    // 初始化菜单项事件和语言设置
    initializeMenuItems();
    initLanguage();
}); 