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
        
        // 分类筛选
        promptCategoryFilter.addEventListener('change', function() {
            loadPrompts(this.value);
        });
        
        // 添加提示词按钮
        addPromptBtn.addEventListener('click', handleAddPrompt);
        
        // 模态框关闭按钮
        closeModalBtn.addEventListener('click', closeModal);
        cancelPromptBtn.addEventListener('click', closeModal);
        
        // 保存提示词按钮
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
}); 