// 订阅页面脚本

// DOM元素
const currentSubscriptionElement = document.getElementById('current-subscription');
const noSubscriptionElement = document.getElementById('no-subscription');
const loginRequiredElement = document.getElementById('login-required');
const subscriptionPlansElement = document.getElementById('subscription-plans');
const renewButton = document.getElementById('renew-button');

// 模态框元素
const confirmPlanNameElement = document.getElementById('confirm-plan-name');
const confirmPlanPriceElement = document.getElementById('confirm-plan-price');
const confirmPlanQuotaElement = document.getElementById('confirm-plan-quota');
const confirmSubscriptionButton = document.getElementById('confirm-subscription');
const subscriptionModal = document.getElementById('subscriptionModal');
const loginModal = document.getElementById('loginModal');
const closeSubscriptionModal = document.getElementById('closeSubscriptionModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const cancelSubscription = document.getElementById('cancelSubscription');
const cancelLogin = document.getElementById('cancelLogin');
const loginPromptBtn = document.getElementById('login-prompt-btn');
const confirmLogin = document.getElementById('confirmLogin');

// 存储计划数据
let plans = [];
let selectedPlanId = null;
let currentSubscription = null;

// 检查用户认证状态
function checkAuth() {
  const token = localStorage.getItem('xpat_auth_token');
  const userInfo = localStorage.getItem('xpat_user_info');
  
  if (token && userInfo) {
    try {
      // 解析用户信息
      const user = JSON.parse(userInfo);
      return { isLoggedIn: true, user };
    } catch (e) {
      return { isLoggedIn: false };
    }
  }
  
  return { isLoggedIn: false };
}

// 设置用户界面
function setupAuthUI() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const adminEntry = document.getElementById('admin-entry');
  
  const { isLoggedIn, user } = checkAuth();
  
  if (isLoggedIn && user) {
    // 用户已登录 - 只显示退出按钮，隐藏登录按钮
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'list-item';
    
    // 如果是管理员，显示管理入口
    if (adminEntry && user.role === 'admin') {
      adminEntry.style.display = 'list-item';
    }
    
    // 绑定登出事件
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('xpat_auth_token');
        localStorage.removeItem('xpat_user_info');
        window.location.reload();
      });
    }
  } else {
    // 用户未登录 - 只显示登录按钮，隐藏退出按钮
    if (loginBtn) loginBtn.style.display = 'list-item';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (adminEntry) adminEntry.style.display = 'none';
    
    // 绑定登录按钮事件
    if (loginBtn) {
      loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showLoginModal();
      });
    }
  }
}

// 初始化页面
async function initPage() {
  // 设置认证UI
  setupAuthUI();
  
  const { isLoggedIn } = checkAuth();
  
  if (isLoggedIn) {
    // 如果用户已登录，加载当前订阅和可用计划
    try {
      await loadCurrentSubscription();
      await loadSubscriptionPlans();
    } catch (error) {
      console.error('初始化页面失败:', error);
    }
  } else {
    // 如果用户未登录，显示登录提示，但仍加载可用计划
    loginRequiredElement.style.display = 'block';
    try {
      await loadSubscriptionPlans();
    } catch (error) {
      console.error('加载订阅计划失败:', error);
    }
  }
  
  // 绑定模态框事件
  setupModalEvents();
  
  // 绑定登录提示按钮事件
  if (loginPromptBtn) {
    loginPromptBtn.addEventListener('click', showLoginModal);
  }
}

