/**
 * 订阅管理模块
 * 处理订阅状态检查、到期提醒和续订功能
 */
class SubscriptionManager {
  constructor() {
    this.hasCheckedExpiration = false;
    this.initializeElements();
  }

  /**
   * 初始化DOM元素引用
   */
  initializeElements() {
    // 延迟初始化，确保DOM已经加载
    window.addEventListener('DOMContentLoaded', () => {
      // 初始化提醒弹窗
      this.expirationToast = document.getElementById('subscription-expiration-toast');
      if (!this.expirationToast) {
        this.createExpirationToast();
      }
    });
  }

  /**
   * 创建到期提醒弹窗
   */
  createExpirationToast() {
    // 创建弹窗容器
    this.expirationToast = document.createElement('div');
    this.expirationToast.id = 'subscription-expiration-toast';
    this.expirationToast.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    this.expirationToast.style.zIndex = '1100';
    this.expirationToast.innerHTML = `
      <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header bg-warning">
          <strong class="me-auto">订阅到期提醒</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          <p id="expiration-message">您的订阅即将到期</p>
          <div class="mt-2 pt-2 border-top">
            <button type="button" class="btn btn-primary btn-sm" id="renew-subscription-btn">立即续订</button>
            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="toast">稍后处理</button>
          </div>
        </div>
      </div>
    `;
    
    // 添加到文档中
    document.body.appendChild(this.expirationToast);
    
    // 绑定续订按钮事件
    document.getElementById('renew-subscription-btn').addEventListener('click', () => {
      window.location.href = '/subscriptions.html';
    });
  }

  /**
   * 检查当前用户的订阅状态
   * @returns {Promise<Object|null>} 活跃的订阅信息，如果没有则返回null
   */
  async checkSubscriptionStatus() {
    try {
      const response = await fetch('/api/subscriptions/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('获取订阅信息失败');
      }
      
      const data = await response.json();
      return data.subscription;
    } catch (error) {
      console.error('检查订阅状态时出错:', error);
      return null;
    }
  }

  /**
   * 检查订阅是否即将到期
   */
  async checkExpirationStatus() {
    // 避免重复检查
    if (this.hasCheckedExpiration) {
      return;
    }
    
    try {
      // 只有登录用户才检查
      if (!localStorage.getItem('token')) {
        return;
      }
      
      const response = await fetch('/api/subscriptions/expiring', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('获取到期信息失败');
      }
      
      const data = await response.json();
      this.hasCheckedExpiration = true;
      
      if (data.expiring) {
        this.showExpirationReminder(data.remainingDays, data.subscription);
      }
    } catch (error) {
      console.error('检查订阅到期状态时出错:', error);
    }
  }

  /**
   * 显示订阅到期提醒
   * @param {number} days - 剩余天数
   * @param {Object} subscription - 订阅信息
   */
  showExpirationReminder(days, subscription) {
    if (!this.expirationToast) {
      this.createExpirationToast();
    }
    
    // 更新提醒消息
    const message = document.getElementById('expiration-message');
    message.textContent = `您的${subscription.planName}订阅将在${days}天后到期。请及时续订以避免服务中断。`;
    
    // 显示提醒
    const toastElement = this.expirationToast.querySelector('.toast');
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }

  /**
   * 续订订阅
   * @returns {Promise<Object>} 续订结果
   */
  async renewSubscription() {
    try {
      const response = await fetch('/api/subscriptions/renew', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '续订失败');
      }
      
      return await response.json();
    } catch (error) {
      console.error('续订订阅时出错:', error);
      throw error;
    }
  }
}

// 创建全局实例
const subscriptionManager = new SubscriptionManager();

// 在每次页面加载时检查订阅状态
document.addEventListener('DOMContentLoaded', () => {
  // 延迟检查，避免影响页面加载性能
  setTimeout(() => {
    subscriptionManager.checkExpirationStatus();
  }, 2000);
});

// 导出实例以供其他模块使用
export default subscriptionManager; 