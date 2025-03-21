<template>
  <div class="settings-page">
    <h1 class="page-title">用户设置</h1>
    
    <div class="settings-container">
      <!-- API配置 -->
      <div class="settings-card">
        <div class="card-header">
          <h2>API 配置</h2>
          <p class="card-description">配置专利助手使用的API密钥和服务</p>
        </div>
        
        <div class="card-body">
          <div class="form-group">
            <label for="apiKey">API 密钥</label>
            <input 
              type="password" 
              id="apiKey" 
              v-model="apiKey" 
              placeholder="请输入您的API密钥"
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="apiModel">API 模型</label>
            <select id="apiModel" v-model="apiModel" class="form-control">
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3">Claude 3</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="apiEndpoint">API 端点</label>
            <input 
              type="text" 
              id="apiEndpoint" 
              v-model="apiEndpoint" 
              placeholder="例如: https://api.openai.com/v1/chat/completions"
              class="form-control"
            />
          </div>
          
          <button class="btn btn-primary" @click="saveAPIConfig">保存 API 设置</button>
        </div>
      </div>
      
      <!-- 账户设置 -->
      <div class="settings-card">
        <div class="card-header">
          <h2>账户设置</h2>
          <p class="card-description">更新您的个人资料和账户信息</p>
        </div>
        
        <div class="card-body">
          <div class="form-group">
            <label for="username">用户名</label>
            <input 
              type="text" 
              id="username" 
              v-model="username" 
              class="form-control"
              disabled
            />
          </div>
          
          <div class="form-group">
            <label for="email">电子邮箱</label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="newPassword">新密码</label>
            <input 
              type="password" 
              id="newPassword" 
              v-model="newPassword" 
              placeholder="留空表示不修改密码"
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">确认新密码</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="confirmPassword" 
              placeholder="再次输入新密码"
              class="form-control"
            />
          </div>
          
          <button class="btn btn-primary" @click="saveAccountSettings">保存账户设置</button>
        </div>
      </div>
      
      <!-- 显示设置 -->
      <div class="settings-card">
        <div class="card-header">
          <h2>显示设置</h2>
          <p class="card-description">自定义应用的外观和行为</p>
        </div>
        
        <div class="card-body">
          <div class="form-group">
            <label class="switch-label">深色模式</label>
            <div class="switch">
              <input type="checkbox" id="darkMode" v-model="darkMode" @change="toggleDarkMode">
              <label for="darkMode" class="switch-toggle"></label>
            </div>
          </div>
          
          <div class="form-group">
            <label for="fontSize">字体大小</label>
            <select id="fontSize" v-model="fontSize" class="form-control" @change="updateFontSize">
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
          </div>
          
          <button class="btn btn-primary" @click="saveDisplaySettings">保存显示设置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'

export default {
  name: 'Settings',
  setup() {
    const authStore = useAuthStore()
    const configStore = useConfigStore()
    
    // API配置
    const apiKey = ref('')
    const apiModel = ref('gpt-4')
    const apiEndpoint = ref('')
    
    // 账户设置
    const username = ref('')
    const email = ref('')
    const newPassword = ref('')
    const confirmPassword = ref('')
    
    // 显示设置
    const darkMode = ref(localStorage.getItem('darkMode') === 'true')
    const fontSize = ref(localStorage.getItem('fontSize') || 'medium')
    
    // 初始化页面
    onMounted(async () => {
      // 加载用户信息
      if (authStore.user) {
        username.value = authStore.user.username
        email.value = authStore.user.email || ''
      }
      
      // 加载配置信息
      if (configStore.configStatus === 'unchecked') {
        await configStore.fetchUserConfig()
      }
      
      if (configStore.config) {
        apiKey.value = configStore.config.apiKey || ''
        apiModel.value = configStore.config.apiModel || 'gpt-4'
        apiEndpoint.value = configStore.config.apiEndpoint || ''
      }
    })
    
    // 保存API配置
    const saveAPIConfig = async () => {
      try {
        await configStore.updateConfig({
          apiKey: apiKey.value,
          apiModel: apiModel.value,
          apiEndpoint: apiEndpoint.value
        })
        
        alert('API 配置已保存')
      } catch (error) {
        console.error('保存 API 配置失败:', error)
        alert(`保存失败: ${error.message}`)
      }
    }
    
    // 保存账户设置
    const saveAccountSettings = async () => {
      // 验证密码
      if (newPassword.value && newPassword.value !== confirmPassword.value) {
        alert('两次输入的密码不一致')
        return
      }
      
      try {
        const profileData = {
          email: email.value
        }
        
        if (newPassword.value) {
          profileData.newPassword = newPassword.value
        }
        
        await authStore.updateProfile(profileData)
        
        // 清空密码字段
        newPassword.value = ''
        confirmPassword.value = ''
        
        alert('账户设置已保存')
      } catch (error) {
        console.error('保存账户设置失败:', error)
        alert(`保存失败: ${error.message}`)
      }
    }
    
    // 切换深色模式
    const toggleDarkMode = () => {
      localStorage.setItem('darkMode', darkMode.value)
      document.documentElement.classList.toggle('dark-mode', darkMode.value)
    }
    
    // 更新字体大小
    const updateFontSize = () => {
      localStorage.setItem('fontSize', fontSize.value)
      
      // 移除所有字体大小类
      document.body.classList.remove('font-small', 'font-medium', 'font-large')
      
      // 添加新的字体大小类
      document.body.classList.add(`font-${fontSize.value}`)
    }
    
    // 保存显示设置
    const saveDisplaySettings = () => {
      toggleDarkMode()
      updateFontSize()
      alert('显示设置已保存')
    }
    
    return {
      apiKey,
      apiModel,
      apiEndpoint,
      username,
      email,
      newPassword,
      confirmPassword,
      darkMode,
      fontSize,
      saveAPIConfig,
      saveAccountSettings,
      toggleDarkMode,
      updateFontSize,
      saveDisplaySettings
    }
  }
}
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 20px;
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

.card-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.card-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.card-description {
  margin-top: 5px;
  color: #666;
}

.card-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-control {
  display: block;
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(58, 143, 247, 0.2);
}

.btn {
  padding: 10px 16px;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: #fff;
  border: none;
}

.btn-primary:hover {
  background-color: var(--secondary-color);
}

/* 开关样式 */
.switch-label {
  display: inline-block;
  margin-right: 10px;
  font-weight: 500;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  vertical-align: middle;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-toggle {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.switch-toggle:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .switch-toggle {
  background-color: var(--primary-color);
}

input:checked + .switch-toggle:before {
  transform: translateX(26px);
}
</style> 