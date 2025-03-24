/**
 * UI辅助模块
 * 提供通用的UI交互功能，如加载状态指示器、通知和操作反馈
 */

// UI帮助器对象
const uiHelper = {
  /**
   * 显示加载指示器
   * @param {string|Element} targetId 目标元素ID或元素本身
   * @param {string} message 加载提示消息，可选
   * @param {boolean} fullscreen 是否全屏显示，默认false
   * @returns {Element} 创建的加载指示器元素
   */
  showLoading(targetId, message = '处理中...', fullscreen = false) {
    // 获取目标元素
    const target = typeof targetId === 'string' 
      ? document.getElementById(targetId) 
      : targetId;
    
    if (!target) {
      console.warn(`目标元素 "${targetId}" 不存在`);
      return null;
    }
    
    // 检查是否已存在加载指示器
    let loader = target.querySelector('.ui-loading-container');
    if (loader) {
      // 如果消息不同，更新消息
      const msgEl = loader.querySelector('.loading-message');
      if (msgEl && msgEl.textContent !== message) {
        msgEl.textContent = message;
      }
      return loader;
    }
    
    // 创建加载指示器
    loader = document.createElement('div');
    loader.className = 'ui-loading-container';
    if (fullscreen) {
      loader.classList.add('fullscreen');
    }
    
    // 设置样式
    loader.style.position = fullscreen ? 'fixed' : 'absolute';
    loader.style.top = '0';
    loader.style.left = '0';
    loader.style.width = '100%';
    loader.style.height = '100%';
    loader.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    loader.style.display = 'flex';
    loader.style.flexDirection = 'column';
    loader.style.alignItems = 'center';
    loader.style.justifyContent = 'center';
    loader.style.zIndex = '1000';
    loader.style.pointerEvents = 'all';
    
    // 添加加载动画
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border text-primary';
    spinner.setAttribute('role', 'status');
    spinner.style.width = '3rem';
    spinner.style.height = '3rem';
    
    // 添加屏幕阅读器支持
    const srOnly = document.createElement('span');
    srOnly.className = 'visually-hidden';
    srOnly.textContent = '加载中...';
    spinner.appendChild(srOnly);
    
    // 添加加载消息
    const messageEl = document.createElement('p');
    messageEl.className = 'loading-message mt-2';
    messageEl.textContent = message;
    messageEl.style.marginTop = '10px';
    messageEl.style.color = '#666';
    
    // 组装加载指示器
    loader.appendChild(spinner);
    loader.appendChild(messageEl);
    
    // 确保目标元素可以容纳定位元素
    const computedStyle = window.getComputedStyle(target);
    if (computedStyle.position === 'static') {
      target.style.position = 'relative';
    }
    
    // 添加到目标元素
    target.appendChild(loader);
    target.classList.add('ui-loading');
    
    return loader;
  },
  
  /**
   * 隐藏加载指示器
   * @param {string|Element} targetId 目标元素ID或元素本身
   */
  hideLoading(targetId) {
    const target = typeof targetId === 'string' 
      ? document.getElementById(targetId) 
      : targetId;
    
    if (!target) {
      console.warn(`目标元素 "${targetId}" 不存在`);
      return;
    }
    
    const loader = target.querySelector('.ui-loading-container');
    if (loader) {
      loader.classList.add('fade-out');
      // 添加淡出效果
      setTimeout(() => {
        if (loader.parentNode) {
          loader.parentNode.removeChild(loader);
          target.classList.remove('ui-loading');
        }
      }, 300);
    }
  },
  
  /**
   * 显示通知
   * @param {string} message 通知消息
   * @param {string} type 通知类型：'info', 'success', 'warning', 'error'
   * @param {number} duration 通知显示时间(毫秒)，0表示不自动关闭
   * @returns {Element} 创建的通知元素
   */
  showNotification(message, type = 'info', duration = 3000) {
    // 保留原有通知显示逻辑
    const notification = document.createElement('div');
    notification.className = `ui-notification ui-notification-${type}`;
    notification.style.animationDuration = '300ms';
    
    const iconSpan = document.createElement('span');
    iconSpan.className = 'notification-icon';
    iconSpan.innerHTML = this.getIconByType(type);
    notification.appendChild(iconSpan);
    
    const messageSpan = document.createElement('span');
    messageSpan.className = 'notification-message';
    messageSpan.textContent = message;
    notification.appendChild(messageSpan);
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => this.closeNotification(notification));
    notification.appendChild(closeBtn);
    
    const notificationsContainer = this.getNotificationsContainer();
    notificationsContainer.appendChild(notification);
    
    // 添加到本地存储的通知列表
    this.saveNotification({
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    });
    
    // 更新通知计数
    this.updateNotificationCounter();
    
    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentNode) {
          this.closeNotification(notification);
        }
      }, duration);
    }
    
    return notification;
  },
  
  /**
   * 保存通知到本地存储
   * @param {Object} notification 通知对象
   */
  saveNotification(notification) {
    try {
      // 从本地存储获取已有通知
      const storedNotifications = JSON.parse(localStorage.getItem('xpat_notifications') || '[]');
      
      // 限制存储通知数量，保留最新的50条
      const maxNotifications = 50;
      if (storedNotifications.length >= maxNotifications) {
        storedNotifications.pop(); // 移除最旧的通知
      }
      
      // 添加新通知到开头
      storedNotifications.unshift(notification);
      
      // 保存回本地存储
      localStorage.setItem('xpat_notifications', JSON.stringify(storedNotifications));
    } catch (error) {
      console.error('保存通知失败:', error);
    }
  },
  
  /**
   * 获取通知列表
   * @param {boolean} unreadOnly 是否只获取未读通知
   * @returns {Array} 通知列表
   */
  getNotifications(unreadOnly = false) {
    try {
      const notifications = JSON.parse(localStorage.getItem('xpat_notifications') || '[]');
      return unreadOnly ? notifications.filter(n => !n.read) : notifications;
    } catch (error) {
      console.error('获取通知失败:', error);
      return [];
    }
  },
  
  /**
   * 标记通知为已读
   * @param {string} notificationId 通知ID
   * @param {boolean} read 是否标记为已读
   */
  markNotificationRead(notificationId, read = true) {
    try {
      const notifications = this.getNotifications();
      const updatedNotifications = notifications.map(n => {
        if (n.id === notificationId) {
          return { ...n, read };
        }
        return n;
      });
      
      localStorage.setItem('xpat_notifications', JSON.stringify(updatedNotifications));
      this.updateNotificationCounter();
    } catch (error) {
      console.error('标记通知状态失败:', error);
    }
  },
  
  /**
   * 标记所有通知为已读
   */
  markAllNotificationsRead() {
    try {
      const notifications = this.getNotifications();
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      
      localStorage.setItem('xpat_notifications', JSON.stringify(updatedNotifications));
      this.updateNotificationCounter();
    } catch (error) {
      console.error('标记所有通知失败:', error);
    }
  },
  
  /**
   * 清除所有通知
   */
  clearAllNotifications() {
    try {
      localStorage.setItem('xpat_notifications', '[]');
      this.updateNotificationCounter();
    } catch (error) {
      console.error('清除通知失败:', error);
    }
  },
  
  /**
   * 更新通知计数器
   */
  updateNotificationCounter() {
    const unreadCount = this.getNotifications(true).length;
    const notificationBtn = document.querySelector('.notification-btn');
    
    if (notificationBtn) {
      // 获取或创建计数器元素
      let counter = notificationBtn.querySelector('.notification-counter');
      
      if (unreadCount > 0) {
        if (!counter) {
          counter = document.createElement('span');
          counter.className = 'notification-counter';
          notificationBtn.appendChild(counter);
        }
        counter.textContent = unreadCount > 99 ? '99+' : unreadCount;
        counter.style.display = 'block';
      } else if (counter) {
        counter.style.display = 'none';
      }
    }
  },
  
  /**
   * 显示通知中心面板
   */
  showNotificationPanel() {
    // 检查是否已存在面板
    let panel = document.getElementById('notificationPanel');
    
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'notificationPanel';
      panel.className = 'notification-panel';
      
      // 创建面板头部
      const header = document.createElement('div');
      header.className = 'notification-panel-header';
      
      const title = document.createElement('h3');
      title.textContent = '通知中心';
      header.appendChild(title);
      
      const actionBtns = document.createElement('div');
      
      const markAllReadBtn = document.createElement('button');
      markAllReadBtn.className = 'action-btn';
      markAllReadBtn.textContent = '全部已读';
      markAllReadBtn.addEventListener('click', () => {
        this.markAllNotificationsRead();
        this.updateNotificationPanelContent(panel);
      });
      actionBtns.appendChild(markAllReadBtn);
      
      const clearAllBtn = document.createElement('button');
      clearAllBtn.className = 'action-btn';
      clearAllBtn.textContent = '清除全部';
      clearAllBtn.addEventListener('click', () => {
        if (confirm('确定要清除所有通知吗？')) {
          this.clearAllNotifications();
          this.updateNotificationPanelContent(panel);
        }
      });
      actionBtns.appendChild(clearAllBtn);
      
      const closeBtn = document.createElement('button');
      closeBtn.className = 'close-btn';
      closeBtn.innerHTML = '&times;';
      closeBtn.addEventListener('click', () => {
        panel.classList.remove('active');
      });
      actionBtns.appendChild(closeBtn);
      
      header.appendChild(actionBtns);
      panel.appendChild(header);
      
      // 创建通知内容区
      const content = document.createElement('div');
      content.className = 'notification-panel-content';
      panel.appendChild(content);
      
      document.body.appendChild(panel);
    }
    
    // 更新面板内容
    this.updateNotificationPanelContent(panel);
    
    // 显示面板
    panel.classList.add('active');
    
    // 点击面板外部关闭
    document.addEventListener('click', function handleOutsideClick(e) {
      if (panel.classList.contains('active') && 
          !panel.contains(e.target) && 
          !document.querySelector('.notification-btn').contains(e.target)) {
        panel.classList.remove('active');
        document.removeEventListener('click', handleOutsideClick);
      }
    });
    
    return panel;
  },
  
  /**
   * 更新通知面板内容
   * @param {Element} panel 通知面板元素
   */
  updateNotificationPanelContent(panel) {
    const content = panel.querySelector('.notification-panel-content');
    content.innerHTML = '';
    
    const notifications = this.getNotifications();
    
    if (notifications.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-notification';
      emptyMsg.textContent = '暂无通知';
      content.appendChild(emptyMsg);
      return;
    }
    
    // 创建通知列表
    const list = document.createElement('ul');
    list.className = 'notification-list';
    
    notifications.forEach(notification => {
      const item = document.createElement('li');
      item.className = `notification-item ${notification.read ? 'read' : 'unread'} type-${notification.type}`;
      item.setAttribute('data-id', notification.id);
      
      const icon = document.createElement('span');
      icon.className = 'notification-item-icon';
      icon.innerHTML = this.getIconByType(notification.type);
      item.appendChild(icon);
      
      const content = document.createElement('div');
      content.className = 'notification-item-content';
      
      const message = document.createElement('p');
      message.className = 'notification-item-message';
      message.textContent = notification.message;
      content.appendChild(message);
      
      const time = document.createElement('span');
      time.className = 'notification-item-time';
      time.textContent = this.formatNotificationTime(notification.timestamp);
      content.appendChild(time);
      
      item.appendChild(content);
      
      const actionBtn = document.createElement('button');
      actionBtn.className = 'notification-item-action';
      actionBtn.textContent = notification.read ? '标为未读' : '标为已读';
      actionBtn.addEventListener('click', e => {
        e.stopPropagation();
        this.markNotificationRead(notification.id, !notification.read);
        this.updateNotificationPanelContent(panel);
      });
      item.appendChild(actionBtn);
      
      // 点击项目标记为已读
      item.addEventListener('click', () => {
        if (!notification.read) {
          this.markNotificationRead(notification.id, true);
          this.updateNotificationPanelContent(panel);
        }
      });
      
      list.appendChild(item);
    });
    
    content.appendChild(list);
  },
  
  /**
   * 格式化通知时间
   * @param {string} timestamp ISO时间字符串
   * @returns {string} 格式化后的时间
   */
  formatNotificationTime(timestamp) {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      // 不同时间范围使用不同格式
      if (diff < 60000) { // 1分钟内
        return '刚刚';
      } else if (diff < 3600000) { // 1小时内
        return `${Math.floor(diff / 60000)}分钟前`;
      } else if (diff < 86400000) { // 1天内
        return `${Math.floor(diff / 3600000)}小时前`;
      } else if (diff < 604800000) { // 1周内
        return `${Math.floor(diff / 86400000)}天前`;
      } else {
        // 格式化为年-月-日
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
    } catch (error) {
      console.error('格式化时间失败:', error);
      return timestamp;
    }
  },
  
  /**
   * 获取或创建通知容器
   * @returns {Element} 通知容器元素
   */
  getNotificationsContainer() {
    // 查找是否已存在通知容器
    let container = document.getElementById('notifications-container');
    
    // 如果不存在，创建一个
    if (!container) {
      container = document.createElement('div');
      container.id = 'notifications-container';
      container.style.position = 'fixed';
      container.style.top = '20px';
      container.style.right = '20px';
      container.style.zIndex = '9999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.alignItems = 'flex-end';
      container.style.gap = '10px';
      document.body.appendChild(container);
    }
    
    return container;
  },
  
  /**
   * 关闭通知
   * @param {Element} notification 通知元素
   */
  closeNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(50px)';
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      
      // 如果容器为空，移除容器
      const container = document.getElementById('notification-container');
      if (container && container.children.length === 0) {
        container.parentNode.removeChild(container);
      }
    }, 300);
  },
  
  /**
   * 显示确认对话框
   * @param {string} message 确认消息
   * @param {Function} onConfirm 确认回调
   * @param {Function} onCancel 取消回调
   * @param {Object} options 配置选项
   * @returns {Element} 创建的对话框元素
   */
  showConfirm(message, onConfirm, onCancel = null, options = {}) {
    const defaultOptions = {
      title: '确认操作',
      confirmText: '确认',
      cancelText: '取消',
      confirmClass: 'btn-primary',
      cancelClass: 'btn-secondary'
    };
    
    const opts = { ...defaultOptions, ...options };
    
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'ui-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '2000';
    
    // 创建对话框
    const dialog = document.createElement('div');
    dialog.className = 'ui-dialog';
    dialog.style.backgroundColor = 'white';
    dialog.style.borderRadius = '8px';
    dialog.style.padding = '20px';
    dialog.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
    dialog.style.maxWidth = '90%';
    dialog.style.width = '400px';
    dialog.style.opacity = '0';
    dialog.style.transform = 'scale(0.9)';
    dialog.style.transition = 'opacity 0.3s, transform 0.3s';
    
    // 标题
    const title = document.createElement('h4');
    title.textContent = opts.title;
    title.style.borderBottom = '1px solid #eee';
    title.style.paddingBottom = '10px';
    title.style.marginBottom = '15px';
    
    // 消息
    const content = document.createElement('div');
    content.innerHTML = message;
    content.style.marginBottom = '20px';
    
    // 按钮容器
    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.justifyContent = 'flex-end';
    buttons.style.gap = '10px';
    
    // 取消按钮
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = opts.cancelText;
    cancelBtn.className = `btn ${opts.cancelClass}`;
    cancelBtn.onclick = () => {
      this.closeDialog(overlay);
      if (onCancel) onCancel();
    };
    
    // 确认按钮
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = opts.confirmText;
    confirmBtn.className = `btn ${opts.confirmClass}`;
    confirmBtn.onclick = () => {
      this.closeDialog(overlay);
      if (onConfirm) onConfirm();
    };
    
    // 组装对话框
    buttons.appendChild(cancelBtn);
    buttons.appendChild(confirmBtn);
    dialog.appendChild(title);
    dialog.appendChild(content);
    dialog.appendChild(buttons);
    overlay.appendChild(dialog);
    
    // 添加到文档
    document.body.appendChild(overlay);
    
    // 触发重排后再应用过渡效果
    setTimeout(() => {
      dialog.style.opacity = '1';
      dialog.style.transform = 'scale(1)';
    }, 10);
    
    // 点击遮罩层关闭对话框
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeDialog(overlay);
        if (onCancel) onCancel();
      }
    });
    
    // 按ESC键关闭对话框
    const keyHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeDialog(overlay);
        if (onCancel) onCancel();
        document.removeEventListener('keydown', keyHandler);
      }
    };
    document.addEventListener('keydown', keyHandler);
    
    return overlay;
  },
  
  /**
   * 关闭对话框
   * @param {Element} overlay 遮罩层元素
   */
  closeDialog(overlay) {
    const dialog = overlay.querySelector('.ui-dialog');
    dialog.style.opacity = '0';
    dialog.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  },
  
  /**
   * 根据类型获取颜色
   * @param {string} type 类型
   * @returns {string} 颜色值
   */
  getColorByType(type) {
    switch (type) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#17a2b8';
    }
  },
  
  /**
   * 根据类型获取图标
   * @param {string} type 类型
   * @returns {string} HTML图标
   */
  getIconByType(type) {
    switch (type) {
      case 'success': return '<i class="bi bi-check-circle-fill"></i>';
      case 'error': return '<i class="bi bi-x-circle-fill"></i>';
      case 'warning': return '<i class="bi bi-exclamation-triangle-fill"></i>';
      case 'info': return '<i class="bi bi-info-circle-fill"></i>';
      default: return '<i class="bi bi-info-circle-fill"></i>';
    }
  },
  
  /**
   * 进度反馈
   * @param {string|Element} targetId 目标元素ID或元素本身
   * @param {number} percent 进度百分比（0-100）
   * @param {string} message 进度消息
   * @returns {Element} 进度条元素
   */
  updateProgress(targetId, percent, message = null) {
    const target = typeof targetId === 'string'
      ? document.getElementById(targetId)
      : targetId;
    
    if (!target) {
      console.warn(`目标元素 "${targetId}" 不存在`);
      return null;
    }
    
    // 查找或创建进度条
    let progressContainer = target.querySelector('.ui-progress-container');
    
    if (!progressContainer) {
      progressContainer = document.createElement('div');
      progressContainer.className = 'ui-progress-container';
      progressContainer.style.width = '100%';
      progressContainer.style.marginTop = '10px';
      progressContainer.style.marginBottom = '10px';
      
      const progressBar = document.createElement('div');
      progressBar.className = 'progress';
      progressBar.style.height = '20px';
      
      const progressInner = document.createElement('div');
      progressInner.className = 'progress-bar progress-bar-striped progress-bar-animated';
      progressInner.style.width = '0%';
      progressInner.setAttribute('role', 'progressbar');
      progressInner.setAttribute('aria-valuenow', '0');
      progressInner.setAttribute('aria-valuemin', '0');
      progressInner.setAttribute('aria-valuemax', '100');
      
      const progressText = document.createElement('div');
      progressText.className = 'progress-text';
      progressText.style.marginTop = '5px';
      progressText.style.fontSize = '0.875rem';
      
      progressBar.appendChild(progressInner);
      progressContainer.appendChild(progressBar);
      progressContainer.appendChild(progressText);
      target.appendChild(progressContainer);
    }
    
    // 更新进度
    const progressInner = progressContainer.querySelector('.progress-bar');
    const progressText = progressContainer.querySelector('.progress-text');
    
    // 限制百分比在0-100之间
    const safePercent = Math.max(0, Math.min(100, percent));
    
    progressInner.style.width = `${safePercent}%`;
    progressInner.setAttribute('aria-valuenow', safePercent);
    
    // 更新进度消息
    if (message !== null) {
      progressText.textContent = message;
    } else {
      progressText.textContent = `${safePercent}%`;
    }
    
    return progressContainer;
  },
  
  /**
   * 添加响应式处理
   * 根据屏幕尺寸调整UI元素
   */
  applyResponsive() {
    // 获取当前视口宽度
    const viewportWidth = window.innerWidth;
    
    // 对小屏幕进行优化
    if (viewportWidth < 768) {
      // 调整对话框宽度
      const dialogs = document.querySelectorAll('.ui-dialog');
      dialogs.forEach(dialog => {
        dialog.style.width = '95%';
        dialog.style.maxWidth = '95%';
      });
      
      // 调整通知栏位置
      const notifications = document.getElementById('notification-container');
      if (notifications) {
        notifications.style.width = '100%';
        notifications.style.right = '0';
        notifications.style.left = '0';
        notifications.style.top = '0';
        notifications.style.alignItems = 'center';
      }
    }
  },
  
  /**
   * 显示管理员操作确认对话框
   * @param {string} operation - 操作名称
   * @param {object} options - 确认选项
   * @returns {Promise<boolean>} - 用户确认结果
   */
  async confirmAdminAction(operation, options = {}) {
    return new Promise((resolve) => {
      // 创建确认容器
      const container = document.createElement('div');
      container.className = 'modal-overlay admin-confirm-modal';
      container.style.display = 'flex';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.right = '0';
      container.style.bottom = '0';
      container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      container.style.zIndex = '999';
      container.style.justifyContent = 'center';
      container.style.alignItems = 'center';
      
      // 设置默认选项
      const defaultOptions = {
        title: '确认管理操作',
        description: `您确定要执行「${operation}」操作吗？`,
        confirmText: '确认执行',
        cancelText: '取消',
        requirePassword: false,
        dangerousAction: false
      };
      
      const settings = { ...defaultOptions, ...options };
      
      // 创建确认对话框内容
      container.innerHTML = `
        <div class="modal small-modal" style="background: #fff; border-radius: 5px; width: 400px; max-width: 90%;">
          <div class="modal-header" style="padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0;">${settings.title}</h3>
            <button id="admin-confirm-close" style="background: none; border: none; font-size: 20px; cursor: pointer;">&times;</button>
          </div>
          <div class="modal-body" style="padding: 15px;">
            <p class="${settings.dangerousAction ? 'text-danger' : ''}" style="${settings.dangerousAction ? 'color: #dc3545; font-weight: bold;' : ''}">${settings.description}</p>
            ${settings.requirePassword ? `
              <div class="form-group" style="margin-bottom: 15px;">
                <label for="admin-password" style="display: block; margin-bottom: 5px;">请输入管理员密码确认:</label>
                <input type="password" id="admin-password" class="form-control" placeholder="输入密码以确认操作" style="width: 100%; padding: 8px; border: 1px solid #ced4da; border-radius: 4px;">
              </div>
            ` : ''}
          </div>
          <div class="modal-footer" style="padding: 15px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 10px;">
            <button id="admin-confirm-cancel" class="btn btn-secondary" style="padding: 6px 12px; background-color: #6c757d; border: none; border-radius: 4px; color: white; cursor: pointer;">${settings.cancelText}</button>
            <button id="admin-confirm-ok" class="btn ${settings.dangerousAction ? 'btn-danger' : 'btn-primary'}" style="padding: 6px 12px; background-color: ${settings.dangerousAction ? '#dc3545' : '#007bff'}; border: none; border-radius: 4px; color: white; cursor: pointer;">${settings.confirmText}</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(container);
      
      // 绑定事件
      document.getElementById('admin-confirm-close').addEventListener('click', () => {
        document.body.removeChild(container);
        resolve(false);
      });
      
      document.getElementById('admin-confirm-cancel').addEventListener('click', () => {
        document.body.removeChild(container);
        resolve(false);
      });
      
      document.getElementById('admin-confirm-ok').addEventListener('click', async () => {
        // 检查是否需要密码验证
        if (settings.requirePassword) {
          const password = document.getElementById('admin-password').value;
          if (!password) {
            // 如果存在showNotification方法则调用
            if (window.uiHelper && window.uiHelper.showNotification) {
              window.uiHelper.showNotification('请输入密码进行确认', 'warning');
            } else {
              alert('请输入密码进行确认');
            }
            return;
          }
          
          try {
            // 验证管理员密码 - 如果有backendApi可调用
            if (window.backendApi && window.backendApi.verifyAdminPassword) {
              const verified = await window.backendApi.verifyAdminPassword(password);
              if (!verified) {
                if (window.uiHelper && window.uiHelper.showNotification) {
                  window.uiHelper.showNotification('密码验证失败', 'error');
                } else {
                  alert('密码验证失败');
                }
                return;
              }
            }
          } catch (error) {
            if (window.uiHelper && window.uiHelper.showNotification) {
              window.uiHelper.showNotification('密码验证过程中发生错误', 'error');
            } else {
              alert('密码验证过程中发生错误');
            }
            return;
          }
        }
        
        document.body.removeChild(container);
        resolve(true);
      });
    });
  }
};

// 页面加载时也应用一次响应式调整
document.addEventListener('DOMContentLoaded', () => {
  uiHelper.applyResponsive();
});

// 监听窗口大小变化，应用响应式调整
window.addEventListener('resize', () => {
  uiHelper.applyResponsive();
});

// 全局挂载模块，替换ES6导出
window.uiHelper = uiHelper; 