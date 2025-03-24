/**
 * 身份验证管理模块
 * 提供统一的登录状态管理、令牌验证和会话控制
 */

// 本地存储密钥 - 使用window避免重复声明冲突
window.TOKEN_KEY = window.TOKEN_KEY || 'xpat_auth_token';
window.USER_INFO_KEY = window.USER_INFO_KEY || 'xpat_user_info';
window.TOKEN_EXPIRY_KEY = window.TOKEN_EXPIRY_KEY || 'xpat_token_expiry';

// 创建全局身份验证管理器
const authManager = {
  /**
   * 获取当前存储的令牌
   * @returns {string|null} 令牌或null
   */
  getToken() {
    return localStorage.getItem(window.TOKEN_KEY);
  },

  /**
   * 获取用户信息
   * @returns {Object|null} 用户信息对象或null
   */
  getUserInfo() {
    const userInfo = localStorage.getItem(window.USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  },

  /**
   * 检查用户是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    const token = this.getToken();
    const expiry = localStorage.getItem(window.TOKEN_EXPIRY_KEY);
    
    if (!token) return false;
    
    // 如果有过期时间，检查是否已过期
    if (expiry && new Date(expiry) < new Date()) {
      this.logout();
      return false;
    }
    
    return true;
  },

  /**
   * 检查用户是否是管理员
   * @returns {boolean} 是否是管理员
   */
  isAdmin() {
    const userInfo = this.getUserInfo();
    return userInfo && userInfo.role === 'admin';
  },

  /**
   * 设置认证信息
   * @param {string} token JWT令牌
   * @param {Object} user 用户信息
   * @param {number} expiryInHours 令牌过期时间（小时）
   */
  setAuth(token, user, expiryInHours = 24) {
    localStorage.setItem(window.TOKEN_KEY, token);
    localStorage.setItem(window.USER_INFO_KEY, JSON.stringify(user));
    
    // 设置过期时间
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + expiryInHours);
    localStorage.setItem(window.TOKEN_EXPIRY_KEY, expiryDate.toISOString());
    
    // 触发登录事件
    window.dispatchEvent(new CustomEvent('auth:login', { detail: user }));
  },

  /**
   * 退出登录
   */
  logout() {
    localStorage.removeItem(window.TOKEN_KEY);
    localStorage.removeItem(window.USER_INFO_KEY);
    localStorage.removeItem(window.TOKEN_EXPIRY_KEY);
    
    // 触发退出登录事件
    window.dispatchEvent(new CustomEvent('auth:logout'));
  },

  /**
   * 获取授权请求头
   * @returns {Object} 包含Authorization的头部对象
   */
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  /**
   * 验证令牌有效性
   * @returns {Promise<boolean>} Promise，解析为令牌是否有效
   */
  async verifyToken() {
    if (!this.isLoggedIn()) return false;
    
    try {
      const response = await fetch(`${window.API_BASE_URL}/api/auth/verify`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('令牌验证失败:', error);
      return false;
    }
  },

  /**
   * 进行API请求时检查授权
   * @param {Function} callback 授权成功时的回调
   * @param {Function} errorCallback 授权失败时的回调
   */
  requireAuth(callback, errorCallback = null) {
    if (this.isLoggedIn()) {
      callback();
    } else {
      if (errorCallback) {
        errorCallback(new Error('需要登录'));
      } else {
        console.error('需要登录才能执行此操作');
        // 如果在页面中，可以自动跳转到登录页面或显示登录模态框
        const loginModal = document.getElementById('loginModalContainer');
        if (loginModal) {
          loginModal.style.display = 'flex';
        }
      }
    }
  }
};

// 添加页面加载时的自动校验
document.addEventListener('DOMContentLoaded', function() {
  // 如果用户已登录，验证令牌有效性
  if (authManager.isLoggedIn()) {
    authManager.verifyToken().then(isValid => {
      if (!isValid) {
        console.warn('会话已过期，请重新登录');
        // 可能的UI提示
      }
    });
  }
});

// 全局挂载模块，替换ES6导出
window.authManager = authManager; 