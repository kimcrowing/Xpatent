/**
 * 用户设置组件 - 提供用户资料和API密钥管理功能
 */

document.addEventListener('DOMContentLoaded', async function() {
    // 确保用户服务已加载
    if (!window.UserService) {
        console.error('UserService未加载，无法初始化用户设置组件');
        return;
    }
    
    // 创建设置弹窗容器，但暂不添加到DOM
    const settingsModal = document.createElement('div');
    settingsModal.id = 'settingsModal';
    settingsModal.className = 'settings-modal';
    settingsModal.style.display = 'none';
    
    // 初始化设置弹窗内容
    settingsModal.innerHTML = `
        <div class="settings-content">
            <div class="settings-header">
                <h2>设置</h2>
                <button class="close-btn" id="closeSettingsBtn">&times;</button>
            </div>
            <div class="settings-tabs">
                <button class="tab-btn active" data-tab="profile">个人资料</button>
                <button class="tab-btn" data-tab="apikeys">API密钥</button>
                <button class="tab-btn" data-tab="preferences">偏好设置</button>
            </div>
            <div class="settings-body">
                <!-- 个人资料设置 -->
                <div class="tab-content active" id="profileTab">
                    <div class="profile-settings">
                        <div class="avatar-section">
                            <div class="avatar-preview" id="avatarPreview"></div>
                            <button class="secondary-btn" id="changeAvatarBtn">更改头像</button>
                            <input type="file" id="avatarUpload" accept="image/*" style="display: none;">
                        </div>
                        <div class="form-group">
                            <label for="displayName">显示名称</label>
                            <input type="text" id="displayName" placeholder="显示名称">
                        </div>
                        <div class="form-group">
                            <label for="email">邮箱</label>
                            <input type="email" id="email" placeholder="邮箱地址">
                        </div>
                        <div class="form-group actions">
                            <button class="primary-btn" id="saveProfileBtn">保存资料</button>
                        </div>
                    </div>
                </div>
                
                <!-- API密钥设置 -->
                <div class="tab-content" id="apikeysTab">
                    <div class="apikeys-settings">
                        <div class="api-provider">
                            <h3>OpenRouter</h3>
                            <div class="form-group">
                                <label for="openrouterKey">API密钥</label>
                                <div class="api-key-input">
                                    <input type="password" id="openrouterKey" placeholder="sk-or-xxxx...">
                                    <button class="toggle-visibility" data-target="openrouterKey">
                                        <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"></path></svg>
                                    </button>
                                </div>
                            </div>
                            <div class="api-key-actions">
                                <button class="primary-btn" id="saveOpenrouterBtn">保存</button>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="openrouterActive">
                                    <span class="toggle-slider"></span>
                                    <span class="toggle-label">启用</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="api-provider">
                            <h3>OpenAI</h3>
                            <div class="form-group">
                                <label for="openaiKey">API密钥</label>
                                <div class="api-key-input">
                                    <input type="password" id="openaiKey" placeholder="sk-xxxx...">
                                    <button class="toggle-visibility" data-target="openaiKey">
                                        <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"></path></svg>
                                    </button>
                                </div>
                            </div>
                            <div class="api-key-actions">
                                <button class="primary-btn" id="saveOpenaiBtn">保存</button>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="openaiActive">
                                    <span class="toggle-slider"></span>
                                    <span class="toggle-label">启用</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="api-provider">
                            <h3>Anthropic</h3>
                            <div class="form-group">
                                <label for="anthropicKey">API密钥</label>
                                <div class="api-key-input">
                                    <input type="password" id="anthropicKey" placeholder="sk-ant-xxxx...">
                                    <button class="toggle-visibility" data-target="anthropicKey">
                                        <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34-3-3-3z" fill="currentColor"></path></svg>
                                    </button>
                                </div>
                            </div>
                            <div class="api-key-actions">
                                <button class="primary-btn" id="saveAnthropicBtn">保存</button>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="anthropicActive">
                                    <span class="toggle-slider"></span>
                                    <span class="toggle-label">启用</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 偏好设置 -->
                <div class="tab-content" id="preferencesTab">
                    <div class="preferences-settings">
                        <div class="form-group">
                            <label>界面主题</label>
                            <div class="theme-selector">
                                <label class="theme-option">
                                    <input type="radio" name="theme" value="dark" checked>
                                    <span class="theme-box dark-theme">
                                        <span class="theme-label">深色</span>
                                    </span>
                                </label>
                                <label class="theme-option">
                                    <input type="radio" name="theme" value="light">
                                    <span class="theme-box light-theme">
                                        <span class="theme-label">浅色</span>
                                    </span>
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>语言</label>
                            <select id="language">
                                <option value="zh-CN" selected>中文</option>
                                <option value="en-US">English</option>
                            </select>
                        </div>
                        <div class="form-group switch-group">
                            <label>通知</label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="notifications" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="form-group actions">
                            <button class="primary-btn" id="savePreferencesBtn">保存设置</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加到DOM
    document.body.appendChild(settingsModal);
    
    // 引用DOM元素
    const settingsBtn = document.getElementById('userMenuBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const userMenu = document.getElementById('userMenu');
    
    // 加载用户资料
    async function loadUserProfile() {
        try {
            const profile = await window.UserService.getUserProfile();
            
            // 填充个人资料表单
            document.getElementById('displayName').value = profile.displayName || '';
            document.getElementById('email').value = profile.email || '';
            
            // 更新头像
            const avatarPreview = document.getElementById('avatarPreview');
            if (profile.avatar) {
                avatarPreview.style.backgroundImage = `url(${profile.avatar})`;
                avatarPreview.textContent = '';
            } else {
                avatarPreview.style.backgroundImage = 'none';
                avatarPreview.textContent = profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U';
            }
            
            // 更新偏好设置
            if (profile.settings) {
                // 主题选择
                const themeInput = document.querySelector(`input[name="theme"][value="${profile.settings.theme || 'dark'}"]`);
                if (themeInput) themeInput.checked = true;
                
                // 语言选择
                const languageSelect = document.getElementById('language');
                if (languageSelect) languageSelect.value = profile.settings.language || 'zh-CN';
                
                // 通知设置
                const notificationsToggle = document.getElementById('notifications');
                if (notificationsToggle) notificationsToggle.checked = profile.settings.notifications !== false;
            }
        } catch (error) {
            console.error('加载用户资料失败:', error);
            showNotification('加载用户资料失败', 'error');
        }
    }
    
    // 加载API密钥设置
    async function loadApiKeys() {
        try {
            const apiKeys = await window.UserService.getApiKeys();
            
            // 填充API密钥表单
            if (apiKeys.openrouter) {
                document.getElementById('openrouterKey').value = apiKeys.openrouter.key || '';
                document.getElementById('openrouterActive').checked = apiKeys.openrouter.active;
            }
            
            if (apiKeys.openai) {
                document.getElementById('openaiKey').value = apiKeys.openai.key || '';
                document.getElementById('openaiActive').checked = apiKeys.openai.active;
            }
            
            if (apiKeys.anthropic) {
                document.getElementById('anthropicKey').value = apiKeys.anthropic.key || '';
                document.getElementById('anthropicActive').checked = apiKeys.anthropic.active;
            }
        } catch (error) {
            console.error('加载API密钥失败:', error);
            showNotification('加载API密钥失败', 'error');
        }
    }
    
    // 打开设置弹窗
    function openSettings() {
        // 加载用户资料和API密钥
        loadUserProfile();
        loadApiKeys();
        
        // 显示弹窗
        settingsModal.style.display = 'flex';
        document.body.classList.add('modal-open');
        
        // 如果用户菜单处于打开状态，关闭它
        userMenu.classList.remove('active');
    }
    
    // 关闭设置弹窗
    function closeSettings() {
        settingsModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
    
    // 切换标签页
    function switchTab(tabId) {
        // 更新标签按钮状态
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });
        
        // 更新标签内容
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}Tab`);
        });
    }
    
    // 显示通知
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 自动消失
        setTimeout(() => {
            notification.classList.add('fadeout');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // 保存用户资料
    async function saveUserProfile() {
        const displayName = document.getElementById('displayName').value;
        const email = document.getElementById('email').value;
        
        try {
            const result = await window.UserService.updateUserProfile({
                displayName,
                email
            });
            
            showNotification('个人资料已更新');
            
            // 更新界面上的用户名显示
            const userAvatar = document.querySelector('.user-avatar');
            if (userAvatar) {
                userAvatar.textContent = displayName ? displayName.charAt(0).toUpperCase() : 'U';
            }
        } catch (error) {
            console.error('更新用户资料失败:', error);
            showNotification('更新用户资料失败', 'error');
        }
    }
    
    // 保存API密钥
    async function saveApiKey(provider) {
        const keyInput = document.getElementById(`${provider}Key`);
        const activeCheckbox = document.getElementById(`${provider}Active`);
        
        if (!keyInput) return;
        
        const apiKey = keyInput.value.trim();
        const active = activeCheckbox ? activeCheckbox.checked : false;
        
        try {
            if (apiKey) {
                const result = await window.UserService.updateApiKey(provider, apiKey, active);
                showNotification(`${provider} API密钥已更新`);
            } else {
                const result = await window.UserService.deleteApiKey(provider);
                showNotification(`${provider} API密钥已删除`);
            }
        } catch (error) {
            console.error(`更新${provider} API密钥失败:`, error);
            showNotification(`更新${provider} API密钥失败`, 'error');
        }
    }
    
    // 保存偏好设置
    async function savePreferences() {
        const theme = document.querySelector('input[name="theme"]:checked').value;
        const language = document.getElementById('language').value;
        const notifications = document.getElementById('notifications').checked;
        
        try {
            const result = await window.UserService.updateUserProfile({
                settings: {
                    theme,
                    language,
                    notifications
                }
            });
            
            showNotification('偏好设置已更新');
            
            // 应用主题
            if (window.setTheme && typeof window.setTheme === 'function') {
                window.setTheme(theme);
            } else {
                document.documentElement.className = `${theme}-theme`;
                document.body.className = `${theme}-theme`;
            }
        } catch (error) {
            console.error('更新偏好设置失败:', error);
            showNotification('更新偏好设置失败', 'error');
        }
    }
    
    // 处理头像上传
    function handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            showNotification('请选择图片文件', 'error');
            return;
        }
        
        // 检查文件大小（最大2MB）
        if (file.size > 2 * 1024 * 1024) {
            showNotification('图片大小不能超过2MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = async function(e) {
            const imageData = e.target.result;
            
            // 更新预览
            const avatarPreview = document.getElementById('avatarPreview');
            avatarPreview.style.backgroundImage = `url(${imageData})`;
            avatarPreview.textContent = '';
            
            // 保存到用户资料
            try {
                const result = await window.UserService.updateUserProfile({
                    avatar: imageData
                });
                
                showNotification('头像已更新');
            } catch (error) {
                console.error('更新头像失败:', error);
                showNotification('更新头像失败', 'error');
            }
        };
        
        reader.readAsDataURL(file);
    }
    
    // 事件监听器
    // 打开设置弹窗
    if (settingsBtn) {
        // 在用户菜单中添加设置选项
        const settingsOption = document.createElement('li');
        settingsOption.textContent = '设置';
        settingsOption.id = 'settingsOption';
        userMenu.querySelector('ul').appendChild(settingsOption);
        
        // 点击设置选项打开设置弹窗
        settingsOption.addEventListener('click', openSettings);
    }
    
    // 关闭设置弹窗
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', closeSettings);
    }
    
    // 点击弹窗外部关闭弹窗
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettings();
        }
    });
    
    // 标签切换
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // 保存个人资料
    document.getElementById('saveProfileBtn').addEventListener('click', saveUserProfile);
    
    // 保存API密钥
    document.getElementById('saveOpenrouterBtn').addEventListener('click', () => saveApiKey('openrouter'));
    document.getElementById('saveOpenaiBtn').addEventListener('click', () => saveApiKey('openai'));
    document.getElementById('saveAnthropicBtn').addEventListener('click', () => saveApiKey('anthropic'));
    
    // 保存偏好设置
    document.getElementById('savePreferencesBtn').addEventListener('click', savePreferences);
    
    // 切换API密钥可见性
    document.querySelectorAll('.toggle-visibility').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            
            if (input.type === 'password') {
                input.type = 'text';
                btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"></path></svg>';
            } else {
                input.type = 'password';
                btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"></path></svg>';
            }
        });
    });
    
    // 设置API密钥激活状态
    document.querySelectorAll('#openrouterActive, #openaiActive, #anthropicActive').forEach(checkbox => {
        checkbox.addEventListener('change', async (e) => {
            const provider = e.target.id.replace('Active', '');
            try {
                await window.UserService.setApiKeyStatus(provider, e.target.checked);
                showNotification(`${provider} API密钥已${e.target.checked ? '激活' : '禁用'}`);
            } catch (error) {
                console.error(`切换${provider} API密钥状态失败:`, error);
                showNotification(`切换${provider} API密钥状态失败`, 'error');
                // 还原复选框状态
                e.target.checked = !e.target.checked;
            }
        });
    });
    
    // 头像上传
    const avatarUpload = document.getElementById('avatarUpload');
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    
    changeAvatarBtn.addEventListener('click', () => {
        avatarUpload.click();
    });
    
    avatarUpload.addEventListener('change', handleAvatarUpload);
    
    console.log('用户设置组件已初始化');
}); 