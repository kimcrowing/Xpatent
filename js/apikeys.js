/**
 * API密钥管理模块
 */

// API基础URL
const API_BASE_URL = window.API_BASE_URL || '';

/**
 * 初始化API密钥管理页面
 */
function initApiKeysPage() {
  document.addEventListener('DOMContentLoaded', function() {
    loadApiKeys();
    
    // 绑定表单提交事件
    const form = document.getElementById('apikey-form');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveApiKey();
      });
    }
    
    // 显示支持的提供商
    displaySupportedProviders();
  });
}

/**
 * 加载用户的API密钥列表
 */
async function loadApiKeys() {
  try {
    showLoading('keys-list');
    
    const response = await fetch(`${API_BASE_URL}/api/apikeys/me`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('xpat_auth_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error(await response.text() || '加载API密钥失败');
    }
    
    const data = await response.json();
    displayApiKeys(data.keys);
  } catch (error) {
    console.error('加载API密钥失败:', error);
    showError('keys-list', error.message);
  } finally {
    hideLoading('keys-list');
  }
}

/**
 * 保存API密钥
 */
async function saveApiKey() {
  try {
    const provider = document.getElementById('provider').value;
    const apiKey = document.getElementById('apikey').value;
    
    if (!provider || !apiKey) {
      showAlert('error', '请填写所有必填字段');
      return;
    }
    
    showLoading('apikey-form');
    
    const response = await fetch(`${API_BASE_URL}/api/apikeys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('xpat_auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ provider, apiKey })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '保存API密钥失败');
    }
    
    const result = await response.json();
    
    // 重置表单
    document.getElementById('apikey-form').reset();
    
    // 刷新密钥列表
    loadApiKeys();
    
    showAlert('success', result.message);
  } catch (error) {
    console.error('保存API密钥失败:', error);
    showAlert('error', `保存失败: ${error.message}`);
  } finally {
    hideLoading('apikey-form');
  }
}

/**
 * 删除API密钥
 * @param {number} id - 密钥ID
 */
async function deleteApiKey(id) {
  if (!confirm('确定要删除这个API密钥吗?')) return;
  
  try {
    showLoading('keys-list');
    
    const response = await fetch(`${API_BASE_URL}/api/apikeys/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('xpat_auth_token')}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '删除API密钥失败');
    }
    
    // 刷新密钥列表
    loadApiKeys();
    
    showAlert('success', '密钥已删除');
  } catch (error) {
    console.error('删除API密钥失败:', error);
    showAlert('error', `删除失败: ${error.message}`);
  } finally {
    hideLoading('keys-list');
  }
}

/**
 * 切换API密钥状态（启用/禁用）
 * @param {number} id - 密钥ID
 * @param {boolean} currentState - 当前状态
 */
async function toggleApiKey(id, currentState) {
  try {
    showLoading('keys-list');
    
    const response = await fetch(`${API_BASE_URL}/api/apikeys/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('xpat_auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_active: !currentState })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '更新API密钥状态失败');
    }
    
    // 刷新密钥列表
    loadApiKeys();
    
    const result = await response.json();
    showAlert('success', result.message);
  } catch (error) {
    console.error('更新API密钥状态失败:', error);
    showAlert('error', `操作失败: ${error.message}`);
  } finally {
    hideLoading('keys-list');
  }
}

/**
 * 显示API密钥列表
 * @param {Array} keys - API密钥列表
 */
function displayApiKeys(keys) {
  const keysList = document.getElementById('keys-list');
  
  if (!keysList) return;
  
  if (!keys || keys.length === 0) {
    keysList.innerHTML = '<div class="alert alert-info">您还没有添加任何API密钥</div>';
    return;
  }
  
  let html = '';
  
  keys.forEach(key => {
    const statusBadge = key.is_active 
      ? '<span class="badge bg-success">已启用</span>' 
      : '<span class="badge bg-danger">已禁用</span>';
    
    const toggleBtn = key.is_active
      ? `<button class="btn btn-sm btn-warning" onclick="toggleApiKey(${key.id}, true)"><i class="bi bi-power"></i> 禁用</button>`
      : `<button class="btn btn-sm btn-success" onclick="toggleApiKey(${key.id}, false)"><i class="bi bi-power"></i> 启用</button>`;
    
    html += `
      <div class="list-group-item">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-1">${getProviderDisplayName(key.provider)} ${statusBadge}</h5>
            <small class="text-muted">添加于: ${new Date(key.created_at).toLocaleString()}</small>
          </div>
          <div class="btn-group">
            ${toggleBtn}
            <button class="btn btn-sm btn-danger" onclick="deleteApiKey(${key.id})"><i class="bi bi-trash"></i> 删除</button>
          </div>
        </div>
      </div>
    `;
  });
  
  keysList.innerHTML = html;
}

/**
 * 获取提供商显示名称
 * @param {string} provider - 提供商代码
 * @returns {string} 显示名称
 */
function getProviderDisplayName(provider) {
  const providers = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google AI',
    microsoft: 'Azure OpenAI',
    xunfei: '讯飞星火',
    baidu: '百度文心一言',
    ali: '阿里通义千问'
  };
  
  return providers[provider] || provider;
}

/**
 * 显示支持的提供商
 */
function displaySupportedProviders() {
  const providerSelect = document.getElementById('provider');
  
  if (!providerSelect) return;
  
  const providers = [
    { value: 'openai', name: 'OpenAI' },
    { value: 'anthropic', name: 'Anthropic' },
    { value: 'google', name: 'Google AI' },
    { value: 'microsoft', name: 'Azure OpenAI' },
    { value: 'xunfei', name: '讯飞星火' },
    { value: 'baidu', name: '百度文心一言' },
    { value: 'ali', name: '阿里通义千问' }
  ];
  
  let options = '<option value="">-- 选择提供商 --</option>';
  
  providers.forEach(provider => {
    options += `<option value="${provider.value}">${provider.name}</option>`;
  });
  
  providerSelect.innerHTML = options;
}

/**
 * 显示加载指示器
 * @param {string} elementId - 元素ID
 */
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add('loading');
  }
}

/**
 * 隐藏加载指示器
 * @param {string} elementId - 元素ID
 */
function hideLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.remove('loading');
  }
}

/**
 * 显示错误消息
 * @param {string} elementId - 元素ID
 * @param {string} message - 错误消息
 */
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `<div class="alert alert-danger">${message}</div>`;
  }
}

/**
 * 显示提示消息
 * @param {string} type - 消息类型 (success, error, info, warning)
 * @param {string} message - 消息内容
 */
function showAlert(type, message) {
  const alertContainer = document.getElementById('alert-container');
  
  if (!alertContainer) {
    console.warn('找不到提示消息容器');
    return;
  }
  
  const alertElement = document.createElement('div');
  alertElement.className = `alert alert-${type} alert-dismissible fade show`;
  alertElement.role = 'alert';
  alertElement.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="关闭"></button>
  `;
  
  alertContainer.appendChild(alertElement);
  
  // 5秒后自动关闭
  setTimeout(() => {
    alertElement.classList.remove('show');
    setTimeout(() => {
      alertContainer.removeChild(alertElement);
    }, 150);
  }, 5000);
}

// 导出模块函数
window.apiKeys = {
  init: initApiKeysPage,
  load: loadApiKeys,
  save: saveApiKey,
  delete: deleteApiKey,
  toggle: toggleApiKey
}; 