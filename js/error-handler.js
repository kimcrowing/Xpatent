/**
 * 错误处理模块
 * 提供统一的错误处理、错误日志和用户反馈功能
 */

// 错误类型枚举
const ErrorType = {
  VALIDATION: 'validation',    // 表单验证错误
  NETWORK: 'network',         // 网络请求错误
  AUTH: 'auth',               // 认证/授权错误
  API: 'api',                 // API响应错误
  UNKNOWN: 'unknown'          // 未知错误
};

// 创建全局错误处理器
const errorHandler = {
  /**
   * 显示错误提示
   * @param {string} message 错误消息
   * @param {string} type 错误类型
   * @param {Element|string} container 显示错误的容器元素或ID
   */
  showError(message, type = ErrorType.UNKNOWN, container = null) {
    console.error(`[${type}错误]`, message);
    
    // 创建带样式的错误提示
    const errorAlert = document.createElement('div');
    errorAlert.className = 'alert alert-danger alert-dismissible fade show';
    errorAlert.role = 'alert';
    
    // 根据错误类型添加不同的图标
    let icon = '';
    switch (type) {
      case ErrorType.VALIDATION:
        icon = '<i class="bi bi-exclamation-triangle-fill"></i> ';
        break;
      case ErrorType.NETWORK:
        icon = '<i class="bi bi-wifi-off"></i> ';
        break;
      case ErrorType.AUTH:
        icon = '<i class="bi bi-shield-lock"></i> ';
        break;
      case ErrorType.API:
        icon = '<i class="bi bi-server"></i> ';
        break;
      default:
        icon = '<i class="bi bi-exclamation-circle-fill"></i> ';
    }
    
    errorAlert.innerHTML = `
      ${icon} <strong>${this.getTypeText(type)}错误：</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="关闭"></button>
    `;
    
    // 查找或创建错误容器
    let targetContainer;
    if (container) {
      targetContainer = typeof container === 'string' 
        ? document.getElementById(container) 
        : container;
    } else {
      // 查找默认的alert-container，如果不存在则创建一个
      targetContainer = document.getElementById('alert-container');
      if (!targetContainer) {
        targetContainer = document.createElement('div');
        targetContainer.id = 'alert-container';
        targetContainer.className = 'alert-container';
        document.body.insertBefore(targetContainer, document.body.firstChild);
      }
    }
    
    // 显示错误
    targetContainer.appendChild(errorAlert);
    
    // 5秒后自动关闭
    setTimeout(() => {
      if (errorAlert.parentNode) {
        errorAlert.parentNode.removeChild(errorAlert);
      }
    }, 5000);
    
    // 触发错误事件，便于全局监听
    window.dispatchEvent(new CustomEvent('app:error', { 
      detail: { message, type, timestamp: new Date().toISOString() } 
    }));
    
    return errorAlert;
  },
  
  /**
   * 处理API错误响应
   * @param {Response} response Fetch API响应对象
   * @param {string} defaultMessage 默认错误消息
   * @param {Element|string} container 显示错误的容器
   */
  async handleApiError(response, defaultMessage = '请求失败', container = null) {
    let errorMessage = defaultMessage;
    let errorType = ErrorType.API;
    
    try {
      const errorData = await response.json();
      
      if (errorData.error && errorData.error.message) {
        errorMessage = errorData.error.message;
      }
      
      // 根据状态码区分错误类型
      if (response.status === 401 || response.status === 403) {
        errorType = ErrorType.AUTH;
        
        // 如果是认证错误，可能需要重新登录
        if (response.status === 401 && window.authManager) {
          window.authManager.logout();
        }
      }
    } catch (e) {
      // 如果响应无法解析为JSON，使用HTTP状态文本
      errorMessage = `${defaultMessage} (${response.status}: ${response.statusText})`;
    }
    
    return this.showError(errorMessage, errorType, container);
  },
  
  /**
   * 处理网络错误
   * @param {Error} error 错误对象
   * @param {string} operation 操作说明
   * @param {Element|string} container 显示错误的容器
   */
  handleNetworkError(error, operation = '网络请求', container = null) {
    const message = `${operation}时发生错误: ${error.message}`;
    return this.showError(message, ErrorType.NETWORK, container);
  },
  
  /**
   * 处理表单验证错误
   * @param {Object|Array} errors 错误对象或数组
   * @param {Element|string} container 显示错误的容器
   */
  handleValidationError(errors, container = null) {
    let message;
    
    if (Array.isArray(errors)) {
      // 如果是错误消息数组，拼接显示
      message = errors.join('<br>');
    } else if (typeof errors === 'object') {
      // 如果是错误对象，提取每个字段的错误
      const errorMessages = [];
      for (const field in errors) {
        if (errors.hasOwnProperty(field)) {
          errorMessages.push(`${field}: ${errors[field]}`);
        }
      }
      message = errorMessages.join('<br>');
    } else {
      message = String(errors);
    }
    
    return this.showError(message, ErrorType.VALIDATION, container);
  },
  
  /**
   * 获取错误类型的中文描述
   * @param {string} type 错误类型
   * @returns {string} 类型对应的中文描述
   */
  getTypeText(type) {
    switch (type) {
      case ErrorType.VALIDATION: return '表单验证';
      case ErrorType.NETWORK: return '网络';
      case ErrorType.AUTH: return '认证';
      case ErrorType.API: return 'API';
      default: return '未知';
    }
  },
  
  /**
   * 向控制台记录错误详情
   * @param {Error} error 错误对象
   * @param {Object} context 错误上下文信息
   */
  logError(error, context = {}) {
    console.error('[错误日志]', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context
    });
    
    // 可以在这里添加错误上报逻辑
    // this.reportError(error, context);
  }
};

// 添加全局的未捕获错误处理
window.addEventListener('error', function(event) {
  errorHandler.showError(
    `发生未处理的错误: ${event.message || '未知错误'}`,
    ErrorType.UNKNOWN
  );
  errorHandler.logError(event.error || new Error(event.message));
});

// 添加Promise未处理的rejection处理
window.addEventListener('unhandledrejection', function(event) {
  const error = event.reason;
  errorHandler.showError(
    `未处理的Promise异常: ${error.message || '未知错误'}`,
    ErrorType.UNKNOWN
  );
  errorHandler.logError(error);
});

// 全局挂载模块，替换ES6导出
window.errorHandler = errorHandler;
window.ErrorType = ErrorType; 