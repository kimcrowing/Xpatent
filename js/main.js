import subscriptionManager from './subscription-manager.js';

// 当用户登录后，检查订阅状态
document.addEventListener('userLoggedIn', () => {
  subscriptionManager.checkExpirationStatus();
}); 