// 加载当前订阅信息
async function loadCurrentSubscription() {
  try {
    const token = localStorage.getItem('xpat_auth_token');
    if (!token) return;
    
    const response = await fetch(`${window.API_BASE_URL}/api/subscriptions/current`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        // 用户没有活跃订阅
        noSubscriptionElement.style.display = 'block';
        return;
      }
      throw new Error(`获取订阅失败: ${response.statusText}`);
    }
    
    currentSubscription = await response.json();
    
    // 如果有活跃的订阅，显示订阅信息
    if (currentSubscription) {
      // 更新DOM
      document.getElementById('current-plan-name').textContent = currentSubscription.plan_name || 'Unknown Plan';
      
      // 格式化到期日期
      const expirationDate = new Date(currentSubscription.expiration_date);
      document.getElementById('expiration-date').textContent = expirationDate.toLocaleDateString('zh-CN');
      
      // 计算剩余天数
      const today = new Date();
      const diffTime = expirationDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      document.getElementById('remaining-days').textContent = `${diffDays} 天`;
      
      // API配额
      document.getElementById('api-quota').textContent = currentSubscription.api_quota || 'Unlimited';
      
      // 功能列表
      const featuresList = document.getElementById('features-list');
      if (featuresList && currentSubscription.features && Array.isArray(currentSubscription.features)) {
        featuresList.innerHTML = '';
        currentSubscription.features.forEach(feature => {
          const li = document.createElement('li');
          li.textContent = feature;
          featuresList.appendChild(li);
        });
      }
      
      // 显示当前订阅区块
      currentSubscriptionElement.style.display = 'block';
      
      // 绑定续订按钮事件
      if (renewButton) {
        renewButton.addEventListener('click', renewCurrentSubscription);
      }
    } else {
      // 没有活跃订阅
      noSubscriptionElement.style.display = 'block';
    }
    
  } catch (error) {
    console.error('加载当前订阅失败:', error);
    noSubscriptionElement.style.display = 'block';
  }
}

