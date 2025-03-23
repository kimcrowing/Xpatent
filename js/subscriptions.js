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
  const authButtons = document.getElementById('auth-buttons');
  const userDropdown = document.getElementById('user-dropdown');
  const username = document.getElementById('username');
  const logoutBtn = document.getElementById('logout-btn');
  
  const { isLoggedIn, user } = checkAuth();
  
  if (isLoggedIn && user) {
    // 显示用户下拉菜单，隐藏登录/注册按钮
    authButtons.classList.add('d-none');
    userDropdown.classList.remove('d-none');
    username.textContent = user.username || '用户';
    
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
    // 显示登录/注册按钮，隐藏用户下拉菜单
    authButtons.classList.remove('d-none');
    userDropdown.classList.add('d-none');
  }
}

/**
 * 初始化页面
 */
async function initPage() {
  // 设置认证UI
  setupAuthUI();
  
  // 检查用户是否已登录
  const { isLoggedIn } = checkAuth();
  
  if (!isLoggedIn) {
    // 显示登录提示
    loginRequiredElement.classList.remove('d-none');
    currentSubscriptionElement.classList.add('d-none');
    noSubscriptionElement.classList.add('d-none');
    
    // 仍然加载计划以供查看
    loadSubscriptionPlans();
    return;
  }
  
  // 加载当前订阅
  loadCurrentSubscription();
  
  // 加载可用订阅计划
  loadSubscriptionPlans();
}

/**
 * 加载当前订阅信息
 */
async function loadCurrentSubscription() {
  try {
    // 直接使用fetch请求获取当前订阅
    const response = await fetch(`${window.API_BASE_URL}/subscriptions/active`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('xpat_auth_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('获取订阅信息失败');
    }
    
    const data = await response.json();
    currentSubscription = data.subscription;
    
    if (currentSubscription) {
      // 显示当前订阅信息
      document.getElementById('current-plan-name').textContent = currentSubscription.plan_name;
      
      // 格式化日期
      const endDate = new Date(currentSubscription.end_date);
      document.getElementById('expiration-date').textContent = endDate.toLocaleDateString('zh-CN');
      
      // 计算剩余天数
      const now = new Date();
      const remainingDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      document.getElementById('remaining-days').textContent = remainingDays > 0 ? remainingDays : '已过期';
      
      // API配额
      document.getElementById('api-quota').textContent = currentSubscription.api_quota;
      
      // 功能列表
      const featuresList = document.getElementById('features-list');
      featuresList.innerHTML = '';
      currentSubscription.features.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        featuresList.appendChild(li);
      });
      
      // 显示订阅卡片
      currentSubscriptionElement.classList.remove('d-none');
      noSubscriptionElement.classList.add('d-none');
      
      // 如果已过期，修改显示状态
      if (remainingDays <= 0) {
        document.getElementById('current-plan-name').innerHTML = `${currentSubscription.plan_name} <span class="badge bg-danger">已过期</span>`;
      }
    } else {
      // 显示无订阅提示
      currentSubscriptionElement.classList.add('d-none');
      noSubscriptionElement.classList.remove('d-none');
    }
  } catch (error) {
    console.error('加载订阅信息失败:', error);
    // 显示错误提示
    noSubscriptionElement.classList.remove('d-none');
    noSubscriptionElement.querySelector('.alert').innerHTML = `
      <h4 class="alert-heading">加载订阅信息失败</h4>
      <p>无法获取您的订阅信息，请刷新页面重试。</p>
    `;
  }
}

/**
 * 加载可用订阅计划
 */
