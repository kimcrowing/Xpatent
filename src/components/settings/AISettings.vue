# 创建 AI 设置组件
<template>
  <div class="ai-settings">
    <h2>AI 配置设置</h2>
    
    <div class="settings-form">
      <div class="form-group">
        <label for="apiKey">API 密钥</label>
        <input
          type="password"
          id="apiKey"
          v-model="config.api_key"
          placeholder="输入 OpenRouter API 密钥"
        />
      </div>
      
      <div class="form-group">
        <label for="apiBase">API 地址</label>
        <input
          type="text"
          id="apiBase"
          v-model="config.api_base"
          placeholder="OpenRouter API 地址"
        />
      </div>
      
      <div class="form-group">
        <label for="defaultModel">默认模型</label>
        <select id="defaultModel" v-model="config.default_model">
          <optgroup v-for="(models, type) in modelGroups" :key="type" :label="getGroupLabel(type)">
            <option v-for="model in models" :key="model.id" :value="model.id">
              {{ model.name }}
            </option>
          </optgroup>
        </select>
      </div>
      
      <div class="form-group">
        <label for="fallbackModel">备用模型</label>
        <select id="fallbackModel" v-model="config.fallback_model">
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="claude-instant-1.2">Claude Instant</option>
        </select>
      </div>
    </div>
    
    <div class="actions">
      <button @click="saveConfig" :disabled="saving">
        {{ saving ? '保存中...' : '保存配置' }}
      </button>
      <button @click="testConnection" :disabled="testing || !config.api_key">
        {{ testing ? '测试中...' : '测试连接' }}
      </button>
    </div>
    
    <div v-if="message" :class="['message', message.type]">
      {{ message.text }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'AISettings',
  
  setup() {
    const config = ref({
      api_key: '',
      api_base: 'https://openrouter.ai/api/v1',
      default_model: 'deepseek/deepseek-r1:free',
      fallback_model: 'gpt-3.5-turbo'
    })
    
    const modelGroups = {
      writing: [
        { id: 'deepseek/deepseek-r1:free', name: '深度思考 R1 (推荐)' },
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
        { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo' }
      ],
      response: [
        { id: 'deepseek/deepseek-r1:free', name: '深度思考 R1 (推荐)' },
        { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
        { id: 'gpt-4', name: 'GPT-4' }
      ],
      optimization: [
        { id: 'deepseek/deepseek-r1:free', name: '深度思考 R1 (推荐)' },
        { id: 'claude-2.1', name: 'Claude 2.1' },
        { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K' }
      ]
    }
    
    const saving = ref(false)
    const testing = ref(false)
    const message = ref(null)
    
    const getGroupLabel = (type) => {
      const labels = {
        writing: '专利撰写',
        response: '专利答复',
        optimization: '文本优化'
      }
      return labels[type] || type
    }
    
    const showMessage = (text, type = 'info') => {
      message.value = { text, type }
      setTimeout(() => {
        message.value = null
      }, 3000)
    }
    
    const loadConfig = async () => {
      try {
        const response = await axios.get('/api/user/config')
        if (response.data) {
          config.value = { ...config.value, ...response.data }
        }
      } catch (error) {
        console.error('加载配置失败:', error)
      }
    }
    
    const saveConfig = async () => {
      saving.value = true
      try {
        await axios.post('/api/user/config', config.value)
        showMessage('配置保存成功', 'success')
      } catch (error) {
        showMessage('配置保存失败: ' + error.message, 'error')
      } finally {
        saving.value = false
      }
    }
    
    const testConnection = async () => {
      testing.value = true
      try {
        const response = await axios.post('/api/ai/test-connection', {
          config: config.value
        })
        if (response.data.success) {
          showMessage('连接测试成功', 'success')
        } else {
          showMessage('连接测试失败: ' + response.data.error, 'error')
        }
      } catch (error) {
        showMessage('连接测试失败: ' + error.message, 'error')
      } finally {
        testing.value = false
      }
    }
    
    onMounted(() => {
      loadConfig()
    })
    
    return {
      config,
      modelGroups,
      saving,
      testing,
      message,
      getGroupLabel,
      saveConfig,
      testConnection
    }
  }
}
</script>

<style scoped>
.ai-settings {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.settings-form {
  margin: 20px 0;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
}

.message.success {
  background-color: #dff0d8;
  color: #3c763d;
}

.message.error {
  background-color: #f2dede;
  color: #a94442;
}

.message.info {
  background-color: #d9edf7;
  color: #31708f;
}
</style> 