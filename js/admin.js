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
     * 初始化各个管理模块
     */
    function initModules() {
        // 加载提示词列表
        loadPrompts();
        
        // 加载用户列表
        loadUsers();
        
        // 加载订阅管理
        loadSubscriptions();
        loadSubscriptionStats();
        
        // 加载API使用统计
        loadApiUsageStats();
    }
    
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
            
            // 初始化各个管理模块
            initModules();
        }
    }
    
    /**
     * 设置CORS模式，适应GitHub Pages环境
     */
    function setupCorsMode() {
        // 检测是否在GitHub Pages环境
        const isGitHubPages = window.location.hostname.includes('github.io');
        
        if (isGitHubPages) {
            // 修改backendApi中的API_BASE_URL
            // 注意：需要部署后端到支持CORS的服务器上
            const apiBaseUrl = prompt(
                '您正在GitHub Pages环境运行，请输入后端API地址（例如：https://your-api-server.com/api）',
                'http://localhost:3000/api'
            );
            
            if (apiBaseUrl) {
                window.API_BASE_URL = apiBaseUrl;
                console.log('已设置API地址为:', apiBaseUrl);
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
            // 假设我们有一个API端点来获取配置
            // 如果后端API尚未实现，可以先从localStorage加载
            const savedConfig = localStorage.getItem('xpat_api_config');
            
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                
                // 填充表单
                document.getElementById('openaiApiKey').value = config.openai?.apiKey || '';
                document.getElementById('openaiModel').value = config.openai?.model || 'gpt-4';
                document.getElementById('openaiEndpoint').value = config.openai?.endpoint || 'https://api.openai.com/v1';
                
                document.getElementById('anthropicApiKey').value = config.anthropic?.apiKey || '';
                document.getElementById('anthropicModel').value = config.anthropic?.model || 'claude-3-opus-20240229';
                document.getElementById('anthropicEndpoint').value = config.anthropic?.endpoint || 'https://api.anthropic.com';
                
                document.getElementById('defaultProvider').value = config.defaultProvider || 'openai';
                document.getElementById('allowUserModelSelection').checked = config.allowUserModelSelection || false;
            }
            
            // 当实现后端API后，这里可以替换为真实的API调用
            // const response = await fetch('/api/admin/config', {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('xpat_auth_token')}`
            //     }
            // });
            // const config = await response.json();
            // 然后填充表单...
            
        } catch (error) {
            console.error('加载API配置失败:', error);
            apiConfigError.textContent = '加载配置失败: ' + (error.message || '未知错误');
        }
    }
    
    /**
     * 处理保存API配置
     */
    async function handleSaveApiConfig() {
        try {
            // 收集表单数据
            const config = {
                openai: {
                    apiKey: document.getElementById('openaiApiKey').value,
                    model: document.getElementById('openaiModel').value,
                    endpoint: document.getElementById('openaiEndpoint').value
                },
                anthropic: {
                    apiKey: document.getElementById('anthropicApiKey').value,
                    model: document.getElementById('anthropicModel').value,
                    endpoint: document.getElementById('anthropicEndpoint').value
                },
                defaultProvider: document.getElementById('defaultProvider').value,
                allowUserModelSelection: document.getElementById('allowUserModelSelection').checked
            };
            
            // 保存到localStorage（临时方案，直到后端API实现）
            localStorage.setItem('xpat_api_config', JSON.stringify(config));
            
            // 提示保存成功
            apiConfigError.textContent = '';
            apiConfigError.style.color = '#4caf50';
            apiConfigError.textContent = '配置保存成功';
            
            // 当后端API实现后，这里应该发送至服务器
            // const response = await fetch('/api/admin/config', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${localStorage.getItem('xpat_auth_token')}`
            //     },
            //     body: JSON.stringify(config)
            // });
            
            // if (!response.ok) {
            //     throw new Error('保存配置失败');
            // }
            
            // 三秒后清除成功消息
            setTimeout(() => {
                if (apiConfigError.style.color === '#4caf50') {
                    apiConfigError.textContent = '';
                }
            }, 3000);
            
        } catch (error) {
            console.error('保存API配置失败:', error);
            apiConfigError.style.color = '#f44336';
            apiConfigError.textContent = '保存配置失败: ' + (error.message || '未知错误');
        }
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
        const tbody = usersTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const tr = document.createElement('tr');
            
            // 格式化创建时间
            const createdAt = new Date(user.created_at);
            const formattedDate = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;
            
            // 角色显示
            const roleDisplay = user.role === 'admin' 
                ? '<span class="role-badge role-admin">管理员</span>' 
                : '<span class="role-badge role-user">普通用户</span>';
            
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${roleDisplay}</td>
                <td>${user.api_quota}</td>
                <td>${user.api_usage}</td>
                <td>${formattedDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-button edit-user-button" data-id="${user.id}" title="编辑">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M18.5 2.5C18.7626 2.23735 19.1189 2.07855 19.5 2.07855C19.8811 2.07855 20.2374 2.23735 20.5 2.5C20.7626 2.76265 20.9214 3.11895 20.9214 3.5C20.9214 3.88105 20.7626 4.23735 20.5 4.5L12 13L9 14L10 11L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button class="action-button reset-quota-button" data-id="${user.id}" title="重置配额">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23 4V10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M1 20V14H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M20.49 9C19.2462 6.28075 16.7512 4.39139 13.8163 3.87541C10.8813 3.35943 7.882 4.25908 5.61723 6.32332C3.35247 8.38756 2.10566 11.3987 2.22597 14.4876C2.34628 17.5765 3.82394 20.4853 6.26 22.36" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M3.51 15C4.75379 17.7193 7.24876 19.6086 10.1837 20.1246C13.1187 20.6406 16.118 19.7409 18.3828 17.6767C20.6475 15.6124 21.8943 12.6013 21.774 9.51237C21.6537 6.42346 20.1761 3.51465 17.74 1.64001" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // 绑定编辑和重置配额按钮事件
        document.querySelectorAll('.edit-user-button').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                handleEditUser(id, users);
            });
        });
        
        document.querySelectorAll('.reset-quota-button').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                handleResetQuota(id, users);
            });
        });
    }
    
    /**
     * 处理编辑用户
     */
    function handleEditUser(id, users) {
        // 查找用户数据
        const user = users.find(u => u.id.toString() === id.toString());
        
        if (!user) {
            console.error('找不到用户数据:', id);
            return;
        }
        
        // 填充表单
        userId.value = user.id;
        userUsername.value = user.username;
        userEmail.value = user.email;
        userRole.value = user.role;
        userApiQuota.value = user.api_quota;
        
        // 清除错误信息
        userFormError.textContent = '';
        
        // 设置模态框标题
        userModalTitle.textContent = '编辑用户';
        
        // 显示模态框
        userModalOverlay.style.display = 'flex';
        
        // 监听角色变更
        const originalRole = user.role;
        userRole.addEventListener('change', function() {
            if (this.value !== originalRole) {
                showRoleConfirmModal(user, this.value);
                // 重置选择
                this.value = originalRole;
            }
        });
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
                    <button class="btn btn-sm btn-primary edit-plan-btn" data-id="${plan.id}">编辑</button>
                    <button class="btn btn-sm btn-danger delete-plan-btn" data-id="${plan.id}">删除</button>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // 添加编辑和删除按钮的事件监听
        tbody.querySelectorAll('.edit-plan-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const planId = this.getAttribute('data-id');
                const plan = plans.find(p => p.id == planId);
                if (plan) {
                    openSubscriptionModal(plan);
                }
            });
        });
        
        tbody.querySelectorAll('.delete-plan-btn').forEach(btn => {
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
        subscriptionModalOverlay.style.display = 'flex';
    }

    /**
     * 关闭订阅计划编辑模态框
     */
    function closeSubscriptionModal() {
        subscriptionModalOverlay.style.display = 'none';
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
    }

    /**
     * 打开删除订阅计划确认模态框
     */
    function openDeleteSubscriptionModal(planId) {
        deleteSubscriptionId.value = planId;
        deleteSubscriptionModalOverlay.style.display = 'flex';
    }

    /**
     * 关闭删除订阅计划确认模态框
     */
    function closeDeleteSubscriptionModal() {
        deleteSubscriptionModalOverlay.style.display = 'none';
    }
}); 