async function loadSubscriptionPlans() {
  try {
    const response = await fetch(`${window.API_BASE_URL}/subscriptions`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('xpat_auth_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('获取订阅计划失败');
    }
    
    const data = await response.json();
    plans = data.plans;
    
    // 清空加载动画
    subscriptionPlansElement.innerHTML = '';
    
    // 渲染订阅计划卡片
    plans.forEach(plan => {
      const planCard = createPlanCard(plan);
      subscriptionPlansElement.appendChild(planCard);
    });
  } catch (error) {
    console.error('加载订阅计划失败:', error);
    subscriptionPlansElement.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          <h4 class="alert-heading">加载订阅计划失败</h4>
          <p>无法获取可用的订阅计划，请刷新页面重试。</p>
        </div>
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
  
  const colElement = document.createElement('div');
  colElement.className = 'col-md-4 mb-4';
  
  colElement.innerHTML = `
    <div class="card h-100 ${isCurrentPlan ? 'border-primary' : ''}">
      <div class="card-header ${isCurrentPlan ? 'bg-primary text-white' : ''}">
        <h3 class="card-title text-center mb-0">${plan.name}</h3>
        ${isCurrentPlan ? '<span class="badge bg-light text-primary float-end">当前</span>' : ''}
      </div>
      <div class="card-body d-flex flex-column">
        <div class="text-center mb-3">
          <span class="h2">${plan.price}</span>
          <span class="text-muted">元 / 月</span>
        </div>
        <p class="text-center mb-4">每日API调用: <strong>${plan.api_quota}</strong> 次</p>
        <ul class="list-group list-group-flush mb-4">
          ${plan.features.map(feature => `<li class="list-group-item">${feature}</li>`).join('')}
        </ul>
        <div class="mt-auto text-center">
          ${plan.price === 0 ? 
            `<button class="btn btn-outline-primary w-100 subscribe-btn" data-plan-id="${plan.id}">选择免费方案</button>` : 
            `<button class="btn ${isCurrentPlan ? 'btn-outline-primary' : 'btn-primary'} w-100 subscribe-btn" data-plan-id="${plan.id}">
              ${isCurrentPlan ? '续订' : '订阅'}
            </button>`
          }
        </div>
      </div>
    </div>
  `;
  
  // 绑定订阅按钮事件
  const subscribeBtn = colElement.querySelector('.subscribe-btn');
  subscribeBtn.addEventListener('click', () => openSubscriptionModal(plan));
  
  return colElement;
}

/**
 * 打开订阅确认模态框
 * @param {Object} plan - 订阅计划数据
 */
function openSubscriptionModal(plan) {
  // 检查用户是否已登录
  if (!localStorage.getItem('xpat_auth_token')) {
    // 打开登录模态框
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
    return;
  }
  
  // 设置模态框数据
  confirmPlanNameElement.textContent = plan.name;
  confirmPlanPriceElement.textContent = plan.price;
  confirmPlanQuotaElement.textContent = plan.api_quota;
  selectedPlanId = plan.id;
  
  // 显示模态框
  const subscriptionModal = new bootstrap.Modal(document.getElementById('subscriptionModal'));
  subscriptionModal.show();
}

/**
 * 订阅计划
 */
async function subscribePlan() {
  try {
    // 禁用按钮，防止重复点击
    confirmSubscriptionButton.disabled = true;
    confirmSubscriptionButton.textContent = '处理中...';
    
    // 调用API进行订阅
    const response = await fetch(`${window.API_BASE_URL}/subscriptions/purchase`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('xpat_auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ planId: selectedPlanId })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '订阅失败');
    }
    
    // 处理成功响应
    const data = await response.json();
    
    // 关闭模态框
    const subscriptionModal = bootstrap.Modal.getInstance(document.getElementById('subscriptionModal'));
    subscriptionModal.hide();
    
    // 显示成功消息
    alert('订阅成功！您现在可以享受高级功能了。');
    
    // 重新加载页面以显示新的订阅信息
    window.location.reload();
  } catch (error) {
    console.error('订阅失败:', error);
    alert(`订阅失败: ${error.message}`);
  } finally {
    // 恢复按钮状态
    confirmSubscriptionButton.disabled = false;
    confirmSubscriptionButton.textContent = '确认订阅';
  }
}

/**
 * 续订当前订阅
 */
async function renewCurrentSubscription() {
  try {
    renewButton.disabled = true;
    renewButton.textContent = '处理中...';
    
    // 直接使用fetch请求续订
    const response = await fetch(`${window.API_BASE_URL}/subscriptions/renew`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('xpat_auth_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '续订失败');
    }
    
    const result = await response.json();
    
    alert('续订成功！新的到期日期：' + new Date(result.newEndDate).toLocaleDateString('zh-CN'));
    
    // 重新加载订阅信息
    loadCurrentSubscription();
  } catch (error) {
    console.error('续订失败:', error);
    alert(`续订失败: ${error.message}`);
  } finally {
    renewButton.disabled = false;
    renewButton.textContent = '续订';
  }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
  initPage();
  
  // 绑定续订按钮事件
  renewButton.addEventListener('click', renewCurrentSubscription);
  
  // 绑定订阅确认按钮事件
  confirmSubscriptionButton.addEventListener('click', subscribePlan);
  
  // 监听认证状态变化
  document.addEventListener('userLoggedIn', () => {
    loginRequiredElement.classList.add('d-none');
    loadCurrentSubscription();
  });
  
  document.addEventListener('userLoggedOut', () => {
    currentSubscriptionElement.classList.add('d-none');
    noSubscriptionElement.classList.add('d-none');
    loginRequiredElement.classList.remove('d-none');
  });
}); 