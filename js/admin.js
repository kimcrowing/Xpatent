/**
 * 管理后台JavaScript
 * 处理管理员登录、提示词管理等功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化API基础URL（如果没有设置）
    if (!window.API_BASE_URL) {
        // 从localStorage中获取
        const savedApiUrl = localStorage.getItem('xpat_api_url');
        if (savedApiUrl) {
            window.API_BASE_URL = savedApiUrl;
            console.log('从本地存储加载API地址:', savedApiUrl);
        } else {
            // 设置默认API地址
            const defaultApiUrl = 'http://localhost:3000/api';
            window.API_BASE_URL = defaultApiUrl;
            localStorage.setItem('xpat_api_url', defaultApiUrl);
            console.log('未找到API地址配置，设置默认地址:', defaultApiUrl);
        }
    }

    // DOM元素引用
    const loginContainer = document.getElementById('loginContainer');
    const adminContent = document.getElementById('adminContent');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginForm = document.getElementById('loginForm');
    const proSubscriptionBtn = document.getElementById('proSubscriptionBtn');
    const cancelUserApiKeyBtn = document.getElementById('cancelUserApiKeyBtn');
    
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
        loginForm.addEventListener('submit', handleLoginSubmit);
        
        // 退出登录
        logoutBtn.addEventListener('click', handleLogout);
        
        // 绑定Tab切换事件
        bindTabSwitchEvents();
        
        // 仪表盘事件
        bindDashboardEvents();
        
        // 绑定提示词管理事件
        bindPromptsEvents();
        
        // 绑定订阅管理事件
        bindSubscriptionEvents();
        
        // 绑定用户管理事件
        bindUserEvents();
        
        // 绑定API日志事件
        bindApiLogsEvents();
        
        // 绑定管理员日志事件
        bindAdminLogsEvents();
        
        // 绑定API密钥管理事件
        bindApiKeysEvents();
        
        // 绑定API配置事件
        bindApiConfigEvents();
        
        // 绑定对话模式管理事件
        bindChatModeEvents();
        
        // 绑定用户功能配置事件
        bindUserFeaturesConfigEvents();
    }

    /**
     * 初始化页面内容
     */
    async function initializeContent() {
        // 检查是否有管理员token
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            showLoginInterface();
            return;
        }

        try {
            // 验证token有效性
            const response = await fetch('/api/admin/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            if (!response.ok) {
                localStorage.removeItem('adminToken');
                showLoginInterface();
                return;
            }

            // 显示管理员界面
            showAdminInterface();
            
            // 根据当前活动的标签页加载内容
            const activeTab = document.querySelector('li.active');
            if (activeTab) {
                const tabId = activeTab.getAttribute('data-tab');
                
                switch (tabId) {
                    case 'dashboard':
                        await initializeDashboard();
                        break;
                    case 'promptsManagement':
                        await loadPrompts();
                        break;
                    case 'apiConfig':
                        await loadApiConfig();
                        break;
                    case 'userManagement':
                        await loadUsers();
                        break;
                    case 'subscriptionManagement':
                        await loadSubscriptions();
                        break;
                    case 'apiUsage':
                        await loadApiUsageStats();
                        break;
                    case 'domainTemplates':
                        await loadDomainTemplates();
                        break;
                    case 'apiKeysManagement':
                        await loadAllApiKeys();
                        break;
                    case 'adminLogs':
                        await loadAdminLogs();
                        break;
                }
            }
        } catch (error) {
            console.error('验证管理员token失败', error);
            localStorage.removeItem('adminToken');
            showLoginInterface();
        }
    }

    // 新增仪表板功能代码
    let dashboardCharts = {};
    let currentDashboardPeriod = 7;

    /**
     * 绑定仪表盘事件
     */
    function bindDashboardEvents() {
        // 刷新按钮点击事件
        const refreshDashboardBtn = document.getElementById('refreshDashboardBtn');
        if (refreshDashboardBtn) {
            refreshDashboardBtn.addEventListener('click', function() {
                initializeDashboard(currentDashboardPeriod);
            });
        }

        // 时间周期选择
        const dashboardPeriodBtn = document.getElementById('dashboardPeriodBtn');
        const periodDropdownItems = document.querySelectorAll('.dropdown-menu a[data-period]');
        
        if (dashboardPeriodBtn) {
            dashboardPeriodBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const dropdownMenu = this.nextElementSibling;
                dropdownMenu.classList.toggle('show');
            });
            
            // 点击其他区域关闭下拉菜单
            document.addEventListener('click', function(e) {
                if (!dashboardPeriodBtn.contains(e.target)) {
                    const dropdownMenu = dashboardPeriodBtn.nextElementSibling;
                    if (dropdownMenu) {
                        dropdownMenu.classList.remove('show');
                    }
                }
            });
        }
        
        // 周期选择事件
        if (periodDropdownItems.length > 0) {
            periodDropdownItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // 移除其他项的active类
                    periodDropdownItems.forEach(i => i.classList.remove('active'));
                    // 添加当前项的active类
                    this.classList.add('active');
                    
                    // 更新按钮文本
                    currentDashboardPeriod = parseInt(this.dataset.period);
                    const periodText = this.textContent;
                    dashboardPeriodBtn.querySelector('span').textContent = periodText;
                    
                    // 关闭下拉菜单
                    const dropdownMenu = dashboardPeriodBtn.nextElementSibling;
                    if (dropdownMenu) {
                        dropdownMenu.classList.remove('show');
                    }
                    
                    // 重新加载数据
                    initializeDashboard(currentDashboardPeriod);
                });
            });
        }
    }
    
    /**
     * 初始化仪表板
     */
    async function initializeDashboard(days = 7) {
        console.log(`初始化仪表盘，周期: ${days}天...`);
        
        try {
            // 显示加载状态
            const loadingEl = document.getElementById('dashboardLoadingState');
            const errorEl = document.getElementById('dashboardErrorState');
            
            if (loadingEl) loadingEl.style.display = 'block';
            if (errorEl) errorEl.style.display = 'none';
            
            // 获取总览数据
            const overviewData = await fetchDashboardOverview();
            renderDashboardOverview(overviewData);
            
            // 获取用户相关数据
            const userData = await fetchUserStats(days);
            renderUserStats(userData);
            
            // 获取API使用数据
            const apiData = await fetchApiUsageStats(days);
            renderApiUsageOverview(apiData);
            
            // 获取订阅相关数据
            const subscriptionData = await fetchSubscriptionStats(days);
            renderSubscriptionStats(subscriptionData);
            
            // 隐藏加载状态
            if (loadingEl) loadingEl.style.display = 'none';
        } catch (error) {
            console.error("加载仪表盘数据失败", error);
            const loadingEl = document.getElementById('dashboardLoadingState');
            const errorEl = document.getElementById('dashboardErrorState');
            
            if (loadingEl) loadingEl.style.display = 'none';
            if (errorEl) {
                errorEl.style.display = 'block';
                errorEl.textContent = `加载仪表盘数据失败: ${error.message}`;
            }
        }
    }

    /**
     * 获取仪表板概览数据
     */
    async function fetchDashboardOverview() {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/admin/dashboard/overview', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`获取概览数据失败: ${response.status}`);
        }
        
        return await response.json();
    }

    /**
     * 获取用户统计数据
     */
    async function fetchUserStats(days = 7) {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/admin/dashboard/user-stats?days=${days}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`获取用户统计数据失败: ${response.status}`);
        }
        
        return await response.json();
    }

    /**
     * 获取API使用统计数据
     */
    async function fetchApiUsageStats(days = 7) {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/admin/dashboard/api-usage?days=${days}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`获取API使用统计数据失败: ${response.status}`);
        }
        
        return await response.json();
    }

    /**
     * 获取订阅统计数据
     */
    async function fetchSubscriptionStats(days = 7) {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/admin/dashboard/subscription-stats?days=${days}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`获取订阅统计数据失败: ${response.status}`);
        }
        
        return await response.json();
    }

    /**
     * 渲染仪表板概览数据
     */
    function renderDashboardOverview(data) {
        // 填充数据卡片
        const totalUsersEl = document.getElementById('totalUsersValue');
        const activeUsersEl = document.getElementById('activeUsersValue');
        const totalApiCallsEl = document.getElementById('totalApiCallsValue');
        const todayApiCallsEl = document.getElementById('todayApiCallsValue');
        
        if (totalUsersEl) totalUsersEl.textContent = data.totalUsers || 0;
        if (activeUsersEl) activeUsersEl.textContent = data.activeUsers || 0;
        if (totalApiCallsEl) totalApiCallsEl.textContent = formatNumber(data.totalApiCalls || 0);
        if (todayApiCallsEl) todayApiCallsEl.textContent = formatNumber(data.todayApiCalls || 0);
        
        // 设置增长率指标
        setGrowthIndicator('totalUsersGrowth', data.userGrowthRate);
        setGrowthIndicator('activeUsersGrowth', data.activeUserGrowthRate);
        setGrowthIndicator('totalApiCallsGrowth', data.apiCallGrowthRate);
        setGrowthIndicator('todayApiCallsGrowth', data.todayApiCallGrowthRate);
    }

    /**
     * 设置增长指标显示
     */
    function setGrowthIndicator(elementId, growthRate) {
        const element = document.getElementById(elementId);
        if (!element || growthRate === undefined) return;
        
        // 设置增长率文字
        element.textContent = `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`;
        
        // 根据增长率设置颜色和图标
        if (growthRate > 0) {
            element.className = 'growth-indicator positive';
            element.innerHTML = `<span class="growth-arrow">↑</span> ${element.textContent}`;
        } else if (growthRate < 0) {
            element.className = 'growth-indicator negative';
            element.innerHTML = `<span class="growth-arrow">↓</span> ${element.textContent}`;
        } else {
            element.className = 'growth-indicator neutral';
            element.innerHTML = `<span class="growth-arrow">→</span> ${element.textContent}`;
        }
    }
    
    /**
     * 渲染用户统计数据
     */
    function renderUserStats(data) {
        // 渲染用户增长趋势图
        renderUserGrowthChart(data.userGrowthData);
        
        // 渲染用户角色分布图
        renderUserRoleChart(data.userRoleDistribution);
        
        // 渲染用户活跃度图表
        renderUserActivityChart(data.userActivityData);
    }

    /**
     * 渲染用户增长趋势图
     */
    function renderUserGrowthChart(data) {
        const chartEl = document.getElementById('userGrowthChart');
        if (!chartEl) return;
        
        const ctx = chartEl.getContext('2d');
        
        // 销毁已存在的图表
        if (dashboardCharts.userGrowth) {
            dashboardCharts.userGrowth.destroy();
        }
        
        // 创建新图表
        dashboardCharts.userGrowth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => item.date),
                datasets: [{
                    label: '新增用户数',
                    data: data.map(item => item.newUsers),
                    borderColor: '#4d8af0',
                    backgroundColor: 'rgba(77, 138, 240, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '用户增长趋势'
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(200, 200, 200, 0.1)'
                        }
                    }
                }
            }
        });
    }

    /**
     * 渲染用户角色分布图
     */
    function renderUserRoleChart(data) {
        const chartEl = document.getElementById('userRoleChart');
        if (!chartEl) return;
        
        const ctx = chartEl.getContext('2d');
        
        // 销毁已存在的图表
        if (dashboardCharts.userRole) {
            dashboardCharts.userRole.destroy();
        }
        
        // 获取角色数据
        const roles = Object.keys(data);
        const counts = Object.values(data);
        
        // 创建新图表
        dashboardCharts.userRole = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: roles.map(role => translateRole(role)),
                datasets: [{
                    data: counts,
                    backgroundColor: [
                        '#4d8af0',
                        '#f7c46c',
                        '#4caf50',
                        '#e74c3c',
                        '#9966ff'
                    ],
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '用户角色分布'
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12
                        }
                    }
                }
            }
        });
    }

    /**
     * 渲染用户活跃度图表
     */
    function renderUserActivityChart(data) {
        const chartEl = document.getElementById('userActivityChart');
        if (!chartEl) return;
        
        const ctx = chartEl.getContext('2d');
        
        // 销毁已存在的图表
        if (dashboardCharts.userActivity) {
            dashboardCharts.userActivity.destroy();
        }
        
        // 创建新图表
        dashboardCharts.userActivity = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.date),
                datasets: [{
                    label: '日活跃用户数',
                    data: data.map(item => item.activeUsers),
                    backgroundColor: '#4caf50',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '用户活跃度趋势'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(200, 200, 200, 0.1)'
                        }
                    }
                }
            }
        });
    }

    /**
     * 渲染API使用概览
     */
    function renderApiUsageOverview(data) {
        // 渲染API调用趋势图
        renderApiCallsChart(data.apiCallsTrend);
        
        // 渲染模型使用分布图
        renderModelUsageChart(data.modelDistribution);
        
        // 渲染用户配额使用图
        renderQuotaUsageChart(data.quotaUsage);
    }

    /**
     * 渲染API调用趋势图
     */
    function renderApiCallsChart(data) {
        const chartEl = document.getElementById('apiCallsChart');
        if (!chartEl) return;
        
        const ctx = chartEl.getContext('2d');
        
        // 销毁已存在的图表
        if (dashboardCharts.apiCalls) {
            dashboardCharts.apiCalls.destroy();
        }
        
        // 创建新图表
        dashboardCharts.apiCalls = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => item.date),
                datasets: [{
                    label: 'API调用量',
                    data: data.map(item => item.calls),
                    borderColor: '#9966ff',
                    backgroundColor: 'rgba(153, 102, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'API调用趋势'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(200, 200, 200, 0.1)'
                        }
                    }
                }
            }
        });
    }

    /**
     * 渲染模型使用分布图
     */
    function renderModelUsageChart(data) {
        const chartEl = document.getElementById('modelUsageChart');
        if (!chartEl) return;
        
        const ctx = chartEl.getContext('2d');
        
        // 销毁已存在的图表
        if (dashboardCharts.modelUsage) {
            dashboardCharts.modelUsage.destroy();
        }
        
        // 获取模型数据
        const models = Object.keys(data);
        const counts = Object.values(data);
        
        // 创建新图表
        dashboardCharts.modelUsage = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: models,
                datasets: [{
                    data: counts,
                    backgroundColor: [
                        '#4d8af0',
                        '#f7c46c',
                        '#4caf50',
                        '#e74c3c',
                        '#9966ff',
                        '#3498db'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '模型使用分布'
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12
                        }
                    }
                }
            }
        });
    }
    
    /**
     * 渲染配额使用图
     */
    function renderQuotaUsageChart(data) {
        const chartEl = document.getElementById('quotaUsageChart');
        if (!chartEl) return;
        
        const ctx = chartEl.getContext('2d');
        
        // 销毁已存在的图表
        if (dashboardCharts.quotaUsage) {
            dashboardCharts.quotaUsage.destroy();
        }
        
        // 创建新图表
        dashboardCharts.quotaUsage = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => truncateText(item.username, 10)),
                datasets: [{
                    label: '已使用',
                    data: data.map(item => item.usage),
                    backgroundColor: '#4d8af0'
                }, {
                    label: '剩余配额',
                    data: data.map(item => item.quota - item.usage),
                    backgroundColor: '#f0f0f0'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '用户配额使用情况'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const index = context.dataIndex;
                                const user = data[index];
                                return `${user.username}: 已用${user.usage}/${user.quota}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(200, 200, 200, 0.1)'
                        }
                    }
                }
            }
        });
    }
    
    /**
     * 渲染订阅统计数据
     */
    function renderSubscriptionStats(data) {
        // 填充数据卡片
        const totalSubsEl = document.getElementById('totalSubscriptionsValue');
        const activeSubsEl = document.getElementById('activeSubscriptionsValue');
        const revenueEl = document.getElementById('monthlyRevenueValue');
        
        if (totalSubsEl) totalSubsEl.textContent = data.totalSubscriptions || 0;
        if (activeSubsEl) activeSubsEl.textContent = data.activeSubscriptions || 0;
        if (revenueEl) revenueEl.textContent = formatCurrency(data.monthlyRevenue || 0);
        
        // 渲染订阅计划分布图
        renderSubscriptionPlanChart(data.planDistribution);
        
        // 渲染订阅趋势图
        renderSubscriptionTrendChart(data.subscriptionTrend);
    }

    /**
     * 渲染订阅计划分布图
     */
    function renderSubscriptionPlanChart(data) {
        const chartEl = document.getElementById('subscriptionPlanChart');
        if (!chartEl) return;
        
        const ctx = chartEl.getContext('2d');
        
        // 销毁已存在的图表
        if (dashboardCharts.subscriptionPlan) {
            dashboardCharts.subscriptionPlan.destroy();
        }
        
        // 获取计划数据
        const plans = Object.keys(data);
        const counts = Object.values(data);
        
        // 创建新图表
        dashboardCharts.subscriptionPlan = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: plans,
                datasets: [{
                    data: counts,
                    backgroundColor: [
                        '#4caf50',
                        '#4d8af0',
                        '#f7c46c',
                        '#e74c3c',
                        '#9966ff'
                    ],
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '订阅计划分布'
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12
                        }
                    }
                }
            }
        });
    }

    /**
     * 渲染订阅趋势图
     */
    function renderSubscriptionTrendChart(data) {
        const chartEl = document.getElementById('subscriptionTrendChart');
        if (!chartEl) return;
        
        const ctx = chartEl.getContext('2d');
        
        // 销毁已存在的图表
        if (dashboardCharts.subscriptionTrend) {
            dashboardCharts.subscriptionTrend.destroy();
        }
        
        // 创建新图表
        dashboardCharts.subscriptionTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => item.date),
                datasets: [{
                    label: '新增订阅',
                    data: data.map(item => item.newSubscriptions),
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: '终止订阅',
                    data: data.map(item => item.endedSubscriptions),
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '订阅趋势'
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(200, 200, 200, 0.1)'
                        }
                    }
                }
            }
        });
    }

    /**
     * 格式化数字（添加千位分隔符）
     */
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    /**
     * 格式化货币
     */
    function formatCurrency(amount) {
        return '¥' + formatNumber(amount.toFixed(2));
    }

    // 在原有的initializeContent函数中添加仪表盘初始化
    const originalInitializeContent = initializeContent;
    initializeContent = async function() {
        await originalInitializeContent();
        
        // 绑定仪表盘事件
        bindDashboardEvents();
        
        // 初始化仪表盘数据（如果当前是仪表盘页面）
        const activeTab = document.querySelector('li.active');
        if (activeTab && activeTab.getAttribute('data-tab') === 'dashboard') {
            await initializeDashboard();
        }
    };

    // 初始化
    checkAuthStatus();
    setupEventListeners();
    setupTabNavigation();
    
    // 如果已登录，加载初始数据
    if (isAuthenticated()) {
        loadPrompts();
        loadUsers();
        loadSubscriptions();
        loadApiUsageStats();
        loadApiUsageCharts();
        loadAllApiKeys();
    }

    /**
     * 绑定Tab切换事件
     */
    function bindTabSwitchEvents() {
        document.querySelectorAll('.nav-tabs li').forEach(tab => {
            tab.addEventListener('click', function() {
                // 移除所有Tab的active类
                document.querySelectorAll('.nav-tabs li').forEach(t => t.classList.remove('active'));
                
                // 添加当前Tab的active类
                this.classList.add('active');
                
                // 获取目标Tab内容
                const target = this.getAttribute('data-tab');
                
                // 隐藏所有Tab内容
                document.querySelectorAll('.admin-section').forEach(section => {
                    section.style.display = 'none';
                });
                
                // 显示目标Tab内容
                document.getElementById(target).style.display = 'block';
                
                // 特殊处理：加载特定Tab的数据
                if (target === 'dashboard') {
                    initializeDashboard();
                } else if (target === 'userManagement') {
                    loadUsers();
                } else if (target === 'promptsManagement') {
                    loadPrompts();
                } else if (target === 'apiUsage') {
                    loadApiUsageStats();
                } else if (target === 'apiKeysManagement') {
                    loadAllApiKeys();
                } else if (target === 'adminLogs') {
                    loadAdminLogs();
                } else if (target === 'subscriptionManagement') {
                    loadSubscriptions();
                }
            });
        });
        
        // 侧边栏菜单项点击事件
        document.querySelectorAll('aside.sidebar li[data-tab]').forEach(item => {
            item.addEventListener('click', function() {
                // 移除所有菜单项的active类
                document.querySelectorAll('aside.sidebar li[data-tab]').forEach(i => i.classList.remove('active'));
                
                // 添加当前菜单项的active类
                this.classList.add('active');
                
                // 获取目标内容
                const target = this.getAttribute('data-tab');
                
                // 隐藏所有内容区域
                document.querySelectorAll('.admin-section').forEach(section => {
                    section.style.display = 'none';
                });
                
                // 显示目标内容区域
                const targetSection = document.getElementById(target);
                if (targetSection) {
                    targetSection.style.display = 'block';
                }
                
                // 特殊处理：加载特定页面的数据
                if (target === 'dashboard') {
                    initializeDashboard();
                } else if (target === 'userManagement') {
                    loadUsers();
                } else if (target === 'promptsManagement') {
                    loadPrompts();
                } else if (target === 'apiUsage') {
                    loadApiUsageStats();
                } else if (target === 'apiKeysManagement') {
                    loadAllApiKeys();
                } else if (target === 'adminLogs') {
                    loadAdminLogs();
                } else if (target === 'subscriptionManagement') {
                    loadSubscriptions();
                } else if (target === 'apiConfig') {
                    loadApiConfig();
                } else if (target === 'domainTemplates') {
                    loadDomainTemplates();
                }
            });
        });
    }

    /**
     * 绑定管理员日志相关事件
     */
    function bindAdminLogsEvents() {
        // 绑定筛选按钮
        const filterLogsBtn = document.getElementById('filterLogsBtn');
        if (filterLogsBtn) {
            filterLogsBtn.addEventListener('click', () => {
                loadAdminLogs(1); // 筛选时重置到第一页
            });
        }
        
        // 绑定分页按钮
        const logsPrevBtn = document.getElementById('logsPrevBtn');
        const logsNextBtn = document.getElementById('logsNextBtn');
        
        if (logsPrevBtn) {
            logsPrevBtn.addEventListener('click', () => {
                const currentPage = parseInt(document.getElementById('logsCurrentPage').textContent);
                if (currentPage > 1) {
                    loadAdminLogs(currentPage - 1);
                }
            });
        }
        
        if (logsNextBtn) {
            logsNextBtn.addEventListener('click', () => {
                const currentPage = parseInt(document.getElementById('logsCurrentPage').textContent);
                const totalPages = parseInt(document.getElementById('logsTotalPages').textContent);
                if (currentPage < totalPages) {
                    loadAdminLogs(currentPage + 1);
                }
            });
        }
        
        // 设置日期选择器默认值
        const today = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        const logStartDate = document.getElementById('logStartDate');
        const logEndDate = document.getElementById('logEndDate');
        
        if (logStartDate) logStartDate.value = formatDate(lastMonth);
        if (logEndDate) logEndDate.value = formatDate(today);
    }
    
    /**
     * 加载管理员操作日志
     * @param {number} page - 页码
     */
    async function loadAdminLogs(page = 1) {
        try {
            // 获取筛选条件
            const actionType = document.getElementById('actionTypeFilter').value;
            const startDate = document.getElementById('logStartDate').value;
            const endDate = document.getElementById('logEndDate').value;
            
            // 构建查询参数
            const queryParams = new URLSearchParams({
                page,
                limit: 10
            });
            
            if (actionType) queryParams.append('actionType', actionType);
            if (startDate) queryParams.append('startDate', startDate);
            if (endDate) queryParams.append('endDate', endDate);
            
            // 显示加载状态
            document.getElementById('logsLoadingState').style.display = 'block';
            document.getElementById('logsEmptyState').style.display = 'none';
            
            // 调用API获取日志
            const result = await window.backendApi.getAdminAuditLogs(queryParams.toString());
            
            // 更新分页信息
            document.getElementById('logsCurrentPage').textContent = page;
            document.getElementById('logsTotalPages').textContent = result.pagination.totalPages;
            document.getElementById('logsPrevBtn').disabled = page <= 1;
            document.getElementById('logsNextBtn').disabled = page >= result.pagination.totalPages;
            
            // 渲染日志表格
            renderAdminLogsTable(result.logs);
            
            // 隐藏加载状态
            document.getElementById('logsLoadingState').style.display = 'none';
            
            // 如果没有数据，显示空状态
            if (!result.logs || result.logs.length === 0) {
                document.getElementById('logsEmptyState').style.display = 'block';
            }
        } catch (error) {
            console.error('加载管理员日志失败:', error);
            document.getElementById('logsLoadingState').style.display = 'none';
            document.getElementById('logsEmptyState').style.display = 'block';
            document.getElementById('logsEmptyState').innerHTML = `
                <p>加载失败: ${error.message || '未知错误'}</p>
            `;
        }
    }
    
    /**
     * 渲染管理员日志表格
     * @param {Array} logs - 日志列表
     */
    function renderAdminLogsTable(logs) {
        const tbody = document.querySelector('#adminLogsTable tbody');
        tbody.innerHTML = '';
        
        if (!logs || logs.length === 0) return;
        
        logs.forEach(log => {
            const tr = document.createElement('tr');
            
            // 根据状态码设置行样式
            const isSuccess = log.status_code >= 200 && log.status_code < 400;
            const statusClass = isSuccess ? 'success' : 'danger';
            
            // 格式化时间
            const timestamp = new Date(log.timestamp).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            tr.innerHTML = `
                <td>${timestamp}</td>
                <td>${log.username || log.user_id}</td>
                <td>${translateActionType(log.action_type)}</td>
                <td title="${log.resource}">${truncateText(log.resource, 20)}</td>
                <td>${log.method}</td>
                <td class="text-${statusClass}">${log.status_code}</td>
                <td>${log.ip_address}</td>
                <td>
                    <button class="btn btn-sm btn-info view-log-details" data-log-id="${log.id}">
                        详情
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // 绑定详情按钮事件
        document.querySelectorAll('.view-log-details').forEach(btn => {
            btn.addEventListener('click', function() {
                const logId = this.getAttribute('data-log-id');
                const log = logs.find(l => l.id == logId);
                if (log) {
                    showLogDetailsModal(log);
                }
            });
        });
    }
    
    /**
     * 翻译操作类型为中文
     * @param {string} actionType - 操作类型
     * @returns {string} 中文操作类型
     */
    function translateActionType(actionType) {
        const typeMap = {
            'user_management': '用户管理',
            'config_change': '配置变更',
            'api_key_management': 'API密钥管理',
            'permission_change': '权限变更',
            'admin_login': '管理员登录',
            'system_settings': '系统设置'
        };
        
        return typeMap[actionType] || actionType;
    }
    
    /**
     * 截断长文本
     * @param {string} text - 原文本
     * @param {number} length - 最大长度
     * @returns {string} 截断后的文本
     */
    function truncateText(text, length) {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    }
    
    /**
     * 显示日志详情模态框
     * @param {Object} log - 日志对象
     */
    function showLogDetailsModal(log) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
    }

    /**
     * 绑定API配置相关事件
     */
    function bindApiConfigEvents() {
        // 添加提供商按钮点击事件
        document.getElementById('addApiProviderBtn').addEventListener('click', function() {
            showApiProviderModal();
        });
        
        // 保存提供商按钮点击事件
        document.getElementById('saveApiProviderBtn').addEventListener('click', function() {
            saveApiProvider();
        });
        
        // 关闭提供商模态框事件
        document.getElementById('closeApiProviderModalBtn').addEventListener('click', function() {
            hideModal('apiProviderModalOverlay');
        });
        
        // 取消按钮点击事件
        document.getElementById('cancelApiProviderBtn').addEventListener('click', function() {
            hideModal('apiProviderModalOverlay');
        });
        
        // 添加模型按钮点击事件
        document.getElementById('addModelBtn').addEventListener('click', function() {
            addModelInput();
        });
        
        // 删除模型按钮委托事件
        document.getElementById('supportedModels').addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-model')) {
                e.target.closest('.model-item').remove();
            }
        });
        
        // 保存全局API配置事件
        document.getElementById('globalApiConfigForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveGlobalApiConfig();
        });
        
        // 加载API提供商列表
        loadApiProviders();
        
        // 加载API模型列表
        loadApiModels();
    }
    
    /**
     * 显示API提供商编辑模态框
     * @param {Object} provider - 提供商信息(如果是编辑现有提供商)
     */
    function showApiProviderModal(provider = null) {
        const form = document.getElementById('apiProviderForm');
        const title = document.getElementById('apiProviderModalTitle');
        
        // 重置表单
        form.reset();
        document.getElementById('apiProviderId').value = '';
        
        // 清除所有模型输入框，只保留一个空的
        const modelsContainer = document.getElementById('supportedModels');
        modelsContainer.innerHTML = '';
        addModelInput();
        
        // 如果是编辑现有提供商
        if (provider) {
            title.textContent = '编辑API提供商';
            document.getElementById('apiProviderId').value = provider.id;
            document.getElementById('apiProviderName').value = provider.name;
            document.getElementById('apiProviderStatus').value = provider.status;
            document.getElementById('apiEndpoint').value = provider.endpoint;
            document.getElementById('defaultApiKey').value = provider.default_api_key || '';
            
            // 添加模型输入框
            if (provider.models && provider.models.length > 0) {
                modelsContainer.innerHTML = '';
                provider.models.forEach(model => {
                    addModelInput(model);
                });
            }
        } else {
            title.textContent = '添加API提供商';
        }
        
        showModal('apiProviderModalOverlay');
    }
    
    /**
     * 添加模型输入框
     * @param {string} modelName - 模型名称(如果是编辑现有模型)
     */
    function addModelInput(modelName = '') {
        const modelsContainer = document.getElementById('supportedModels');
        const modelItem = document.createElement('div');
        modelItem.className = 'model-item';
        modelItem.innerHTML = `
            <input type="text" placeholder="模型名称" class="model-name" value="${modelName}">
            <button type="button" class="btn-icon remove-model">×</button>
        `;
        modelsContainer.appendChild(modelItem);
    }
    
    /**
     * 保存API提供商
     */
    async function saveApiProvider() {
        // 获取表单数据
        const providerId = document.getElementById('apiProviderId').value;
        const name = document.getElementById('apiProviderName').value;
        const status = document.getElementById('apiProviderStatus').value;
        const endpoint = document.getElementById('apiEndpoint').value;
        const defaultApiKey = document.getElementById('defaultApiKey').value;
        
        // 收集模型名称
        const models = [];
        document.querySelectorAll('#supportedModels .model-name').forEach(input => {
            if (input.value.trim()) {
                models.push(input.value.trim());
            }
        });
        
        // 验证表单
        if (!name) {
            showError('apiProviderFormError', '提供商名称不能为空');
            return;
        }
        
        if (!endpoint) {
            showError('apiProviderFormError', 'API端点不能为空');
            return;
        }
        
        if (models.length === 0) {
            showError('apiProviderFormError', '至少需要一个模型');
            return;
        }
        
        // 构建提交数据
        const data = {
            name,
            status,
            endpoint,
            default_api_key: defaultApiKey,
            models
        };
        
        try {
            // 显示加载状态
            document.getElementById('saveApiProviderBtn').disabled = true;
            document.getElementById('saveApiProviderBtn').textContent = '保存中...';
            
            // 发送请求
            let url = '/api/admin/providers';
            let method = 'POST';
            
            if (providerId) {
                url = `/api/admin/providers/${providerId}`;
                method = 'PUT';
            }
            
            const token = localStorage.getItem('adminToken');
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || '保存失败');
            }
            
            // 隐藏模态框
            hideModal('apiProviderModalOverlay');
            
            // 重新加载提供商列表
            loadApiProviders();
            
            // 显示成功提示
            showNotification('提供商保存成功', 'success');
        } catch (error) {
            showError('apiProviderFormError', error.message);
        } finally {
            // 恢复按钮状态
            document.getElementById('saveApiProviderBtn').disabled = false;
            document.getElementById('saveApiProviderBtn').textContent = '保存';
        }
    }

    /**
     * 加载API提供商列表
     */
    async function loadApiProviders() {
        const tableBody = document.querySelector('#apiProvidersTable tbody');
        const loadingState = document.getElementById('apiProvidersLoadingState');
        const emptyState = document.getElementById('apiProvidersEmptyState');
        
        try {
            // 显示加载状态
            tableBody.innerHTML = '';
            loadingState.style.display = 'block';
            emptyState.style.display = 'none';
            
            // 发送请求
            const response = await apiRequest('/admin/providers');
            
            // 隐藏加载状态
            loadingState.style.display = 'none';
            
            // 如果没有数据，显示空状态
            if (!response.providers || response.providers.length === 0) {
                emptyState.style.display = 'block';
                return;
            }
            
            // 渲染数据
            response.providers.forEach(provider => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${provider.name}</td>
                    <td>${provider.endpoint}</td>
                    <td>${provider.models?.length || 0}</td>
                    <td>
                        <span class="badge ${provider.status === 'active' ? 'badge-success' : 'badge-danger'}">
                            ${provider.status === 'active' ? '启用' : '禁用'}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-button edit-button" data-id="${provider.id}" title="编辑">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="action-button delete-button" data-id="${provider.id}" title="删除">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
                
                // 绑定编辑和删除按钮事件
                row.querySelector('.edit-button').addEventListener('click', () => {
                    showApiProviderModal(provider);
                });
                
                row.querySelector('.delete-button').addEventListener('click', () => {
                    if (confirm(`确定要删除 ${provider.name} 提供商吗？`)) {
                        deleteApiProvider(provider.id);
                    }
                });
            });
            
            // 加载全局API配置下拉框数据
            updateProviderDropdowns(response.providers);
        } catch (error) {
            console.error('加载API提供商失败:', error);
            loadingState.style.display = 'none';
            showToast(`加载API提供商失败: ${error.message}`, 'error');
        }
    }
    
    /**
     * 更新提供商下拉框
     * @param {Array} providers - 提供商列表
     */
    function updateProviderDropdowns(providers) {
        const defaultProviderSelect = document.getElementById('defaultApiProvider');
        
        if (defaultProviderSelect) {
            // 保存当前选中的值
            const currentValue = defaultProviderSelect.value;
            
            // 清空选项
            defaultProviderSelect.innerHTML = '<option value="">请选择默认提供商</option>';
            
            // 添加新选项
            providers.forEach(provider => {
                if (provider.status === 'active') {
                    const option = document.createElement('option');
                    option.value = provider.id;
                    option.textContent = provider.name;
                    defaultProviderSelect.appendChild(option);
                }
            });
            
            // 恢复选中状态
            if (currentValue) {
                defaultProviderSelect.value = currentValue;
            }
        }
    }

    /**
     * 绑定对话模式管理事件
     */
    function bindChatModeEvents() {
        // 添加对话模式按钮点击事件
        document.getElementById('addChatModeBtn').addEventListener('click', function() {
            showChatModeModal();
        });
        
        // 保存对话模式按钮点击事件
        document.getElementById('saveChatModeBtn').addEventListener('click', function() {
            saveChatMode();
        });
        
        // 关闭对话模式模态框事件
        document.getElementById('closeChatModeModalBtn').addEventListener('click', function() {
            hideModal('chatModeModalOverlay');
        });
        
        // 取消按钮点击事件
        document.getElementById('cancelChatModeBtn').addEventListener('click', function() {
            hideModal('chatModeModalOverlay');
        });
        
        // 用户筛选下拉框变化事件
        document.getElementById('userPermissionChatModeFilter').addEventListener('change', function() {
            const userId = this.value;
            if (userId) {
                loadUserChatModePermissions(userId);
            } else {
                // 清空用户权限表格
                document.querySelector('#userChatModeTable tbody').innerHTML = '';
                document.getElementById('userChatModeEmptyState').style.display = 'block';
            }
        });
        
        // 保存用户权限按钮点击事件
        document.getElementById('savePermissionBtn').addEventListener('click', function() {
            saveUserChatModePermission();
        });
        
        // 关闭权限编辑模态框事件
        document.getElementById('closeUserChatModePermissionModalBtn').addEventListener('click', function() {
            hideModal('userChatModePermissionModalOverlay');
        });
        
        // 取消权限编辑按钮点击事件
        document.getElementById('cancelPermissionBtn').addEventListener('click', function() {
            hideModal('userChatModePermissionModalOverlay');
        });
        
        // 搜索按钮点击事件
        document.getElementById('chatModeSearchBtn').addEventListener('click', function() {
            searchChatModes();
        });
        
        // 搜索输入框回车事件
        document.getElementById('chatModeSearchInput').addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                searchChatModes();
            }
        });
        
        // 状态筛选变化事件
        document.getElementById('chatModeStatusFilter').addEventListener('change', function() {
            searchChatModes();
        });
        
        // 加载对话模式列表
        loadChatModes();
        
        // 加载用户列表到下拉框
        loadUsersForPermissions();
    }

    /**
     * 绑定用户功能配置事件
     */
    function bindUserFeaturesConfigEvents() {
        // 用户选择下拉框变化事件
        document.getElementById('userConfigSelector').addEventListener('change', function() {
            const userId = this.value;
            if (userId) {
                loadUserFeatureConfig(userId);
            } else {
                // 隐藏配置内容，显示空状态
                document.getElementById('userConfigContent').style.display = 'none';
                document.getElementById('userConfigEmptyState').style.display = 'flex';
            }
        });
        
        // 配置页tab切换事件
        document.querySelectorAll('.tab-item[data-config-tab]').forEach(tab => {
            tab.addEventListener('click', function() {
                // 移除所有tab的active类
                document.querySelectorAll('.tab-item[data-config-tab]').forEach(t => {
                    t.classList.remove('active');
                });
                
                // 隐藏所有内容
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // 激活当前tab
                this.classList.add('active');
                
                // 显示对应内容
                const tabId = this.getAttribute('data-config-tab') + 'Config';
                document.getElementById(tabId).classList.add('active');
            });
        });
        
        // 全选/全不选按钮事件 - 对话模式
        document.getElementById('selectAllChatModesBtn').addEventListener('click', function() {
            document.querySelectorAll('#userChatModesTable input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = true;
            });
        });
        
        document.getElementById('unselectAllChatModesBtn').addEventListener('click', function() {
            document.querySelectorAll('#userChatModesTable input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
        });
        
        // 全选/全不选按钮事件 - 提示词模板
        document.getElementById('selectAllPromptsBtn').addEventListener('click', function() {
            document.querySelectorAll('#userPromptsTable input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = true;
            });
        });
        
        document.getElementById('unselectAllPromptsBtn').addEventListener('click', function() {
            document.querySelectorAll('#userPromptsTable input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
        });
        
        // 全选/全不选按钮事件 - API供应商
        document.getElementById('selectAllProvidersBtn').addEventListener('click', function() {
            document.querySelectorAll('#userProvidersTable input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = true;
            });
        });
        
        document.getElementById('unselectAllProvidersBtn').addEventListener('click', function() {
            document.querySelectorAll('#userProvidersTable input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
        });
        
        // 全选/全不选按钮事件 - 模型
        document.getElementById('selectAllModelsBtn').addEventListener('click', function() {
            document.querySelectorAll('#userModelsTable input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = true;
            });
        });
        
        document.getElementById('unselectAllModelsBtn').addEventListener('click', function() {
            document.querySelectorAll('#userModelsTable input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
        });
        
        // 保存配置按钮事件
        document.getElementById('saveUserConfigBtn').addEventListener('click', saveUserFeatureConfig);
        
        // 初始加载用户列表
        loadUsersForFeatureConfig();
    }
    
    /**
     * 加载用户列表到用户功能配置选择器
     */
    async function loadUsersForFeatureConfig() {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('加载用户列表失败');
            }
            
            const data = await response.json();
            const userSelector = document.getElementById('userConfigSelector');
            
            // 清空现有选项，保留默认选项
            userSelector.innerHTML = '<option value="">请选择用户...</option>';
            
            // 填充用户列表
            if (data.users && data.users.length > 0) {
                data.users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = `${user.username} (${user.email})`;
                    userSelector.appendChild(option);
                });
            }
        } catch (error) {
            console.error('加载用户列表失败:', error);
            showNotification('加载用户列表失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 加载用户功能配置
     * @param {string} userId - 用户ID
     */
    async function loadUserFeatureConfig(userId) {
        try {
            // 显示加载状态
            document.getElementById('userConfigContent').style.display = 'none';
            document.getElementById('userConfigEmptyState').style.display = 'none';
            
            const tables = ['userChatModesTable', 'userPromptsTable', 'userProvidersTable', 'userModelsTable'];
            tables.forEach(tableId => {
                const tbody = document.querySelector(`#${tableId} tbody`);
                tbody.innerHTML = '<tr><td colspan="3" class="text-center">加载中...</td></tr>';
            });
            
            // 发送请求获取用户信息
            const token = localStorage.getItem('adminToken');
            const userResponse = await fetch(`/api/admin/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!userResponse.ok) {
                throw new Error('获取用户信息失败');
            }
            
            const userData = await userResponse.json();
            
            // 设置用户名称
            document.getElementById('selectedUserName').textContent = userData.user.username;
            
            // 获取用户功能配置
            const configResponse = await fetch(`/api/admin/users/${userId}/features`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!configResponse.ok) {
                throw new Error('获取用户功能配置失败');
            }
            
            const configData = await configResponse.json();
            
            // 加载对话模式配置
            await loadUserChatModesConfig(userId, configData.chatModes);
            
            // 加载提示词模板配置
            await loadUserPromptsConfig(userId, configData.promptTemplates);
            
            // 加载API供应商配置
            await loadUserProvidersConfig(userId, configData.apiProviders);
            
            // 加载模型配置
            await loadUserModelsConfig(userId, configData.models);
            
            // 显示配置内容
            document.getElementById('userConfigContent').style.display = 'block';
        } catch (error) {
            console.error('加载用户功能配置失败:', error);
            showNotification('加载用户功能配置失败: ' + error.message, 'error');
            
            // 显示空状态
            document.getElementById('userConfigEmptyState').style.display = 'flex';
        }
    }

    /**
     * 加载用户对话模式配置
     * @param {string} userId - 用户ID
     * @param {Array} userChatModes - 用户已启用的对话模式
     */
    async function loadUserChatModesConfig(userId, userChatModes = []) {
        try {
            // 获取所有对话模式
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/admin/chat-modes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('获取对话模式列表失败');
            }
            
            const data = await response.json();
            const tbody = document.querySelector('#userChatModesTable tbody');
            tbody.innerHTML = '';
            
            if (!data.chatModes || data.chatModes.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" class="text-center">暂无对话模式数据</td></tr>';
                return;
            }
            
            // 渲染对话模式列表
            data.chatModes.forEach(mode => {
                const isEnabled = userChatModes.some(m => m.id === mode.id);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="text-center">
                        <label class="toggle-switch">
                            <input type="checkbox" data-mode-id="${mode.id}" ${isEnabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </td>
                    <td>${mode.name}</td>
                    <td>${mode.description || '无描述'}</td>
                `;
                tbody.appendChild(row);
            });
        } catch (error) {
            console.error('加载用户对话模式配置失败:', error);
            const tbody = document.querySelector('#userChatModesTable tbody');
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">加载失败</td></tr>';
        }
    }
    
    /**
     * 加载用户提示词模板配置
     * @param {string} userId - 用户ID
     * @param {Array} userPrompts - 用户已启用的提示词模板
     */
    async function loadUserPromptsConfig(userId, userPrompts = []) {
        try {
            // 获取所有提示词模板
            const token = localStorage.getItem('xpat_auth_token');
            if (!token) {
                console.error('未登录，无法加载提示词模板');
                return;
            }
            
            const userPromptsTableBody = document.querySelector('#userPromptsTable tbody');
            if (!userPromptsTableBody) {
                console.warn('未找到用户提示词表格，跳过加载');
                return;
            }
            
            // 显示加载状态
            userPromptsTableBody.innerHTML = '<tr><td colspan="3" class="text-center">加载中...</td></tr>';
            
            // 确保API_BASE_URL以/api结尾
            let apiUrl = window.API_BASE_URL;
            if (apiUrl.endsWith('/api')) {
                apiUrl = apiUrl; // 保持原样
            } else if (!apiUrl.endsWith('/')) {
                apiUrl = apiUrl + '/';
            }
            
            console.log('请求所有提示词模板，URL:', `${apiUrl}admin/prompts`);
            
            const response = await fetch(`${apiUrl}admin/prompts`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': '1',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            // 检查响应类型，确保是JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // 尝试读取响应内容以便更好地诊断
                const responseText = await response.text();
                console.error('API返回了非JSON响应:', responseText.substring(0, 200));
                throw new Error(`API返回了非JSON响应: ${contentType}`);
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.error?.message || '加载提示词模板失败');
                } catch (e) {
                    throw new Error(`加载提示词模板失败: HTTP ${response.status} - ${errorText.substring(0, 100)}`);
                }
            }
            
            const data = await response.json();
            console.log('已加载所有提示词模板:', data);
            
            // 清空表格
            userPromptsTableBody.innerHTML = '';
            
            // 如果没有数据
            if (!data.prompts || data.prompts.length === 0) {
                userPromptsTableBody.innerHTML = '<tr><td colspan="3" class="text-center">暂无提示词模板</td></tr>';
                return;
            }
            
            // 获取用户已启用的提示词ID
            const userPromptIds = userPrompts.map(p => p.id);
            
            // 渲染数据
            data.prompts.forEach(prompt => {
                const isEnabled = userPromptIds.includes(prompt.id);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="text-center">
                        <label class="toggle-switch">
                            <input type="checkbox" data-prompt-id="${prompt.id}" ${isEnabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </td>
                    <td>${prompt.title}</td>
                    <td>${prompt.category || '未分类'}</td>
                `;
                userPromptsTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('加载用户提示词模板配置失败:', error);
            
            const userPromptsTableBody = document.querySelector('#userPromptsTable tbody');
            if (userPromptsTableBody) {
                userPromptsTableBody.innerHTML = '<tr><td colspan="3" class="text-center">加载失败</td></tr>';
            }
        }
    }

    /**
     * 编辑提示词模板
     * @param {Object} prompt - 提示词模板对象
     */
    function editPrompt(prompt) {
        // 获取表单元素
        const promptIdInput = document.getElementById('promptId');
        const promptTitleInput = document.getElementById('promptTitle');
        const promptCategoryInput = document.getElementById('promptCategory');
        const promptContentTextarea = document.getElementById('promptContent');
        const promptStatusSelect = document.getElementById('promptStatus');
        
        if (!promptIdInput || !promptTitleInput || !promptCategoryInput || !promptContentTextarea || !promptStatusSelect) {
            console.error('未找到提示词表单元素');
            return;
        }
        
        // 填充表单数据
        promptIdInput.value = prompt.id;
        promptTitleInput.value = prompt.title;
        promptCategoryInput.value = prompt.category || '';
        promptContentTextarea.value = prompt.content;
        promptStatusSelect.value = prompt.status || 'active';
        
        // 显示模态框
        const promptModal = document.getElementById('promptModal');
        const promptModalTitle = document.getElementById('promptModalTitle');
        
        if (promptModal && promptModalTitle) {
            promptModalTitle.textContent = '编辑提示词模板';
            promptModal.style.display = 'block';
        }
    }

    /**
     * 删除提示词模板
     * @param {string} promptId - 提示词模板ID
     */
    async function deletePrompt(promptId) {
        if (!confirm('确定要删除这个提示词模板吗？此操作无法撤销。')) {
            return;
        }
        
        try {
            const token = localStorage.getItem('xpat_auth_token');
            if (!token) {
                throw new Error('未登录，无法删除提示词模板');
            }
            
            // 确保API_BASE_URL以/api结尾
            let apiUrl = window.API_BASE_URL;
            if (apiUrl.endsWith('/api')) {
                apiUrl = apiUrl; // 保持原样
            } else if (!apiUrl.endsWith('/')) {
                apiUrl = apiUrl + '/';
            }
            
            console.log('删除提示词模板，URL:', `${apiUrl}admin/prompts/${promptId}`);
            
            const response = await fetch(`${apiUrl}admin/prompts/${promptId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': '1',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            // 检查响应
            if (!response.ok) {
                // 尝试解析错误响应
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        throw new Error(errorData.error?.message || '删除失败');
                    } else {
                        const errorText = await response.text();
                        throw new Error(`删除失败: HTTP ${response.status} - ${errorText.substring(0, 100)}`);
                    }
                } catch (e) {
                    throw new Error(`删除失败: ${e.message}`);
                }
            }
            
            // 刷新提示词列表
            loadPrompts();
            
            // 显示成功消息
            if (typeof showNotification === 'function') {
                showNotification('提示词模板已成功删除', 'success');
            }
        } catch (error) {
            console.error('删除提示词模板失败:', error);
            
            // 显示错误消息
            if (typeof showNotification === 'function') {
                showNotification(`删除提示词模板失败: ${error.message}`, 'error');
            }
        }
    }

    /**
     * 截断文本
     * @param {string} text - 要截断的文本
     * @param {number} maxLength - 最大长度
     * @returns {string} 截断后的文本
     */
    function truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * 加载提示词列表
     */
    async function loadPrompts() {
        try {
            const response = await getAllPrompts();
            if (response && response.prompts) {
                const promptsContainer = document.getElementById('promptsContainer');
                if (promptsContainer) {
                    promptsContainer.innerHTML = '';
                    
                    // 如果没有提示词，显示空状态
                    if (response.prompts.length === 0) {
                        promptsContainer.innerHTML = '<div class="empty-state">暂无提示词模板，请添加新模板</div>';
                        return;
                    }
                    
                    // 渲染提示词列表
                    response.prompts.forEach(prompt => {
                        const promptCard = createPromptCard(prompt);
                        promptsContainer.appendChild(promptCard);
                    });
                }
            }
        } catch (error) {
            console.error('加载提示词失败:', error);
            showToast('加载提示词失败: ' + error.message, 'error');
        }
    }

    /**
     * 加载API配置
     */
    async function loadApiConfig() {
        try {
            const response = await getApiConfig();
            if (response && response.config) {
                // 填充API配置表单
                const config = response.config;
                
                // 更新界面中的API配置
                const modelConfigContainer = document.getElementById('modelConfigContainer');
                if (modelConfigContainer) {
                    modelConfigContainer.innerHTML = '';
                    
                    // 遍历API提供商和模型配置
                    if (config.providers && config.providers.length > 0) {
                        config.providers.forEach(provider => {
                            const providerCard = createProviderCard(provider);
                            modelConfigContainer.appendChild(providerCard);
                        });
                    } else {
                        modelConfigContainer.innerHTML = '<div class="empty-state">暂无API配置，请添加配置</div>';
                    }
                }
            }
        } catch (error) {
            console.error('加载API配置失败:', error);
            showToast('加载API配置失败: ' + error.message, 'error');
        }
    }

    /**
     * 创建提示词卡片元素
     */
    function createPromptCard(prompt) {
        const card = document.createElement('div');
        card.className = 'card prompt-card';
        card.dataset.id = prompt.id;
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${prompt.name}</h3>
                <div class="card-actions">
                    <button class="btn btn-icon edit-prompt" data-id="${prompt.id}">✏️</button>
                    <button class="btn btn-icon delete-prompt" data-id="${prompt.id}">🗑️</button>
                </div>
            </div>
            <div class="card-body">
                <div class="badge badge-${prompt.isPublic ? 'success' : 'secondary'} prompt-status">
                    ${prompt.isPublic ? '公开' : '私有'}
                </div>
                <div class="badge badge-primary prompt-category">${prompt.category || '未分类'}</div>
                <p class="prompt-content">${truncateText(prompt.content, 150)}</p>
            </div>
        `;
        
        // 绑定编辑和删除事件
        card.querySelector('.edit-prompt').addEventListener('click', () => {
            editPrompt(prompt);
        });
        
        card.querySelector('.delete-prompt').addEventListener('click', () => {
            deletePrompt(prompt.id);
        });
        
        return card;
    }

    /**
     * 创建API提供商卡片
     */
    function createProviderCard(provider) {
        const card = document.createElement('div');
        card.className = 'card provider-card';
        card.dataset.id = provider.id;
        
        // 模型列表HTML
        let modelsHtml = '';
        if (provider.models && provider.models.length > 0) {
            modelsHtml = provider.models.map(model => `
                <div class="model-item">
                    <span class="model-name">${model.name}</span>
                    <span class="model-info">最大上下文: ${model.maxContext || 'N/A'}</span>
                </div>
            `).join('');
        } else {
            modelsHtml = '<div class="empty-state">未配置模型</div>';
        }
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${provider.name}</h3>
                <div class="card-actions">
                    <button class="btn btn-icon edit-provider" data-id="${provider.id}">✏️</button>
                    <button class="btn btn-icon delete-provider" data-id="${provider.id}">🗑️</button>
                </div>
            </div>
            <div class="card-body">
                <div class="provider-status ${provider.isActive ? 'active' : 'inactive'}">
                    ${provider.isActive ? '已启用' : '已禁用'}
                </div>
                <div class="provider-endpoint">
                    <strong>基础URL:</strong> ${provider.baseUrl || 'N/A'}
                </div>
                <div class="provider-models">
                    <strong>模型:</strong>
                    <div class="models-list">
                        ${modelsHtml}
                    </div>
                </div>
            </div>
        `;
        
        // 绑定编辑和删除事件
        card.querySelector('.edit-provider').addEventListener('click', () => {
            showApiProviderModal(provider);
        });
        
        card.querySelector('.delete-provider').addEventListener('click', async () => {
            if (confirm(`确定要删除提供商 "${provider.name}" 吗？`)) {
                try {
                    await deleteApiProvider(provider.id);
                    card.remove();
                    showToast('删除提供商成功', 'success');
                } catch (error) {
                    console.error('删除提供商失败:', error);
                    showToast('删除提供商失败: ' + error.message, 'error');
                }
            }
        });
        
        return card;
    }

    /**
     * 显示Toast通知
     */
    function showToast(message, type = 'info') {
        // 创建或获取toast容器
        let toastContainer = document.getElementById('toastContainer');
        
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            document.body.appendChild(toastContainer);
        }
        
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // 添加到容器
        toastContainer.appendChild(toast);
        
        // 自动关闭
        setTimeout(() => {
            toast.classList.add('toast-hide');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    /**
     * 删除API提供商
     */
    async function deleteApiProvider(providerId) {
        return apiRequest(`/admin/api-config/providers/${providerId}`, 'DELETE');
    }

    /**
     * 处理登录表单提交
     * @param {Event} event - 表单提交事件
     */
    async function handleLoginSubmit(event) {
        event.preventDefault();
        
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        const errorMsg = document.getElementById('loginError');
        
        // 清除之前的错误信息
        errorMsg.textContent = '';
        errorMsg.style.display = 'none';
        
        // 获取表单值
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        // 表单验证
        if (!email || !password) {
            errorMsg.textContent = '请输入邮箱和密码';
            errorMsg.style.display = 'block';
            return;
        }
        
        try {
            // 调用登录API
            const response = await login(email, password);
            
            // 检查是否是管理员
            const userInfo = getUserInfo();
            if (userInfo && userInfo.role === 'admin') {
                // 显示管理界面
                showAdminInterface();
                
                // 加载管理员数据
                loadPrompts();
                
                // 显示成功消息
                showToast('登录成功', 'success');
            } else {
                // 不是管理员，清除认证信息
                clearAuth();
                errorMsg.textContent = '您不是管理员，无法访问此页面';
                errorMsg.style.display = 'block';
            }
        } catch (error) {
            console.error('登录失败:', error);
            errorMsg.textContent = error.message || '登录失败，请检查邮箱和密码';
            errorMsg.style.display = 'block';
        }
    }

    /**
     * 处理退出登录
     */
    function handleLogout() {
        // 清除认证信息
        clearAuth();
        
        // 显示登录界面
        showLoginInterface();
        
        // 显示消息
        showToast('已退出登录', 'info');
    }

    /**
     * 绑定提示词管理事件
     */
    function bindPromptsEvents() {
        // 添加提示词按钮
        const addPromptBtn = document.getElementById('addPromptBtn');
        if (addPromptBtn) {
            addPromptBtn.addEventListener('click', () => {
                showPromptModal();
            });
        }
        
        // 保存提示词按钮
        const savePromptBtn = document.getElementById('savePromptBtn');
        if (savePromptBtn) {
            savePromptBtn.addEventListener('click', savePrompt);
        }
        
        // 取消提示词编辑按钮
        const cancelPromptBtn = document.getElementById('cancelPromptBtn');
        if (cancelPromptBtn) {
            cancelPromptBtn.addEventListener('click', () => {
                hidePromptModal();
            });
        }
        
        // 提示词类别过滤器
        const promptCategoryFilter = document.getElementById('promptCategoryFilter');
        if (promptCategoryFilter) {
            promptCategoryFilter.addEventListener('change', filterPromptsByCategory);
        }
    }

    /**
     * 绑定订阅管理事件
     */
    function bindSubscriptionEvents() {
        // 添加订阅计划按钮
        const addSubscriptionBtn = document.getElementById('addSubscriptionBtn');
        if (addSubscriptionBtn) {
            addSubscriptionBtn.addEventListener('click', () => {
                showSubscriptionModal();
            });
        }
        
        // 保存订阅计划按钮
        const saveSubscriptionBtn = document.getElementById('saveSubscriptionBtn');
        if (saveSubscriptionBtn) {
            saveSubscriptionBtn.addEventListener('click', saveSubscriptionPlan);
        }
        
        // 取消订阅计划编辑按钮
        const cancelSubscriptionBtn = document.getElementById('cancelSubscriptionBtn');
        if (cancelSubscriptionBtn) {
            cancelSubscriptionBtn.addEventListener('click', () => {
                hideSubscriptionModal();
            });
        }
    }

    /**
     * 绑定用户管理事件
     */
    function bindUserEvents() {
        // 用户搜索按钮
        const userSearchBtn = document.getElementById('userSearchBtn');
        if (userSearchBtn) {
            userSearchBtn.addEventListener('click', searchUsers);
        }
        
        // 用户搜索框回车事件
        const userSearchInput = document.getElementById('userSearchInput');
        if (userSearchInput) {
            userSearchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    searchUsers();
                }
            });
        }
        
        // 用户分页按钮
        const userPrevPageBtn = document.getElementById('userPrevPageBtn');
        const userNextPageBtn = document.getElementById('userNextPageBtn');
        
        if (userPrevPageBtn) {
            userPrevPageBtn.addEventListener('click', () => {
                navigateUserPage('prev');
            });
        }
        
        if (userNextPageBtn) {
            userNextPageBtn.addEventListener('click', () => {
                navigateUserPage('next');
            });
        }
    }

    /**
     * 绑定API日志事件
     */
    function bindApiLogsEvents() {
        // API日志搜索按钮
        const apiLogSearchBtn = document.getElementById('apiLogSearchBtn');
        if (apiLogSearchBtn) {
            apiLogSearchBtn.addEventListener('click', searchApiLogs);
        }
        
        // 日期过滤器
        const apiLogDateFilter = document.getElementById('apiLogDateFilter');
        if (apiLogDateFilter) {
            apiLogDateFilter.addEventListener('change', filterApiLogsByDate);
        }
        
        // 用户过滤器
        const apiLogUserFilter = document.getElementById('apiLogUserFilter');
        if (apiLogUserFilter) {
            apiLogUserFilter.addEventListener('change', filterApiLogsByUser);
        }
        
        // API日志分页按钮
        const apiLogPrevPageBtn = document.getElementById('apiLogPrevPageBtn');
        const apiLogNextPageBtn = document.getElementById('apiLogNextPageBtn');
        
        if (apiLogPrevPageBtn) {
            apiLogPrevPageBtn.addEventListener('click', () => {
                navigateApiLogPage('prev');
            });
        }
        
        if (apiLogNextPageBtn) {
            apiLogNextPageBtn.addEventListener('click', () => {
                navigateApiLogPage('next');
            });
        }
    }

    /**
     * 绑定API密钥管理事件
     */
    function bindApiKeysEvents() {
        // 添加API密钥按钮
        const addApiKeyBtn = document.getElementById('addApiKeyBtn');
        if (addApiKeyBtn) {
            addApiKeyBtn.addEventListener('click', () => {
                showApiKeyModal();
            });
        }
        
        // 保存API密钥按钮
        const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
        if (saveApiKeyBtn) {
            saveApiKeyBtn.addEventListener('click', saveApiKey);
        }
        
        // 取消API密钥编辑按钮
        const cancelApiKeyBtn = document.getElementById('cancelApiKeyBtn');
        if (cancelApiKeyBtn) {
            cancelApiKeyBtn.addEventListener('click', () => {
                hideApiKeyModal();
            });
        }
        
        // 复制API密钥按钮
        document.querySelectorAll('.copy-api-key').forEach(btn => {
            btn.addEventListener('click', copyApiKey);
        });
        
        // 显示/隐藏API密钥密码
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', togglePasswordVisibility);
        });
    }

    /**
     * 显示提示词编辑模态框
     * @param {Object} prompt - 提示词对象（如果是编辑现有提示词）
     */
    function showPromptModal(prompt = null) {
        // 获取模态框元素
        const modal = document.getElementById('promptModal');
        if (!modal) {
            console.error('未找到提示词模态框');
            return;
        }
        
        // 获取表单元素
        const promptIdInput = document.getElementById('promptId');
        const promptNameInput = document.getElementById('promptName');
        const promptCategoryInput = document.getElementById('promptCategory');
        const promptContentTextarea = document.getElementById('promptContent');
        const promptIsPublicCheckbox = document.getElementById('promptIsPublic');
        const modalTitle = document.getElementById('promptModalTitle');
        
        // 重置表单
        promptIdInput.value = '';
        promptNameInput.value = '';
        promptCategoryInput.value = '';
        promptContentTextarea.value = '';
        promptIsPublicCheckbox.checked = false;
        
        // 如果是编辑现有提示词
        if (prompt) {
            modalTitle.textContent = '编辑提示词';
            promptIdInput.value = prompt.id;
            promptNameInput.value = prompt.name;
            promptCategoryInput.value = prompt.category || '';
            promptContentTextarea.value = prompt.content;
            promptIsPublicCheckbox.checked = prompt.isPublic;
        } else {
            modalTitle.textContent = '添加提示词';
        }
        
        // 显示模态框
        modal.style.display = 'block';
    }

    /**
     * 隐藏提示词编辑模态框
     */
    function hidePromptModal() {
        const modal = document.getElementById('promptModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * 保存提示词
     */
    async function savePrompt() {
        // 获取表单数据
        const promptId = document.getElementById('promptId').value;
        const name = document.getElementById('promptName').value;
        const category = document.getElementById('promptCategory').value;
        const content = document.getElementById('promptContent').value;
        const isPublic = document.getElementById('promptIsPublic').checked;
        
        // 验证表单
        if (!name) {
            showToast('提示词名称不能为空', 'error');
            return;
        }
        
        if (!content) {
            showToast('提示词内容不能为空', 'error');
            return;
        }
        
        try {
            let response;
            
            // 显示加载状态
            const saveBtn = document.getElementById('savePromptBtn');
            saveBtn.disabled = true;
            saveBtn.textContent = '保存中...';
            
            // 根据是否有ID决定是新增还是更新
            if (promptId) {
                // 更新现有提示词
                response = await updatePrompt(promptId, {
                    name,
                    category,
                    content,
                    isPublic
                });
            } else {
                // 创建新提示词
                response = await createPrompt(name, category, content, isPublic);
            }
            
            // 隐藏模态框
            hidePromptModal();
            
            // 重新加载提示词列表
            loadPrompts();
            
            // 显示成功消息
            showToast(promptId ? '提示词更新成功' : '提示词创建成功', 'success');
        } catch (error) {
            console.error('保存提示词失败:', error);
            showToast('保存提示词失败: ' + error.message, 'error');
        } finally {
            // 恢复按钮状态
            const saveBtn = document.getElementById('savePromptBtn');
            saveBtn.disabled = false;
            saveBtn.textContent = '保存';
        }
    }

    /**
     * 按分类筛选提示词
     */
    function filterPromptsByCategory() {
        const category = document.getElementById('promptCategoryFilter').value;
        const promptCards = document.querySelectorAll('.prompt-card');
        
        // 如果选择了"全部"，显示所有提示词
        if (!category || category === 'all') {
            promptCards.forEach(card => {
                card.style.display = 'block';
            });
            return;
        }
        
        // 否则，只显示所选分类的提示词
        promptCards.forEach(card => {
            const cardCategory = card.querySelector('.prompt-category').textContent;
            if (cardCategory === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    /**
     * 显示订阅计划编辑模态框
     * @param {Object} plan - 订阅计划对象（如果是编辑现有计划）
     */
    function showSubscriptionModal(plan = null) {
        // 获取模态框元素
        const modal = document.getElementById('subscriptionModal');
        if (!modal) {
            console.error('未找到订阅计划模态框');
            return;
        }
        
        // 获取表单元素
        const planIdInput = document.getElementById('planId');
        const planNameInput = document.getElementById('planName');
        const planPriceInput = document.getElementById('planPrice');
        const planDurationInput = document.getElementById('planDuration');
        const planApiQuotaInput = document.getElementById('planApiQuota');
        const planFeaturesTextarea = document.getElementById('planFeatures');
        const planStatusSelect = document.getElementById('planStatus');
        const modalTitle = document.getElementById('subscriptionModalTitle');
        
        // 重置表单
        planIdInput.value = '';
        planNameInput.value = '';
        planPriceInput.value = '';
        planDurationInput.value = '30';
        planApiQuotaInput.value = '100';
        planFeaturesTextarea.value = '';
        planStatusSelect.value = 'active';
        
        // 如果是编辑现有计划
        if (plan) {
            modalTitle.textContent = '编辑订阅计划';
            planIdInput.value = plan.id;
            planNameInput.value = plan.name;
            planPriceInput.value = plan.price;
            planDurationInput.value = plan.duration || 30;
            planApiQuotaInput.value = plan.apiQuota || 100;
            planFeaturesTextarea.value = Array.isArray(plan.features) ? plan.features.join('\n') : plan.features || '';
            planStatusSelect.value = plan.status || 'active';
        } else {
            modalTitle.textContent = '添加订阅计划';
        }
        
        // 显示模态框
        modal.style.display = 'block';
    }

    /**
     * 隐藏订阅计划编辑模态框
     */
    function hideSubscriptionModal() {
        const modal = document.getElementById('subscriptionModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * 保存订阅计划
     */
    async function saveSubscriptionPlan() {
        // 获取表单数据
        const planId = document.getElementById('planId').value;
        const name = document.getElementById('planName').value;
        const price = parseFloat(document.getElementById('planPrice').value);
        const duration = parseInt(document.getElementById('planDuration').value);
        const apiQuota = parseInt(document.getElementById('planApiQuota').value);
        const featuresText = document.getElementById('planFeatures').value;
        const status = document.getElementById('planStatus').value;
        
        // 解析特性列表
        const features = featuresText.split('\n')
            .map(feature => feature.trim())
            .filter(feature => feature);
        
        // 验证表单
        if (!name) {
            showToast('计划名称不能为空', 'error');
            return;
        }
        
        if (isNaN(price) || price < 0) {
            showToast('计划价格必须是有效的数字', 'error');
            return;
        }
        
        if (isNaN(duration) || duration <= 0) {
            showToast('计划时长必须是大于0的整数', 'error');
            return;
        }
        
        if (isNaN(apiQuota) || apiQuota <= 0) {
            showToast('API配额必须是大于0的整数', 'error');
            return;
        }
        
        try {
            let response;
            
            // 显示加载状态
            const saveBtn = document.getElementById('saveSubscriptionBtn');
            saveBtn.disabled = true;
            saveBtn.textContent = '保存中...';
            
            // 准备数据
            const planData = {
                name,
                price,
                duration,
                apiQuota,
                features,
                status
            };
            
            // 根据是否有ID决定是新增还是更新
            if (planId) {
                // 更新现有计划
                response = await updateSubscriptionPlan(planId, planData);
            } else {
                // 创建新计划
                response = await createSubscriptionPlan(name, price, duration, apiQuota, features);
            }
            
            // 隐藏模态框
            hideSubscriptionModal();
            
            // 重新加载订阅计划列表
            loadSubscriptions();
            
            // 显示成功消息
            showToast(planId ? '订阅计划更新成功' : '订阅计划创建成功', 'success');
        } catch (error) {
            console.error('保存订阅计划失败:', error);
            showToast('保存订阅计划失败: ' + error.message, 'error');
        } finally {
            // 恢复按钮状态
            const saveBtn = document.getElementById('saveSubscriptionBtn');
            saveBtn.disabled = false;
            saveBtn.textContent = '保存';
        }
    }

    /**
     * 加载订阅计划列表
     */
    async function loadSubscriptions() {
        try {
            // 显示加载状态
            const subscriptionsContainer = document.getElementById('subscriptionsContainer');
            if (subscriptionsContainer) {
                subscriptionsContainer.innerHTML = '<div class="loading-indicator">加载中...</div>';
            }
            
            // 获取订阅计划列表
            const response = await getAllSubscriptionPlans();
            
            // 清空容器
            if (subscriptionsContainer) {
                subscriptionsContainer.innerHTML = '';
            }
            
            // 如果没有数据，显示空状态
            if (!response || !response.plans || response.plans.length === 0) {
                if (subscriptionsContainer) {
                    subscriptionsContainer.innerHTML = '<div class="empty-state">暂无订阅计划，请添加新计划</div>';
                }
                return;
            }
            
            // 渲染订阅计划列表
            response.plans.forEach(plan => {
                const planCard = createSubscriptionPlanCard(plan);
                if (subscriptionsContainer) {
                    subscriptionsContainer.appendChild(planCard);
                }
            });
        } catch (error) {
            console.error('加载订阅计划失败:', error);
            showToast('加载订阅计划失败: ' + error.message, 'error');
            
            // 显示错误状态
            const subscriptionsContainer = document.getElementById('subscriptionsContainer');
            if (subscriptionsContainer) {
                subscriptionsContainer.innerHTML = '<div class="error-state">加载订阅计划失败，请重试</div>';
            }
        }
    }

    /**
     * 创建订阅计划卡片
     * @param {Object} plan - 订阅计划数据
     * @returns {HTMLElement} 订阅计划卡片元素
     */
    function createSubscriptionPlanCard(plan) {
        const card = document.createElement('div');
        card.className = 'card subscription-plan-card';
        card.dataset.id = plan.id;
        
        // 格式化价格
        const formattedPrice = `¥${plan.price.toFixed(2)}`;
        
        // 格式化特性列表
        let featuresHtml = '';
        if (plan.features && plan.features.length > 0) {
            featuresHtml = plan.features.map(feature => `<li>${feature}</li>`).join('');
        } else {
            featuresHtml = '<li>无特性</li>';
        }
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${plan.name}</h3>
                <div class="card-actions">
                    <button class="btn btn-icon edit-plan" data-id="${plan.id}">✏️</button>
                    <button class="btn btn-icon delete-plan" data-id="${plan.id}">🗑️</button>
                </div>
            </div>
            <div class="card-body">
                <div class="plan-price">${formattedPrice}</div>
                <div class="plan-duration">有效期: ${plan.duration || 30} 天</div>
                <div class="plan-quota">API配额: ${plan.apiQuota || 100} 次</div>
                <div class="plan-status">
                    <span class="badge badge-${plan.status === 'active' ? 'success' : 'secondary'}">
                        ${plan.status === 'active' ? '已启用' : '已禁用'}
                    </span>
                </div>
                <div class="plan-features">
                    <h4>包含特性:</h4>
                    <ul>
                        ${featuresHtml}
                    </ul>
                </div>
            </div>
        `;
        
        // 绑定编辑和删除事件
        card.querySelector('.edit-plan').addEventListener('click', () => {
            showSubscriptionModal(plan);
        });
        
        card.querySelector('.delete-plan').addEventListener('click', () => {
            deleteSubscriptionPlan(plan.id);
        });
        
        return card;
    }

    /**
     * 删除订阅计划
     * @param {string} planId - 订阅计划ID
     */
    async function deleteSubscriptionPlan(planId) {
        if (!confirm('确定要删除此订阅计划吗？此操作不可撤销，且可能影响已订阅用户。')) {
            return;
        }
        
        try {
            // 调用API删除订阅计划
            await apiRequest(`/admin/subscriptions/${planId}`, 'DELETE');
            
            // 移除页面上的订阅计划卡片
            const planCard = document.querySelector(`.subscription-plan-card[data-id="${planId}"]`);
            if (planCard) {
                planCard.remove();
            }
            
            // 显示成功消息
            showToast('订阅计划删除成功', 'success');
            
            // 重新加载订阅计划列表
            loadSubscriptions();
        } catch (error) {
            console.error('删除订阅计划失败:', error);
            showToast('删除订阅计划失败: ' + error.message, 'error');
        }
    }

    /**
     * 搜索用户
     */
    async function searchUsers() {
        // 获取搜索关键词
        const searchKeyword = document.getElementById('userSearchInput').value.trim();
        
        // 重置页码并加载用户
        currentUserPage = 1;
        await loadUsers(currentUserPage, userPageSize, searchKeyword);
    }

    /**
     * 导航用户分页
     * @param {string} direction - 分页方向，'prev'或'next'
     */
    async function navigateUserPage(direction) {
        if (direction === 'prev' && currentUserPage > 1) {
            currentUserPage--;
        } else if (direction === 'next' && !isUserLastPage) {
            currentUserPage++;
        } else {
            return; // 不进行操作
        }
        
        // 获取搜索关键词
        const searchKeyword = document.getElementById('userSearchInput').value.trim();
        
        // 加载用户
        await loadUsers(currentUserPage, userPageSize, searchKeyword);
    }

    // 用户管理全局变量
    let currentUserPage = 1;
    let userPageSize = 10;
    let isUserLastPage = false;
    let totalUserCount = 0;

    /**
     * 加载用户列表
     * @param {number} page - 页码
     * @param {number} limit - 每页条数
     * @param {string} keyword - 搜索关键词
     */
    async function loadUsers(page = 1, limit = 10, keyword = '') {
        try {
            // 显示加载状态
            const userTableBody = document.getElementById('userTableBody');
            if (userTableBody) {
                userTableBody.innerHTML = '<tr><td colspan="6" class="text-center">加载中...</td></tr>';
            }
            
            // 构建API请求路径
            let endpoint = `/admin/users?page=${page}&limit=${limit}`;
            if (keyword) {
                endpoint += `&keyword=${encodeURIComponent(keyword)}`;
            }
            
            // 获取用户列表
            const response = await apiRequest(endpoint);
            
            // 更新全局状态
            currentUserPage = page;
            isUserLastPage = response.users.length < limit;
            totalUserCount = response.total || 0;
            
            // 更新分页信息
            updateUserPagination();
            
            // 渲染用户表格
            renderUserTable(response.users);
        } catch (error) {
            console.error('加载用户失败:', error);
            
            // 显示错误状态
            const userTableBody = document.getElementById('userTableBody');
            if (userTableBody) {
                userTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">加载用户失败，请重试</td></tr>';
            }
            
            showToast('加载用户失败: ' + error.message, 'error');
        }
    }

    /**
     * 渲染用户表格
     * @param {Array} users - 用户数据数组
     */
    function renderUserTable(users) {
        const userTableBody = document.getElementById('userTableBody');
        
        if (!userTableBody) {
            console.error('未找到用户表格');
            return;
        }
        
        // 清空表格
        userTableBody.innerHTML = '';
        
        // 如果没有数据，显示空状态
        if (!users || users.length === 0) {
            userTableBody.innerHTML = '<tr><td colspan="6" class="text-center">暂无用户</td></tr>';
            return;
        }
        
        // 遍历用户数据
        users.forEach(user => {
            const row = document.createElement('tr');
            row.dataset.id = user.id;
            
            // 创建日期格式化
            const createdDate = new Date(user.createdAt);
            const formattedDate = createdDate.toLocaleString('zh-CN');
            
            // 最后登录时间格式化
            let lastLoginDate = '从未登录';
            if (user.lastLogin) {
                const lastLogin = new Date(user.lastLogin);
                lastLoginDate = lastLogin.toLocaleString('zh-CN');
            }
            
            // 生成角色选择器
            const roleOptions = ['user', 'admin', 'vip'].map(role => 
                `<option value="${role}" ${user.role === role ? 'selected' : ''}>${translateRole(role)}</option>`
            ).join('');
            
            // 生成表格行
            row.innerHTML = `
                <td class="user-id">${user.id}</td>
                <td class="user-name">
                    <div class="user-info">
                        <span class="user-avatar">${user.username ? user.username[0].toUpperCase() : '?'}</span>
                        <div>
                            <div class="user-username">${user.username || '未设置'}</div>
                            <div class="user-email">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td class="user-role">
                    <select class="form-control role-select" data-user-id="${user.id}">
                        ${roleOptions}
                    </select>
                </td>
                <td class="user-status">
                    <span class="badge badge-${user.active ? 'success' : 'danger'}">
                        ${user.active ? '已激活' : '未激活'}
                    </span>
                </td>
                <td class="user-created-at">${formattedDate}</td>
                <td class="user-last-login">${lastLoginDate}</td>
                <td class="user-actions">
                    <button class="btn btn-sm edit-user" data-user-id="${user.id}">
                        编辑
                    </button>
                    <button class="btn btn-sm btn-danger delete-user" data-user-id="${user.id}">
                        删除
                    </button>
                </td>
            `;
            
            // 添加到表格
            userTableBody.appendChild(row);
        });
        
        // 绑定角色选择器事件
        bindRoleSelectEvents();
        
        // 绑定用户操作事件
        bindUserActionEvents();
    }

    /**
     * 更新用户分页信息
     */
    function updateUserPagination() {
        const userPageInfo = document.getElementById('userPageInfo');
        const userPrevPageBtn = document.getElementById('userPrevPageBtn');
        const userNextPageBtn = document.getElementById('userNextPageBtn');
        
        if (userPageInfo) {
            userPageInfo.textContent = `第 ${currentUserPage} 页 (共 ${totalUserCount} 条)`;
        }
        
        if (userPrevPageBtn) {
            userPrevPageBtn.disabled = currentUserPage <= 1;
        }
        
        if (userNextPageBtn) {
            userNextPageBtn.disabled = isUserLastPage;
        }
    }

    /**
     * 绑定角色选择器事件
     */
    function bindRoleSelectEvents() {
        const roleSelects = document.querySelectorAll('.role-select');
        
        roleSelects.forEach(select => {
            select.addEventListener('change', async function() {
                const userId = this.getAttribute('data-user-id');
                const newRole = this.value;
                
                if (confirm(`确定要将用户 #${userId} 的角色更改为"${translateRole(newRole)}"吗？`)) {
                    try {
                        await updateUserRole(userId, newRole);
                        showToast('用户角色更新成功', 'success');
                    } catch (error) {
                        console.error('更新用户角色失败:', error);
                        showToast('更新用户角色失败: ' + error.message, 'error');
                        // 重置选择器
                        await loadUsers(currentUserPage, userPageSize);
                    }
                } else {
                    // 用户取消了操作，重新加载表格恢复原值
                    await loadUsers(currentUserPage, userPageSize);
                }
            });
        });
    }

    /**
     * 绑定用户操作事件
     */
    function bindUserActionEvents() {
        // 编辑用户按钮
        const editUserBtns = document.querySelectorAll('.edit-user');
        editUserBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = this.getAttribute('data-user-id');
                showUserEditModal(userId);
            });
        });
        
        // 删除用户按钮
        const deleteUserBtns = document.querySelectorAll('.delete-user');
        deleteUserBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = this.getAttribute('data-user-id');
                deleteUser(userId);
            });
        });
    }

    /**
     * 显示用户编辑模态框
     * @param {string} userId - 用户ID
     */
    async function showUserEditModal(userId) {
        try {
            // 获取用户信息
            const user = await apiRequest(`/admin/users/${userId}`);
            
            // 获取模态框元素
            const modal = document.getElementById('userEditModal');
            if (!modal) {
                console.error('未找到用户编辑模态框');
                return;
            }
            
            // 填充表单
            document.getElementById('editUserId').value = user.id;
            document.getElementById('editUsername').value = user.username || '';
            document.getElementById('editEmail').value = user.email || '';
            document.getElementById('editUserRole').value = user.role || 'user';
            document.getElementById('editUserStatus').checked = user.active;
            
            // 显示模态框
            modal.style.display = 'block';
        } catch (error) {
            console.error('获取用户信息失败:', error);
            showToast('获取用户信息失败: ' + error.message, 'error');
        }
    }

    /**
     * 删除用户
     * @param {string} userId - 用户ID
     */
    async function deleteUser(userId) {
        if (!confirm(`确定要删除ID为 ${userId} 的用户吗？此操作不可撤销。`)) {
            return;
        }
        
        try {
            await apiRequest(`/admin/users/${userId}`, 'DELETE');
            
            // 重新加载用户列表
            await loadUsers(currentUserPage, userPageSize);
            
            showToast('用户删除成功', 'success');
        } catch (error) {
            console.error('删除用户失败:', error);
            showToast('删除用户失败: ' + error.message, 'error');
        }
    }

    /**
     * 将角色代码转换为显示文本
     * @param {string} role - 角色代码
     * @returns {string} 角色显示文本
     */
    function translateRole(role) {
        const roleMap = {
            'user': '普通用户',
            'admin': '管理员',
            'vip': 'VIP用户'
        };
        
        return roleMap[role] || role;
    }

    /**
     * 加载API模型列表
     */
    async function loadApiModels() {
        const tableBody = document.querySelector('#apiModelsTable tbody');
        const loadingState = document.getElementById('apiModelsLoadingState');
        const emptyState = document.getElementById('apiModelsEmptyState');
        
        if (!tableBody || !loadingState || !emptyState) {
            console.error('API模型表格元素未找到');
            return;
        }
        
        try {
            // 显示加载状态
            tableBody.innerHTML = '';
            loadingState.style.display = 'block';
            emptyState.style.display = 'none';
            
            // 发送请求 - 使用有效的API路径
            const response = await apiRequest('/chat/models');
            
            // 隐藏加载状态
            loadingState.style.display = 'none';
            
            // 如果没有数据，显示空状态
            if (!response.models || response.models.length === 0) {
                emptyState.style.display = 'block';
                return;
            }
            
            // 渲染数据
            response.models.forEach(model => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${model.name}</td>
                    <td>${model.provider}</td>
                    <td>${model.maxContext || 'N/A'}</td>
                    <td>${model.maxTokens || 'N/A'}</td>
                    <td>
                        <span class="badge ${model.isActive ? 'badge-success' : 'badge-danger'}">
                            ${model.isActive ? '启用' : '禁用'}
                        </span>
                    </td>
                    <td class="price-column">
                        <div class="price-tooltip" title="输入价格: ¥${model.inputPrice}/1K tokens，输出价格: ¥${model.outputPrice}/1K tokens">
                            ¥${model.inputPrice}/¥${model.outputPrice}
                        </div>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-button edit-button" data-id="${model.id}" title="编辑">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="action-button delete-button" data-id="${model.id}" title="删除">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
                
                // 绑定编辑和删除按钮事件
                row.querySelector('.edit-button').addEventListener('click', () => {
                    showModelEditModal(model);
                });
                
                row.querySelector('.delete-button').addEventListener('click', () => {
                    if (confirm(`确定要删除 ${model.name} 模型吗？`)) {
                        deleteApiModel(model.id);
                    }
                });
            });
        } catch (error) {
            console.error('加载API模型失败:', error);
            loadingState.style.display = 'none';
            showToast(`加载API模型失败: ${error.message}`, 'error');
        }
    }

    /**
     * 显示模型编辑模态框
     * @param {Object} model - 模型对象
     */
    function showModelEditModal(model) {
        // 获取模态框元素
        const modal = document.getElementById('modelEditModal');
        if (!modal) {
            console.error('未找到模型编辑模态框');
            return;
        }
        
        // 获取表单元素
        const modelIdInput = document.getElementById('editModelId');
        const modelNameInput = document.getElementById('editModelName');
        const modelProviderSelect = document.getElementById('editModelProvider');
        const modelMaxContextInput = document.getElementById('editModelMaxContext');
        const modelMaxTokensInput = document.getElementById('editModelMaxTokens');
        const modelInputPriceInput = document.getElementById('editModelInputPrice');
        const modelOutputPriceInput = document.getElementById('editModelOutputPrice');
        const modelStatusSelect = document.getElementById('editModelStatus');
        
        // 填充表单
        if (model) {
            modelIdInput.value = model.id;
            modelNameInput.value = model.name;
            modelProviderSelect.value = model.provider;
            modelMaxContextInput.value = model.maxContext || '';
            modelMaxTokensInput.value = model.maxTokens || '';
            modelInputPriceInput.value = model.inputPrice || '';
            modelOutputPriceInput.value = model.outputPrice || '';
            modelStatusSelect.value = model.isActive ? 'active' : 'inactive';
        } else {
            // 清空表单（新增模式）
            modelIdInput.value = '';
            modelNameInput.value = '';
            modelProviderSelect.value = '';
            modelMaxContextInput.value = '';
            modelMaxTokensInput.value = '';
            modelInputPriceInput.value = '';
            modelOutputPriceInput.value = '';
            modelStatusSelect.value = 'active';
        }
        
        // 显示模态框
        modal.style.display = 'block';
    }

    /**
     * 删除API模型
     * @param {string} modelId - 模型ID
     */
    async function deleteApiModel(modelId) {
        try {
            await apiRequest(`/chat/models/${modelId}`, 'DELETE');
            showToast('删除模型成功', 'success');
            loadApiModels(); // 重新加载模型列表
        } catch (error) {
            console.error('删除模型失败:', error);
            showToast(`删除模型失败: ${error.message}`, 'error');
        }
    }

    /**
     * 隐藏模态框
     * @param {string} modalId - 模态框ID
     */
    function hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * 保存全局API配置
     */
    async function saveGlobalApiConfig() {
        try {
            // 获取表单数据
            const defaultProvider = document.getElementById('defaultApiProvider').value;
            const defaultModel = document.getElementById('defaultApiModel').value;
            const defaultTemperature = parseFloat(document.getElementById('defaultTemperature').value);
            const systemPrompt = document.getElementById('systemPrompt').value;
            const apiRequestTimeout = parseInt(document.getElementById('apiRequestTimeout').value);
            
            // 验证数据
            if (!defaultProvider) {
                showToast('请选择默认API提供商', 'error');
                return;
            }
            
            if (!defaultModel) {
                showToast('请选择默认模型', 'error');
                return;
            }
            
            if (isNaN(defaultTemperature) || defaultTemperature < 0 || defaultTemperature > 1) {
                showToast('默认温度必须是0-1之间的数值', 'error');
                return;
            }
            
            if (isNaN(apiRequestTimeout) || apiRequestTimeout < 1000) {
                showToast('API请求超时必须是大于1000的整数', 'error');
                return;
            }
            
            // 构建配置数据
            const configData = {
                defaultProvider,
                defaultModel,
                defaultTemperature,
                systemPrompt,
                apiRequestTimeout
            };
            
            // 发送请求
            await apiRequest('/chat/config', 'PUT', configData);
            
            // 显示成功消息
            showToast('全局API配置保存成功', 'success');
        } catch (error) {
            console.error('保存全局API配置失败:', error);
            showToast(`保存全局API配置失败: ${error.message}`, 'error');
        }
    }

    // API日志全局变量
    let currentApiLogPage = 1;
    let apiLogPageSize = 20;
    let apiLogDateFilter = '';
    let apiLogUserFilter = '';
    let isApiLogLastPage = false;

    /**
     * 搜索API日志
     */
    async function searchApiLogs() {
        // 获取搜索条件
        const searchInput = document.getElementById('apiLogSearchInput');
        if (searchInput) {
            const searchTerm = searchInput.value.trim();
            
            // 重置页码并加载
            currentApiLogPage = 1;
            await loadApiLogs(currentApiLogPage, apiLogPageSize, searchTerm, apiLogDateFilter, apiLogUserFilter);
        }
    }

    /**
     * 按日期筛选API日志
     */
    async function filterApiLogsByDate() {
        const dateFilter = document.getElementById('apiLogDateFilter');
        if (dateFilter) {
            apiLogDateFilter = dateFilter.value;
            
            // 重置页码并加载
            currentApiLogPage = 1;
            
            const searchInput = document.getElementById('apiLogSearchInput');
            const searchTerm = searchInput ? searchInput.value.trim() : '';
            
            await loadApiLogs(currentApiLogPage, apiLogPageSize, searchTerm, apiLogDateFilter, apiLogUserFilter);
        }
    }

    /**
     * 按用户筛选API日志
     */
    async function filterApiLogsByUser() {
        const userFilter = document.getElementById('apiLogUserFilter');
        if (userFilter) {
            apiLogUserFilter = userFilter.value;
            
            // 重置页码并加载
            currentApiLogPage = 1;
            
            const searchInput = document.getElementById('apiLogSearchInput');
            const searchTerm = searchInput ? searchInput.value.trim() : '';
            
            await loadApiLogs(currentApiLogPage, apiLogPageSize, searchTerm, apiLogDateFilter, apiLogUserFilter);
        }
    }

    /**
     * 导航API日志分页
     * @param {string} direction - 分页方向，'prev'或'next'
     */
    async function navigateApiLogPage(direction) {
        if (direction === 'prev' && currentApiLogPage > 1) {
            currentApiLogPage--;
        } else if (direction === 'next' && !isApiLogLastPage) {
            currentApiLogPage++;
        } else {
            return; // 不进行操作
        }
        
        // 获取搜索条件
        const searchInput = document.getElementById('apiLogSearchInput');
        const searchTerm = searchInput ? searchInput.value.trim() : '';
        
        // 加载日志
        await loadApiLogs(currentApiLogPage, apiLogPageSize, searchTerm, apiLogDateFilter, apiLogUserFilter);
    }

    /**
     * 加载API日志
     * @param {number} page - 页码
     * @param {number} limit - 每页数量
     * @param {string} searchTerm - 搜索关键词
     * @param {string} dateFilter - 日期筛选
     * @param {string} userFilter - 用户筛选
     */
    async function loadApiLogs(page = 1, limit = 20, searchTerm = '', dateFilter = '', userFilter = '') {
        try {
            // 显示加载状态
            const tableBody = document.getElementById('apiLogsTableBody');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center">加载中...</td></tr>';
            }
            
            // 构建API请求路径
            let endpoint = `/admin/api-logs?page=${page}&limit=${limit}`;
            
            if (searchTerm) {
                endpoint += `&q=${encodeURIComponent(searchTerm)}`;
            }
            
            if (dateFilter) {
                endpoint += `&date=${encodeURIComponent(dateFilter)}`;
            }
            
            if (userFilter) {
                endpoint += `&user=${encodeURIComponent(userFilter)}`;
            }
            
            // 发送请求
            const response = await apiRequest(endpoint);
            
            // 更新全局变量
            currentApiLogPage = page;
            isApiLogLastPage = response.logs.length < limit;
            
            // 更新分页信息
            updateApiLogPagination();
            
            // 渲染日志表格
            renderApiLogs(response.logs);
            
            // 更新用户筛选下拉框
            if (response.users && response.users.length > 0) {
                updateApiLogUserFilter(response.users);
            }
        } catch (error) {
            console.error('加载API日志失败:', error);
            
            // 显示错误状态
            const tableBody = document.getElementById('apiLogsTableBody');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">加载日志失败，请重试</td></tr>';
            }
            
            showToast('加载API日志失败: ' + error.message, 'error');
        }
    }

    /**
     * 渲染API日志
     * @param {Array} logs - 日志数组
     */
    function renderApiLogs(logs) {
        const tableBody = document.getElementById('apiLogsTableBody');
        if (!tableBody) {
            return;
        }
        
        // 清空表格
        tableBody.innerHTML = '';
        
        // 如果没有数据，显示空状态
        if (!logs || logs.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">暂无日志</td></tr>';
            return;
        }
        
        // 遍历日志数据
        logs.forEach(log => {
            const row = document.createElement('tr');
            
            // 格式化时间
            const timestamp = new Date(log.timestamp);
            const formattedTime = timestamp.toLocaleString('zh-CN');
            
            // 截断请求和响应数据
            const requestData = log.request ? JSON.stringify(log.request).substring(0, 50) + '...' : 'N/A';
            const responseData = log.response ? JSON.stringify(log.response).substring(0, 50) + '...' : 'N/A';
            
            // 生成表格行
            row.innerHTML = `
                <td>${log.id}</td>
                <td>${log.userId || 'N/A'}</td>
                <td>${log.endpoint || 'N/A'}</td>
                <td>${formattedTime}</td>
                <td>${log.status || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm view-api-log" data-id="${log.id}">
                        查看详情
                    </button>
                </td>
            `;
            
            // 添加到表格
            tableBody.appendChild(row);
            
            // 绑定查看详情按钮事件
            row.querySelector('.view-api-log').addEventListener('click', () => {
                showApiLogDetails(log);
            });
        });
    }

    /**
     * 更新API日志分页信息
     */
    function updateApiLogPagination() {
        const pageInfo = document.getElementById('apiLogPageInfo');
        const prevBtn = document.getElementById('apiLogPrevPageBtn');
        const nextBtn = document.getElementById('apiLogNextPageBtn');
        
        if (pageInfo) {
            pageInfo.textContent = `第 ${currentApiLogPage} 页`;
        }
        
        if (prevBtn) {
            prevBtn.disabled = currentApiLogPage <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = isApiLogLastPage;
        }
    }

    /**
     * 更新API日志用户筛选下拉框
     * @param {Array} users - 用户数组
     */
    function updateApiLogUserFilter(users) {
        const userFilter = document.getElementById('apiLogUserFilter');
        if (!userFilter) {
            return;
        }
        
        // 保留当前选中的值
        const currentValue = userFilter.value;
        
        // 清空现有选项，保留"全部"选项
        while (userFilter.options.length > 1) {
            userFilter.remove(1);
        }
        
        // 添加用户选项
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.username || user.email || user.id;
            userFilter.appendChild(option);
        });
        
        // 恢复之前选中的值
        if (currentValue) {
            userFilter.value = currentValue;
        }
    }

    /**
     * 显示API日志详情
     * @param {Object} log - 日志对象
     */
    function showApiLogDetails(log) {
        // 获取模态框元素
        const modal = document.getElementById('apiLogDetailsModal');
        if (!modal) {
            console.error('未找到API日志详情模态框');
            return;
        }
        
        // 填充日志详情
        document.getElementById('logDetailsId').textContent = log.id;
        document.getElementById('logDetailsUser').textContent = log.userId || 'N/A';
        document.getElementById('logDetailsEndpoint').textContent = log.endpoint || 'N/A';
        document.getElementById('logDetailsTimestamp').textContent = new Date(log.timestamp).toLocaleString('zh-CN');
        document.getElementById('logDetailsStatus').textContent = log.status || 'N/A';
        
        // 格式化请求和响应数据
        const requestJson = log.request ? JSON.stringify(log.request, null, 2) : 'N/A';
        const responseJson = log.response ? JSON.stringify(log.response, null, 2) : 'N/A';
        
        document.getElementById('logDetailsRequest').textContent = requestJson;
        document.getElementById('logDetailsResponse').textContent = responseJson;
        
        // 显示模态框
        modal.style.display = 'block';
    }

    /**
     * 显示API密钥模态框
     * @param {Object} apiKey - API密钥对象（编辑时传入）
     */
    function showApiKeyModal(apiKey = null) {
        // 获取模态框元素
        const modal = document.getElementById('apiKeyModal');
        if (!modal) {
            console.error('未找到API密钥模态框');
            return;
        }
        
        // 获取表单元素
        const keyIdInput = document.getElementById('apiKeyId');
        const providerSelect = document.getElementById('apiKeyProvider');
        const keyInput = document.getElementById('apiKeyValue');
        const userSelect = document.getElementById('apiKeyUser');
        const isGlobalCheckbox = document.getElementById('apiKeyIsGlobal');
        const modalTitle = document.getElementById('apiKeyModalTitle');
        
        // 重置表单
        keyIdInput.value = '';
        keyInput.value = '';
        isGlobalCheckbox.checked = false;
        
        // 根据是否有API密钥对象，决定是编辑还是新增
        if (apiKey) {
            modalTitle.textContent = '编辑API密钥';
            keyIdInput.value = apiKey.id;
            keyInput.value = apiKey.key || '';
            
            // 设置提供商
            if (providerSelect && apiKey.provider) {
                providerSelect.value = apiKey.provider;
            }
            
            // 设置用户
            if (userSelect && apiKey.userId) {
                userSelect.value = apiKey.userId;
                isGlobalCheckbox.checked = false;
            } else {
                isGlobalCheckbox.checked = true;
            }
        } else {
            modalTitle.textContent = '添加API密钥';
        }
        
        // 显示模态框
        modal.style.display = 'block';
    }

    /**
     * 隐藏API密钥模态框
     */
    function hideApiKeyModal() {
        const modal = document.getElementById('apiKeyModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * 保存API密钥
     */
    async function saveApiKey() {
        // 获取表单数据
        const keyId = document.getElementById('apiKeyId').value;
        const provider = document.getElementById('apiKeyProvider').value;
        const key = document.getElementById('apiKeyValue').value;
        const userId = document.getElementById('apiKeyUser').value;
        const isGlobal = document.getElementById('apiKeyIsGlobal').checked;
        
        // 验证表单
        if (!provider) {
            showToast('请选择API提供商', 'error');
            return;
        }
        
        if (!key) {
            showToast('API密钥不能为空', 'error');
            return;
        }
        
        if (!isGlobal && !userId) {
            showToast('请选择用户或勾选"全局密钥"', 'error');
            return;
        }
        
        try {
            // 准备数据
            const data = {
                provider,
                key,
                userId: isGlobal ? null : userId
            };
            
            let response;
            
            // 根据是否有ID决定是新增还是更新
            if (keyId) {
                response = await apiRequest(`/admin/api-keys/${keyId}`, 'PUT', data);
            } else {
                response = await apiRequest('/admin/api-keys', 'POST', data);
            }
            
            // 隐藏模态框
            hideApiKeyModal();
            
            // 重新加载API密钥列表
            loadApiKeys();
            
            // 显示成功消息
            showToast(keyId ? 'API密钥更新成功' : 'API密钥添加成功', 'success');
        } catch (error) {
            console.error('保存API密钥失败:', error);
            showToast('保存API密钥失败: ' + error.message, 'error');
        }
    }

    /**
     * 复制API密钥
     * @param {Event} event - 点击事件
     */
    function copyApiKey(event) {
        const button = event.target.closest('.copy-api-key');
        if (!button) return;
        
        // 获取要复制的密钥
        const keyElement = button.closest('tr').querySelector('.api-key-value');
        const key = keyElement.textContent;
        
        // 复制到剪贴板
        navigator.clipboard.writeText(key)
            .then(() => {
                showToast('API密钥已复制到剪贴板', 'success');
                
                // 临时改变按钮文本
                const originalText = button.textContent;
                button.textContent = '已复制!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('复制失败:', err);
                showToast('复制失败，请手动复制', 'error');
            });
    }

    /**
     * 切换密码可见性
     * @param {Event} event - 点击事件
     */
    function togglePasswordVisibility(event) {
        const button = event.target.closest('.toggle-password');
        if (!button) return;
        
        // 获取相关的密码输入框
        const passwordInput = button.previousElementSibling;
        if (!passwordInput) return;
        
        // 切换密码可见性
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            button.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            button.textContent = '👁️';
        }
    }

    /**
     * 加载API密钥列表
     */
    async function loadApiKeys() {
        try {
            // 显示加载状态
            const tableBody = document.getElementById('apiKeysTableBody');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center">加载中...</td></tr>';
            }
            
            // 获取API密钥列表
            const response = await apiRequest('/admin/api-keys');
            
            // 清空表格
            if (tableBody) {
                tableBody.innerHTML = '';
            }
            
            // 如果没有数据，显示空状态
            if (!response || !response.keys || response.keys.length === 0) {
                if (tableBody) {
                    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">暂无API密钥</td></tr>';
                }
                return;
            }
            
            // 渲染API密钥表格
            response.keys.forEach(key => {
                const row = document.createElement('tr');
                
                // 生成表格行
                row.innerHTML = `
                    <td>${key.provider || 'N/A'}</td>
                    <td class="api-key-value">
                        <div class="password-field">
                            <input type="password" value="${key.key}" readonly class="form-control" />
                            <button class="toggle-password">👁️</button>
                        </div>
                    </td>
                    <td>${key.userId || '全局'}</td>
                    <td>${new Date(key.createdAt).toLocaleDateString('zh-CN')}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-sm copy-api-key" title="复制">
                                复制
                            </button>
                            <button class="btn btn-sm edit-api-key" data-id="${key.id}">
                                编辑
                            </button>
                            <button class="btn btn-sm btn-danger delete-api-key" data-id="${key.id}">
                                删除
                            </button>
                        </div>
                    </td>
                `;
                
                // 添加到表格
                if (tableBody) {
                    tableBody.appendChild(row);
                }
                
                // 绑定事件
                const editBtn = row.querySelector('.edit-api-key');
                if (editBtn) {
                    editBtn.addEventListener('click', () => {
                        showApiKeyModal(key);
                    });
                }
                
                const deleteBtn = row.querySelector('.delete-api-key');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', async () => {
                        if (confirm(`确定要删除此API密钥吗？`)) {
                            try {
                                await apiRequest(`/admin/api-keys/${key.id}`, 'DELETE');
                                loadApiKeys();
                                showToast('API密钥删除成功', 'success');
                            } catch (error) {
                                console.error('删除API密钥失败:', error);
                                showToast('删除API密钥失败: ' + error.message, 'error');
                            }
                        }
                    });
                }
                
                // 绑定密码可见性切换
                const toggleBtn = row.querySelector('.toggle-password');
                if (toggleBtn) {
                    toggleBtn.addEventListener('click', togglePasswordVisibility);
                }
                
                // 绑定复制按钮
                const copyBtn = row.querySelector('.copy-api-key');
                if (copyBtn) {
                    copyBtn.addEventListener('click', copyApiKey);
                }
            });
        } catch (error) {
            console.error('加载API密钥失败:', error);
            
            // 显示错误状态
            const tableBody = document.getElementById('apiKeysTableBody');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">加载API密钥失败，请重试</td></tr>';
            }
            
            showToast('加载API密钥失败: ' + error.message, 'error');
        }
    }

    /**
     * 加载对话模式列表
     */
    async function loadChatModes() {
        const tableBody = document.getElementById('chatModeTableBody');
        const loadingState = document.getElementById('chatModeLoadingState');
        const emptyState = document.getElementById('chatModeEmptyState');
        
        if (!tableBody || !loadingState || !emptyState) {
            console.error('对话模式表格元素未找到');
            return;
        }
        
        try {
            // 显示加载状态
            tableBody.innerHTML = '';
            loadingState.style.display = 'block';
            emptyState.style.display = 'none';
            
            // 获取筛选条件
            const searchInput = document.getElementById('chatModeSearchInput');
            const statusFilter = document.getElementById('chatModeStatusFilter');
            
            const searchTerm = searchInput ? searchInput.value.trim() : '';
            const status = statusFilter ? statusFilter.value : 'all';
            
            // 构建API请求路径
            let endpoint = '/chat/modes';
            const params = [];
            
            if (searchTerm) {
                params.push(`q=${encodeURIComponent(searchTerm)}`);
            }
            
            if (status && status !== 'all') {
                params.push(`status=${encodeURIComponent(status)}`);
            }
            
            if (params.length > 0) {
                endpoint += `?${params.join('&')}`;
            }
            
            // 发送请求
            const response = await apiRequest(endpoint);
            
            // 隐藏加载状态
            loadingState.style.display = 'none';
            
            // 如果没有数据，显示空状态
            if (!response.modes || response.modes.length === 0) {
                tableBody.innerHTML = '';
                emptyState.style.display = 'block';
                return;
            }
            
            // 渲染数据
            tableBody.innerHTML = '';
            response.modes.forEach(mode => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${mode.id}</td>
                    <td>${mode.name}</td>
                    <td>${mode.description || '无描述'}</td>
                    <td>${formatRequiredPermission(mode.requiredPermission)}</td>
                    <td>
                        <span class="badge ${mode.isActive ? 'badge-success' : 'badge-danger'}">
                            ${mode.isActive ? '启用' : '禁用'}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-button edit-button" data-id="${mode.id}" title="编辑">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="action-button delete-button" data-id="${mode.id}" title="删除">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
                
                // 绑定编辑和删除按钮事件
                row.querySelector('.edit-button').addEventListener('click', () => {
                    showChatModeModal(mode);
                });
                
                row.querySelector('.delete-button').addEventListener('click', () => {
                    if (confirm(`确定要删除 "${mode.name}" 对话模式吗？`)) {
                        deleteChatMode(mode.id);
                    }
                });
            });
        } catch (error) {
            console.error('加载对话模式失败:', error);
            loadingState.style.display = 'none';
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">加载对话模式失败，请重试</td></tr>';
            showToast('加载对话模式失败: ' + error.message, 'error');
        }
    }

    /**
     * 格式化权限要求
     * @param {string} permission - 权限代码
     * @returns {string} 格式化后的文本
     */
    function formatRequiredPermission(permission) {
        if (!permission) return '无限制';
        
        const permissionMap = {
            'basic': '基础用户',
            'premium': '高级用户',
            'pro': '专业用户',
            'admin': '管理员'
        };
        
        return permissionMap[permission] || permission;
    }

    /**
     * 搜索对话模式
     */
    function searchChatModes() {
        loadChatModes();
    }

    /**
     * 加载用户列表到权限下拉框
     */
    async function loadUsersForPermissions() {
        try {
            const response = await apiRequest('/admin/users');
            
            if (!response.users || response.users.length === 0) {
                return;
            }
            
            const select = document.getElementById('userPermissionChatModeFilter');
            if (!select) return;
            
            // 清空选项（保留第一个"请选择用户"选项）
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            // 添加用户选项
            response.users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.username || '无名称'} (${user.email})`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('加载用户列表失败:', error);
            showToast('加载用户列表失败: ' + error.message, 'error');
        }
    }

    /**
     * 加载用户对话模式权限
     * @param {string} userId - 用户ID
     */
    async function loadUserChatModePermissions(userId) {
        const tableBody = document.querySelector('#userChatModeTable tbody');
        const emptyState = document.getElementById('userChatModeEmptyState');
        
        if (!tableBody || !emptyState) return;
        
        try {
            // 显示加载状态
            tableBody.innerHTML = '<tr><td colspan="3" class="text-center">加载中...</td></tr>';
            emptyState.style.display = 'none';
            
            // 发送请求
            const response = await apiRequest(`/admin/users/${userId}/permissions`);
            
            // 如果没有数据或没有对话模式权限
            if (!response || !response.allowedChatModes || response.allowedChatModes.length === 0) {
                tableBody.innerHTML = '';
                emptyState.style.display = 'block';
                return;
            }
            
            // 获取全部对话模式列表
            const modesResponse = await apiRequest('/chat/modes');
            const allModes = modesResponse.modes || [];
            
            // 渲染数据
            tableBody.innerHTML = '';
            if (allModes.length === 0) {
                emptyState.style.display = 'block';
                return;
            }
            
            allModes.forEach(mode => {
                const isAllowed = response.allowedChatModes.includes(mode.id);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${mode.name}</td>
                    <td>${mode.description || '无描述'}</td>
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" data-mode-id="${mode.id}" 
                                ${isAllowed ? 'checked' : ''}>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // 显示编辑按钮
            document.getElementById('editPermissionBtn').style.display = 'block';
            
            // 保存当前用户ID
            document.getElementById('permissionUserId').value = userId;
        } catch (error) {
            console.error('加载用户权限失败:', error);
            tableBody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">加载失败，请重试</td></tr>';
            showToast('加载用户权限失败: ' + error.message, 'error');
        }
    }

    /**
     * 保存用户对话模式权限
     */
    async function saveUserChatModePermission() {
        const userId = document.getElementById('permissionUserId').value;
        
        if (!userId) {
            showToast('请先选择用户', 'error');
            return;
        }
        
        try {
            // 获取所有选中的模式
            const allowedModes = [];
            document.querySelectorAll('#userChatModeTable input[type="checkbox"]:checked').forEach(checkbox => {
                allowedModes.push(checkbox.getAttribute('data-mode-id'));
            });
            
            // 发送请求
            await apiRequest(`/admin/users/${userId}/permissions`, 'PUT', {
                allowedChatModes: allowedModes
            });
            
            showToast('用户权限保存成功', 'success');
        } catch (error) {
            console.error('保存用户权限失败:', error);
            showToast('保存用户权限失败: ' + error.message, 'error');
        }
    }

    /**
     * 显示对话模式编辑模态框
     * @param {Object} mode - 对话模式对象（编辑时传入）
     */
    function showChatModeModal(mode = null) {
        // 获取模态框元素
        const modal = document.getElementById('chatModeModalOverlay');
        if (!modal) {
            console.error('未找到对话模式模态框');
            return;
        }
        
        // 获取表单元素
        const modeIdInput = document.getElementById('chatModeId');
        const modeNameInput = document.getElementById('chatModeName');
        const modeDescInput = document.getElementById('chatModeDescription');
        const modeSystemPromptInput = document.getElementById('chatModeSystemPrompt');
        const modeRequiredPermissionSelect = document.getElementById('chatModeRequiredPermission');
        const modeStatusSelect = document.getElementById('chatModeStatus');
        const modalTitle = document.getElementById('chatModeModalTitle');
        
        // 如果是编辑模式
        if (mode) {
            modalTitle.textContent = '编辑对话模式';
            modeIdInput.value = mode.id;
            modeNameInput.value = mode.name;
            modeDescInput.value = mode.description || '';
            modeSystemPromptInput.value = mode.systemPrompt || '';
            modeRequiredPermissionSelect.value = mode.requiredPermission || 'none';
            modeStatusSelect.value = mode.isActive ? 'active' : 'inactive';
        } else {
            // 新增模式
            modalTitle.textContent = '添加对话模式';
            modeIdInput.value = '';
            modeNameInput.value = '';
            modeDescInput.value = '';
            modeSystemPromptInput.value = '';
            modeRequiredPermissionSelect.value = 'none';
            modeStatusSelect.value = 'active';
        }
        
        // 显示模态框
        modal.style.display = 'block';
    }

    /**
     * 删除对话模式
     * @param {string} modeId - 对话模式ID
     */
    async function deleteChatMode(modeId) {
        try {
            await apiRequest(`/chat/modes/${modeId}`, 'DELETE');
            showToast('删除对话模式成功', 'success');
            loadChatModes();
        } catch (error) {
            console.error('删除对话模式失败:', error);
            showToast('删除对话模式失败: ' + error.message, 'error');
        }
    }
});