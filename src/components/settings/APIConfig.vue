<template>
  <div class="api-config">
    <div class="card">
      <div class="card-header">
        <h2>API配置设置</h2>
        <p class="config-status" v-if="!isAdmin">
          <span v-if="configStore.hasConfig" class="status-badge status-success">
            <i class="fas fa-check-circle"></i> 已配置
          </span>
          <span v-else class="status-badge status-warning">
            <i class="fas fa-exclamation-circle"></i> 未配置
          </span>
        </p>
        <p v-if="isAdmin" class="admin-note">
          <i class="fas fa-shield-alt"></i> 
          您正在编辑系统默认配置，这些配置将作为管理员的默认设置
        </p>
      </div>
      
      <div class="card-body">
        <div v-if="!isAdmin && configStore.needsConfig" class="alert alert-warning">
          <i class="fas fa-exclamation-triangle"></i>
          您需要配置API参数才能使用系统的核心功能。
        </div>
        
        <form @submit.prevent="saveConfig">
          <div class="form-group">
            <label for="api-key">API密钥 <span class="required">*</span></label>
            <div class="input-group">
              <input 
                :type="showApiKey ? 'text' : 'password'" 
                id="api-key" 
                v-model="formData.api_key" 
                class="form-control"
                placeholder="输入OpenAI API密钥"
                autocomplete="off"
                :disabled="saving"
              />
              <button 
                type="button" 
                class="btn-icon" 
                @click="showApiKey = !showApiKey"
                title="显示/隐藏密钥"
              >
                <i :class="showApiKey ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <small class="form-text">您的API密钥不会上传到服务器，仅存储在本地数据库中。</small>
          </div>
          
          <div class="form-group">
            <label for="api-base-url">API基础URL</label>
            <input 
              type="text" 
              id="api-base-url" 
              v-model="formData.api_base_url" 
              class="form-control"
              placeholder="https://api.openai.com/v1"
              :disabled="saving"
            />
            <small class="form-text">默认为OpenAI官方API，如果使用第三方服务可更改此地址。</small>
          </div>
          
          <div class="form-group">
            <label for="proxy-url">代理服务器URL</label>
            <input 
              type="text" 
              id="proxy-url" 
              v-model="formData.proxy_url" 
              class="form-control"
              placeholder="http://your-proxy-server:port"
              :disabled="saving"
            />
            <small class="form-text">如果您需要通过代理服务器访问API，请在此设置代理地址。</small>
          </div>
          
          <div class="form-row">
            <div class="form-group col-md-6">
              <label for="model">默认模型</label>
              <select 
                id="model" 
                v-model="formData.model" 
                class="form-control"
                :disabled="saving"
              >
                <option value="deepseek/deepseek-r1:free">深度思考 R1 (推荐)</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-3.5-turbo-16k">GPT-3.5 Turbo (16K)</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-4-32k">GPT-4 (32K)</option>
              </select>
            </div>
            
            <div class="form-group col-md-6">
              <label for="temperature">温度参数</label>
              <div class="input-group">
                <input 
                  type="range" 
                  id="temperature" 
                  v-model.number="formData.temperature" 
                  min="0" 
                  max="1" 
                  step="0.1"
                  class="form-control-range"
                  :disabled="saving"
                />
                <span class="temperature-value">{{ formData.temperature }}</span>
              </div>
              <small class="form-text">较低的值使回答更加确定，较高的值使回答更加多样化。</small>
            </div>
          </div>
          
          <div class="form-group">
            <label for="max-tokens">最大令牌数</label>
            <input 
              type="number" 
              id="max-tokens" 
              v-model.number="formData.max_tokens" 
              class="form-control"
              min="100"
              max="8192"
              :disabled="saving"
            />
            <small class="form-text">响应的最大长度限制。</small>
          </div>
          
          <div class="form-group" v-if="error">
            <div class="alert alert-danger">
              {{ error }}
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-outline" @click="resetForm" :disabled="saving">
              重置
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving || !formData.api_key">
              {{ saving ? '保存中...' : '保存配置' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'APIConfig',
  setup() {
    const configStore = useConfigStore()
    const authStore = useAuthStore()
    const isAdmin = computed(() => authStore.isAdmin)
    
    const showApiKey = ref(false)
    const error = ref(null)
    const saving = ref(false)
    const formData = reactive({
      api_key: '',
      api_base_url: 'https://openrouter.ai/api/v1',
      proxy_url: '',
      model: 'deepseek/deepseek-r1:free',
      temperature: 0.7,
      max_tokens: 2000
    })
    
    // 当组件加载时获取配置
    onMounted(async () => {
      try {
        if (isAdmin.value) {
          // 管理员获取默认配置
          const defaultConfig = await configStore.fetchDefaultConfig()
          Object.assign(formData, defaultConfig)
        } else {
          // 普通用户获取个人配置
          await configStore.fetchUserConfig()
          if (configStore.hasConfig) {
            Object.assign(formData, configStore.userConfig)
          }
        }
      } catch (err) {
        error.value = '加载配置失败：' + (err.message || '未知错误')
      }
    })
    
    // 保存配置
    const saveConfig = async () => {
      error.value = null
      saving.value = true
      
      try {
        // 验证必填字段
        if (!formData.api_key) {
          throw new Error('API密钥不能为空')
        }
        
        // 格式化数字字段
        const configToSave = {
          ...formData,
          temperature: Number(formData.temperature),
          max_tokens: Number(formData.max_tokens)
        }
        
        // 根据用户类型保存不同配置
        let result
        if (isAdmin.value) {
          result = await configStore.saveDefaultConfig(configToSave)
        } else {
          result = await configStore.saveUserConfig(configToSave)
        }
        
        if (!result.success) {
          throw new Error(result.message || '保存失败')
        }
        
        alert('配置已成功保存')
      } catch (err) {
        error.value = err.message || '保存配置失败'
      } finally {
        saving.value = false
      }
    }
    
    // 重置表单
    const resetForm = () => {
      // 重置为默认值
      formData.api_key = ''
      formData.api_base_url = 'https://openrouter.ai/api/v1'
      formData.proxy_url = ''
      formData.model = 'deepseek/deepseek-r1:free'
      formData.temperature = 0.7
      formData.max_tokens = 2000
      
      error.value = null
    }
    
    return {
      configStore,
      isAdmin,
      formData,
      showApiKey,
      error,
      saving,
      saveConfig,
      resetForm
    }
  }
}
</script>

<style scoped>
.api-config {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.admin-note {
  color: var(--primary-color);
  font-weight: 500;
}

.config-status {
  margin: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.875rem;
}

.status-success {
  background-color: rgba(46, 204, 113, 0.15);
  color: #27ae60;
}

.status-warning {
  background-color: rgba(243, 156, 18, 0.15);
  color: #f39c12;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -10px;
  margin-left: -10px;
}

.col-md-6 {
  flex: 0 0 50%;
  max-width: 50%;
  padding: 0 10px;
}

.input-group {
  display: flex;
  align-items: center;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  color: var(--text-color);
}

.temperature-value {
  min-width: 30px;
  text-align: center;
  margin-left: 10px;
}

.form-control-range {
  width: 100%;
}

.required {
  color: var(--danger-color);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .config-status {
    margin-top: var(--spacing-sm);
  }
  
  .col-md-6 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style> 