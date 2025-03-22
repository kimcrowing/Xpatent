/**
 * 管理后台JavaScript
 * 处理管理员登录、提示词管理等功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const loginContainer = document.getElementById('loginContainer');
    const adminContent = document.getElementById('adminContent');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const menuItems = document.querySelectorAll('.menu-item');
    
    // 提示词管理相关元素
    const promptsTable = document.getElementById('promptsTable');
    const promptsEmptyState = document.getElementById('promptsEmptyState');
    const promptsLoadingState = document.getElementById('promptsLoadingState');
    const promptCategoryFilter = document.getElementById('promptCategoryFilter');
    const addPromptBtn = document.getElementById('addPromptBtn');
    
    // 用户管理相关元素
    const usersTable = document.getElementById('usersTable');
    const usersEmptyState = document.getElementById('usersEmptyState');
    const usersLoadingState = document.getElementById('usersLoadingState');
    const userRoleFilter = document.getElementById('userRoleFilter');
    const userSearchInput = document.getElementById('userSearchInput');
    const userSearchBtn = document.getElementById('userSearchBtn');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const currentPageEl = document.getElementById('currentPage');
    const totalPagesEl = document.getElementById('totalPages');
    
    // 订阅管理相关元素
    const subscriptionsTable = document.getElementById('subscriptionsTable');
    const subscriptionsEmptyState = document.getElementById('subscriptionsEmptyState');
    const subscriptionsLoadingState = document.getElementById('subscriptionsLoadingState');
    const addSubscriptionBtn = document.getElementById('addSubscriptionBtn');
    const totalSubscriptionsValue = document.getElementById('totalSubscriptionsValue');
    const activeSubscriptionsValue = document.getElementById('activeSubscriptionsValue');
    const monthlyRevenueValue = document.getElementById('monthlyRevenueValue');
    
    // API使用统计相关元素
    const apiUsageTable = document.getElementById('apiUsageTable');
    const apiUsageEmptyState = document.getElementById('apiUsageEmptyState');
    const apiUsageLoadingState = document.getElementById('apiUsageLoadingState');
    const todayApiCallsValue = document.getElementById('todayApiCallsValue');
    const totalApiCallsValue = document.getElementById('totalApiCallsValue');
    const activeUsersValue = document.getElementById('activeUsersValue');
    const dailyApiCallsChart = document.getElementById('dailyApiCallsChart');
    const modelDistributionChart = document.getElementById('modelDistributionChart');
    
    // 用户编辑模态框
    const userModalOverlay = document.getElementById('userModalOverlay');
    const closeUserModalBtn = document.getElementById('closeUserModalBtn');
    const userModalTitle = document.getElementById('userModalTitle');
    const userForm = document.getElementById('userForm');
    const userId = document.getElementById('userId');
    const userUsername = document.getElementById('userUsername');
    const userEmail = document.getElementById('userEmail');
    const userRole = document.getElementById('userRole');
    const userApiQuota = document.getElementById('userApiQuota');
    const userFormError = document.getElementById('userFormError');
    const saveUserBtn = document.getElementById('saveUserBtn');
    const cancelUserBtn = document.getElementById('cancelUserBtn');
    
    // 订阅计划编辑模态框
    const subscriptionModalOverlay = document.getElementById('subscriptionModalOverlay');
    const closeSubscriptionModalBtn = document.getElementById('closeSubscriptionModalBtn');
    const subscriptionModalTitle = document.getElementById('subscriptionModalTitle');
    const subscriptionForm = document.getElementById('subscriptionForm');
    const subscriptionId = document.getElementById('subscriptionId');
    const subscriptionName = document.getElementById('subscriptionName');
    const subscriptionPrice = document.getElementById('subscriptionPrice');
    const subscriptionDuration = document.getElementById('subscriptionDuration');
    const subscriptionApiQuota = document.getElementById('subscriptionApiQuota');
    const featureList = document.getElementById('featureList');
    const addFeatureBtn = document.getElementById('addFeatureBtn');
    const subscriptionFormError = document.getElementById('subscriptionFormError');
    const saveSubscriptionBtn = document.getElementById('saveSubscriptionBtn');
    const cancelSubscriptionBtn = document.getElementById('cancelSubscriptionBtn');
    
    // 删除订阅确认模态框
    const deleteSubscriptionModalOverlay = document.getElementById('deleteSubscriptionModalOverlay');
    const closeDeleteSubscriptionModalBtn = document.getElementById('closeDeleteSubscriptionModalBtn');
    const deleteSubscriptionId = document.getElementById('deleteSubscriptionId');
    const confirmDeleteSubscriptionBtn = document.getElementById('confirmDeleteSubscriptionBtn');
    const cancelDeleteSubscriptionBtn = document.getElementById('cancelDeleteSubscriptionBtn');
    
    // 角色修改确认模态框
    const roleConfirmModalOverlay = document.getElementById('roleConfirmModalOverlay');
    const closeRoleConfirmModalBtn = document.getElementById('closeRoleConfirmModalBtn');
    const roleChangeUsername = document.getElementById('roleChangeUsername');
    const roleChangeOld = document.getElementById('roleChangeOld');
    const roleChangeNew = document.getElementById('roleChangeNew');
    const roleChangeUserId = document.getElementById('roleChangeUserId');
    const roleChangeValue = document.getElementById('roleChangeValue');
    const cancelRoleChangeBtn = document.getElementById('cancelRoleChangeBtn');
    const confirmRoleChangeBtn = document.getElementById('confirmRoleChangeBtn');
    
    // API配置相关元素
    const apiConfigForm = document.getElementById('apiConfigForm');
    const saveApiConfigBtn = document.getElementById('saveApiConfigBtn');
    const apiConfigError = document.getElementById('apiConfigError');
    
    // 模态框相关元素
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalTitle = document.getElementById('modalTitle');
    const promptForm = document.getElementById('promptForm');
    const promptId = document.getElementById('promptId');
    const promptName = document.getElementById('promptName');
    const promptCategory = document.getElementById('promptCategory');
    const promptContent = document.getElementById('promptContent');
    const promptIsPublic = document.getElementById('promptIsPublic');
    const promptFormError = document.getElementById('promptFormError');
    const savePromptBtn = document.getElementById('savePromptBtn');
    const cancelPromptBtn = document.getElementById('cancelPromptBtn');
    
    // 删除确认模态框
    const deleteModalOverlay = document.getElementById('deleteModalOverlay');
    const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
    const deletePromptId = document.getElementById('deletePromptId');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    
    // 用户列表状态
    let currentUserPage = 1;
    let totalUserPages = 1;
    let currentUserRole = '';
    let currentUserSearch = '';
    
    // 页面初始化
    initPage();
    
    // 绑定事件
    bindEvents();
    
    /**
     * 页面初始化
     */
    function initPage() {
        // 检查是否已登录并且是管理员
        checkAuth();
        
        // 设置CORS模式以适应GitHub Pages环境
        setupCorsMode();
        
        // 加载API配置（如果登录了）
        if (localStorage.getItem('xpat_auth_token')) {
            loadApiConfig();
        }
    }
    
    /**
     * 设置CORS模式，适应GitHub Pages环境
     */
    function setupCorsMode() {
        // 检测是否在GitHub Pages环境
        const isGitHubPages = window.location.hostname.includes('github.io');
        
        if (isGitHubPages) {
            // 从本地存储加载API地址，如果没有则使用默认地址
            const savedApiUrl = localStorage.getItem('xpat_api_url');
            
            if (savedApiUrl) {
                window.API_BASE_URL = savedApiUrl;
                console.log('从本地存储加载API地址:', savedApiUrl);
            } else {
                // 默认使用本地地址，需要管理员在部署时手动修改
                const defaultApiUrl = 'http://localhost:3000/api';
                window.API_BASE_URL = defaultApiUrl;
                localStorage.setItem('xpat_api_url', defaultApiUrl);
                console.log('已设置默认API地址:', defaultApiUrl);
            }
        }
    }
    
    /**
     * 检查用户认证状态
     */
    function checkAuth() {
        try {
            // 从localStorage获取令牌
            const token = localStorage.getItem('xpat_auth_token');
            const userInfo = JSON.parse(localStorage.getItem('xpat_user_info') || '{}');
            
            if (token && userInfo && userInfo.role === 'admin') {
                // 显示管理员界面
                showAdminInterface();
                
                // 获取提示词列表
                loadPrompts();
            } else {
                // 显示登录界面
                showLoginInterface();
            }
        } catch (error) {
            console.error('检查认证状态失败:', error);
            showLoginInterface();
        }
    }
    
    /**
     * 显示管理员界面
     */
    function showAdminInterface() {
        loginContainer.style.display = 'none';
        adminContent.style.display = 'flex';
        logoutBtn.style.display = 'block';
    }
    
    /**
     * 显示登录界面
     */
    function showLoginInterface() {
        loginContainer.style.display = 'flex';
        adminContent.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
    
    /**
     * 绑定事件处理
     */
    function bindEvents() {
        // 登录表单提交
        loginForm.addEventListener('submit', handleLogin);
        
        // 退出登录按钮
        logoutBtn.addEventListener('click', handleLogout);
        
        // 菜单项点击
        menuItems.forEach(item => {
            item.addEventListener('click', handleMenuItemClick);
        });
        
        // 提示词管理相关事件
        promptCategoryFilter.addEventListener('change', function() {
            loadPrompts(this.value);
        });
        
        addPromptBtn.addEventListener('click', handleAddPrompt);
        
        // 订阅管理相关事件
        if (addSubscriptionBtn) {
            addSubscriptionBtn.addEventListener('click', handleAddSubscription);
        }
        
        if (addFeatureBtn) {
            addFeatureBtn.addEventListener('click', addFeatureItem);
        }
        
        // 订阅编辑模态框事件
        if (closeSubscriptionModalBtn) {
            closeSubscriptionModalBtn.addEventListener('click', closeSubscriptionModal);
        }
        
        if (cancelSubscriptionBtn) {
            cancelSubscriptionBtn.addEventListener('click', closeSubscriptionModal);
        }
        
        if (saveSubscriptionBtn) {
            saveSubscriptionBtn.addEventListener('click', handleSaveSubscription);
        }
        
        // 删除订阅确认模态框事件
        if (closeDeleteSubscriptionModalBtn) {
            closeDeleteSubscriptionModalBtn.addEventListener('click', closeDeleteSubscriptionModal);
        }
        
        if (cancelDeleteSubscriptionBtn) {
            cancelDeleteSubscriptionBtn.addEventListener('click', closeDeleteSubscriptionModal);
        }
        
        if (confirmDeleteSubscriptionBtn) {
            confirmDeleteSubscriptionBtn.addEventListener('click', handleConfirmDeleteSubscription);
        }
        
        // 用户管理相关事件
        userRoleFilter.addEventListener('change', function() {
            currentUserRole = this.value;
            currentUserPage = 1;
            loadUsers();
        });
        
        userSearchBtn.addEventListener('click', function() {
            currentUserSearch = userSearchInput.value.trim();
            currentUserPage = 1;
            loadUsers();
        });
        
        userSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                currentUserSearch = userSearchInput.value.trim();
                currentUserPage = 1;
                loadUsers();
            }
        });
        
        // 分页按钮
        prevPageBtn.addEventListener('click', function() {
            if (currentUserPage > 1) {
                currentUserPage--;
                loadUsers();
            }
        });
        
        nextPageBtn.addEventListener('click', function() {
            if (currentUserPage < totalUserPages) {
                currentUserPage++;
                loadUsers();
            }
        });
        
        // 用户编辑模态框事件
        closeUserModalBtn.addEventListener('click', closeUserModal);
        cancelUserBtn.addEventListener('click', closeUserModal);
        saveUserBtn.addEventListener('click', handleSaveUser);
        
        // 角色修改确认模态框事件
        closeRoleConfirmModalBtn.addEventListener('click', closeRoleConfirmModal);
        cancelRoleChangeBtn.addEventListener('click', closeRoleConfirmModal);
        confirmRoleChangeBtn.addEventListener('click', handleConfirmRoleChange);
        
        // API配置相关事件
        if (saveApiConfigBtn) {
            saveApiConfigBtn.addEventListener('click', handleSaveApiConfig);
        }
        
        // 提示词管理模态框事件
        closeModalBtn.addEventListener('click', closeModal);
        cancelPromptBtn.addEventListener('click', closeModal);
        savePromptBtn.addEventListener('click', handleSavePrompt);
        
        // 删除模态框操作
        closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
        cancelDeleteBtn.addEventListener('click', closeDeleteModal);
        confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

        // 从这里开始添加创建用户按钮事件监听
        if (document.getElementById('createUserBtn')) {
            document.getElementById('createUserBtn').addEventListener('click', handleAddUser);
        }
        
        // 添加确认删除用户和提交创建用户的事件监听
        if (document.getElementById('submitCreateUser')) {
            document.getElementById('submitCreateUser').addEventListener('click', handleCreateUser);
        }
        
        if (document.getElementById('confirmDeleteUser')) {
            document.getElementById('confirmDeleteUser').addEventListener('click', handleConfirmDeleteUser);
        }
    }
    
    /**
     * 处理登录提交
     */
    async function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginError = document.getElementById('loginError');
        
        if (!email || !password) {
            loginError.textContent = '请输入邮箱和密码';
            return;
        }
        
        try {
            // 清除错误信息
            loginError.textContent = '';
            
            // 登录请求
            const response = await window.backendApi.login(email, password);
            
            // 检查是否是管理员
            if (response.user && response.user.role === 'admin') {
                showAdminInterface();
                loadPrompts();
                loadApiConfig(); // 登录成功后加载API配置
            } else {
                window.backendApi.clearAuth();
                loginError.textContent = '只有管理员才能访问该页面';
            }
        } catch (error) {
            console.error('登录失败:', error);
            loginError.textContent = error.message || '登录失败，请检查邮箱和密码';
        }
    }
    
    /**
     * 处理退出登录
     */
    function handleLogout() {
        window.backendApi.clearAuth();
        showLoginInterface();
    }
    
    /**
     * 处理菜单项点击
     */
    function handleMenuItemClick(e) {
        const selectedSection = e.target.getAttribute('data-section');
        
        // 更新活动菜单项
        menuItems.forEach(item => {
            item.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // 隐藏所有sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // 显示选中的section
        document.getElementById(selectedSection).style.display = 'block';
        
        // 根据选中的区域加载数据
        if (selectedSection === 'userManagement') {
            loadUsers();
        } else if (selectedSection === 'subscriptionManagement') {
            loadSubscriptions();
            loadSubscriptionStats();
        } else if (selectedSection === 'apiUsage') {
            loadApiUsageStats();
        }
    }
    
    /**
     * 加载提示词列表
     */
    async function loadPrompts(category = '') {
        // 显示加载状态
        promptsLoadingState.style.display = 'block';
        promptsEmptyState.style.display = 'none';
        promptsTable.querySelector('tbody').innerHTML = '';
        
        try {
            // 调用API获取提示词列表
            const response = await window.backendApi.getAllPrompts(category);
            const templates = response.templates || [];
            
            // 渲染表格
            renderPromptsTable(templates);
            
            // 根据数据量显示空状态或表格
            if (templates.length === 0) {
                promptsEmptyState.style.display = 'block';
                promptsTable.style.display = 'none';
            } else {
                promptsEmptyState.style.display = 'none';
                promptsTable.style.display = 'table';
            }
        } catch (error) {
            console.error('加载提示词失败:', error);
            promptsEmptyState.textContent = '加载提示词失败: ' + (error.message || '未知错误');
            promptsEmptyState.style.display = 'block';
            promptsTable.style.display = 'none';
        } finally {
            // 隐藏加载状态
            promptsLoadingState.style.display = 'none';
        }
    }
    
    /**
     * 渲染提示词表格
     */
    function renderPromptsTable(templates) {
        const tbody = promptsTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        templates.forEach(template => {
            const tr = document.createElement('tr');
            
            // 格式化分类显示
            let categoryDisplay = template.category;
            switch(template.category) {
                case 'general': categoryDisplay = '通用对话'; break;
                case 'patent-search': categoryDisplay = '专利检索'; break;
                case 'patent-writing': categoryDisplay = '专利撰写'; break;
                case 'patent-analysis': categoryDisplay = '专利分析'; break;
            }
            
            // 格式化创建时间
            const createdAt = new Date(template.created_at);
            const formattedDate = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;
            
            tr.innerHTML = `
                <td>${template.id}</td>
                <td>${template.name}</td>
                <td>${categoryDisplay}</td>
                <td>${template.is_public ? '公开' : '私有'}</td>
                <td>${template.creator_id || '系统'}</td>
                <td>${formattedDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-button edit-button" data-id="${template.id}" title="编辑">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M18.5 2.5C18.7626 2.23735 19.1189 2.07855 19.5 2.07855C19.8811 2.07855 20.2374 2.23735 20.5 2.5C20.7626 2.76265 20.9214 3.11895 20.9214 3.5C20.9214 3.88105 20.7626 4.23735 20.5 4.5L12 13L9 14L10 11L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button class="action-button delete-button" data-id="${template.id}" title="删除">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M10 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M5 7L6 19C6 19.5304 6.21071 20.0391 6.58579 20.4142C6.96086 20.7893 7.46957 21 8 21H16C16.5304 21 17.0391 20.7893 17.4142 20.4142C17.7893 20.0391 18 19.5304 18 19L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M9 7V4C9 3.73478 9.10536 3.48043 9.29289 3.29289C9.48043 3.10536 9.73478 3 10 3H14C14.2652 3 14.5196 3.10536 14.7071 3.29289C14.8946 3.48043 15 3.73478 15 4V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // 绑定编辑和删除按钮事件
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                handleEditPrompt(id);
            });
        });
        
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                handleDeletePrompt(id);
            });
        });
    }
    
    /**
     * 处理添加提示词
     */
    function handleAddPrompt() {
        // 重置表单
        promptForm.reset();
        promptId.value = '';
        promptFormError.textContent = '';
        
        // 设置模态框标题
        modalTitle.textContent = '添加新提示词';
        
        // 显示模态框
        modalOverlay.style.display = 'flex';
    }
    
    /**
     * 处理编辑提示词
     */
    async function handleEditPrompt(id) {
        // 显示加载状态
        promptFormError.textContent = '加载中...';
        
        // 显示模态框
        modalOverlay.style.display = 'flex';
        modalTitle.textContent = '编辑提示词';
        
        try {
            // 获取提示词详情
            const response = await window.backendApi.getPrompt(id);
            const template = response.template;
            
            // 填充表单
            promptId.value = template.id;
            promptName.value = template.name;
            promptCategory.value = template.category;
            promptContent.value = template.content;
            promptIsPublic.checked = template.is_public === 1;
            
            // 清除错误信息
            promptFormError.textContent = '';
        } catch (error) {
            console.error('获取提示词详情失败:', error);
            promptFormError.textContent = '加载提示词详情失败: ' + (error.message || '未知错误');
        }
    }
    
    /**
     * 处理删除提示词
     */
    function handleDeletePrompt(id) {
        // 设置要删除的ID
        deletePromptId.value = id;
        
        // 显示确认模态框
        deleteModalOverlay.style.display = 'flex';
    }
    
    /**
     * 处理确认删除
     */
    async function handleConfirmDelete() {
        const id = deletePromptId.value;
        
        if (!id) return;
        
        try {
            // 调用API删除提示词
            await window.backendApi.deletePrompt(id);
            
            // 关闭确认模态框
            closeDeleteModal();
            
            // 重新加载提示词列表
            loadPrompts(promptCategoryFilter.value);
        } catch (error) {
            console.error('删除提示词失败:', error);
            alert('删除提示词失败: ' + (error.message || '未知错误'));
        }
    }
    
    /**
     * 处理保存提示词
     */
    async function handleSavePrompt() {
        // 获取表单数据
        const id = promptId.value;
        const name = promptName.value;
        const category = promptCategory.value;
        const content = promptContent.value;
        const isPublic = promptIsPublic.checked;
        
        // 表单验证
        if (!name || !category || !content) {
            promptFormError.textContent = '请填写所有必填字段';
            return;
        }
        
        try {
            // 创建或更新提示词
            if (id) {
                // 更新
                await window.backendApi.updatePrompt(id, {
                    name,
                    category,
                    content,
                    isPublic
                });
            } else {
                // 创建
                await window.backendApi.createPrompt(name, category, content, isPublic);
            }
            
            // 关闭模态框
            closeModal();
            
            // 重新加载提示词列表
            loadPrompts(promptCategoryFilter.value);
        } catch (error) {
            console.error('保存提示词失败:', error);
            promptFormError.textContent = '保存失败: ' + (error.message || '未知错误');
        }
    }
    
    /**
     * 关闭模态框
     */
    function closeModal() {
        modalOverlay.style.display = 'none';
        promptForm.reset();
        promptFormError.textContent = '';
    }
    
    /**
     * 关闭删除确认模态框
     */
    function closeDeleteModal() {
        deleteModalOverlay.style.display = 'none';
        deletePromptId.value = '';
    }
    
    /**
     * 加载API配置
     */
    async function loadApiConfig() {
        try {
            // 加载后端API地址
            const backendApiUrl = localStorage.getItem('xpat_api_url') || window.API_BASE_URL || 'http://localhost:3000/api';
            document.getElementById('backendApiUrl').value = backendApiUrl;
            
            // 从后端获取API配置
            const config = await window.backendApi.getApiConfig();
            
            // 如果获取成功，填充表单
            if (config) {
                // OpenAI配置
                document.getElementById('openaiApiKey').value = config.openai?.apiKey || '';
                document.getElementById('openaiModel').value = config.openai?.model || 'gpt-4-turbo';
                document.getElementById('openaiEndpoint').value = config.openai?.endpoint || '';
                
                // Anthropic配置
                document.getElementById('anthropicApiKey').value = config.anthropic?.apiKey || '';
                document.getElementById('anthropicModel').value = config.anthropic?.model || 'claude-3-opus-20240229';
                document.getElementById('anthropicEndpoint').value = config.anthropic?.endpoint || '';
                
                // OpenRouter配置
                document.getElementById('openrouterApiKey').value = config.openrouter?.apiKey || '';
                document.getElementById('openrouterModel').value = config.openrouter?.model || 'deepseek/deepseek-r1:free';
                document.getElementById('openrouterEndpoint').value = config.openrouter?.endpoint || 'https://openrouter.ai/api/v1/chat/completions';
                document.getElementById('openrouterReferer').value = config.openrouter?.referer || 'http://localhost';
                document.getElementById('openrouterTitle').value = config.openrouter?.title || 'AI Chat Test';
                
                // 通用设置
                document.getElementById('defaultProvider').value = config.defaultProvider || 'openai';
                document.getElementById('allowUserModelSelection').checked = config.allowUserModelSelection || false;
            } else {
                // 如果后端未返回配置，从localStorage加载作为备份
                loadLocalApiConfig();
            }
        } catch (error) {
            console.error('加载API配置失败:', error);
            apiConfigError.textContent = '从服务器加载配置失败，尝试加载本地配置';
            
            // 尝试从localStorage加载配置
            loadLocalApiConfig();
        }
    }
    
    /**
     * 从localStorage加载API配置（作为备份）
     */
    function loadLocalApiConfig() {
        // OpenAI配置
        const openaiApiKey = localStorage.getItem('xpat_openai_api_key') || '';
        const openaiModel = localStorage.getItem('xpat_openai_model') || 'gpt-4-turbo';
        const openaiEndpoint = localStorage.getItem('xpat_openai_endpoint') || '';
        
        // Anthropic配置
        const anthropicApiKey = localStorage.getItem('xpat_anthropic_api_key') || '';
        const anthropicModel = localStorage.getItem('xpat_anthropic_model') || 'claude-3-opus-20240229';
        const anthropicEndpoint = localStorage.getItem('xpat_anthropic_endpoint') || '';
        
        // OpenRouter配置
        const openrouterApiKey = localStorage.getItem('xpat_openrouter_api_key') || '';
        const openrouterModel = localStorage.getItem('xpat_openrouter_model') || 'deepseek/deepseek-r1:free';
        const openrouterEndpoint = localStorage.getItem('xpat_openrouter_endpoint') || 'https://openrouter.ai/api/v1/chat/completions';
        const openrouterReferer = localStorage.getItem('xpat_openrouter_referer') || 'http://localhost';
        const openrouterTitle = localStorage.getItem('xpat_openrouter_title') || 'AI Chat Test';
        
        // 通用设置
        const defaultProvider = localStorage.getItem('xpat_default_provider') || 'openai';
        const allowUserModelSelection = localStorage.getItem('xpat_allow_user_model_selection') === 'true';
        
        // 填充表单
        document.getElementById('openaiApiKey').value = openaiApiKey;
        document.getElementById('openaiModel').value = openaiModel;
        document.getElementById('openaiEndpoint').value = openaiEndpoint;
        
        document.getElementById('anthropicApiKey').value = anthropicApiKey;
        document.getElementById('anthropicModel').value = anthropicModel;
        document.getElementById('anthropicEndpoint').value = anthropicEndpoint;
        
        document.getElementById('openrouterApiKey').value = openrouterApiKey;
        document.getElementById('openrouterModel').value = openrouterModel;
        document.getElementById('openrouterEndpoint').value = openrouterEndpoint;
        document.getElementById('openrouterReferer').value = openrouterReferer;
        document.getElementById('openrouterTitle').value = openrouterTitle;
        
        document.getElementById('defaultProvider').value = defaultProvider;
        document.getElementById('allowUserModelSelection').checked = allowUserModelSelection;
    }
    
    /**
     * 保存API配置
     */
    async function handleSaveApiConfig() {
        try {
            // 保存后端API地址
            const backendApiUrl = document.getElementById('backendApiUrl').value.trim();
            if (backendApiUrl) {
                localStorage.setItem('xpat_api_url', backendApiUrl);
                window.API_BASE_URL = backendApiUrl;
                console.log('已更新后端API地址:', backendApiUrl);
            }
            
            // 获取表单值
            const openaiApiKey = document.getElementById('openaiApiKey').value.trim();
            const openaiModel = document.getElementById('openaiModel').value;
            const openaiEndpoint = document.getElementById('openaiEndpoint').value.trim();
            
            const anthropicApiKey = document.getElementById('anthropicApiKey').value.trim();
            const anthropicModel = document.getElementById('anthropicModel').value;
            const anthropicEndpoint = document.getElementById('anthropicEndpoint').value.trim();
            
            const openrouterApiKey = document.getElementById('openrouterApiKey').value.trim();
            const openrouterModel = document.getElementById('openrouterModel').value;
            const openrouterEndpoint = document.getElementById('openrouterEndpoint').value.trim();
            const openrouterReferer = document.getElementById('openrouterReferer').value.trim();
            const openrouterTitle = document.getElementById('openrouterTitle').value.trim();
            
            const defaultProvider = document.getElementById('defaultProvider').value;
            const allowUserModelSelection = document.getElementById('allowUserModelSelection').checked;
            
            // 构建配置对象
            const config = {
                openai: {
                    apiKey: openaiApiKey,
                    model: openaiModel,
                    endpoint: openaiEndpoint
                },
                anthropic: {
                    apiKey: anthropicApiKey,
                    model: anthropicModel,
                    endpoint: anthropicEndpoint
                },
                openrouter: {
                    apiKey: openrouterApiKey,
                    model: openrouterModel,
                    endpoint: openrouterEndpoint,
                    referer: openrouterReferer,
                    title: openrouterTitle
                },
                defaultProvider,
                allowUserModelSelection
            };
            
            // 保存到后端
            await window.backendApi.saveApiConfig(config);
            
            // 同时保存到localStorage作为备份
            saveLocalApiConfig(config);
            
            apiConfigError.textContent = '';
            alert('API配置已保存到服务器');
            
        } catch (error) {
            console.error('保存API配置失败:', error);
            apiConfigError.textContent = '保存到服务器失败: ' + error.message;
            
            // 尝试只保存到本地
            try {
                const config = collectFormConfig();
                saveLocalApiConfig(config);
                alert('无法保存到服务器，但已保存到本地');
            } catch (localError) {
                console.error('本地保存也失败:', localError);
            }
        }
    }
    
    /**
     * 收集表单中的配置数据
     */
    function collectFormConfig() {
        return {
            openai: {
                apiKey: document.getElementById('openaiApiKey').value.trim(),
                model: document.getElementById('openaiModel').value,
                endpoint: document.getElementById('openaiEndpoint').value.trim()
            },
            anthropic: {
                apiKey: document.getElementById('anthropicApiKey').value.trim(),
                model: document.getElementById('anthropicModel').value,
                endpoint: document.getElementById('anthropicEndpoint').value.trim()
            },
            openrouter: {
                apiKey: document.getElementById('openrouterApiKey').value.trim(),
                model: document.getElementById('openrouterModel').value,
                endpoint: document.getElementById('openrouterEndpoint').value.trim(),
                referer: document.getElementById('openrouterReferer').value.trim(),
                title: document.getElementById('openrouterTitle').value.trim()
            },
            defaultProvider: document.getElementById('defaultProvider').value,
            allowUserModelSelection: document.getElementById('allowUserModelSelection').checked
        };
    }
    
    /**
     * 保存API配置到localStorage（作为备份）
     */
    function saveLocalApiConfig(config) {
        localStorage.setItem('xpat_openai_api_key', config.openai.apiKey);
        localStorage.setItem('xpat_openai_model', config.openai.model);
        localStorage.setItem('xpat_openai_endpoint', config.openai.endpoint);
        
        localStorage.setItem('xpat_anthropic_api_key', config.anthropic.apiKey);
        localStorage.setItem('xpat_anthropic_model', config.anthropic.model);
        localStorage.setItem('xpat_anthropic_endpoint', config.anthropic.endpoint);
        
        localStorage.setItem('xpat_openrouter_api_key', config.openrouter.apiKey);
        localStorage.setItem('xpat_openrouter_model', config.openrouter.model);
        localStorage.setItem('xpat_openrouter_endpoint', config.openrouter.endpoint);
        localStorage.setItem('xpat_openrouter_referer', config.openrouter.referer);
        localStorage.setItem('xpat_openrouter_title', config.openrouter.title);
        
        localStorage.setItem('xpat_default_provider', config.defaultProvider);
        localStorage.setItem('xpat_allow_user_model_selection', config.allowUserModelSelection);
    }
    
    /**
     * 加载用户列表
     */
    async function loadUsers() {
        // 显示加载状态
        usersLoadingState.style.display = 'block';
        usersEmptyState.style.display = 'none';
        usersTable.querySelector('tbody').innerHTML = '';
        
        // 禁用分页按钮
        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;
        
        try {
            // 调用API获取用户列表
            const response = await window.backendApi.getAllUsers(currentUserPage, 10);
            const users = response.users || [];
            const pagination = response.pagination || { total: 0, page: 1, pages: 1 };
            
            // 更新分页信息
            currentUserPage = pagination.page;
            totalUserPages = pagination.pages;
            currentPageEl.textContent = currentUserPage;
            totalPagesEl.textContent = totalUserPages;
            
            // 启用/禁用分页按钮
            prevPageBtn.disabled = currentUserPage <= 1;
            nextPageBtn.disabled = currentUserPage >= totalUserPages;
            
            // 渲染表格
            renderUsersTable(users);
            
            // 根据数据量显示空状态或表格
            if (users.length === 0) {
                usersEmptyState.style.display = 'block';
                usersTable.style.display = 'none';
            } else {
                usersEmptyState.style.display = 'none';
                usersTable.style.display = 'table';
            }
        } catch (error) {
            console.error('加载用户列表失败:', error);
            usersEmptyState.textContent = '加载用户列表失败: ' + (error.message || '未知错误');
            usersEmptyState.style.display = 'block';
            usersTable.style.display = 'none';
        } finally {
            // 隐藏加载状态
            usersLoadingState.style.display = 'none';
        }
    }
    
    /**
     * 渲染用户表格
     */
    function renderUsersTable(users) {
        if (!usersTable) return;
        
        // 清空表格
        const tbody = usersTable.querySelector('tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        // 显示用户数据
        if (users && users.length > 0) {
            users.forEach(user => {
                const tr = document.createElement('tr');
                
                tr.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.role === 'admin' ? '管理员' : '普通用户'}</td>
                    <td>${user.api_quota || '无限制'}</td>
                    <td>${new Date(user.created_at).toLocaleString()}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-role-btn" data-id="${user.id}" data-role="${user.role}">修改角色</button>
                        <button class="btn btn-sm btn-warning reset-quota-btn" data-id="${user.id}">重置配额</button>
                        <button class="btn btn-sm btn-danger delete-user-btn" data-id="${user.id}" data-username="${user.username}">删除</button>
                    </td>
                `;
                
                tbody.appendChild(tr);
            });
            
            // 绑定按钮事件
            tbody.querySelectorAll('.edit-role-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const currentRole = this.getAttribute('data-role');
                    const newRole = currentRole === 'admin' ? 'user' : 'admin';
                    const user = users.find(u => u.id == id);
                    
                    if (user) {
                        showRoleConfirmModal(user, newRole);
                    }
                });
            });
            
            tbody.querySelectorAll('.reset-quota-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    handleResetQuota(id, users);
                });
            });
            
            // 添加删除用户按钮事件
            tbody.querySelectorAll('.delete-user-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const username = this.getAttribute('data-username');
                    handleDeleteUser(id, username);
                });
            });
            
            // 显示表格，隐藏空状态和加载状态
            usersTable.style.display = 'table';
            if (usersEmptyState) usersEmptyState.style.display = 'none';
            if (usersLoadingState) usersLoadingState.style.display = 'none';
        } else {
            // 显示空状态，隐藏表格和加载状态
            usersTable.style.display = 'none';
            if (usersEmptyState) usersEmptyState.style.display = 'block';
            if (usersLoadingState) usersLoadingState.style.display = 'none';
        }
    }
    
    /**
     * 显示角色修改确认模态框
     */
    function showRoleConfirmModal(user, newRole) {
        // 转换角色显示
        const oldRoleDisplay = user.role === 'admin' ? '管理员' : '普通用户';
        const newRoleDisplay = newRole === 'admin' ? '管理员' : '普通用户';
        
        // 填充模态框内容
        roleChangeUsername.textContent = user.username;
        roleChangeOld.textContent = oldRoleDisplay;
        roleChangeNew.textContent = newRoleDisplay;
        roleChangeUserId.value = user.id;
        roleChangeValue.value = newRole;
        
        // 显示确认模态框
        roleConfirmModalOverlay.style.display = 'flex';
    }
    
    /**
     * 处理角色修改确认
     */
    async function handleConfirmRoleChange() {
        const id = roleChangeUserId.value;
        const role = roleChangeValue.value;
        
        if (!id || !role) return;
        
        try {
            // 调用API更新用户角色
            await window.backendApi.updateUserRole(id, role);
            
            // 关闭确认模态框
            closeRoleConfirmModal();
            
            // 关闭用户编辑模态框
            closeUserModal();
            
            // 重新加载用户列表
            loadUsers();
        } catch (error) {
            console.error('更新用户角色失败:', error);
            userFormError.textContent = '更新角色失败: ' + (error.message || '未知错误');
        }
    }
    
    /**
     * 处理重置配额
     */
    async function handleResetQuota(id, users) {
        // 查找用户数据
        const user = users.find(u => u.id.toString() === id.toString());
        
        if (!user) {
            console.error('找不到用户数据:', id);
            return;
        }
        
        // 询问新的配额值
        const newQuota = prompt(`请输入用户"${user.username}"的新API配额值:`, user.api_quota);
        
        // 验证输入
        if (newQuota === null) return; // 取消操作
        
        const quotaValue = parseInt(newQuota);
        if (isNaN(quotaValue) || quotaValue < 0) {
            alert('请输入有效的配额值（大于等于0的整数）');
            return;
        }
        
        try {
            // 调用API重置用户配额
            await window.backendApi.resetUserApiQuota(id, quotaValue);
            
            // 重新加载用户列表
            loadUsers();
        } catch (error) {
            console.error('重置用户配额失败:', error);
            alert('重置配额失败: ' + (error.message || '未知错误'));
        }
    }
    
    /**
     * 处理保存用户
     */
    async function handleSaveUser() {
        // 获取表单数据
        const id = userId.value;
        const quota = parseInt(userApiQuota.value);
        
        // 表单验证
        if (isNaN(quota) || quota < 0) {
            userFormError.textContent = '请输入有效的配额值（大于等于0的整数）';
            return;
        }
        
        try {
            // 更新用户API配额
            await window.backendApi.resetUserApiQuota(id, quota);
            
            // 关闭模态框
            closeUserModal();
            
            // 重新加载用户列表
            loadUsers();
        } catch (error) {
            console.error('保存用户信息失败:', error);
            userFormError.textContent = '保存失败: ' + (error.message || '未知错误');
        }
    }
    
    /**
     * 关闭用户编辑模态框
     */
    function closeUserModal() {
        userModalOverlay.style.display = 'none';
        userForm.reset();
        userFormError.textContent = '';
    }
    
    /**
     * 关闭角色修改确认模态框
     */
    function closeRoleConfirmModal() {
        roleConfirmModalOverlay.style.display = 'none';
    }

    /**
     * 加载订阅计划列表
     */
    function loadSubscriptions() {
        // 显示加载状态
        subscriptionsTable.classList.add('hidden');
        subscriptionsEmptyState.classList.add('hidden');
        subscriptionsLoadingState.classList.remove('hidden');
        
        BackendAPI.getAllSubscriptionPlans()
            .then(plans => {
                subscriptionsLoadingState.classList.add('hidden');
                
                if (plans && plans.length > 0) {
                    renderSubscriptionsTable(plans);
                    subscriptionsTable.classList.remove('hidden');
                } else {
                    subscriptionsEmptyState.classList.remove('hidden');
                }
            })
            .catch(error => {
                console.error('加载订阅计划失败:', error);
                subscriptionsLoadingState.classList.add('hidden');
                subscriptionsEmptyState.classList.remove('hidden');
            });
    }

    /**
     * 渲染订阅计划表格
     */
    function renderSubscriptionsTable(plans) {
        const tbody = subscriptionsTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        plans.forEach(plan => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${plan.id}</td>
                <td>${plan.name}</td>
                <td>¥${plan.price.toFixed(2)}</td>
                <td>${plan.duration}天</td>
                <td>${plan.apiQuota}</td>
                <td>${plan.subscriberCount || 0}</td>
                <td>
                    <button class="btn btn-sm btn-edit" data-id="${plan.id}">编辑</button>
                    <button class="btn btn-sm btn-delete" data-id="${plan.id}">删除</button>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // 添加编辑和删除按钮的事件监听
        tbody.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const planId = this.getAttribute('data-id');
                const plan = plans.find(p => p.id == planId);
                if (plan) {
                    openSubscriptionModal(plan);
                }
            });
        });
        
        tbody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const planId = this.getAttribute('data-id');
                openDeleteSubscriptionModal(planId);
            });
        });
    }

    /**
     * 加载订阅统计数据
     */
    function loadSubscriptionStats() {
        BackendAPI.getSubscriptionStats()
            .then(stats => {
                // 更新统计卡片
                totalSubscriptionsValue.textContent = stats.totalSubscriptions;
                activeSubscriptionsValue.textContent = stats.activeSubscriptions;
                monthlyRevenueValue.textContent = `¥${stats.monthlyRevenue.toFixed(2)}`;
            })
            .catch(error => {
                console.error('加载订阅统计失败:', error);
                totalSubscriptionsValue.textContent = '0';
                activeSubscriptionsValue.textContent = '0';
                monthlyRevenueValue.textContent = '¥0.00';
            });
    }

    /**
     * 打开订阅计划编辑模态框
     */
    function openSubscriptionModal(plan = null) {
        // 清空表单
        subscriptionForm.reset();
        subscriptionFormError.textContent = '';
        featureList.innerHTML = '';
        
        if (plan) {
            // 编辑模式
            subscriptionModalTitle.textContent = '编辑订阅计划';
            subscriptionId.value = plan.id;
            subscriptionName.value = plan.name;
            subscriptionPrice.value = plan.price;
            subscriptionDuration.value = plan.duration;
            subscriptionApiQuota.value = plan.apiQuota;
            
            // 添加特性列表
            if (plan.features && Array.isArray(plan.features)) {
                plan.features.forEach(feature => {
                    addFeatureItem(feature);
                });
            }
        } else {
            // 新增模式
            subscriptionModalTitle.textContent = '添加订阅计划';
            subscriptionId.value = '';
            
            // 添加默认特性
            addFeatureItem('无限使用基础模型');
            addFeatureItem('优先客服支持');
        }
        
        // 显示模态框
        subscriptionModalOverlay.classList.remove('hidden');
    }

    /**
     * 关闭订阅计划编辑模态框
     */
    function closeSubscriptionModal() {
        subscriptionModalOverlay.classList.add('hidden');
    }

    /**
     * 添加特性项
     */
    function addFeatureItem(featureText = '') {
        const featureItem = document.createElement('div');
        featureItem.className = 'feature-item';
        
        featureItem.innerHTML = `
            <input type="text" class="feature-input" value="${featureText}" placeholder="输入特性描述...">
            <button type="button" class="btn btn-sm btn-danger btn-remove-feature">删除</button>
        `;
        
        // 添加删除按钮事件
        const removeBtn = featureItem.querySelector('.btn-remove-feature');
        removeBtn.addEventListener('click', function() {
            featureItem.remove();
        });
        
        featureList.appendChild(featureItem);
        
        // 如果是通过"添加特性"按钮调用的，聚焦新添加的输入框
        if (!featureText) {
            featureItem.querySelector('.feature-input').focus();
        }
        
        return featureItem;
    }

    /**
     * 保存订阅计划
     */
    function handleSaveSubscription() {
        const subscriptionId = document.getElementById('subscriptionId');
        const subscriptionName = document.getElementById('subscriptionName');
        const subscriptionPrice = document.getElementById('subscriptionPrice');
        const subscriptionDuration = document.getElementById('subscriptionDuration');
        const subscriptionApiQuota = document.getElementById('subscriptionApiQuota');
        const featureList = document.getElementById('featureList');
        const subscriptionFormError = document.getElementById('subscriptionFormError');
        const saveSubscriptionBtn = document.getElementById('saveSubscriptionBtn');
        
        // 获取表单数据
        const id = subscriptionId.value.trim();
        const name = subscriptionName.value.trim();
        const price = parseFloat(subscriptionPrice.value);
        const duration = parseInt(subscriptionDuration.value);
        const apiQuota = parseInt(subscriptionApiQuota.value);
        
        // 获取特性列表
        const features = [];
        featureList.querySelectorAll('.feature-input').forEach(input => {
            const value = input.value.trim();
            if (value) {
                features.push(value);
            }
        });
        
        // 表单验证
        if (!name) {
            subscriptionFormError.textContent = '请输入订阅计划名称';
            return;
        }
        
        if (isNaN(price) || price <= 0) {
            subscriptionFormError.textContent = '请输入有效的价格';
            return;
        }
        
        if (isNaN(duration) || duration <= 0) {
            subscriptionFormError.textContent = '请输入有效的有效期天数';
            return;
        }
        
        if (isNaN(apiQuota) || apiQuota <= 0) {
            subscriptionFormError.textContent = '请输入有效的API配额';
            return;
        }
        
        // 显示保存中状态
        saveSubscriptionBtn.disabled = true;
        saveSubscriptionBtn.textContent = '保存中...';
        subscriptionFormError.textContent = '';
        
        // 准备数据
        const data = {
            name,
            price,
            duration,
            apiQuota,
            features
        };
        
        // 创建或更新订阅计划
        const promise = id 
            ? BackendAPI.updateSubscriptionPlan(id, data)
            : BackendAPI.createSubscriptionPlan(name, price, duration, apiQuota, features);
        
        promise
            .then(() => {
                closeSubscriptionModal();
                loadSubscriptions();
                loadSubscriptionStats();
            })
            .catch(error => {
                subscriptionFormError.textContent = `保存失败: ${error.message || '未知错误'}`;
            })
            .finally(() => {
                saveSubscriptionBtn.disabled = false;
                saveSubscriptionBtn.textContent = '保存';
            });
    }

    /**
     * 处理添加订阅计划按钮点击
     */
    function handleAddSubscription() {
        openSubscriptionModal();
    }

    /**
     * 打开删除订阅计划确认模态框
     */
    function openDeleteSubscriptionModal(planId) {
        deleteSubscriptionId.value = planId;
        deleteSubscriptionModalOverlay.classList.remove('hidden');
    }

    /**
     * 关闭删除订阅计划确认模态框
     */
    function closeDeleteSubscriptionModal() {
        deleteSubscriptionModalOverlay.classList.add('hidden');
    }

    /**
     * 处理确认删除订阅计划
     */
    function handleConfirmDeleteSubscription() {
        const planId = deleteSubscriptionId.value;
        
        // 显示删除中状态
        confirmDeleteSubscriptionBtn.disabled = true;
        confirmDeleteSubscriptionBtn.textContent = '删除中...';
        
        BackendAPI.deleteSubscriptionPlan(planId)
            .then(() => {
                closeDeleteSubscriptionModal();
                loadSubscriptions();
                loadSubscriptionStats();
            })
            .catch(error => {
                alert(`删除失败: ${error.message || '未知错误'}`);
            })
            .finally(() => {
                confirmDeleteSubscriptionBtn.disabled = false;
                confirmDeleteSubscriptionBtn.textContent = '确认删除';
            });
    }
    
    /**
     * 加载API使用统计数据
     */
    function loadApiUsageStats() {
        // 显示加载状态
        apiUsageTable.classList.add('hidden');
        apiUsageEmptyState.classList.add('hidden');
        apiUsageLoadingState.classList.remove('hidden');
        
        BackendAPI.getApiUsageStats()
            .then(stats => {
                apiUsageLoadingState.classList.add('hidden');
                
                // 更新统计卡片
                todayApiCallsValue.textContent = stats.todayApiCalls;
                totalApiCallsValue.textContent = stats.totalApiCalls;
                activeUsersValue.textContent = stats.activeUsers;
                
                // 渲染用户API使用排行
                if (stats.userRankings && stats.userRankings.length > 0) {
                    renderApiUsageTable(stats.userRankings);
                    apiUsageTable.classList.remove('hidden');
                } else {
                    apiUsageEmptyState.classList.remove('hidden');
                }
                
                // 渲染图表
                renderApiUsageCharts(stats);
            })
            .catch(error => {
                console.error('加载API使用统计失败:', error);
                apiUsageLoadingState.classList.add('hidden');
                apiUsageEmptyState.classList.remove('hidden');
                
                // 重置统计卡片
                todayApiCallsValue.textContent = '0';
                totalApiCallsValue.textContent = '0';
                activeUsersValue.textContent = '0';
            });
    }
    
    /**
     * 渲染API使用表格
     */
    function renderApiUsageTable(users) {
        const tbody = apiUsageTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const tr = document.createElement('tr');
            
            // 计算配额使用率
            const quotaUsage = user.apiQuota > 0 ? (user.apiCalls / user.apiQuota * 100).toFixed(1) : 0;
            
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.apiCalls}</td>
                <td>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${Math.min(quotaUsage, 100)}%"></div>
                        <span>${quotaUsage}%</span>
                    </div>
                </td>
                <td>${user.commonModels || '无数据'}</td>
                <td>${user.lastUsage ? new Date(user.lastUsage).toLocaleString() : '从未使用'}</td>
            `;
            
            tbody.appendChild(tr);
        });
    }
    
    /**
     * 渲染API使用图表
     */
    function renderApiUsageCharts(stats) {
        // 这里应该使用图表库如Chart.js来渲染图表
        // 以下为示例，实际实现需要引入相应的图表库
        
        // 日调用量图表
        if (stats.dailyApiCalls && typeof Chart !== 'undefined') {
            // 假设已经引入了Chart.js
            const dailyCtx = dailyApiCallsChart.getContext('2d');
            
            // 清除之前的图表实例
            if (window.dailyApiChart) {
                window.dailyApiChart.destroy();
            }
            
            // 准备数据
            const labels = Object.keys(stats.dailyApiCalls);
            const data = Object.values(stats.dailyApiCalls);
            
            // 创建新图表
            window.dailyApiChart = new Chart(dailyCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '日API调用量',
                        data: data,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } else {
            // 如果没有引入Chart.js，则显示文本数据
            dailyApiCallsChart.innerHTML = '图表库未引入，无法显示图表';
        }
        
        // 模型分布图表
        if (stats.modelDistribution && typeof Chart !== 'undefined') {
            const modelCtx = modelDistributionChart.getContext('2d');
            
            // 清除之前的图表实例
            if (window.modelDistChart) {
                window.modelDistChart.destroy();
            }
            
            // 准备数据
            const labels = Object.keys(stats.modelDistribution);
            const data = Object.values(stats.modelDistribution);
            
            // 创建新图表
            window.modelDistChart = new Chart(modelCtx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(153, 102, 255, 0.6)',
                            'rgba(255, 159, 64, 0.6)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true
                }
            });
        } else {
            // 如果没有引入Chart.js，则显示文本数据
            modelDistributionChart.innerHTML = '图表库未引入，无法显示图表';
        }
    }

    /**
     * 显示添加用户模态框
     */
    function handleAddUser() {
        // 清空表单
        document.getElementById('newUsername').value = '';
        document.getElementById('newEmail').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('newRole').value = 'user';
        document.getElementById('newApiQuota').value = '100';
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('createUserModal'));
        modal.show();
    }
    
    /**
     * 处理创建用户
     */
    async function handleCreateUser() {
        const username = document.getElementById('newUsername').value;
        const email = document.getElementById('newEmail').value;
        const password = document.getElementById('newPassword').value;
        const role = document.getElementById('newRole').value;
        const apiQuota = parseInt(document.getElementById('newApiQuota').value);
        
        if (!username || !email || !password) {
            alert('请填写完整的用户信息');
            return;
        }
        
        try {
            await backendApi.createUser(username, email, password, role, apiQuota);
            alert('用户创建成功');
            
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('createUserModal'));
            modal.hide();
            
            // 重新加载用户列表
            loadUsers();
        } catch (error) {
            alert('创建用户失败: ' + (error.message || '未知错误'));
            console.error('创建用户错误:', error);
        }
    }

    /**
     * 删除用户变量
     */
    let deleteUserId = null;
    
    /**
     * 打开删除用户确认模态框
     */
    function handleDeleteUser(id, username) {
        deleteUserId = id;
        document.getElementById('deleteUserName').textContent = username;
        const modal = new bootstrap.Modal(document.getElementById('deleteUserModal'));
        modal.show();
    }
    
    /**
     * 确认删除用户
     */
    async function handleConfirmDeleteUser() {
        if (!deleteUserId) return;
        
        try {
            await backendApi.deleteUser(deleteUserId);
            alert('用户删除成功');
            
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteUserModal'));
            modal.hide();
            
            // 重新加载用户列表
            loadUsers();
        } catch (error) {
            alert('删除用户失败: ' + (error.message || '未知错误'));
            console.error('删除用户错误:', error);
        }
    }
}); 