// 加载订阅计划
async function loadSubscriptionPlans() {
  try {
    // 清空加载指示器
    subscriptionPlansElement.innerHTML = '<div class="loading-indicator"><div class="spinner"></div></div>';
    
    const response = await fetch(`${window.API_BASE_URL}/api/subscriptions/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`获取订阅计划失败: ${response.statusText}`);
    }
    
    plans = await response.json();
    
    // 清空加载指示器
    subscriptionPlansElement.innerHTML = '';
    
    // 创建计划卡片
    plans.forEach(plan => {
      const planCard = createPlanCard(plan);
      subscriptionPlansElement.appendChild(planCard);
    });
  } catch (error) {
    console.error('加载订阅计划失败:', error);
    subscriptionPlansElement.innerHTML = `
      <div class="alert alert-warning">
        <h4>加载订阅计划失败</h4>
        <p>无法获取可用的订阅计划，请刷新页面重试。</p>
      </div>
    `;
  }
}

/**
 * 创建订阅计划卡片
 * @param {Object} plan - 订阅计划数据
 * @returns {HTMLElement} 计划卡片元素
 */
function createPlanCard(plan) {
  const isCurrentPlan = currentSubscription && currentSubscription.plan_id === plan.id;
  
  const planCard = document.createElement('div');
  planCard.className = 'plan-card';
  
  planCard.innerHTML = `
    <div class="plan-header">
      <h3>
        ${plan.name}
        ${isCurrentPlan ? '<span class="plan-badge">当前</span>' : ''}
      </h3>
    </div>
    <div class="plan-body">
      <div class="plan-price">
        ${plan.price}<span>元 / 月</span>
      </div>
      <div class="plan-feature">
        每日API调用: <strong>${plan.api_quota}</strong> 次
      </div>
      <ul class="features-list">
        ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
      </ul>
      <button class="btn-subscribe ${isCurrentPlan ? 'btn-outline' : ''}" data-plan-id="${plan.id}">
        ${isCurrentPlan ? '续订' : (plan.price === 0 ? '选择免费方案' : '订阅')}
      </button>
    </div>
  `;
  
  // 绑定订阅按钮事件
  const subscribeBtn = planCard.querySelector('.btn-subscribe');
  subscribeBtn.addEventListener('click', () => openSubscriptionModal(plan));
  
  return planCard;
}

/**
 * 设置模态框事件
 */
function setupModalEvents() {
  // 关闭订阅确认模态框
  if (closeSubscriptionModal) {
    closeSubscriptionModal.addEventListener('click', () => {
      subscriptionModal.classList.remove('active');
    });
  }
  
  // 取消订阅按钮
  if (cancelSubscription) {
    cancelSubscription.addEventListener('click', () => {
      subscriptionModal.classList.remove('active');
    });
  }
  
  // 点击模态框外部关闭
  window.addEventListener('click', (e) => {
    if (e.target === subscriptionModal) {
      subscriptionModal.classList.remove('active');
    }
    if (e.target === loginModal) {
      loginModal.classList.remove('active');
    }
  });
  
  // 确认订阅按钮
  if (confirmSubscriptionButton) {
    confirmSubscriptionButton.addEventListener('click', subscribePlan);
  }
  
  // 关闭登录模态框
  if (closeLoginModal) {
    closeLoginModal.addEventListener('click', () => {
      loginModal.classList.remove('active');
    });
  }
  
  // 取消登录按钮
  if (cancelLogin) {
    cancelLogin.addEventListener('click', () => {
      loginModal.classList.remove('active');
    });
  }
  
  // 确认登录按钮
  if (confirmLogin) {
    confirmLogin.addEventListener('click', handleLogin);
  }
}

/**
 * 显示登录模态框
 */
function showLoginModal() {
  // 重置表单
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.reset();
  
  // 清除错误信息
  const loginError = document.getElementById('loginError');
  if (loginError) loginError.style.display = 'none';
  
  // 显示模态框
  loginModal.classList.add('active');
}

/**
 * 处理登录
 */
async function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const loginError = document.getElementById('loginError');
  
  if (!email || !password) {
    loginError.textContent = '请输入邮箱和密码';
    loginError.style.display = 'block';
    return;
  }
  
  try {
    const response = await fetch(`${window.API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      loginError.textContent = data.message || '登录失败，请检查邮箱和密码';
      loginError.style.display = 'block';
      return;
    }
    
    // 保存token和用户信息
    localStorage.setItem('xpat_auth_token', data.token);
    localStorage.setItem('xpat_user_info', JSON.stringify(data.user));
    
    // 关闭模态框
    loginModal.classList.remove('active');
    
    // 刷新页面
    window.location.reload();
    
  } catch (error) {
    console.error('登录失败:', error);
    loginError.textContent = '登录过程中发生错误，请稍后重试';
    loginError.style.display = 'block';
  }
}

/**
 * 打开订阅确认模态框
 * @param {Object} plan - 订阅计划数据
 */
function openSubscriptionModal(plan) {
  // 检查用户是否已登录
  if (!localStorage.getItem('xpat_auth_token')) {
    // 打开登录模态框
    showLoginModal();
    return;
  }
  
  // 设置模态框数据
  confirmPlanNameElement.textContent = plan.name;
  confirmPlanPriceElement.textContent = plan.price;
  confirmPlanQuotaElement.textContent = plan.api_quota;
  selectedPlanId = plan.id;
  
  // 显示模态框
  subscriptionModal.classList.add('active');
}

/**
 * 订阅计划
 */
async function subscribePlan() {
  if (!selectedPlanId) {
    console.error('没有选择订阅计划');
    return;
  }
  
  const token = localStorage.getItem('xpat_auth_token');
  if (!token) {
    showLoginModal();
    return;
  }
  
  try {
    // 开始订阅处理
    confirmSubscriptionButton.textContent = '处理中...';
    confirmSubscriptionButton.disabled = true;
    
    const response = await fetch(`${window.API_BASE_URL}/api/subscriptions/subscribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ plan_id: selectedPlanId })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '订阅失败');
    }
    
    // 关闭模态框
    subscriptionModal.classList.remove('active');
    
    // 显示成功消息
    alert('订阅成功！');
    
    // 重新加载订阅信息
    loadCurrentSubscription();
    loadSubscriptionPlans();
    
  } catch (error) {
    console.error('订阅计划失败:', error);
    alert(`订阅失败: ${error.message}`);
  } finally {
    // 恢复按钮状态
    confirmSubscriptionButton.textContent = '确认订阅';
    confirmSubscriptionButton.disabled = false;
  }
}

/**
 * 续订当前订阅
 */
async function renewCurrentSubscription() {
  if (!currentSubscription) {
    console.error('没有当前订阅可续订');
    return;
  }
  
  const token = localStorage.getItem('xpat_auth_token');
  if (!token) {
    showLoginModal();
    return;
  }
  
  try {
    // 开始续订处理
    renewButton.textContent = '处理中...';
    renewButton.disabled = true;
    
    const response = await fetch(`${window.API_BASE_URL}/api/subscriptions/renew`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subscription_id: currentSubscription.id })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '续订失败');
    }
    
    // 显示成功消息
    alert('续订成功！');
    
    // 重新加载订阅信息
    loadCurrentSubscription();
    
  } catch (error) {
    console.error('续订失败:', error);
    alert(`续订失败: ${error.message}`);
  } finally {
    // 恢复按钮状态
    renewButton.textContent = '续订';
    renewButton.disabled = false;
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage); 